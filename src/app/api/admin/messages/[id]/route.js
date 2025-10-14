import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function PATCH(request, { params }) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'OPERATOR')) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }

    const { id } = params
    const { status } = await request.json()

    if (!status) {
      return NextResponse.json(
        { message: 'Estado es requerido' },
        { status: 400 }
      )
    }

    const validStatuses = ['RECEIVED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { message: 'Estado inválido' },
        { status: 400 }
      )
    }

    const message = await prisma.contactMessage.update({
      where: { id },
      data: { status },
      include: {
        replies: {
          orderBy: {
            sentAt: 'asc'
          }
        }
      }
    })

    return NextResponse.json({ 
      message: 'Mensaje actualizado exitosamente',
      contactMessage: message 
    })

  } catch (error) {
    console.error('Error updating message:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
