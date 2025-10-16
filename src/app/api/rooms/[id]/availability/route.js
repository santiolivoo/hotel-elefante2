import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const roomId = parseInt(params.id)
    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year') || new Date().getFullYear())
    const month = parseInt(searchParams.get('month') || new Date().getMonth())

    // Obtener la habitación específica
    const room = await prisma.room.findUnique({
      where: { id: roomId }
    })

    if (!room) {
      return NextResponse.json(
        { error: 'Habitación no encontrada' },
        { status: 404 }
      )
    }

    // Calcular el rango de fechas del mes
    const startDate = new Date(year, month, 1)
    const endDate = new Date(year, month + 1, 0)
    
    // Obtener todas las reservas del mes para esta habitación específica
    const reservations = await prisma.reservation.findMany({
      where: {
        roomId: roomId,
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
        id: true,
        roomId: true,
        checkIn: true,
        checkOut: true
      }
    })

    // Calcular disponibilidad para cada día del mes
    const availability = {}
    
    const currentDate = new Date(startDate)
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0]
      
      // Verificar si esta habitación tiene reserva para este día
      const reservation = reservations.find(res => {
        const resCheckIn = new Date(res.checkIn)
        const resCheckOut = new Date(res.checkOut)
        
        // Una habitación está ocupada si la fecha está entre checkIn y checkOut
        return currentDate >= resCheckIn && currentDate < resCheckOut
      })
      
      availability[dateStr] = {
        available: !reservation,
        reservationId: reservation?.id || null
      }
      
      currentDate.setDate(currentDate.getDate() + 1)
    }

    return NextResponse.json({
      roomId,
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
