# 📊 Análisis - Disponibilidad de Habitaciones

## 1️⃣ **Análisis Check-outs Hoy**

### ✅ **Resultado: Funcionan Correctamente**

**Admin Reservas:**
```javascript
// Línea 223-226
checkOutsToday: reservations.filter(r => {
  const checkOutStr = new Date(r.checkOut).toISOString().split('T')[0]
  return checkOutStr === todayStr
}).length,
```

**Operador Reservas:**
```javascript
// Línea 187-190
checkOutsToday: reservations.filter(r => {
  const checkOutStr = new Date(r.checkOut).toISOString().split('T')[0]
  return checkOutStr === todayStr
}).length,
```

### **Conclusión:**
✅ Ambas páginas usan comparación de strings ISO  
✅ Sin problemas de timezone  
✅ Check-outs se cuentan correctamente  

---

## 2️⃣ **Análisis Lógica de Disponibilidad**

### ❌ **Problemas Actuales**

#### **Problema 1: Dependencia del Status de Habitación**

**Ubicación:** `src/app/api/reservations/route.js` (líneas 66-74)

```javascript
// ❌ ACTUAL: Primero filtra por status
const roomsOfType = await prisma.room.findMany({
  where: {
    roomTypeId: roomId,
    status: 'AVAILABLE'  // ← Problema: ignora habitaciones OCCUPIED
  }
})
```

**Consecuencia:**
- Si una habitación está marcada como OCCUPIED el 10 de octubre
- Y un usuario quiere reservar para el 20 de octubre
- La habitación NO aparecerá disponible
- Aunque NO tenga reservas para el 20 de octubre

#### **Problema 2: Status Manual sin Asociación**

**Ubicación:** `src/app/api/admin/rooms/[id]/route.js` (líneas 56-66)

```javascript
// ❌ ACTUAL: Cambia status sin verificar reservas
const updateData = {}
if (data.status) updateData.status = data.status

await prisma.room.update({
  where: { id: roomId },
  data: updateData
})
```

**Consecuencia:**
- Admin marca habitación como OCCUPIED
- No se asocia a ninguna reserva
- No se sabe quién la ocupa ni hasta cuándo
- No se puede liberar automáticamente

#### **Problema 3: Verificación de Disponibilidad Tardía**

**Flujo actual:**
```
1. Buscar habitaciones con status AVAILABLE ❌
2. De esas, verificar si tienen reservas conflictivas ✅
3. Seleccionar primera habitación sin conflictos
```

**Problema:**
- Habitaciones potencialmente disponibles se descartan en paso 1
- Solo porque tienen status OCCUPIED/CLEANING/etc.
- Pero podrían estar libres para las fechas solicitadas

---

## 🎯 **Solución Propuesta**

### **A. Cambiar Lógica de Disponibilidad**

#### **Nueva Lógica:**
```
1. Buscar TODAS las habitaciones del tipo (excepto MAINTENANCE)
2. Verificar cuáles tienen reservas conflictivas para las fechas
3. Las que NO tengan conflictos están disponibles
4. Ignorar status AVAILABLE/OCCUPIED (son indicativos, no definitivos)
```

#### **Implementación:**

**Archivo:** `src/app/api/reservations/route.js`

```javascript
// ✅ NUEVO: Buscar todas excepto en mantenimiento
const roomsOfType = await prisma.room.findMany({
  where: {
    roomTypeId: roomId,
    status: {
      not: 'MAINTENANCE'  // Solo excluir las que realmente no están operativas
    }
  },
  include: {
    roomType: true
  }
})

// ✅ Verificar disponibilidad basándose solo en reservas
for (const room of roomsOfType) {
  const conflictingReservations = await prisma.reservation.findMany({
    where: {
      roomId: room.id,
      status: {
        in: ['PENDING_PAYMENT', 'CONFIRMED']
      },
      OR: [
        // ... lógica de conflictos existente
      ]
    }
  })

  if (conflictingReservations.length === 0) {
    selectedRoom = room
    break
  }
}
```

---

### **B. Asociar Status OCCUPIED a Reservas**

#### **Opción 1: Crear Reserva Manual (Recomendado)**

Cuando admin/operador marquen OCCUPIED, crear una reserva:

```javascript
// Nuevo endpoint: POST /api/admin/rooms/[id]/occupy
{
  guestName: "Juan Pérez",
  checkIn: "2025-10-13",
  checkOut: "2025-10-15",
  guests: 2,
  type: "WALK_IN" // Reserva sin pago online
}
```

