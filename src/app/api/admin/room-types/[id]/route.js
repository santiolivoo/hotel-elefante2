import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { name, shortDescription, description, basePrice, maxGuests, size, bedType, imageUrl, images } = body
    const typeId = parseInt(params.id)

    const roomType = await prisma.roomType.update({
      where: { id: typeId },
      data: {
        ...(name && { name }),
        ...(shortDescription !== undefined && { shortDescription }),
        ...(description !== undefined && { description }),
        ...(basePrice && { basePrice: parseFloat(basePrice) }),
        ...(maxGuests && { maxGuests: parseInt(maxGuests) }),
        ...(size !== undefined && { size }),
        ...(bedType !== undefined && { bedType }),
        ...(imageUrl !== undefined && { imageUrl }),
        ...(images !== undefined && { images: images ? JSON.stringify(images) : null })
      }
    })

    return NextResponse.json({ roomType })
  } catch (error) {
    console.error('Error al actualizar tipo de habitación:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el tipo de habitación' },
      { status: 500 }
    )
  }
}

export async function DELETE(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const typeId = parseInt(params.id)

    // Verificar si hay habitaciones con este tipo
    const roomCount = await prisma.room.count({
      where: { roomTypeId: typeId }
    })

    if (roomCount > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar. Hay ${roomCount} habitación(es) usando este tipo` },
        { status: 400 }
      )
    }

    await prisma.roomType.delete({
      where: { id: typeId }
    })

    return NextResponse.json({ message: 'Tipo de habitación eliminado exitosamente' })
  } catch (error) {
    console.error('Error al eliminar tipo de habitación:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el tipo de habitación' },
      { status: 500 }
    )
  }
}
