import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const serviceId = parseInt(params.id)

    const service = await prisma.service.findUnique({
      where: { 
        id: serviceId,
        active: true 
      }
    })

    if (!service) {
      return NextResponse.json(
        { error: 'Servicio no encontrado' },
        { status: 404 }
      )
    }

    // Parsear features e images
    const serviceWithParsedData = {
      ...service,
      features: JSON.parse(service.features || '[]'),
      images: service.images ? JSON.parse(service.images) : (service.imageUrl ? [service.imageUrl] : [])
    }

    return NextResponse.json({ service: serviceWithParsedData })
  } catch (error) {
    console.error('Error al obtener servicio:', error)
    return NextResponse.json(
      { error: 'Error al cargar el servicio' },
      { status: 500 }
    )
  }
}
