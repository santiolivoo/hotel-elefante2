import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request, { params }) {
  try {
    const roomTypeId = parseInt(params.id)
    
    // Obtener el tipo de habitación con sus habitaciones
    const roomType = await prisma.roomType.findUnique({
      where: {
        id: roomTypeId
      },
      include: {
        rooms: {
          where: {
            status: 'AVAILABLE'
          }
        }
      }
    })

    if (!roomType) {
      return NextResponse.json(
        { error: 'Tipo de habitación no encontrado' },
        { status: 404 }
      )
    }

    // Formatear los datos para la respuesta
    const images = roomType.images ? JSON.parse(roomType.images) : []
    // Usar imageUrl como principal, si no existe usar la primera del array
    const mainImage = roomType.imageUrl || images[0] || null
    
    const formattedRoom = {
      id: roomType.id,
      name: roomType.name,
      shortDescription: roomType.shortDescription,
      description: roomType.description,
      price: parseFloat(roomType.basePrice),
      maxGuests: roomType.maxGuests,
      size: roomType.size,
      bedType: roomType.bedType,
      roomType: roomType.name,
      available: roomType.rooms.length,
      image: mainImage,
      images: [mainImage],
      rating: 4.7,
      reviews: 25
    }

    return NextResponse.json({ room: formattedRoom })
  } catch (error) {
    console.error('Error al obtener tipo de habitación:', error)
    return NextResponse.json(
      { error: 'Error al cargar la habitación' },
      { status: 500 }
    )
  }
}

