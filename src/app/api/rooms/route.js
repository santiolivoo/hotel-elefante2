import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
      const mainImage = images[0] || type.imageUrl || getDefaultImage(type.name)
      
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
        images: images.length > 0 ? images : [mainImage]
      }
    })

    return NextResponse.json({ roomTypes: formattedRoomTypes })
  } catch (error) {
    console.error('Error al obtener tipos de habitación:', error)
    return NextResponse.json(
      { error: 'Error al cargar las habitaciones' },
      { status: 500 }
    )
  }
}

// Función auxiliar para obtener imágenes por defecto según el tipo
function getDefaultImage(typeName) {
  const imageMap = {
    'Suite Estándar': '/Imagenes del hotel/suite estandar.jpg',
    'Suite Familiar': '/Imagenes del hotel/suite familiar.jpg',
    'Suite Deluxe': '/Imagenes del hotel/suite deluxe.jpg',
    'Suite Presidencial': '/Imagenes del hotel/suite presi.jpg',
    'Suite VIP': '/Imagenes del hotel/suite vip.jpg'
  }
  
  return imageMap[typeName] || '/Imagenes del hotel/suite estandar.jpg'
}
