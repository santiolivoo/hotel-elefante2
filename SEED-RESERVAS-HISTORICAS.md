# 🌱 Seed de Reservas Históricas

## 📋 Descripción

Script para agregar reservas históricas de **Enero 2025 a Septiembre 2025** sin eliminar las reservas existentes.

---

## 🎯 Características

### **Reservas Creadas:**
- **Total:** 23 reservas
- **Período:** Enero - Septiembre 2025
- **Usuario:** usuario@hotelelefante.com
- **Estado:** COMPLETED (completadas)
- **Distribución:** Entre 2-3 reservas por mes

### **Detalle por Mes:**

| Mes | Reservas | Fechas |
|-----|----------|--------|
| Enero 2025 | 2 | 10-13 ene, 20-25 ene |
| Febrero 2025 | 3 | 5-8 feb, 14-17 feb, 25-28 feb |
| Marzo 2025 | 2 | 8-12 mar, 22-26 mar |
| Abril 2025 | 3 | 3-7 abr, 15-18 abr, 28 abr-1 may |
| Mayo 2025 | 2 | 10-14 may, 24-28 may |
| Junio 2025 | 3 | 5-9 jun, 15-20 jun, 26-30 jun |
| Julio 2025 | 3 | 8-12 jul, 18-22 jul, 28-31 jul |
| Agosto 2025 | 2 | 7-11 ago, 22-26 ago |
| Septiembre 2025 | 3 | 5-9 sep, 15-19 sep, 25-29 sep |

---

## 🚀 Cómo Ejecutar

### **Opción 1: Node directo**
```bash
node prisma/seed-reservations.js
```

### **Opción 2: npm script** (si lo agregas a package.json)
```bash
npm run seed:reservations
```

---

## ⚙️ Lógica del Seed

### **1. Busca Usuario**
```javascript
const user = await prisma.user.findUnique({
  where: { email: 'usuario@hotelelefante.com' }
})
```

### **2. Obtiene Habitaciones**
```javascript
const rooms = await prisma.room.findMany({
  include: { roomType: true }
})
```

### **3. Crea Reservas**
Para cada reserva:
- Selecciona habitación aleatoria
- Calcula días de estancia
- Calcula monto total (precio base × días)
- Marca como COMPLETED con paidAmount completo
- Fecha de creación = fecha de check-in

---

## 💰 Cálculo de Montos

```javascript
const days = (checkOut - checkIn) / (1000 * 60 * 60 * 24)
const totalAmount = roomType.basePrice * days
const paidAmount = totalAmount  // Completadas = 100% pagado
```

**Ejemplo:**
```
Habitación: Suite Deluxe ($25,000/noche)
Check-in: 10 enero
Check-out: 13 enero
Días: 3
Total: $75,000
Pagado: $75,000
```

---

## 📊 Impacto en Dashboard

### **Gráfico de Ingresos 2025:**
```
Ene: $X (2 reservas)
Feb: $Y (3 reservas)
Mar: $Z (2 reservas)
...
Sep: $W (3 reservas)
```

### **Estadísticas:**
```
Total Reservas: +23
Total Ingresos: Suma de todas las reservas
Estado: COMPLETED
```

---

## ✅ Verificación

### **1. Ejecutar el Seed**
```bash
node prisma/seed-reservations.js
```

**Output esperado:**
```
🌱 Iniciando seed de reservas históricas...
✅ Usuario encontrado: usuario@hotelelefante.com
✅ 5 habitaciones encontradas

📅 Creando 23 reservas históricas...

✅ Reserva 1: enero de 2025 - Suite Deluxe - $75,000
✅ Reserva 2: enero de 2025 - Habitación Estándar - $50,000
...
✅ Reserva 23: septiembre de 2025 - Suite Premium - $120,000

✅ Seed completado: 23 reservas creadas exitosamente

📊 Resumen por mes:
   Enero 2025: 2 reservas
   Febrero 2025: 3 reservas
   ...
   Septiembre 2025: 3 reservas

💰 Total esperado en ingresos visible en el dashboard
```

### **2. Verificar en Base de Datos**
```sql
SELECT 
  MONTH(checkIn) as mes,
  COUNT(*) as cantidad,
  SUM(paidAmount) as ingresos
FROM Reservation
WHERE YEAR(checkIn) = 2025
  AND MONTH(checkIn) BETWEEN 1 AND 9
  AND userId = (SELECT id FROM User WHERE email = 'usuario@hotelelefante.com')
GROUP BY MONTH(checkIn)
ORDER BY mes
```

### **3. Verificar en Dashboard**
```
1. Login como admin
2. Ir a /admin/dashboard
3. Selector de año: 2025
4. ✅ Ver barras en Ene-Sep
5. ✅ Hover en cada barra para ver detalles
```

### **4. Verificar en Mis Reservas**
```
1. Login como usuario@hotelelefante.com
2. Ir a /mis-reservas
3. Tab: "Pasadas"
4. ✅ Ver 23 reservas COMPLETED
```

---

