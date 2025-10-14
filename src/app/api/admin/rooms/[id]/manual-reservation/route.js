import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'OPERATOR'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const { id } = params
    const roomId = parseInt(id)
    
    if (isNaN(roomId)) {
      return NextResponse.json(
        { error: 'ID de habitación inválido' },
        { status: 400 }
      )
    }

    const { guestName, guestEmail, checkIn, checkOut, guests, totalAmount } = await request.json()

    // Validar campos requeridos
    if (!guestName || !guestEmail || !checkIn || !checkOut || !guests) {
      return NextResponse.json(
        { error: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    // Validar fechas
    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)
    const today = new Date()
    today.setHours(0, 0, 0, 0)

    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
        { error: 'La fecha de check-out debe ser posterior al check-in' },
        { status: 400 }
      )
    }

    // Verificar que la habitación existe
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      include: { roomType: true }
    })

    if (!room) {
      return NextResponse.json(
        { error: 'Habitación no encontrada' },
        { status: 404 }
      )
    }

    // Verificar disponibilidad (sin conflictos de reservas)
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
        { error: 'La habitación no está disponible para esas fechas' },
        { status: 409 }
      )
    }

    // Buscar o crear usuario
    let user = await prisma.user.findUnique({
      where: { email: guestEmail }
    })
    
    if (!user) {
      // Crear usuario temporal para walk-in
      const bcrypt = require('bcryptjs')
      const tempPassword = Math.random().toString(36).slice(-8)
      const passwordHash = await bcrypt.hash(tempPassword, 10)
      
      user = await prisma.user.create({
        data: {
          email: guestEmail,
          name: guestName,
          passwordHash: passwordHash,
          role: 'USER'
        }
      })
    }

    // Calcular monto total si no se proporcionó
    const finalAmount = totalAmount || parseFloat(room.roomType.basePrice) * Math.ceil((checkOutDate - checkInDate) / (1000 * 60 * 60 * 24))

    // Crear reserva manual
    const reservation = await prisma.reservation.create({
      data: {
        roomId: roomId,
        userId: user.id,
        checkIn: checkInDate,
        checkOut: checkOutDate,
        guests: parseInt(guests),
        totalAmount: finalAmount,
        paidAmount: finalAmount, // Asumimos pago completo
        status: 'CONFIRMED'
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

    // Actualizar status de habitación si el check-in es hoy o anterior
    const todayStr = new Date().toISOString().split('T')[0]
    const checkInStr = checkInDate.toISOString().split('T')[0]
    
    if (checkInStr <= todayStr) {
      await prisma.room.update({
        where: { id: roomId },
        data: { status: 'OCCUPIED' }
      })
    }

    return NextResponse.json({
      message: 'Reserva manual creada exitosamente',
      reservation: {
        id: reservation.id,
        guestName: reservation.user.name,
        guestEmail: reservation.user.email,
        roomNumber: reservation.room.number,
        roomType: reservation.room.roomType.name,
        checkIn: reservation.checkIn,
        checkOut: reservation.checkOut,
        guests: reservation.guests,
        totalAmount: reservation.totalAmount,
        status: reservation.status
      }
    })

  } catch (error) {
    console.error('Error creating manual reservation:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