**Ventajas:**
- Trazabilidad completa
- Se sabe quién ocupa la habitación
- Se puede liberar automáticamente al hacer checkout
- Aparece en reportes de ocupación
- Compatible con sistema existente

#### **Opción 2: Reserva Asociada (Alternativa)**

Al marcar OCCUPIED, seleccionar de reservas existentes:

```javascript
// PATCH /api/admin/rooms/[id]
{
  status: "OCCUPIED",
  reservationId: "clxxxx" // Asociar a reserva existente
}
```

**Ventajas:**
- Vincula status con reserva
- Más simple si ya existe la reserva
- Evita crear reservas duplicadas

---

### **C. Auto-actualización de Status**

Crear un sistema que actualice automáticamente el status de habitaciones:

```javascript
// Función auxiliar: getActualRoomStatus()
async function getActualRoomStatus(roomId) {
  const now = new Date()
  
  // Verificar si tiene reserva activa ahora
  const activeReservation = await prisma.reservation.findFirst({
    where: {
      roomId: roomId,
      checkIn: { lte: now },
      checkOut: { gt: now },
      status: { in: ['CONFIRMED', 'PENDING_PAYMENT'] }
    }
  })
  
  if (activeReservation) {
    return 'OCCUPIED'
  }
  
  // Si no tiene reserva activa, verificar status manual
  const room = await prisma.room.findUnique({
    where: { id: roomId }
  })
  
  // Si está en MAINTENANCE, mantenerlo
  if (room.status === 'MAINTENANCE') {
    return 'MAINTENANCE'
  }
  
  // Si no tiene reserva y no está en mantenimiento, está disponible
  return 'AVAILABLE'
}
```

---

## 📋 **Plan de Implementación**

### **Fase 1: Fix Lógica de Disponibilidad (Alta Prioridad)**

#### **Archivos a Modificar:**

**1. `/src/app/api/reservations/route.js`**
```javascript
// Línea 66: Cambiar filtro de habitaciones
// ANTES:
where: {
  roomTypeId: roomId,
  status: 'AVAILABLE'
}

// DESPUÉS:
where: {
  roomTypeId: roomId,
  status: { not: 'MAINTENANCE' }
}
```

**2. `/src/app/api/rooms/route.js`**
```javascript
// Línea 10: Cambiar para considerar disponibilidad por fechas

// ANTES:
rooms: {
  where: { status: 'AVAILABLE' }
}

// DESPUÉS:
// Opción A: Mostrar todos y calcular disponibilidad en frontend
rooms: {
  where: { status: { not: 'MAINTENANCE' } }
}

// Opción B: Recibir fechas y calcular disponibilidad
// Requiere agregar checkIn/checkOut como query params
```

---

### **Fase 2: Sistema de Ocupación Manual (Media Prioridad)**

#### **Nuevo Endpoint: `/api/admin/rooms/[id]/manual-reservation`**

```javascript
// POST /api/admin/rooms/[id]/manual-reservation
export async function POST(request, { params }) {
  const session = await getServerSession(authOptions)
  
  if (!session || !['ADMIN', 'OPERATOR'].includes(session.user.role)) {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const { id } = params
  const { guestName, guestEmail, checkIn, checkOut, guests, totalAmount } = await request.json()

  // Validar fechas
  const checkInDate = new Date(checkIn)
  const checkOutDate = new Date(checkOut)

  if (checkOutDate <= checkInDate) {
    return NextResponse.json({ error: 'Fecha de checkout inválida' }, { status: 400 })
  }

  // Verificar disponibilidad
  const conflictingReservations = await prisma.reservation.findMany({
    where: {
      roomId: parseInt(id),
      status: { in: ['PENDING_PAYMENT', 'CONFIRMED'] },
      OR: [
        { AND: [{ checkIn: { lte: checkInDate } }, { checkOut: { gt: checkInDate } }] },
        { AND: [{ checkIn: { lt: checkOutDate } }, { checkOut: { gte: checkOutDate } }] },
        { AND: [{ checkIn: { gte: checkInDate } }, { checkOut: { lte: checkOutDate } }] }
      ]
    }
  })

  if (conflictingReservations.length > 0) {
    return NextResponse.json({ error: 'Habitación no disponible para esas fechas' }, { status: 409 })
  }

  // Crear usuario temporal o usar existente
  let user = await prisma.user.findUnique({ where: { email: guestEmail } })
  
  if (!user) {
    user = await prisma.user.create({
      data: {
        email: guestEmail,
        name: guestName,
        passwordHash: '', // Usuario sin contraseña (walk-in)
        role: 'USER'
      }
    })
  }

  // Crear reserva
  const reservation = await prisma.reservation.create({
    data: {
      roomId: parseInt(id),
      userId: user.id,
      checkIn: checkInDate,
      checkOut: checkOutDate,
      guests,
      totalAmount,
      paidAmount: totalAmount, // Asumimos pago en efectivo
      status: 'CONFIRMED'
    },
    include: {
      room: { include: { roomType: true } },
      user: true
    }
  })

  // Actualizar status de habitación si es hoy
  const today = new Date().toISOString().split('T')[0]
  const checkInStr = checkInDate.toISOString().split('T')[0]
  
  if (checkInStr <= today) {
    await prisma.room.update({
      where: { id: parseInt(id) },
      data: { status: 'OCCUPIED' }
    })
  }

  return NextResponse.json({ 
    message: 'Reserva manual creada',
    reservation 
  })
}
```

