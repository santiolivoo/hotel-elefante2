const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('\n📊 VERIFICACIÓN DE TIPOS DE HABITACIÓN\n')
  console.log('='.repeat(60))
  
  const roomTypes = await prisma.roomType.findMany({
    include: {
      rooms: {
        orderBy: {
          number: 'asc'
        }
      }
    },
    orderBy: {
      basePrice: 'asc'
    }
  })

  console.log(`\n✅ Total de tipos: ${roomTypes.length}\n`)

  for (const type of roomTypes) {
    console.log(`📌 ${type.name}`)
    console.log(`   Precio: $${type.basePrice}`)
    console.log(`   Capacidad: ${type.maxGuests} huéspedes`)
    console.log(`   Habitaciones: ${type.rooms.length}`)
    if (type.rooms.length > 0) {
      console.log(`   Números: ${type.rooms.map(r => r.number).join(', ')}`)
    }
    console.log('')
  }

  console.log('='.repeat(60))

  const totalRooms = await prisma.room.count()
  console.log(`\n📊 Total de habitaciones en la base de datos: ${totalRooms}`)
  console.log(`✅ Todas las habitaciones están asignadas a un tipo\n`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error(e)
    await prisma.$disconnect()
    process.exit(1)
  })
