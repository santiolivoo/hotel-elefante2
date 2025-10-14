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

    const roomTypes = await prisma.roomType.findMany({
      include: {
        _count: {
          select: { rooms: true }
        }
      },
      orderBy: {
        name: 'asc'
      }
    })

    return NextResponse.json({ roomTypes })
  } catch (error) {
    console.error('Error al obtener tipos de habitación:', error)
    return NextResponse.json(
      { error: 'Error al cargar los tipos de habitación' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    console.log('Session:', session)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const body = await request.json()
    console.log('Body recibido:', body)
    
    const { name, shortDescription, description, basePrice, maxGuests, size, bedType, imageUrl, images } = body

    if (!name || !basePrice || !maxGuests) {
      console.log('Campos faltantes:', { name, basePrice, maxGuests })
      return NextResponse.json(
        { error: 'Faltan campos requeridos' },
        { status: 400 }
      )
    }

    const data = {
      name,
      shortDescription: shortDescription || null,
      description: description || null,
      basePrice: parseFloat(basePrice),
      maxGuests: parseInt(maxGuests),
      size: size || null,
      bedType: bedType || null,
      imageUrl: imageUrl || null,
      images: images && images.length > 0 ? JSON.stringify(images) : null
    }
    
    console.log('Datos a crear:', data)

    const roomType = await prisma.roomType.create({
      data
    })

    console.log('Tipo creado:', roomType)
    return NextResponse.json({ roomType }, { status: 201 })
  } catch (error) {
    console.error('Error al crear tipo de habitación:', error)
    console.error('Stack trace:', error.stack)
    return NextResponse.json(
      { error: error.message || 'Error al crear el tipo de habitación' },
      { status: 500 }
    )
  }
}
