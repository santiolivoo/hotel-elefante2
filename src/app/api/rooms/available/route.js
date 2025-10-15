import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const checkIn = searchParams.get('checkIn')
    const checkOut = searchParams.get('checkOut')
    const guests = parseInt(searchParams.get('guests') || '1')

    if (!checkIn || !checkOut) {
      return NextResponse.json(
        { error: 'Fechas de check-in y check-out requeridas' },
        { status: 400 }
      )
    }

    const checkInDate = new Date(checkIn)
    const checkOutDate = new Date(checkOut)

    if (checkOutDate <= checkInDate) {
      return NextResponse.json(
        { error: 'Fecha de check-out debe ser posterior al check-in' },
        { status: 400 }
      )
    }

    // Obtener todos los tipos de habitaciones
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

    // Para cada tipo, verificar disponibilidad real para las fechas
    const availableRoomTypes = []

    for (const roomType of roomTypes) {
      // Filtrar por capacidad
      if (roomType.maxGuests < guests) {
        continue
      }

      // Contar habitaciones disponibles para las fechas
      let availableCount = 0

      for (const room of roomType.rooms) {
        // Verificar si tiene reservas conflictivas
        const conflictingReservations = await prisma.reservation.findMany({
          where: {
            roomId: room.id,
            status: {
              in: ['PENDING_PAYMENT', 'CONFIRMED']
            },
            OR: [
              {
                AND: [
                  { checkIn: { lte: checkInDate } },
                  { checkOut: { gt: checkInDate } }
                ]
              },
              {
                AND: [
                  { checkIn: { lt: checkOutDate } },
                  { checkOut: { gte: checkOutDate } }
                ]
              },
              {
                AND: [
                  { checkIn: { gte: checkInDate } },
                  { checkOut: { lte: checkOutDate } }
                ]
              }
            ]
          }
        })

        // Si no tiene conflictos, está disponible
        if (conflictingReservations.length === 0) {
          availableCount++
        }
      }

      // Solo incluir si hay al menos una habitación disponible
      if (availableCount > 0) {
        const images = roomType.images ? JSON.parse(roomType.images) : []
        // Usar imageUrl como principal, si no existe usar la primera del array
        const mainImage = roomType.imageUrl || images[0] || null
        
        availableRoomTypes.push({
          id: roomType.id,
          name: roomType.name,
          shortDescription: roomType.shortDescription,
          description: roomType.description,
          price: parseFloat(roomType.basePrice),
          maxGuests: roomType.maxGuests,
          size: roomType.size,
          bedType: roomType.bedType,
          roomType: roomType.name,
          available: availableCount,
          image: mainImage,
          images: images.length > 0 ? images : (mainImage ? [mainImage] : [])
        })
      }
    }

    return NextResponse.json({ 
      roomTypes: availableRoomTypes,
      checkIn,
      checkOut,
      guests
    })
  } catch (error) {
    console.error('Error al obtener habitaciones disponibles:', error)
    return NextResponse.json(
      { error: 'Error al cargar las habitaciones disponibles' },
      { status: 500 }
    )
  }
}

