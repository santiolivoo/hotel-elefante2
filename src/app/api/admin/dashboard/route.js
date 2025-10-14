import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    // Obtener año del query parameter (por defecto año actual)
    const { searchParams } = new URL(request.url)
    const year = parseInt(searchParams.get('year')) || new Date().getFullYear()

    // Definir rango de fechas para el año seleccionado en UTC
    const startOfYear = new Date(Date.UTC(year, 0, 1, 0, 0, 0)) // 1 de enero 00:00:00 UTC
    const endOfYear = new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999)) // 31 de diciembre 23:59:59.999 UTC

    // Obtener reservas del año seleccionado (filtradas por fecha de check-in)
    const reservations = await prisma.reservation.findMany({
      where: {
        checkIn: {
          gte: startOfYear,
          lte: endOfYear
        }
      },
      include: {
        room: {
          include: {
            roomType: true
          }
        },
        user: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Obtener todas las habitaciones
    const rooms = await prisma.room.findMany({
      include: {
        roomType: true
      }
    })

    // Obtener mensajes de contacto
    const messages = await prisma.contactMessage.findMany({
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Calcular estadísticas
    const confirmedReservations = reservations.filter(r => r.status === 'CONFIRMED')
    const completedReservations = reservations.filter(r => r.status === 'COMPLETED')
    
    // Calcular ingresos totales desde reservas confirmadas y completadas
    const totalRevenue = reservations
      .filter(r => r.status === 'CONFIRMED' || r.status === 'COMPLETED')
      .reduce((sum, reservation) => {
        return sum + parseFloat(reservation.paidAmount || 0)
      }, 0)

    // Calcular ocupación promedio del año seleccionado
    // Ocupación = (noches reservadas / noches disponibles) * 100
    const totalRooms = rooms.length
    const daysInYear = 365 // Simplificado, podría usar año bisiesto
    const totalAvailableNights = totalRooms * daysInYear
    
    // Calcular total de noches reservadas en el año
    const totalReservedNights = reservations
      .filter(r => r.status === 'CONFIRMED' || r.status === 'COMPLETED')
      .reduce((sum, reservation) => {
        const checkIn = new Date(reservation.checkIn)
        const checkOut = new Date(reservation.checkOut)
        const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
        return sum + nights
      }, 0)
    
    const occupancyRate = totalAvailableNights > 0 
      ? Math.round((totalReservedNights / totalAvailableNights) * 100) 
      : 0

    // Mensajes pendientes
    const pendingMessages = messages.filter(m => m.status === 'RECEIVED').length

    // Pagos pendientes
    const pendingPayments = reservations.filter(r => r.status === 'PENDING_PAYMENT').length

    // Calcular ingresos por mes (12 meses del año seleccionado)
    // Los ingresos se asignan al mes de CHECK-IN, no de creación de reserva
    const monthlyRevenue = []
    
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      // Filtrar por fecha de CHECK-IN usando año y mes UTC para evitar problemas de timezone
      const monthReservations = reservations.filter(r => {
        const checkInDate = new Date(r.checkIn)
        const checkInYear = checkInDate.getUTCFullYear()
        const checkInMonth = checkInDate.getUTCMonth()
        
        return checkInYear === year && checkInMonth === monthIndex && 
               (r.status === 'CONFIRMED' || r.status === 'COMPLETED')
      })
      
      const revenue = monthReservations.reduce((sum, r) => sum + parseFloat(r.paidAmount || 0), 0)
      
      const monthDate = new Date(year, monthIndex, 1)
      monthlyRevenue.push({
        month: monthDate.toLocaleString('es-ES', { month: 'short' }),
        revenue: Math.round(revenue),
        reservations: monthReservations.length
      })
    }

    // Distribución de tipos de habitaciones reservadas
    // Obtener todos los tipos de habitación
    const allRoomTypes = await prisma.roomType.findMany({
      select: {
        name: true
      }
    })

    // Inicializar distribución con todos los tipos
    const roomTypeDistribution = {}
    allRoomTypes.forEach(type => {
      roomTypeDistribution[type.name] = 0
    })

    // Contar reservas por tipo
    confirmedReservations.concat(completedReservations).forEach(res => {
      const typeName = res.room.roomType.name
      if (roomTypeDistribution[typeName] !== undefined) {
        roomTypeDistribution[typeName]++
      }
    })

    // Convertir a array y filtrar tipos con al menos 1 reserva (o incluir todos para visualización)
    const roomTypeData = Object.entries(roomTypeDistribution).map(([name, value]) => ({
      name,
      value
    }))
    
    // Agregar log para debug
    console.log('Room Type Distribution:', roomTypeDistribution)
    console.log('Room Type Data:', roomTypeData)

    // Reservas recientes
    const recentReservations = reservations.slice(0, 10).map(r => ({
      id: r.id,
      guestName: r.user.name,
      roomNumber: r.room.number,
      roomType: r.room.roomType.name,
      checkIn: r.checkIn,
      checkOut: r.checkOut,
      status: r.status,
      totalAmount: parseFloat(r.totalAmount),
      paidAmount: parseFloat(r.paidAmount),
      createdAt: r.createdAt
    }))

    return NextResponse.json({
      stats: {
        totalReservations: reservations.length,
        totalRevenue: Math.round(totalRevenue),
        occupancyRate,
        newMessages: pendingMessages,
        pendingPayments
      },
      revenueData: monthlyRevenue,
      roomTypeData,
      recentReservations
    })

  } catch (error) {
    console.error('Error al obtener datos del dashboard:', error)
    return NextResponse.json(
      { error: 'Error al cargar datos del dashboard' },
      { status: 500 }
    )
  }
}
