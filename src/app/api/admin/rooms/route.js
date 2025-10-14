import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'OPERATOR')) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }

    const rooms = await prisma.room.findMany({
      include: {
        roomType: true
      },
      orderBy: {
        number: 'asc'
      }
    })

    return NextResponse.json({ rooms })
  } catch (error) {
    console.error('Error fetching rooms:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }

    const { number, floor, roomTypeId, status } = await request.json()

    // Validate input
    if (!number || !floor || !roomTypeId) {
      return NextResponse.json(
        { message: 'Todos los campos son requeridos' },
        { status: 400 }
      )
    }

    // Check if room number already exists
    const existingRoom = await prisma.room.findUnique({
      where: { number }
    })

    if (existingRoom) {
      return NextResponse.json(
        { message: 'Ya existe una habitación con ese número' },
        { status: 409 }
      )
    }

    // Create room
    const room = await prisma.room.create({
      data: {
        number,
        floor: parseInt(floor),
        roomTypeId: parseInt(roomTypeId),
        status: status || 'AVAILABLE'
      },
      include: {
        roomType: true
      }
    })

    return NextResponse.json(
      { 
        message: 'Habitación creada exitosamente',
        room
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Error creating room:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
