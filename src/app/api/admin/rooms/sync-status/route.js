import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || !['ADMIN', 'OPERATOR'].includes(session.user.role)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const now = new Date()
    const todayStr = now.toISOString().split('T')[0]

    // Obtener todas las habitaciones
    const rooms = await prisma.room.findMany()

    let updated = 0
    const updates = []

    for (const room of rooms) {
      // No tocar habitaciones en mantenimiento
      if (room.status === 'MAINTENANCE') {
        continue
      }

      // Verificar si tiene reserva activa HOY
      const activeReservation = await prisma.reservation.findFirst({
        where: {
          roomId: room.id,
          checkIn: { lte: now },
          checkOut: { gt: now },
          status: {
            in: ['CONFIRMED', 'PENDING_PAYMENT']
          }
        }
      })

      // Determinar nuevo status
      const newStatus = activeReservation ? 'OCCUPIED' : 'AVAILABLE'

      // Actualizar si cambió
      if (room.status !== newStatus) {
        await prisma.room.update({
          where: { id: room.id },
          data: { status: newStatus }
        })
        
        updates.push({
          roomNumber: room.number,
          from: room.status,
          to: newStatus
        })
        
        updated++
      }
    }

    return NextResponse.json({
      message: `Sincronización completada: ${updated} habitaciones actualizadas`,
      updated,
      total: rooms.length,
      changes: updates
    })

  } catch (error) {
    console.error('Error syncing room status:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
