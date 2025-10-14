import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }

    const { id } = params
    const { status } = await request.json()

    // Find the reservation
    const reservation = await prisma.reservation.findUnique({
      where: { id }
    })

    if (!reservation) {
      return NextResponse.json(
        { message: 'Reserva no encontrada' },
        { status: 404 }
      )
    }

    // Check if user owns the reservation or is admin/operator
    if (
      reservation.userId !== session.user.id && 
      session.user.role !== 'ADMIN' && 
      session.user.role !== 'OPERATOR'
    ) {
      return NextResponse.json(
        { message: 'No tienes permiso para modificar esta reserva' },
        { status: 403 }
      )
    }

    // Validate status change
    if (!['PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'COMPLETED'].includes(status)) {
      return NextResponse.json(
        { message: 'Estado inválido' },
        { status: 400 }
      )
    }

    // Update reservation
    const updatedReservation = await prisma.reservation.update({
      where: { id },
      data: { status },
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

    return NextResponse.json({ 
      message: 'Reserva actualizada exitosamente',
      reservation: updatedReservation
    })

  } catch (error) {
    console.error('Error updating reservation:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }

    const { id } = params

    // Find the reservation
    const reservation = await prisma.reservation.findUnique({
      where: { id }
    })

    if (!reservation) {
      return NextResponse.json(
        { message: 'Reserva no encontrada' },
        { status: 404 }
      )
    }

    // Check if user owns the reservation or is admin
    if (
      reservation.userId !== session.user.id && 
      session.user.role !== 'ADMIN'
    ) {
      return NextResponse.json(
        { message: 'No tienes permiso para eliminar esta reserva' },
        { status: 403 }
      )
    }

    // Delete reservation
    await prisma.reservation.delete({
      where: { id }
    })

    return NextResponse.json({ 
      message: 'Reserva eliminada exitosamente'
    })

  } catch (error) {
    console.error('Error deleting reservation:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
