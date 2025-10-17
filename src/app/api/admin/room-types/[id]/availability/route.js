import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'OPERATOR')) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }

    const { id } = params
    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year'))
    const month = parseInt(searchParams.get('month'))

    if (!year || month === undefined) {
      return NextResponse.json(
        { message: 'Año y mes son requeridos' },
        { status: 400 }
      )
    }

    // Obtener todas las habitaciones de este tipo
    const rooms = await prisma.room.findMany({
      where: {
        roomTypeId: parseInt(id)
      },
      select: {
        id: true
      }
    })

    const totalRooms = rooms.length
    const roomIds = rooms.map(r => r.id)

    // Obtener el primer y último día del mes
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    
    // Ajustar a medianoche en timezone local
    firstDay.setHours(0, 0, 0, 0)
    lastDay.setHours(23, 59, 59, 999)

    // Obtener todas las reservas que se solapan con este mes
    // para cualquier habitación de este tipo
    const reservations = await prisma.reservation.findMany({
      where: {
        roomId: {
          in: roomIds
        },
        status: {
          in: ['CONFIRMED', 'PENDING_PAYMENT']
        },
        OR: [
          {
            checkIn: {
              gte: firstDay,
              lte: lastDay
            }
          },
          {
            checkOut: {
              gte: firstDay,
              lte: lastDay
            }
          },
          {
            AND: [
              { checkIn: { lte: firstDay } },
              { checkOut: { gte: lastDay } }
            ]
          }
        ]
      },
      select: {
        checkIn: true,
        checkOut: true,
        roomId: true
      }
    })

    // Calcular disponibilidad día por día
    const availability = {}
    
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const currentDate = new Date(year, month, day)
      const dateStr = formatDateLocal(currentDate)
      
      // Contar cuántas habitaciones están ocupadas este día
      const occupiedRooms = new Set()
      
      reservations.forEach(reservation => {
        const resCheckIn = new Date(reservation.checkIn)
        const resCheckOut = new Date(reservation.checkOut)
        
        // Comparar usando strings de fecha YYYY-MM-DD para evitar problemas de zona horaria
        const resCheckInStr = resCheckIn.toISOString().split('T')[0]
        const resCheckOutStr = resCheckOut.toISOString().split('T')[0]
        
        // La habitación está ocupada desde checkIn (inclusive) hasta checkOut (exclusive)
        if (dateStr >= resCheckInStr && dateStr < resCheckOutStr) {
          occupiedRooms.add(reservation.roomId)
        }
      })
      
      const availableRooms = totalRooms - occupiedRooms.size
      
      availability[dateStr] = {
        available: availableRooms > 0,
        availableRooms: availableRooms,
        totalRooms: totalRooms
      }
    }

    return NextResponse.json({ 
      availability,
      totalRooms
    })

  } catch (error) {
    console.error('Error fetching room type availability:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor', error: error.message },
      { status: 500 }
    )
  }
}

// Helper function to format date in local timezone as YYYY-MM-DD
function formatDateLocal(date) {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}
