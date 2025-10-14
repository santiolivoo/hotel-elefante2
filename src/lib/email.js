const nodemailer = require('nodemailer')

// Función helper para formatear fechas correctamente (evita problema de timezone)
const formatLocalDate = (dateString) => {
  if (!dateString) return ''
  const dateStr = typeof dateString === 'string' ? dateString : dateString.toISOString().split('T')[0]
  const [year, month, day] = dateStr.split('-')
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

// Configuración del transportador de email
const createTransporter = () => {
  if (process.env.RESEND_API_KEY) {
    // Usar Resend si está configurado
    return nodemailer.createTransport({
      host: 'smtp.resend.com',
      port: 587,
      secure: false,
      auth: {
        user: 'resend',
        pass: process.env.RESEND_API_KEY
      }
    })
  } else {
    // Usar configuración SMTP tradicional (Gmail)
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: parseInt(process.env.SMTP_PORT) || 587,
      secure: false, // true para 465, false para otros puertos
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD
      },
      tls: {
        // No fallar en certificados inválidos
        rejectUnauthorized: false
      }
    })
  }
}

// Template para confirmación de reserva
const getReservationConfirmationTemplate = (reservation) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Confirmación de Reserva - Hotel Elefante</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .reservation-details { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #eee; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
        .button { display: inline-block; background: #667eea; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏨 Hotel Elefante</h1>
          <h2>Confirmación de Reserva</h2>
        </div>
        
        <div class="content">
          <p>Estimado/a <strong>${reservation.user.name}</strong>,</p>
          
          <p>¡Gracias por elegir Hotel Elefante! Nos complace confirmar su reserva:</p>
          
          <div class="reservation-details">
            <h3>Detalles de su Reserva</h3>
            <div class="detail-row">
              <span><strong>Número de Reserva:</strong></span>
              <span>${reservation.id.slice(-8).toUpperCase()}</span>
            </div>
            <div class="detail-row">
              <span><strong>Habitación:</strong></span>
              <span>${reservation.room.roomType.name} - #${reservation.room.number}</span>
            </div>
            <div class="detail-row">
              <span><strong>Check-in:</strong></span>
              <span>${formatLocalDate(reservation.checkIn)}</span>
            </div>
            <div class="detail-row">
              <span><strong>Check-out:</strong></span>
              <span>${formatLocalDate(reservation.checkOut)}</span>
            </div>
            <div class="detail-row">
              <span><strong>Huéspedes:</strong></span>
              <span>${reservation.guests}</span>
            </div>
            <div class="detail-row">
              <span><strong>Total:</strong></span>
              <span><strong>$${reservation.totalAmount.toLocaleString('es-AR')}</strong></span>
            </div>
          </div>
          
          <p><strong>Información del Hotel:</strong></p>
          <p>📍 San Lorenzo, Salta, Argentina<br>
          📞 +54 387 123-4567<br>
          ✉️ info@hotelelefante.com</p>
          
          <p><strong>Horarios:</strong></p>
          <p>Check-in: 15:00 - 22:00<br>
          Check-out: 08:00 - 11:00</p>
          
          <p>Esperamos recibirle pronto en nuestro hotel. Si tiene alguna pregunta, no dude en contactarnos.</p>
          
          <p>¡Que tenga una excelente estadía!</p>
        </div>
        
        <div class="footer">
          <p>Hotel Elefante - San Lorenzo, Salta, Argentina</p>
          <p>Cerca del majestuoso Cerro Elefante</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Template para respuesta a contacto
const getContactReplyTemplate = (contactMessage, replyBody) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Respuesta a su Consulta - Hotel Elefante</title>
      <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .content { padding: 30px; background: #f9f9f9; }
        .original-message { background: #e9ecef; padding: 15px; border-left: 4px solid #667eea; margin: 20px 0; }
        .reply { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🏨 Hotel Elefante</h1>
          <h2>Respuesta a su Consulta</h2>
        </div>
        
        <div class="content">
          <p>Estimado/a <strong>${contactMessage.name}</strong>,</p>
          
          <p>Gracias por contactarnos. A continuación encontrará la respuesta a su consulta:</p>
          
          <div class="reply">
            ${replyBody.replace(/\n/g, '<br>')}
          </div>
          
          <div class="original-message">
            <h4>Su mensaje original:</h4>
            <p><strong>Asunto:</strong> ${contactMessage.subject}</p>
            <p>${contactMessage.message}</p>
          </div>
          
          <p>Si tiene más preguntas, no dude en contactarnos nuevamente.</p>
          
          <p>Saludos cordiales,<br>
          Equipo Hotel Elefante</p>
        </div>
        
        <div class="footer">
          <p>Hotel Elefante - San Lorenzo, Salta, Argentina</p>
          <p>📞 +54 387 123-4567 | ✉️ info@hotelelefante.com</p>
        </div>
      </div>
    </body>
    </html>
  `
}

// Enviar email de confirmación de reserva
const sendReservationConfirmation = async (reservation) => {
  try {
    const transporter = createTransporter()
    
    const mailOptions = {
      from: `"Hotel Elefante" <${process.env.SMTP_USER || 'noreply@hotelelefante.com'}>`,
      to: reservation.user.email,
      subject: `Confirmación de Reserva #${reservation.id.slice(-8).toUpperCase()} - Hotel Elefante`,
      html: getReservationConfirmationTemplate(reservation)
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('Reservation confirmation email sent:', result.messageId)
    return result
  } catch (error) {
    console.error('Error sending reservation confirmation email:', error)
    throw error
  }
}

// Enviar respuesta a mensaje de contacto
const sendContactReply = async (contactMessage, replyBody) => {
  try {
    const transporter = createTransporter()
    
    const mailOptions = {
      from: `"Hotel Elefante" <${process.env.SMTP_USER || 'noreply@hotelelefante.com'}>`,
      to: contactMessage.email,
      subject: `Re: ${contactMessage.subject} - Hotel Elefante`,
      html: getContactReplyTemplate(contactMessage, replyBody)
    }

    const result = await transporter.sendMail(mailOptions)
    console.log('Contact reply email sent:', result.messageId)
    return result
  } catch (error) {
    console.error('Error sending contact reply email:', error)
    throw error
  }
}

// Exportaciones
module.exports = {
  sendReservationConfirmation,
  sendContactReply
}
