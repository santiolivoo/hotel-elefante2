import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'
const nodemailer = require('nodemailer')

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'OPERATOR')) {
      return NextResponse.json(
        { message: 'No autorizado' },
        { status: 401 }
      )
    }

    const { testEmail } = await request.json()

    if (!testEmail) {
      return NextResponse.json(
        { message: 'Email de prueba requerido' },
        { status: 400 }
      )
    }

    // Verificar configuración
    if (!process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      return NextResponse.json(
        { 
          success: false,
          message: 'Configuración de email incompleta',
          details: 'Faltan SMTP_USER o SMTP_PASSWORD en las variables de entorno'
        },
        { status: 400 }
      )
    }

    // Crear transportador
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      },
      tls: {
        rejectUnauthorized: false
      }
    })

    // Verificar conexión
    await transporter.verify()
    console.log('✅ Conexión SMTP verificada')

    // Enviar email de prueba
    const info = await transporter.sendMail({
      from: `"Hotel Elefante - Test" <${process.env.SMTP_USER}>`,
      to: testEmail,
      subject: '✅ Test de Email - Hotel Elefante',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: linear-gradient(135deg, #D4C56D 0%, #748067 100%); color: white; padding: 30px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 30px; background: #f9f9f9; border-radius: 0 0 8px 8px; }
            .success { background: #d4edda; color: #155724; padding: 15px; border-radius: 5px; margin: 20px 0; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>🏨 Hotel Elefante</h1>
              <h2>Test de Configuración de Email</h2>
            </div>
            
            <div class="content">
              <div class="success">
                <strong>✅ ¡Éxito!</strong> El sistema de emails está funcionando correctamente.
              </div>
              
              <p><strong>Detalles de la prueba:</strong></p>
              <ul>
                <li>Servidor SMTP: ${process.env.SMTP_HOST}</li>
                <li>Puerto: ${process.env.SMTP_PORT}</li>
                <li>Usuario: ${process.env.SMTP_USER}</li>
                <li>Fecha: ${new Date().toLocaleString('es-AR')}</li>
              </ul>
              
              <p>El sistema de notificaciones por email está operativo y listo para:</p>
              <ul>
                <li>📧 Confirmaciones de reserva</li>
                <li>💬 Respuestas a consultas de clientes</li>
                <li>🎉 Envío de promociones</li>
              </ul>
              
              <p style="margin-top: 30px; color: #666; font-size: 14px;">
                Este es un email de prueba generado por el sistema de gestión de Hotel Elefante.
              </p>
            </div>
          </div>
        </body>
        </html>
      `
    })

    console.log('✅ Email de prueba enviado:', info.messageId)

    return NextResponse.json({
      success: true,
      message: 'Email de prueba enviado exitosamente',
      details: {
        messageId: info.messageId,
        recipient: testEmail,
        smtp: {
          host: process.env.SMTP_HOST,
          port: process.env.SMTP_PORT,
          user: process.env.SMTP_USER
        }
      }
    })

  } catch (error) {
    console.error('❌ Error en test de email:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Error al enviar email de prueba',
      error: error.message,
      details: {
        code: error.code,
        command: error.command,
        response: error.response
      }
    }, { status: 500 })
  }
}
