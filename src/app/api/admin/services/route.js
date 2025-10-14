import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'OPERATOR')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const services = await prisma.service.findMany({
      orderBy: [
        { order: 'asc' },
        { createdAt: 'desc' }
      ]
    })

    // Parsear features e images de JSON string a array
    const servicesWithParsedFeatures = services.map(service => ({
      ...service,
      features: JSON.parse(service.features || '[]'),
      images: service.images ? JSON.parse(service.images) : (service.imageUrl ? [service.imageUrl] : [])
    }))

    return NextResponse.json({ services: servicesWithParsedFeatures })
  } catch (error) {
    console.error('Error al obtener servicios:', error)
    return NextResponse.json(
      { error: 'Error al cargar los servicios' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
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

    if (!title || !description || !icon || !hours) {
      return NextResponse.json(
        { error: 'Faltan campos requeridos (title, description, icon, hours)' },
        { status: 400 }
      )
    }

    const data = {
      title,
      description,
      icon,
      features: JSON.stringify(features || []),
      hours,
      images: images ? JSON.stringify(images) : null,
      imageUrl: images && images.length > 0 ? images[0] : (imageUrl || null),
      featured: featured !== undefined ? featured : false,
      active: active !== undefined ? active : true,
      order: order !== undefined ? parseInt(order) : 0
    }

    const service = await prisma.service.create({
      data
    })

    // Parsear features e images para respuesta
    const serviceWithParsedFeatures = {
      ...service,
      features: JSON.parse(service.features),
      images: service.images ? JSON.parse(service.images) : (service.imageUrl ? [service.imageUrl] : [])
    }

    return NextResponse.json({ service: serviceWithParsedFeatures }, { status: 201 })
  } catch (error) {
    console.error('Error al crear servicio:', error)
    return NextResponse.json(
      { error: error.message || 'Error al crear el servicio' },
      { status: 500 }
    )
  }
}
