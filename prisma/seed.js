const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Iniciando seed de la base de datos...')

  // Limpiar datos existentes
  await prisma.reply.deleteMany()
  await prisma.contactMessage.deleteMany()
  await prisma.reservation.deleteMany()
  await prisma.room.deleteMany()
  await prisma.roomType.deleteMany()
  await prisma.service.deleteMany()
  await prisma.operator.deleteMany()
  await prisma.user.deleteMany()

  console.log('🗑️ Datos existentes eliminados')

  // Crear usuarios
  const adminPassword = await bcrypt.hash('admin123', 12)
  const operatorPassword = await bcrypt.hash('operador123', 12)
  const userPassword = await bcrypt.hash('usuario123', 12)

  const admin = await prisma.user.create({
    data: {
      email: 'admin@hotelelefante.com',
      passwordHash: adminPassword,
      name: 'Administrador Hotel',
      role: 'ADMIN'
    }
  })

  const operator = await prisma.user.create({
    data: {
      email: 'operador@hotelelefante.com',
      passwordHash: operatorPassword,
      name: 'Operador Hotel',
      role: 'OPERATOR'
    }
  })

  const user1 = await prisma.user.create({
    data: {
      email: 'usuario@hotelelefante.com',
      passwordHash: userPassword,
      name: 'Usuario Demo',
      role: 'USER'
    }
  })

  const user2 = await prisma.user.create({
    data: {
      email: 'juan.perez@email.com',
      passwordHash: userPassword,
      name: 'Juan Pérez',
      role: 'USER'
    }
  })

  const user3 = await prisma.user.create({
    data: {
      email: 'maria.garcia@email.com',
      passwordHash: userPassword,
      name: 'María García',
      role: 'USER'
    }
  })

  const user4 = await prisma.user.create({
    data: {
      email: 'ana.martinez@email.com',
      passwordHash: userPassword,
      name: 'Ana Martínez',
      role: 'USER'
    }
  })

  const user5 = await prisma.user.create({
    data: {
      email: 'laura.fernandez@email.com',
      passwordHash: userPassword,
      name: 'Laura Fernández',
      role: 'USER'
    }
  })

  const user6 = await prisma.user.create({
    data: {
      email: 'roberto.silva@email.com',
      passwordHash: userPassword,
      name: 'Roberto Silva',
      role: 'USER'
    }
  })

  const user7 = await prisma.user.create({
    data: {
      email: 'carlos.ruiz@email.com',
      passwordHash: userPassword,
      name: 'Carlos Ruiz',
      role: 'USER'
    }
  })

  const user8 = await prisma.user.create({
    data: {
      email: 'sofia.lopez@email.com',
      passwordHash: userPassword,
      name: 'Sofía López',
      role: 'USER'
    }
  })

  const user9 = await prisma.user.create({
    data: {
      email: 'diego.torres@email.com',
      passwordHash: userPassword,
      name: 'Diego Torres',
      role: 'USER'
    }
  })

  const user10 = await prisma.user.create({
    data: {
      email: 'valentina.rojas@email.com',
      passwordHash: userPassword,
      name: 'Valentina Rojas',
      role: 'USER'
    }
  })

  console.log('👥 Usuarios creados: 13 usuarios en total')

  // Crear información de operador
  await prisma.operator.create({
    data: {
      userId: operator.id,
      phone: '+54 387 123-4567',
      active: true
    }
  })

  console.log('🔧 Información de operador creada')

  // Crear tipos de habitación
  const suiteEstandarType = await prisma.roomType.create({
    data: {
      name: 'Suite Estándar',
      description: 'Cómoda suite con todas las comodidades básicas para una estadía perfecta.',
      basePrice: 15000,
      maxGuests: 2
    }
  })

  const suiteDeluxeType = await prisma.roomType.create({
    data: {
      name: 'Suite Deluxe',
      description: 'Espaciosa suite con vista panorámica al Cerro Elefante y amenidades premium.',
      basePrice: 25000,
      maxGuests: 3
    }
  })

  const suiteFamiliarType = await prisma.roomType.create({
    data: {
      name: 'Suite Familiar',
      description: 'Amplia suite diseñada para familias, con espacio para hasta 4 personas.',
      basePrice: 32000,
      maxGuests: 4
    }
  })

  const suitePresidencialType = await prisma.roomType.create({
    data: {
      name: 'Suite Presidencial',
      description: 'Lujosa suite presidencial con sala de estar separada, jacuzzi y las mejores vistas del hotel.',
      basePrice: 45000,
      maxGuests: 4
    }
  })

  const suiteVIPType = await prisma.roomType.create({
    data: {
      name: 'Suite VIP',
      description: 'Suite exclusiva VIP con todas las amenidades de lujo. Servicio personalizado.',
      basePrice: 38000,
      maxGuests: 3
    }
  })

  console.log('🏠 Tipos de habitación creados')

  // Crear habitaciones
  const rooms = []
  
  // Suites Estándar (101-103)
  for (let i = 1; i <= 3; i++) {
    const room = await prisma.room.create({
      data: {
        number: `10${i}`,
        floor: 1,
        roomTypeId: suiteEstandarType.id,
        status: i <= 2 ? 'AVAILABLE' : 'OCCUPIED',
        description: `Suite estándar en el primer piso con todas las comodidades básicas.`,
        images: JSON.stringify([])
      }
    })
    rooms.push(room)
  }

  // Suites Deluxe (201-204)
  for (let i = 1; i <= 4; i++) {
    const room = await prisma.room.create({
      data: {
        number: `20${i}`,
        floor: 2,
        roomTypeId: suiteDeluxeType.id,
        status: i <= 3 ? 'AVAILABLE' : 'OCCUPIED',
        description: `Suite deluxe con vista panorámica al Cerro Elefante.`,
        images: JSON.stringify([])
      }
    })
    rooms.push(room)
  }

  // Suites Familiares (301-303)
  for (let i = 1; i <= 3; i++) {
    const room = await prisma.room.create({
      data: {
        number: `30${i}`,
        floor: 3,
        roomTypeId: suiteFamiliarType.id,
        status: i <= 2 ? 'AVAILABLE' : 'RESERVED',
        description: `Suite familiar con espacio para toda la familia.`,
        images: JSON.stringify([])
      }
    })
    rooms.push(room)
  }

  // Suites Presidenciales (401-402)
  for (let i = 1; i <= 2; i++) {
    const room = await prisma.room.create({
      data: {
        number: `40${i}`,
        floor: 4,
        roomTypeId: suitePresidencialType.id,
        status: 'AVAILABLE',
        description: `Suite presidencial con jacuzzi y las mejores vistas del hotel.`,
        images: JSON.stringify([])
      }
    })
    rooms.push(room)
  }

  // Suites VIP (501-503)
  for (let i = 1; i <= 3; i++) {
    const room = await prisma.room.create({
      data: {
        number: `50${i}`,
        floor: 5,
        roomTypeId: suiteVIPType.id,
        status: i === 1 ? 'AVAILABLE' : 'OCCUPIED',
        description: `Suite VIP exclusiva con servicio personalizado.`,
        images: JSON.stringify([])
      }
    })
    rooms.push(room)
  }

  console.log('🏨 Habitaciones creadas')

  // Crear reservas de ejemplo
  const reservations = []
  
  // Reserva confirmada
  const reservation1 = await prisma.reservation.create({
    data: {
      roomId: rooms[0].id,
      userId: user1.id,
      checkIn: new Date('2024-12-15'),
      checkOut: new Date('2024-12-18'),
      guests: 2,
      status: 'CONFIRMED',
      totalAmount: 45000,
      paidAmount: 45000
    }
  })
  reservations.push(reservation1)

  // Reserva pendiente de pago
  const reservation2 = await prisma.reservation.create({
    data: {
      roomId: rooms[5].id,
      userId: user2.id,
      checkIn: new Date('2024-12-20'),
      checkOut: new Date('2024-12-23'),
      guests: 3,
      status: 'PENDING_PAYMENT',
      totalAmount: 75000,
      paidAmount: 0
    }
  })
  reservations.push(reservation2)

  // Reserva completada
  const reservation3 = await prisma.reservation.create({
    data: {
      roomId: rooms[10].id,
      userId: user3.id,
      checkIn: new Date('2024-11-01'),
      checkOut: new Date('2024-11-05'),
      guests: 2,
      status: 'COMPLETED',
      totalAmount: 180000,
      paidAmount: 180000
    }
  })
  reservations.push(reservation3)

  console.log('📅 Reservas creadas')

  // Crear mensajes de contacto
  const messages = []
  
  const message1 = await prisma.contactMessage.create({
    data: {
      name: 'Carlos López',
      email: 'carlos.lopez@email.com',
      phone: '+54 387 555-0123',
      subject: 'reserva',
      message: 'Hola, me gustaría consultar sobre disponibilidad para el fin de semana del 25 de diciembre. Somos 4 personas y necesitaríamos una suite.',
      status: 'RECEIVED'
    }
  })
  messages.push(message1)

  const message2 = await prisma.contactMessage.create({
    data: {
      name: 'Ana Martínez',
      email: 'ana.martinez@email.com',
      subject: 'servicios',
      message: '¿Ofrecen servicio de transporte desde el aeropuerto? ¿Cuál es el costo?',
      status: 'IN_PROGRESS'
    }
  })
  messages.push(message2)

  const message3 = await prisma.contactMessage.create({
    data: {
      name: 'Roberto Silva',
      email: 'roberto.silva@email.com',
      phone: '+54 387 555-0456',
      subject: 'eventos',
      message: 'Estamos organizando una boda para 80 personas. ¿Tienen salón de eventos y servicio de catering?',
      status: 'RESOLVED'
    }
  })
  messages.push(message3)

  console.log('💬 Mensajes de contacto creados')

  // Crear respuestas
  await prisma.reply.create({
    data: {
      contactId: message2.id,
      operatorId: operator.id,
      body: 'Hola Ana, sí ofrecemos servicio de transporte desde el aeropuerto. El costo es de $5,000 por trayecto. ¿Te gustaría que coordinemos el servicio para tu llegada?'
    }
  })

  await prisma.reply.create({
    data: {
      contactId: message3.id,
      operatorId: operator.id,
      body: 'Hola Roberto, perfecto para tu evento. Tenemos un salón que puede acomodar hasta 100 personas y ofrecemos servicio completo de catering. Te envío por email el catálogo de servicios y precios.'
    }
  })

  console.log('📧 Respuestas creadas')

  // Crear servicios
  const servicesData = [
    // Servicios Destacados
    {
      title: 'Casino & Entretenimiento',
      description: 'Disfruta de una noche emocionante en nuestro casino exclusivo. Mesas de juego, tragamonedas y entretenimiento de primera clase en un ambiente sofisticado.',
      icon: 'Sparkles',
      features: ['Juegos de mesa', 'Tragamonedas', 'Bar premium', 'Shows en vivo', 'Área VIP'],
      hours: 'Todos los días: 20:00 - 04:00',
      imageUrl: null,
      featured: true,
      active: true,
      order: 1
    },
    {
      title: 'Parapente en Salta',
      description: 'Vive la experiencia única de volar sobre las montañas de Salta. Parapente con instructores certificados y vistas espectaculares del Cerro Elefante.',
      icon: 'Wind',
      features: ['Instructores certificados', 'Equipo profesional', 'Fotos y videos', 'Vuelo tándem', 'Seguro incluido'],
      hours: 'Previa reserva - Según clima',
      imageUrl: null,
      featured: true,
      active: true,
      order: 2
    },
    {
      title: 'Piscina con Vista Panorámica',
      description: 'Sumérgete en nuestra impresionante piscina con vista a las montañas. Bar junto a la piscina, área de descanso y la mejor vista de San Lorenzo.',
      icon: 'Waves',
      features: ['Piscina climatizada', 'Bar de piscina', 'Reposeras', 'Vista panorámica', 'Área para niños'],
      hours: 'Todos los días: 8:00 - 20:00',
      imageUrl: null,
      featured: true,
      active: true,
      order: 3
    },
    // Servicios Principales
    {
      title: 'Restaurante Gourmet',
      description: 'Cocina de autor con lo mejor de la gastronomía regional e internacional. Platos elaborados con ingredientes frescos y locales.',
      icon: 'Utensils',
      features: ['Cocina gourmet', 'Carta de vinos', 'Menú degustación', 'Vista al valle'],
      hours: 'Lunes a Domingo: 7:00 - 23:00',
      imageUrl: null,
      featured: false,
      active: true,
      order: 4
    },
    {
      title: 'Bar junto a la Piscina',
      description: 'Refréscate con cócteles tropicales, bebidas premium y snacks mientras disfrutas del sol.',
      icon: 'Coffee',
      features: ['Cócteles artesanales', 'Bebidas frías', 'Snacks y aperitivos', 'Música ambiente'],
      hours: 'Todos los días: 10:00 - 20:00',
      imageUrl: null,
      featured: false,
      active: true,
      order: 5
    },
    {
      title: 'Desayuno Buffet',
      description: 'Comienza tu día con nuestro completo buffet de desayuno. Opciones dulces, saladas, frutas frescas y café de especialidad.',
      icon: 'UtensilsCrossed',
      features: ['Buffet completo', 'Opciones veganas', 'Frutas frescas', 'Panadería artesanal'],
      hours: 'Todos los días: 7:00 - 11:00',
      imageUrl: null,
      featured: false,
      active: true,
      order: 6
    },
    {
      title: 'Gimnasio Equipado',
      description: 'Mantén tu rutina de ejercicios en nuestro gimnasio completamente equipado con máquinas modernas.',
      icon: 'Dumbbell',
      features: ['Equipamiento moderno', 'Pesas libres', 'Máquinas cardio', 'Vista panorámica'],
      hours: 'Todos los días: 6:00 - 22:00',
      imageUrl: null,
      featured: false,
      active: true,
      order: 7
    },
    {
      title: 'Masajes Corporales',
      description: 'Relájate con nuestros masajes terapéuticos y tratamientos de bienestar. Profesionales certificados y aceites naturales.',
      icon: 'Heart',
      features: ['Masajes relajantes', 'Terapia de piedras', 'Aromaterapia', 'Tratamientos faciales'],
      hours: 'Lunes a Domingo: 9:00 - 21:00',
      imageUrl: null,
      featured: false,
      active: true,
      order: 8
    },
    {
      title: 'Servicio a la Habitación',
      description: 'Disfruta de nuestro menú completo en la comodidad de tu habitación. Servicio disponible las 24 horas.',
      icon: 'Phone',
      features: ['Disponible 24/7', 'Menú completo', 'Desayuno en cama', 'Entrega rápida'],
      hours: 'Disponible 24 horas',
      imageUrl: null,
      featured: false,
      active: true,
      order: 9
    },
    {
      title: 'Servicio de Lavandería',
      description: 'Servicio de lavandería y planchado para que siempre luzcas impecable durante tu estadía.',
      icon: 'Shirt',
      features: ['Lavado y planchado', 'Servicio express', 'Limpieza en seco', 'Entrega en habitación'],
      hours: 'Lunes a Domingo: 8:00 - 20:00',
      imageUrl: null,
      featured: false,
      active: true,
      order: 10
    }
  ]

  for (const serviceData of servicesData) {
    await prisma.service.create({
      data: {
        title: serviceData.title,
        description: serviceData.description,
        icon: serviceData.icon,
        features: JSON.stringify(serviceData.features),
        hours: serviceData.hours,
        imageUrl: serviceData.imageUrl,
        featured: serviceData.featured,
        active: serviceData.active,
        order: serviceData.order
      }
    })
  }

  console.log('✨ Servicios creados')

  console.log('✅ Seed completado exitosamente!')
  console.log('\n📊 Resumen de datos creados:')
  console.log(`👥 Usuarios: ${await prisma.user.count()}`)
  console.log(`🏠 Tipos de habitación: ${await prisma.roomType.count()}`)
  console.log(`🏨 Habitaciones: ${await prisma.room.count()}`)
  console.log(`📅 Reservas: ${await prisma.reservation.count()}`)
  console.log(`💬 Mensajes: ${await prisma.contactMessage.count()}`)
  console.log(`📧 Respuestas: ${await prisma.reply.count()}`)
  console.log(`✨ Servicios: ${await prisma.service.count()}`)
  
  console.log('\n🔑 Credenciales de acceso:')
  console.log('Admin: admin@hotelelefante.com / admin123')
  console.log('Operador: operador@hotelelefante.com / operador123')
  console.log('Usuario: usuario@hotelelefante.com / usuario123')
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
