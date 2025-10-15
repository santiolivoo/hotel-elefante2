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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const roomId = searchParams.get('roomId')
    const userId = searchParams.get('userId')
    const search = searchParams.get('search')
    const dateRange = searchParams.get('dateRange')
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 50
    const skip = (page - 1) * limit

    let whereClause = {}

    // Filtro de estado
    if (status && status !== 'ALL') {
      whereClause.status = status
    }

    // Filtro de habitación
    if (roomId) {
      whereClause.roomId = parseInt(roomId)
    }

    // Filtro de usuario
    if (userId) {
      whereClause.userId = userId
    }

    // Filtro de búsqueda por texto
    if (search) {
      whereClause.OR = [
        { id: { contains: search, mode: 'insensitive' } },
        { user: { name: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
        { room: { number: { contains: search } } }
      ]
    }

    // Filtro de rango de fechas
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    if (dateRange === 'today') {
      whereClause.checkIn = {
        gte: today,
        lt: tomorrow
      }
    } else if (dateRange === 'upcoming') {
      whereClause.checkIn = {
        gt: today
      }
    } else if (dateRange === 'current') {
      whereClause.AND = [
        { checkIn: { lte: today } },
        { checkOut: { gt: today } },
        { status: 'CONFIRMED' }
      ]
    } else if (dateRange === 'checkouts_today') {
      whereClause.checkOut = {
        gte: today,
        lt: tomorrow
      }
    }

    // Obtener total count para paginación
    const totalCount = await prisma.reservation.count({
      where: whereClause
    })

    // Calcular stats globales (independientes de paginación y filtros)

    const [checkInsToday, checkOutsToday, pendingPayments, activeReservations] = await Promise.all([
      // Check-ins hoy
      prisma.reservation.count({
        where: {
          checkIn: {
            gte: today,
            lt: tomorrow
          },
          status: { in: ['CONFIRMED', 'PENDING_PAYMENT'] }
        }
      }),
      // Check-outs hoy
      prisma.reservation.count({
        where: {
          checkOut: {
            gte: today,
            lt: tomorrow
          },
          status: { in: ['CONFIRMED', 'COMPLETED'] }
        }
      }),
      // Pagos pendientes
      prisma.reservation.count({
        where: {
          status: 'PENDING_PAYMENT'
        }
      }),
      // Reservas activas (guests actualmente en el hotel)
      prisma.reservation.count({
        where: {
          checkIn: { lte: today },
          checkOut: { gt: today },
          status: 'CONFIRMED'
        }
      })
    ])

    // Obtener reservas paginadas
    const reservations = await prisma.reservation.findMany({
      where: whereClause,
      include: {
        room: {
          include: {
            roomType: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: limit
    })

    return NextResponse.json({ 
      reservations,
      pagination: {
        total: totalCount,
        page,
        limit,
        totalPages: Math.ceil(totalCount / limit)
      },
      stats: {
        checkInsToday,
        checkOutsToday,
        pendingPayments,
        activeReservations,
        totalReservations: totalCount
      }
    })

  } catch (error) {
    console.error('Error fetching reservations:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
