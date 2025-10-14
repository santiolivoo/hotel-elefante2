import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET público - obtener todos los servicios activos
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const featured = searchParams.get('featured')

    const where = { active: true }
    if (featured === 'true') {
      where.featured = true
    }

    const services = await prisma.service.findMany({
      where,
      orderBy: [
        { order: 'asc' },
        { createdAt: 'asc' }
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
