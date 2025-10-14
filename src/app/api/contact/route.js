import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request) {
  try {
    const { name, email, phone, subject, message } = await request.json()

    // Validate input
    if (!name || !email || !subject || !message) {
      return NextResponse.json(
        { message: 'Nombre, email, asunto y mensaje son requeridos' },
        { status: 400 }
      )
    }

    // Create contact message
    const contactMessage = await prisma.contactMessage.create({
      data: {
        name,
        email,
        phone: phone || null,
        subject,
        message,
        status: 'RECEIVED'
      }
    })

    return NextResponse.json(
      { 
        message: 'Mensaje enviado exitosamente',
        contactMessage: {
          id: contactMessage.id,
          name: contactMessage.name,
          email: contactMessage.email,
          subject: contactMessage.subject,
          createdAt: contactMessage.createdAt
        }
      },
      { status: 201 }
    )

  } catch (error) {
    console.error('Error creating contact message:', error)
    return NextResponse.json(
      { message: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
