import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const roomTypeId = parseInt(params.id)
    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year') || new Date().getFullYear())
    const month = parseInt(searchParams.get('month') || new Date().getMonth())

    // Obtener todas las habitaciones de este tipo
    const roomType = await prisma.roomType.findUnique({
      where: { id: roomTypeId },
      include: {
        rooms: {
          where: {
            status: { not: 'MAINTENANCE' }
          }
        }
      }
    })

    if (!roomType) {
      return NextResponse.json(
        { error: 'Tipo de habitación no encontrado' },
        { status: 404 }
      )
    }

    // Calcular el rango de fechas del mes
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0)
    
    // Obtener todas las reservas del mes para este tipo de habitación
    const reservations = await prisma.reservation.findMany({
      where: {
        roomId: {
          in: roomType.rooms.map(r => r.id)
        },
        status: {
          in: ['PENDING_PAYMENT', 'CONFIRMED']
        },
        OR: [
          {
            AND: [
              { checkIn: { lte: endDate } },
              { checkOut: { gte: startDate } }
            ]
          }
        ]
      },
      select: {
        roomId: true,
        checkIn: true,
        checkOut: true
      }
    })

    // Calcular disponibilidad para cada día del mes
    const availability = {}
    const totalRooms = roomType.rooms.length
    
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]
      
      // Contar cuántas habitaciones están ocupadas este día
      let occupiedRooms = 0
      
      for (const room of roomType.rooms) {
        // Verificar si esta habitación tiene reserva para este día
        const hasReservation = reservations.some(res => {
          const resCheckIn = new Date(res.checkIn)
          const resCheckOut = new Date(res.checkOut)
          
          // Una habitación está ocupada si la fecha está entre checkIn y checkOut
          return res.roomId === room.id && 
                 currentDate >= resCheckIn && 
                 currentDate < resCheckOut
        })
        
        if (hasReservation) {
          occupiedRooms++
        }
      }
      
      const availableRooms = totalRooms - occupiedRooms
      
      availability[dateStr] = {
        available: availableRooms > 0,
        availableRooms,
        totalRooms
      }
      
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return NextResponse.json({
      roomTypeId,
      year,
      month,
      availability
    })
  } catch (error) {
    console.error('Error al obtener disponibilidad:', error)
    return NextResponse.json(
      { error: 'Error al cargar la disponibilidad' },
      { status: 500 }
    )
  }
}
