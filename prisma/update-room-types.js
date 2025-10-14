const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
  console.log('🔄 Actualizando tipos de habitación...\n')

  try {
    // 1. Obtener tipos existentes
    const existingTypes = await prisma.roomType.findMany()
    console.log('📋 Tipos existentes:', existingTypes.map(t => t.name).join(', '))

    // 2. Definir los 5 tipos correctos
    const correctTypes = [
      {
        name: 'Estandar',
        description: 'Cómoda habitación con todas las comodidades básicas para una estadía perfecta.',
        basePrice: 15000,
        maxGuests: 2
      },
      {
        name: 'Familiar',
        description: 'Amplia habitación diseñada para familias, con espacio para hasta 4 personas.',
        basePrice: 22000,
        maxGuests: 4
      },
      {
        name: 'Deluxe',
        description: 'Espaciosa habitación con vista panorámica al Cerro Elefante y amenidades premium.',
        basePrice: 35000,
        maxGuests: 3
      },
      {
        name: 'Presidencial',
        description: 'Lujosa suite presidencial con sala de estar separada, jacuzzi y las mejores vistas del hotel.',
        basePrice: 55000,
        maxGuests: 4
      },
      {
        name: 'VIP',
        description: 'Suite exclusiva VIP con todas las amenidades de lujo y servicio personalizado 24/7.',
        basePrice: 75000,
        maxGuests: 2
      }
    ]

    // 3. Crear o actualizar tipos de habitación
    const roomTypes = {}
    
    for (const typeData of correctTypes) {
      const existing = existingTypes.find(t => 
        t.name.toLowerCase().includes(typeData.name.toLowerCase()) ||
        typeData.name.toLowerCase().includes(t.name.toLowerCase())
      )

      if (existing) {
        // Actualizar tipo existente
        const updated = await prisma.roomType.update({
          where: { id: existing.id },
          data: {
            name: typeData.name,
            description: typeData.description,
            basePrice: typeData.basePrice,
            maxGuests: typeData.maxGuests
          }
        })
        roomTypes[typeData.name] = updated
        console.log(`✅ Actualizado: ${typeData.name}`)
      } else {
        // Crear nuevo tipo
        const created = await prisma.roomType.create({
          data: typeData
        })
        roomTypes[typeData.name] = created
        console.log(`✨ Creado: ${typeData.name}`)
      }
    }

    // 4. Obtener todas las habitaciones
    const rooms = await prisma.room.findMany({
      include: {
        roomType: true
      }
    })

    console.log(`\n🏨 Reasignando ${rooms.length} habitaciones...\n`)

    // 5. Reasignar habitaciones según su número
    for (const room of rooms) {
      let newTypeId = null
      let newTypeName = ''

      // Lógica de asignación por número de habitación
      if (room.number.startsWith('1')) {
        // Piso 1: Estandar
        newTypeId = roomTypes['Estandar'].id
        newTypeName = 'Estandar'
      } else if (room.number.startsWith('2')) {
        // Piso 2: Deluxe y Familiar alternados
        const lastDigit = parseInt(room.number.slice(-1))
        if (lastDigit <= 2) {
          newTypeId = roomTypes['Deluxe'].id
          newTypeName = 'Deluxe'
        } else {
          newTypeId = roomTypes['Familiar'].id
          newTypeName = 'Familiar'
        }
      } else if (room.number.startsWith('3')) {
        // Piso 3: Presidencial
        newTypeId = roomTypes['Presidencial'].id
        newTypeName = 'Presidencial'
      } else if (room.number.startsWith('4')) {
        // Piso 4: VIP
        newTypeId = roomTypes['VIP'].id
        newTypeName = 'VIP'
      } else {
        // Por defecto: Estandar
        newTypeId = roomTypes['Estandar'].id
        newTypeName = 'Estandar'
      }

      // Actualizar habitación
      await prisma.room.update({
        where: { id: room.id },
        data: { roomTypeId: newTypeId }
      })

      console.log(`✅ Habitación ${room.number} → ${newTypeName}`)
    }

    // 6. Eliminar tipos no utilizados (si existen tipos extra)
    const typeIdsInUse = Object.values(roomTypes).map(t => t.id)
    const typesToDelete = existingTypes.filter(t => !typeIdsInUse.includes(t.id))

    for (const oldType of typesToDelete) {
      // Verificar que no haya habitaciones usando este tipo
      const roomsWithType = await prisma.room.count({
        where: { roomTypeId: oldType.id }
      })

      if (roomsWithType === 0) {
        await prisma.roomType.delete({
          where: { id: oldType.id }
        })
        console.log(`🗑️ Eliminado tipo obsoleto: ${oldType.name}`)
      }
    }

    // 7. Mostrar resumen final
    console.log('\n📊 RESUMEN FINAL:\n')
    
    const finalTypes = await prisma.roomType.findMany({
      include: {
        rooms: true
      },
      orderBy: {
        basePrice: 'asc'
      }
    })

    for (const type of finalTypes) {
      console.log(`${type.name}:`)
      console.log(`  - Precio: $${type.basePrice}`)
      console.log(`  - Capacidad: ${type.maxGuests} huéspedes`)
      console.log(`  - Habitaciones: ${type.rooms.length}`)
      console.log(`  - Números: ${type.rooms.map(r => r.number).join(', ')}`)
      console.log('')
    }

    console.log('✅ ¡Actualización completada exitosamente!')

  } catch (error) {
    console.error('❌ Error durante la actualización:', error)
    throw error
  }
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
