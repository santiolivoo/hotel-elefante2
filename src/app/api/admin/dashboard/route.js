import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

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

    // Definir rango de fechas para el año seleccionado
    const startOfYear = new Date(year, 0, 1, 0, 0, 0)
    const endOfYear = new Date(year, 11, 31, 23, 59, 59, 999)

    // Usar agregaciones para estadísticas (más eficiente que cargar todas las reservas)
    const [totalReservations, confirmedCount, completedCount, pendingPaymentsYear] = await Promise.all([
      prisma.reservation.count({
        where: {
          checkIn: { gte: startOfYear, lte: endOfYear }
        }
      }),
      prisma.reservation.count({
        where: {
          checkIn: { gte: startOfYear, lte: endOfYear },
          status: 'CONFIRMED'
        }
      }),
      prisma.reservation.count({
        where: {
          checkIn: { gte: startOfYear, lte: endOfYear },
          status: 'COMPLETED'
        }
      }),
      prisma.reservation.count({
        where: {
          checkIn: { gte: startOfYear, lte: endOfYear },
          status: 'PENDING_PAYMENT'
        }
      })
    ])

    // Calcular ingresos totales usando aggregate
    const revenueResult = await prisma.reservation.aggregate({
      where: {
        checkIn: { gte: startOfYear, lte: endOfYear },
        status: { in: ['CONFIRMED', 'COMPLETED'] }
      },
      _sum: {
        paidAmount: true
      }
    })
    
    const totalRevenue = parseFloat(revenueResult._sum.paidAmount || 0)

    // Obtener conteo de habitaciones (más rápido que cargar todas)
    const totalRooms = await prisma.room.count()

    // Obtener solo el conteo de mensajes pendientes (más rápido)
    const pendingMessages = await prisma.contactMessage.count({
      where: {
        status: 'RECEIVED'
      }
    }).catch(() => 0)

    // Obtener solo las reservas necesarias para cálculos detallados
    const reservationsForCalc = await prisma.reservation.findMany({
      where: {
        checkIn: { gte: startOfYear, lte: endOfYear },
        status: { in: ['CONFIRMED', 'COMPLETED'] }
      },
      select: {
        checkIn: true,
        checkOut: true,
        status: true,
        paidAmount: true,
        room: {
          select: {
            roomType: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    // Calcular ocupación promedio del año seleccionado
    // Ocupación = (noches reservadas / noches disponibles) * 100
    const daysInYear = 365 // Simplificado, podría usar año bisiesto
    const totalAvailableNights = totalRooms * daysInYear
    
    // Calcular total de noches reservadas en el año
    const totalReservedNights = reservationsForCalc.reduce((sum, reservation) => {
      const checkIn = new Date(reservation.checkIn)
      const checkOut = new Date(reservation.checkOut)
      const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24))
      return sum + nights
    }, 0)
    
    const occupancyRate = totalAvailableNights > 0 
      ? Math.round((totalReservedNights / totalAvailableNights) * 100) 
      : 0

    // Calcular stats diarias (independientes del año seleccionado)
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)

    const [checkInsToday, checkOutsToday, activeReservations, pendingPayments] = await Promise.all([
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
      // Reservas activas (guests actualmente en el hotel)
      prisma.reservation.count({
        where: {
          checkIn: { lte: today },
          checkOut: { gt: today },
          status: 'CONFIRMED'
        }
      }),
      // Pagos pendientes (globales, no solo del año)
      prisma.reservation.count({
        where: {
          status: 'PENDING_PAYMENT'
        }
      })
    ])

    // Calcular ingresos por mes
    const monthlyRevenue = []
    
    for (let monthIndex = 0; monthIndex < 12; monthIndex++) {
      const monthReservations = reservationsForCalc.filter(r => {
        const checkInDate = new Date(r.checkIn)
        return checkInDate.getFullYear() === year && checkInDate.getMonth() === monthIndex
      })
      
      const revenue = monthReservations.reduce((sum, r) => sum + parseFloat(r.paidAmount || 0), 0)
      
      const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
      monthlyRevenue.push({
        month: monthNames[monthIndex],
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
    reservationsForCalc.forEach(res => {
      const typeName = res.room.roomType.name
      if (roomTypeDistribution[typeName] !== undefined) {
        roomTypeDistribution[typeName]++
      }
    })

    // Convertir a array
    const roomTypeData = Object.entries(roomTypeDistribution).map(([name, value]) => ({
      name,
      value
    }))

    return NextResponse.json({
      stats: {
        // Stats del año seleccionado
        totalReservations,
        totalRevenue: Math.round(totalRevenue),
        occupancyRate,
        // Stats diarias/globales
        checkInsToday,
        checkOutsToday,
        activeReservations,
        newMessages: pendingMessages,
        pendingPayments
      },
      revenueData: monthlyRevenue,
      roomTypeData
    })

  } catch (error) {
    console.error('Dashboard API Error:', error)
    return NextResponse.json(
      { error: 'Error al cargar datos del dashboard', message: error.message },
      { status: 500 }
    )
  }
}
