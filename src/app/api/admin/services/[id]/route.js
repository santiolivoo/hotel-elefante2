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
    const { title, description, icon, features, hours, images, imageUrl, featured, active, order } = body
    const serviceId = parseInt(params.id)

    const updateData = {}
    
    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (icon !== undefined) updateData.icon = icon
    if (features !== undefined) updateData.features = JSON.stringify(features)
    if (hours !== undefined) updateData.hours = hours
    if (images !== undefined) {
      updateData.images = JSON.stringify(images)
      updateData.imageUrl = images.length > 0 ? images[0] : null
    } else if (imageUrl !== undefined) {
      updateData.imageUrl = imageUrl
    }
    if (featured !== undefined) updateData.featured = featured
    if (active !== undefined) updateData.active = active
    if (order !== undefined) updateData.order = parseInt(order)

    const service = await prisma.service.update({
      where: { id: serviceId },
      data: updateData
    })

    // Parsear features e images para respuesta
    const serviceWithParsedFeatures = {
      ...service,
      features: JSON.parse(service.features),
      images: service.images ? JSON.parse(service.images) : (service.imageUrl ? [service.imageUrl] : [])
    }

    return NextResponse.json({ service: serviceWithParsedFeatures })
  } catch (error) {
    console.error('Error al actualizar servicio:', error)
    return NextResponse.json(
      { error: 'Error al actualizar el servicio' },
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

    const serviceId = parseInt(params.id)

    await prisma.service.delete({
      where: { id: serviceId }
    })

    return NextResponse.json({ message: 'Servicio eliminado exitosamente' })
  } catch (error) {
    console.error('Error al eliminar servicio:', error)
    return NextResponse.json(
      { error: 'Error al eliminar el servicio' },
      { status: 500 }
    )
  }
}
