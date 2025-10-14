import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'OPERATOR')) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }

    const { id } = params
    const { status } = await request.json()

    if (!status) {
      return NextResponse.json(
        { message: 'Estado es requerido' },
        { status: 400 }
      )
    }

    const validStatuses = ['PENDING_PAYMENT', 'CONFIRMED', 'CANCELLED', 'COMPLETED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { message: 'Estado inválido' },
        { status: 400 }
      )
    }

    // Si se confirma la reserva, actualizar el monto pagado
    const updateData = { status }
    
    if (status === 'CONFIRMED') {
      const existingReservation = await prisma.reservation.findUnique({
        where: { id }
      })

      if (!existingReservation) {
        return NextResponse.json(
          { message: 'Reserva no encontrada' },
          { status: 404 }
        )
      }

      // Marcar la reserva como pagada completamente
      updateData.paidAmount = existingReservation.totalAmount
    }

    const reservation = await prisma.reservation.update({
      where: { id },
      data: updateData,
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
      reservation 
    })

  } catch (error) {
    console.error('Error updating reservation:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