## 🎯 Características del Script

### **Seguro:**
```javascript
// No elimina datos existentes
// Solo agrega nuevas reservas
// Si falla, no afecta otras reservas
```

### **Realista:**
```javascript
// Habitaciones aleatorias
// Diferentes duraciones (3-5 días)
// Diferentes cantidades de huéspedes (2-4)
// Precios calculados según tipo de habitación
```

### **Trazable:**
```javascript
// Console.log detallado
// Manejo de errores por reserva
// Resumen al final
```

---

## 🔧 Personalización

### **Cambiar Usuario:**
```javascript
const user = await prisma.user.findUnique({
  where: { email: 'otro@email.com' }  // ← Cambiar aquí
})
```

### **Agregar Más Meses:**
```javascript
// OCTUBRE 2025 (agregar después de Septiembre)
{
  checkIn: new Date('2025-10-05T00:00:00.000Z'),
  checkOut: new Date('2025-10-09T00:00:00.000Z'),
  guests: 2,
  status: 'COMPLETED'
},
```

### **Cambiar Estado:**
```javascript
// Para reservas confirmadas pero no completadas:
status: 'CONFIRMED'  // En vez de 'COMPLETED'
```

### **Cambiar Rango de Fechas:**
```javascript
// Cambiar año completo:
new Date('2024-01-10T00:00:00.000Z')  // 2024 en vez de 2025
```

---

## 📈 Distribución de Reservas

### **Por Mes:**
```
        3 ┤  ██    ██  ██ ██       ██
        2 ┤  ██ ██ ██  ██ ██ ██    ██
        1 ┤  ──────────────────────────
          └  Ene Feb Mar Abr May Jun Jul Ago Sep
```

### **Por Duración:**
```
3 días:  ~40% de reservas
4 días:  ~35% de reservas
5 días:  ~25% de reservas
```

### **Por Huéspedes:**
```
2 huéspedes: ~60%
3 huéspedes: ~25%
4 huéspedes: ~15%
```

---

## 🐛 Troubleshooting

### **Error: Usuario no encontrado**
```
❌ Usuario de prueba no encontrado

Solución:
1. Verificar que el usuario existe:
   SELECT * FROM User WHERE email = 'usuario@hotelelefante.com'
2. Si no existe, ejecutar seed principal:
   npx prisma db seed
```

### **Error: No hay habitaciones**
```
❌ No hay habitaciones disponibles

Solución:
1. Verificar habitaciones en BDD:
   SELECT * FROM Room
2. Ejecutar seed principal si necesario:
   npx prisma db seed
```

### **Error: Fecha duplicada**
```
❌ Error creando reserva: Unique constraint failed

Solución:
- Cambiar fechas en el script
- O eliminar reservas existentes de ese período
```

### **Reservas no aparecen en Dashboard**
```
Verificar:
1. Estado es 'CONFIRMED' o 'COMPLETED'
2. paidAmount > 0
3. Año correcto en selector
4. Mes correcto (getUTCMonth)
```

---

## 📝 Notas Importantes

### **Formato de Fechas:**
```javascript
// ✅ CORRECTO - ISO 8601 UTC:
new Date('2025-01-10T00:00:00.000Z')

// ❌ INCORRECTO - Puede causar problemas de timezone:
new Date('2025-01-10')
new Date('2025/01/10')
```

### **Estado de Reservas:**
```javascript
// COMPLETED: Reserva ya ocurrió, pagada completo
// CONFIRMED: Reserva confirmada, futuro o en curso
// PENDING_PAYMENT: Esperando pago
// CANCELLED: Cancelada
```

### **Fechas de Creación:**
```javascript
createdAt: resData.checkIn  // Simula que se reservó el día del check-in
// Para más realismo, podrías usar:
// createdAt: new Date(resData.checkIn.getTime() - 7 * 24 * 60 * 60 * 1000)
// (7 días antes del check-in)
```

---

## 🎉 Resultado Esperado

### **Después de ejecutar:**

**Dashboard mostrará:**
```
📊 Ingresos por Mes 2025
   Barras visibles en todos los meses Ene-Sep
   Cada barra con altura proporcional a ingresos
   Hover muestra detalles por mes
```

**Mis Reservas mostrará:**
```
📅 Tab "Pasadas"
   23 reservas adicionales COMPLETED
   Usuario: usuario@hotelelefante.com
   Período: Enero - Septiembre 2025
```

**Base de Datos:**
```
+23 filas en tabla Reservation
Status: COMPLETED
paidAmount: Completo
checkIn: Enero-Septiembre 2025
```

---

## 🚀 Ejecutar Ahora

```bash
# Navegar a la carpeta del proyecto
cd "c:\Users\santi\OneDrive\Escritorio\PROYECTOS\HOTEL ELEFANTE 2"

# Ejecutar el seed
node prisma/seed-reservations.js

# Ver resultado en dashboard
# http://localhost:3002/admin/dashboard
```

---

**¡Listo para ejecutar y poblar el dashboard con datos históricos!** 📊