---

### **Fase 3: UI para Ocupación Manual**

#### **Modificar: `/src/app/admin/habitaciones/page.js`**

Agregar un nuevo dialog para cuando marquen OCCUPIED:

```javascript
const [occupyDialog, setOccupyDialog] = useState({
  open: false,
  roomId: null,
  roomNumber: ''
})

const [occupyForm, setOccupyForm] = useState({
  guestName: '',
  guestEmail: '',
  checkIn: new Date().toISOString().split('T')[0],
  checkOut: '',
  guests: 1,
  totalAmount: 0
})

// Al seleccionar OCCUPIED en el dropdown:
const handleStatusChange = (roomId, roomNumber, newStatus) => {
  if (newStatus === 'OCCUPIED') {
    setOccupyDialog({
      open: true,
      roomId,
      roomNumber
    })
  } else {
    // Cambiar status directamente para otros casos
    handleChangeStatus(roomId, newStatus)
  }
}

const handleOccupy = async () => {
  try {
    const response = await fetch(`/api/admin/rooms/${occupyDialog.roomId}/manual-reservation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(occupyForm)
    })

    if (response.ok) {
      toast({
        title: 'Habitación ocupada',
        description: 'Reserva manual creada exitosamente'
      })
      setOccupyDialog({ open: false, roomId: null, roomNumber: '' })
      fetchData()
    }
  } catch (error) {
    toast({
      title: 'Error',
      description: 'No se pudo ocupar la habitación',
      variant: 'destructive'
    })
  }
}
```

#### **Dialog UI:**

```jsx
<Dialog open={occupyDialog.open} onOpenChange={(open) => setOccupyDialog({ ...occupyDialog, open })}>
  <DialogContent className="max-w-md">
    <DialogHeader>
      <DialogTitle>Ocupar Habitación #{occupyDialog.roomNumber}</DialogTitle>
    </DialogHeader>
    
    <div className="space-y-4">
      <div>
        <Label>Nombre del Huésped</Label>
        <Input
          value={occupyForm.guestName}
          onChange={(e) => setOccupyForm({ ...occupyForm, guestName: e.target.value })}
          placeholder="Juan Pérez"
        />
      </div>

      <div>
        <Label>Email</Label>
        <Input
          type="email"
          value={occupyForm.guestEmail}
          onChange={(e) => setOccupyForm({ ...occupyForm, guestEmail: e.target.value })}
          placeholder="juan@ejemplo.com"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Check-in</Label>
          <Input
            type="date"
            value={occupyForm.checkIn}
            onChange={(e) => setOccupyForm({ ...occupyForm, checkIn: e.target.value })}
          />
        </div>
        <div>
          <Label>Check-out</Label>
          <Input
            type="date"
            value={occupyForm.checkOut}
            onChange={(e) => setOccupyForm({ ...occupyForm, checkOut: e.target.value })}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Huéspedes</Label>
          <Input
            type="number"
            min="1"
            value={occupyForm.guests}
            onChange={(e) => setOccupyForm({ ...occupyForm, guests: parseInt(e.target.value) })}
          />
        </div>
        <div>
          <Label>Monto Total</Label>
          <Input
            type="number"
            min="0"
            value={occupyForm.totalAmount}
            onChange={(e) => setOccupyForm({ ...occupyForm, totalAmount: parseFloat(e.target.value) })}
            placeholder="150000"
          />
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <Button
          variant="outline"
          onClick={() => setOccupyDialog({ open: false, roomId: null, roomNumber: '' })}
        >
          Cancelar
        </Button>
        <Button onClick={handleOccupy}>
          Confirmar Ocupación
        </Button>
      </div>
    </div>
  </DialogContent>
