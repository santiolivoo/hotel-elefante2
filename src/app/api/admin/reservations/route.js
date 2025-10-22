import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

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
    const roomTypeId = searchParams.get('roomTypeId')
    const userId = searchParams.get('userId')
    const search = searchParams.get('search')
    const dateRange = searchParams.get('dateRange')
    const customDateFrom = searchParams.get('customDateFrom')
    const customDateTo = searchParams.get('customDateTo')
    const reservationId = searchParams.get('id') // Para filtrar por reserva específica
    const page = parseInt(searchParams.get('page')) || 1
    const limit = parseInt(searchParams.get('limit')) || 50
    const skip = (page - 1) * limit

    let whereClause = {}
    let andConditions = []

    // Si hay un ID de reserva específico, solo devolver esa reserva
    if (reservationId) {
      whereClause.id = reservationId
    }

    // Filtro de estado
    if (status && status !== 'ALL') {
      whereClause.status = status
    }

    // Filtro de habitación
    if (roomId) {
      whereClause.roomId = parseInt(roomId)
    }

    // Filtro de tipo de habitación
    if (roomTypeId) {
      whereClause.room = {
        roomTypeId: parseInt(roomTypeId)
      }
    }

    // Filtro de usuario
    if (userId) {
      whereClause.userId = userId
    }

    // Filtro de búsqueda por texto
    if (search) {
      andConditions.push({
        OR: [
          { id: { contains: search, mode: 'insensitive' } },
          { user: { name: { contains: search, mode: 'insensitive' } } },
          { user: { email: { contains: search, mode: 'insensitive' } } },
          { room: { number: { contains: search } } }
        ]
      })
    }

    // Filtro de rango de fechas
    // Crear fechas en UTC para evitar problemas de zona horaria
    const now = new Date()
    const today = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0))
    const tomorrow = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate() + 1, 0, 0, 0, 0))

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
    } else if (dateRange === 'custom' && customDateFrom && customDateTo) {
      // Filtro personalizado de fechas - CORREGIR TIMEZONE
      // Parsear fechas y agregar timezone offset manualmente para evitar UTC
      const parseLocalDate = (dateStr) => {
        const [year, month, day] = dateStr.split('-').map(Number)
        const date = new Date(year, month - 1, day)
        // Ajustar al inicio del día en hora local
        date.setHours(0, 0, 0, 0)
        return date
      }
      
      const dateFrom = parseLocalDate(customDateFrom)
      const dateTo = parseLocalDate(customDateTo)
      // Ajustar al final del día para dateTo
      dateTo.setHours(23, 59, 59, 999)
      
      whereClause.checkIn = {
        gte: dateFrom,
        lte: dateTo
      }
      // NO aplicar filtro por defecto cuando hay filtro custom
    }
    // Si dateRange === 'all', no aplicar ningún filtro de fecha
    // Esto permite ver TODAS las reservas cuando se limpian los filtros

    // Combinar todas las condiciones AND
    if (andConditions.length > 0) {
      whereClause.AND = andConditions
    }

    // Obtener total count para paginación
    const totalCount = await prisma.reservation.count({
      where: whereClause
    })

    // Calcular stats globales (independientes de paginación y filtros)
    // Total de TODAS las reservas en la base de datos
    const totalReservationsGlobal = await prisma.reservation.count()

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
    // Ordenar por: 1) Estado (PENDING_PAYMENT primero), 2) checkIn más cercano
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
      orderBy: [
        {
          status: 'asc' // CANCELLED < COMPLETED < CONFIRMED < PENDING_PAYMENT (alfabético)
        },
        {
          checkIn: 'asc' // Más cercano primero
        }
      ],
      skip,
      take: limit
    })
    
    // Reordenar solo si NO hay filtro de status específico
    // Si hay filtro de status, mantener el orden por checkIn ascendente
    const sortedReservations = (!status || status === 'ALL') 
      ? reservations.sort((a, b) => {
          // Primero por estado: PENDING_PAYMENT antes que otros
          if (a.status === 'PENDING_PAYMENT' && b.status !== 'PENDING_PAYMENT') return -1
          if (a.status !== 'PENDING_PAYMENT' && b.status === 'PENDING_PAYMENT') return 1
          
          // Luego por fecha de checkIn (más cercana primero)
          return new Date(a.checkIn) - new Date(b.checkIn)
        })
      : reservations.sort((a, b) => {
          // Solo ordenar por checkIn ascendente (cronológico)
          return new Date(a.checkIn) - new Date(b.checkIn)
        })

    return NextResponse.json({ 
      reservations: sortedReservations,
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
        totalReservations: totalReservationsGlobal, // Total global de todas las reservas
        filteredReservations: totalCount // Total de reservas con los filtros aplicados
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
