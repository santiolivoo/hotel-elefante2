import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Deshabilitar caché para obtener siempre datos frescos
export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request) {
  try {
    // Obtener todos los tipos de habitaciones con sus habitaciones
    // Excluir solo las que están en mantenimiento
    const roomTypes = await prisma.roomType.findMany({
      include: {
        rooms: {
          where: {
            status: {
              not: 'MAINTENANCE'
            }
          }
        }
      },
      orderBy: {
        basePrice: 'asc'
      }
    })

    // Formatear los datos para la respuesta
    const formattedRoomTypes = roomTypes.map(type => {
      const images = type.images ? JSON.parse(type.images) : []
      // Usar imageUrl como principal, si no existe usar la primera del array
      const mainImage = type.imageUrl || images[0] || null
      
      return {
        id: type.id,
        name: type.name,
        shortDescription: type.shortDescription,
        description: type.description,
        price: parseFloat(type.basePrice),
        maxGuests: type.maxGuests,
        size: type.size,
        bedType: type.bedType,
        roomType: type.name,
        available: type.rooms.length,
        image: mainImage,
        images: images.length > 0 ? images : (mainImage ? [mainImage] : [])
      }
    })

    return NextResponse.json(
      { roomTypes: formattedRoomTypes },
      {
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        },
      }
    )
  } catch (error) {
    console.error('Error al obtener tipos de habitación:', error)
    return NextResponse.json(
      { error: 'Error al cargar las habitaciones' },
      { status: 500 }
    )
  }
}

