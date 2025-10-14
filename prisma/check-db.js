const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  // Contar tipos
  const typesCount = await prisma.roomType.count()
  console.log('Total tipos:', typesCount)
  
  // Listar tipos
  const types = await prisma.roomType.findMany({
    select: {
      id: true,
      name: true,
      basePrice: true,
      maxGuests: true,
      _count: {
        select: {
          rooms: true
        }
      }
    },
    orderBy: {
      basePrice: 'asc'
    }
  })
  
  console.log('\nTipos de habitacion:')
  types.forEach(t => {
    console.log(`- ${t.name}: $${t.basePrice}, ${t.maxGuests} huespedes, ${t._count.rooms} habitaciones`)
  })
  
  // Total habitaciones
  const roomsCount = await prisma.room.count()
  console.log('\nTotal habitaciones:', roomsCount)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('ERROR:', e.message)
    await prisma.$disconnect()
    process.exit(1)
  })
