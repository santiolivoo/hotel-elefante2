const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de reservas históricas...')

  // Buscar usuario de prueba
  const user = await prisma.user.findUnique({
    where: { email: 'usuario@hotelelefante.com' }
  })

  if (!user) {
    console.error('❌ Usuario de prueba no encontrado')
    return
  }

  console.log('✅ Usuario encontrado:', user.email)

  // Obtener todas las habitaciones disponibles
  const rooms = await prisma.room.findMany({
    include: {
      roomType: true
    }
  })

  if (rooms.length === 0) {
    console.error('❌ No hay habitaciones disponibles')
    return
  }

  console.log(`✅ ${rooms.length} habitaciones encontradas`)

  // Definir reservas por mes (enero a septiembre 2025)
  const reservationsData = [
    // ENERO 2025 (2 reservas)
    {
      checkIn: new Date('2025-01-10T00:00:00.000Z'),
      checkOut: new Date('2025-01-13T00:00:00.000Z'),
      guests: 2,
      status: 'COMPLETED'
    },
    {
      checkIn: new Date('2025-01-20T00:00:00.000Z'),
      checkOut: new Date('2025-01-25T00:00:00.000Z'),
      guests: 3,
      status: 'COMPLETED'
    },

    // FEBRERO 2025 (3 reservas)
    {
      checkIn: new Date('2025-02-05T00:00:00.000Z'),
      checkOut: new Date('2025-02-08T00:00:00.000Z'),
      guests: 2,
      status: 'COMPLETED'
    },
    {
      checkIn: new Date('2025-02-14T00:00:00.000Z'),
      checkOut: new Date('2025-02-17T00:00:00.000Z'),
      guests: 2,
      status: 'COMPLETED'
    },
    {
      checkIn: new Date('2025-02-25T00:00:00.000Z'),
      checkOut: new Date('2025-02-28T00:00:00.000Z'),
      guests: 4,
      status: 'COMPLETED'
    },

    // MARZO 2025 (2 reservas)
    {
      checkIn: new Date('2025-03-08T00:00:00.000Z'),
      checkOut: new Date('2025-03-12T00:00:00.000Z'),
      guests: 2,
      status: 'COMPLETED'
    },
    {
      checkIn: new Date('2025-03-22T00:00:00.000Z'),
      checkOut: new Date('2025-03-26T00:00:00.000Z'),
      guests: 3,
      status: 'COMPLETED'
    },

    // ABRIL 2025 (3 reservas)
    {
      checkIn: new Date('2025-04-03T00:00:00.000Z'),
      checkOut: new Date('2025-04-07T00:00:00.000Z'),
      guests: 2,
      status: 'COMPLETED'
    },
    {
      checkIn: new Date('2025-04-15T00:00:00.000Z'),
      checkOut: new Date('2025-04-18T00:00:00.000Z'),
      guests: 4,
      status: 'COMPLETED'
    },
    {
      checkIn: new Date('2025-04-28T00:00:00.000Z'),
      checkOut: new Date('2025-05-01T00:00:00.000Z'),
      guests: 2,
      status: 'COMPLETED'
    },

    // MAYO 2025 (2 reservas)
    {
      checkIn: new Date('2025-05-10T00:00:00.000Z'),
      checkOut: new Date('2025-05-14T00:00:00.000Z'),
      guests: 3,
      status: 'COMPLETED'
    },
    {
      checkIn: new Date('2025-05-24T00:00:00.000Z'),
      checkOut: new Date('2025-05-28T00:00:00.000Z'),
      guests: 2,
      status: 'COMPLETED'
    },

    // JUNIO 2025 (3 reservas)
    {
      checkIn: new Date('2025-06-05T00:00:00.000Z'),
      checkOut: new Date('2025-06-09T00:00:00.000Z'),
      guests: 2,
      status: 'COMPLETED'
    },
    {
      checkIn: new Date('2025-06-15T00:00:00.000Z'),
      checkOut: new Date('2025-06-20T00:00:00.000Z'),
      guests: 4,
      status: 'COMPLETED'
    },
    {
      checkIn: new Date('2025-06-26T00:00:00.000Z'),
      checkOut: new Date('2025-06-30T00:00:00.000Z'),
      guests: 2,
      status: 'COMPLETED'
    },

    // JULIO 2025 (3 reservas)
    {
      checkIn: new Date('2025-07-08T00:00:00.000Z'),
      checkOut: new Date('2025-07-12T00:00:00.000Z'),
      guests: 3,
      status: 'COMPLETED'
    },
    {
      checkIn: new Date('2025-07-18T00:00:00.000Z'),
      checkOut: new Date('2025-07-22T00:00:00.000Z'),
      guests: 2,
      status: 'COMPLETED'
    },
    {
      checkIn: new Date('2025-07-28T00:00:00.000Z'),
      checkOut: new Date('2025-07-31T00:00:00.000Z'),
      guests: 4,
      status: 'COMPLETED'
    },

    // AGOSTO 2025 (2 reservas)
    {
      checkIn: new Date('2025-08-07T00:00:00.000Z'),
      checkOut: new Date('2025-08-11T00:00:00.000Z'),
      guests: 2,
      status: 'COMPLETED'
    },
    {
      checkIn: new Date('2025-08-22T00:00:00.000Z'),
      checkOut: new Date('2025-08-26T00:00:00.000Z'),
      guests: 3,
      status: 'COMPLETED'
    },

    // SEPTIEMBRE 2025 (3 reservas)
    {
      checkIn: new Date('2025-09-05T00:00:00.000Z'),
      checkOut: new Date('2025-09-09T00:00:00.000Z'),
      guests: 2,
      status: 'COMPLETED'
    },
    {
      checkIn: new Date('2025-09-15T00:00:00.000Z'),
      checkOut: new Date('2025-09-19T00:00:00.000Z'),
      guests: 4,
      status: 'COMPLETED'
    },
    {
      checkIn: new Date('2025-09-25T00:00:00.000Z'),
      checkOut: new Date('2025-09-29T00:00:00.000Z'),
      guests: 2,
      status: 'COMPLETED'
    }
  ]

  console.log(`\n📅 Creando ${reservationsData.length} reservas históricas...\n`)

  let createdCount = 0

  for (const resData of reservationsData) {
    // Seleccionar habitación aleatoria
    const randomRoom = rooms[Math.floor(Math.random() * rooms.length)]
    
    // Calcular días de estancia
    const diffTime = Math.abs(resData.checkOut - resData.checkIn)
    const days = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    // Calcular monto total basado en precio de habitación y días
    const basePrice = parseFloat(randomRoom.roomType.basePrice)
    const totalAmount = basePrice * days
    const paidAmount = totalAmount // Completadas = pagadas completo
    
    try {
      const reservation = await prisma.reservation.create({
        data: {
          userId: user.id,
          roomId: randomRoom.id,
          checkIn: resData.checkIn,
          checkOut: resData.checkOut,
          guests: resData.guests,
          totalAmount: totalAmount,
          paidAmount: paidAmount,
          status: resData.status,
          createdAt: resData.checkIn // Fecha de creación = fecha de check-in
        }
      })

      createdCount++
      
      const monthName = resData.checkIn.toLocaleString('es-ES', { month: 'long', year: 'numeric' })
      console.log(`✅ Reserva ${createdCount}: ${monthName} - ${randomRoom.roomType.name} - $${totalAmount.toLocaleString('es-AR')}`)
      
    } catch (error) {
      console.error(`❌ Error creando reserva para ${resData.checkIn}:`, error.message)
    }
  }

  console.log(`\n✅ Seed completado: ${createdCount} reservas creadas exitosamente`)
  
  // Mostrar resumen por mes
  console.log('\n📊 Resumen por mes:')
  const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre']
  const counts = [2, 3, 2, 3, 2, 3, 3, 2, 3]
  
  for (let i = 0; i < months.length; i++) {
    console.log(`   ${months[i]} 2025: ${counts[i]} reservas`)
  }
  
  console.log(`\n💰 Total esperado en ingresos visible en el dashboard`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error en seed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