</Dialog>
```

---

### **Fase 4: Auto-actualización de Status (Baja Prioridad)**

Crear un job o endpoint que actualice automáticamente los status:

```javascript
// /api/admin/rooms/sync-status
export async function POST(request) {
  const session = await getServerSession(authOptions)
  
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
  }

  const now = new Date()
  const todayStr = now.toISOString().split('T')[0]

  // Obtener todas las habitaciones
  const rooms = await prisma.room.findMany()

  let updated = 0

  for (const room of rooms) {
    // No tocar habitaciones en mantenimiento
    if (room.status === 'MAINTENANCE') continue

    // Verificar si tiene reserva activa HOY
    const activeReservation = await prisma.reservation.findFirst({
      where: {
        roomId: room.id,
        checkIn: { lte: now },
        checkOut: { gt: now },
        status: { in: ['CONFIRMED', 'PENDING_PAYMENT'] }
      }
    })

    const newStatus = activeReservation ? 'OCCUPIED' : 'AVAILABLE'

    if (room.status !== newStatus) {
      await prisma.room.update({
        where: { id: room.id },
        data: { status: newStatus }
      })
      updated++
    }
  }

  return NextResponse.json({ 
    message: `${updated} habitaciones actualizadas` 
  })
}
```

Llamar este endpoint:
- Al inicio del día (cron job)
- Después de cada checkout
- Manualmente desde admin panel

---

## 🎯 **Resumen de Cambios**

### **Archivos a Modificar:**

```
✅ src/app/api/reservations/route.js
   - Cambiar filtro de status en línea 69
   
✅ src/app/api/rooms/route.js
   - Cambiar filtro de disponibilidad (línea 11)
   
✅ src/app/api/admin/rooms/[id]/manual-reservation/route.js
   - Crear nuevo endpoint (archivo nuevo)
   
✅ src/app/api/admin/rooms/sync-status/route.js
   - Crear endpoint de sincronización (archivo nuevo)
   
✅ src/app/admin/habitaciones/page.js
   - Agregar dialog de ocupación manual
   - Cambiar handleStatusChange
   
✅ src/app/operador/habitaciones/page.js (si existe)
   - Mismos cambios que admin
```

---

## ✅ **Beneficios**

### **Para Usuarios:**
```
✅ Ven habitaciones realmente disponibles para sus fechas
✅ No se pierden habitaciones disponibles
✅ Mejor experiencia de reserva
```

### **Para Admin/Operador:**
```
✅ Marcan habitaciones ocupadas con datos del huésped
✅ Saben quién ocupa cada habitación
✅ Pueden hacer checkout fácilmente
✅ Reportes más precisos
```

### **Para el Sistema:**
```
✅ Lógica de disponibilidad más robusta
✅ Menos errores de reserva
✅ Trazabilidad completa
✅ Auto-gestión de status
```

---

## 🧪 **Testing**

### **Test 1: Disponibilidad Mejorada**
```
1. Marcar habitación 101 como OCCUPIED para hoy
2. Intentar reservar habitación 101 para mañana
3. ✅ Debería aparecer disponible
4. ✅ Debería permitir reservar
```

### **Test 2: Ocupación Manual**
```
1. Admin marca habitación 102 como OCCUPIED
2. Sistema pide datos del huésped
3. Admin completa formulario
4. ✅ Se crea reserva manual
5. ✅ Habitación marcada como OCCUPIED
6. ✅ Aparece en lista de reservas
```

### **Test 3: Auto-actualización**
```
1. Habitación 103 tiene checkout hoy
2. Operador procesa checkout
3. Sistema ejecuta sync-status
4. ✅ Habitación cambia a AVAILABLE
5. ✅ Disponible para nuevas reservas
```

---

## 🎉 **Resultado Final**

```
Situación Actual:
- Habitación 101: OCCUPIED (manualmente)
- Usuario busca para mañana
- ❌ No aparece disponible (aunque esté libre)

Después de los Cambios:
- Habitación 101: OCCUPIED con reserva hasta hoy
- Usuario busca para mañana
- ✅ Aparece disponible
- ✅ Puede reservar
- Sistema verifica solo reservas conflictivas
```

---

**¿Proceder con la implementación?** 🚀
