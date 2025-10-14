const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

const servicesData = [
  // Servicios Destacados
  {
    title: 'Casino & Entretenimiento',
    description: 'Disfruta de una noche emocionante en nuestro casino exclusivo. Mesas de juego, tragamonedas y entretenimiento de primera clase en un ambiente sofisticado.',
    icon: 'Sparkles',
    features: ['Juegos de mesa', 'Tragamonedas', 'Bar premium', 'Shows en vivo', 'Área VIP'],
    hours: 'Todos los días: 20:00 - 04:00',
    imageUrl: '/Imagenes del hotel/Acceso a casino.jpg',
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
    imageUrl: '/Imagenes del hotel/Servicio Parapente Salta.jpg',
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
    imageUrl: '/Imagenes del hotel/Bar junto a la piscina.jpg',
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
    imageUrl: '/Imagenes del hotel/Restaurante Gourmet.jpg',
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
    imageUrl: '/Imagenes del hotel/Bar junto a la piscina.jpg',
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
    imageUrl: '/Imagenes del hotel/Desayuno Buffet.jpg',
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
    imageUrl: '/Imagenes del hotel/GYM.jpg',
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
    imageUrl: '/Imagenes del hotel/Masajes Corporales.jpg',
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
    imageUrl: '/Imagenes del hotel/Servicio a la habitacion.jpg',
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
    imageUrl: '/Imagenes del hotel/Servicio de Lavanderia.jpg',
    featured: false,
    active: true,
    order: 10
  }
]

async function main() {
  console.log('🌱 Iniciando seed de servicios...')

  // Eliminar servicios existentes
  await prisma.service.deleteMany()
  console.log('🗑️ Servicios existentes eliminados')

  // Crear servicios
  for (const serviceData of servicesData) {
    const service = await prisma.service.create({
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
    console.log(`✅ Servicio creado: ${service.title}`)
  }

  console.log('✨ Seed de servicios completado!')
}

main()
  .catch((e) => {
    console.error('❌ Error durante el seed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
