import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const roomTypeId = parseInt(params.id)
    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year') || new Date().getFullYear())
    const month = parseInt(searchParams.get('month') || new Date().getMonth())

    // Obtener todas las habitaciones de este tipo
    const roomsOfType = await prisma.room.findMany({
      where: { roomTypeId: roomTypeId },
      select: { id: true }
    })

    if (roomsOfType.length === 0) {
      return NextResponse.json(
        { error: 'No hay habitaciones de este tipo' },
        { status: 404 }
      )
    }

    const totalRooms = roomsOfType.length
    const roomIds = roomsOfType.map(r => r.id)

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
    console.error('Error al obtener disponibilidad:', error)
    return NextResponse.json(
      { error: 'Error al cargar la disponibilidad' },
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
