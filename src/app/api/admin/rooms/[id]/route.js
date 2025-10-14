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
    const data = await request.json()

    // Convert id to number
    const roomId = parseInt(id)

    if (isNaN(roomId)) {
      return NextResponse.json(
        { message: 'ID de habitación inválido' },
        { status: 400 }
      )
    }

    // Check if room exists
    const existingRoom = await prisma.room.findUnique({
      where: { id: roomId }
    })

    if (!existingRoom) {
      return NextResponse.json(
        { message: 'Habitación no encontrada' },
        { status: 404 }
      )
    }

    // If changing number, check it's not duplicated
    if (data.number && data.number !== existingRoom.number) {
      const duplicateRoom = await prisma.room.findUnique({
        where: { number: data.number }
      })

      if (duplicateRoom) {
        return NextResponse.json(
          { message: 'Ya existe una habitación con ese número' },
          { status: 409 }
        )
      }
    }

    // Prepare update data
    const updateData = {}
    if (data.number) updateData.number = data.number
    if (data.floor) updateData.floor = parseInt(data.floor)
    if (data.roomTypeId) updateData.roomTypeId = parseInt(data.roomTypeId)
    if (data.status) updateData.status = data.status

    // Update room
    const room = await prisma.room.update({
      where: { id: roomId },
      data: updateData,
      include: {
        roomType: true
      }
    })

    return NextResponse.json({
      message: 'Habitación actualizada exitosamente',
      room
    })
  } catch (error) {
    console.error('Error updating room:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }

    const { id } = params
    const roomId = parseInt(id)

    if (isNaN(roomId)) {
      return NextResponse.json(
        { message: 'ID de habitación inválido' },
        { status: 400 }
      )
    }

    // Check if room has active reservations
    const activeReservations = await prisma.reservation.findMany({
      where: {
        roomId: roomId,
        status: {
          in: ['PENDING_PAYMENT', 'CONFIRMED']
        }
      }
    })

    if (activeReservations.length > 0) {
      return NextResponse.json(
        { message: 'No se puede eliminar una habitación con reservas activas' },
        { status: 409 }
      )
    }

    // Delete room
    await prisma.room.delete({
      where: { id: roomId }
    })

    return NextResponse.json({
      message: 'Habitación eliminada exitosamente'
    })
  } catch (error) {
    console.error('Error deleting room:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
