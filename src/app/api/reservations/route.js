import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
const { sendReservationConfirmation } = require('@/lib/email')

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }

    const { roomId, checkIn, checkOut, guests, totalAmount } = await request.json()

    // Validate input
    if (!roomId || !checkIn || !checkOut || !guests || !totalAmount) {
      return NextResponse.json(
        { message: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    // Validate dates
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    
    // Comparar fechas como strings para evitar problemas de zona horaria
    const todayStr = new Date().toISOString().split('T')[0]
    const checkInStr = checkIn.split('T')[0]

    if (checkInStr < todayStr) {
      return NextResponse.json(
        { message: 'La fecha de check-in no puede ser anterior a hoy' },
        { status: 400 }
      )
    }

    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
        { message: 'La fecha de check-out debe ser posterior al check-in' },
        { status: 400 }
      )
    }

    // Check if roomId is a RoomType ID or a specific Room ID
    // First, try to find as RoomType
    const roomType = await prisma.roomType.findUnique({
      where: { id: roomId }
    })

    let selectedRoom = null

    if (roomType) {
      // If roomId is a RoomType ID, find an available room of that type
      if (guests > roomType.capacity) {
        return NextResponse.json(
          { message: 'Número de huéspedes excede la capacidad de la habitación' },
          { status: 400 }
        )
      }

      // Get all rooms of this type (except MAINTENANCE)
      // Disponibilidad se verifica por reservas, no por status
      const roomsOfType = await prisma.room.findMany({
        where: {
          roomTypeId: roomId,
          status: {
            not: 'MAINTENANCE'
          }
        },
        include: {
          roomType: true
        }
      })

      if (roomsOfType.length === 0) {
        return NextResponse.json(
          { message: 'No hay habitaciones disponibles de este tipo' },
          { status: 404 }
        )
      }

      // Check each room for availability in the date range
      for (const room of roomsOfType) {
        const conflictingReservations = await prisma.reservation.findMany({
          where: {
            roomId: room.id,
            status: {
              in: ['PENDING_PAYMENT', 'CONFIRMED']
            },
            OR: [
              {
                AND: [
                  { checkIn: { lte: checkInDate } },
                  { checkOut: { gt: checkInDate } }
                ]
              },
              {
                AND: [
                  { checkIn: { lt: checkOutDate } },
                  { checkOut: { gte: checkOutDate } }
                ]
              },
              {
                AND: [
                  { checkIn: { gte: checkInDate } },
                  { checkOut: { lte: checkOutDate } }
                ]
              }
            ]
          }
        })

        if (conflictingReservations.length === 0) {
          selectedRoom = room
          break
        }
      }

      if (!selectedRoom) {
        return NextResponse.json(
          { message: 'No hay habitaciones disponibles para las fechas seleccionadas' },
          { status: 409 }
        )
      }
    } else {
      // If roomId is a specific Room ID
      const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: { roomType: true }
      })

      if (!room) {
        return NextResponse.json(
          { message: 'Habitación no encontrada' },
          { status: 404 }
        )
      }

      if (guests > room.roomType.capacity) {
        return NextResponse.json(
          { message: 'Número de huéspedes excede la capacidad de la habitación' },
          { status: 400 }
        )
      }

      // Check room availability
      const conflictingReservations = await prisma.reservation.findMany({
        where: {
          roomId: roomId,
          status: {
            in: ['PENDING_PAYMENT', 'CONFIRMED']
          },
          OR: [
            {
              AND: [
                { checkIn: { lte: checkInDate } },
                { checkOut: { gt: checkInDate } }
              ]
            },
            {
              AND: [
                { checkIn: { lt: checkOutDate } },
                { checkOut: { gte: checkOutDate } }
              ]
            },
            {
              AND: [
                { checkIn: { gte: checkInDate } },
                { checkOut: { lte: checkOutDate } }
              ]
            }
          ]
        }
      })

      if (conflictingReservations.length > 0) {
        return NextResponse.json(
          { message: 'La habitación no está disponible para las fechas seleccionadas' },
          { status: 409 }
        )
      }

      selectedRoom = room
    }

    // Create reservation using the selected room
    const reservation = await prisma.reservation.create({
      data: {
        roomId: selectedRoom.id,
        userId: session.user.id,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests,
        totalAmount,
        status: 'PENDING_PAYMENT'
      },
      include: {
        room: {
          include: {
            roomType: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // Enviar email de confirmación
    try {
      await sendReservationConfirmation(reservation)
      console.log('✅ Email de confirmación enviado a:', reservation.user.email)
    } catch (emailError) {
      console.error('⚠️ Error enviando email de confirmación:', emailError)
      // No fallar la reserva si el email falla, solo registrar el error
    }

    return NextResponse.json(
      { 
        message: 'Reserva creada exitosamente',
        reservation: {
          id: reservation.id,
          checkIn: reservation.checkIn,
          checkOut: reservation.checkOut,
          guests: reservation.guests,
          totalAmount: reservation.totalAmount,
          status: reservation.status,
          room: {
            id: reservation.room.id,
            number: reservation.room.number,
            roomType: reservation.room.roomType
          }
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error creating reservation:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    // If user is not admin/operator, only show their own reservations
    const whereClause = (session.user.role === 'ADMIN' || session.user.role === 'OPERATOR') && userId
      ? { userId }
      : { userId: session.user.id }

    const reservations = await prisma.reservation.findMany({
      where: whereClause,
      include: {
        room: {
          include: {
            roomType: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ reservations })

  } catch (error) {
    console.error('Error fetching reservations:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
