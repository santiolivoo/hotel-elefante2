import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
const { sendContactReply } = require('@/lib/email')

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'OPERATOR')) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }

    const { contactId, body } = await request.json()

    if (!contactId || !body) {
      return NextResponse.json(
        { message: 'ID del contacto y mensaje son requeridos' },
        { status: 400 }
      )
    }

    // Verify contact message exists
    const contactMessage = await prisma.contactMessage.findUnique({
      where: { id: contactId }
    })

    if (!contactMessage) {
      return NextResponse.json(
        { message: 'Mensaje de contacto no encontrado' },
        { status: 404 }
      )
    }

    // Create reply
    const reply = await prisma.reply.create({
      data: {
        contactId,
        operatorId: session.user.id,
        body
      }
    })

    // Update contact message status if it was RECEIVED
    if (contactMessage.status === 'RECEIVED') {
      await prisma.contactMessage.update({
        where: { id: contactId },
        data: { status: 'IN_PROGRESS' }
      })
    }

    // Enviar email de respuesta al cliente
    try {
      await sendContactReply(contactMessage, body)
      console.log('✅ Email de respuesta enviado a:', contactMessage.email)
    } catch (emailError) {
      console.error('⚠️ Error enviando email de respuesta:', emailError)
      // No fallar la respuesta si el email falla, solo registrar el error
    }

    return NextResponse.json({ 
      message: 'Respuesta enviada exitosamente',
      reply 
    })

  } catch (error) {
    console.error('Error sending reply:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
