# Correcciones Implementadas - 17 Oct 2025

## 1. ✅ Problema: Pendientes de pago no se veían por defecto

### Causa Raíz
El uso de `whereClause.OR` causaba conflictos cuando había múltiples condiciones OR (búsqueda de texto + filtro por defecto).

### Solución
- Implementado sistema de `andConditions` array que combina múltiples condiciones OR correctamente
- Ahora usa `whereClause.AND = [...]` para evitar sobrescribir condiciones
- **Archivo:** `src/app/api/admin/reservations/route.js`

---

## 2. ✅ Dashboard: Tarjetas clickeables con filtros aplicados

### Implementación
Todas las tarjetas del dashboard ahora redirigen a `/admin/reservas` con los filtros apropiados:

| Tarjeta | URL Destino | Filtro Aplicado |
|---------|-------------|-----------------|
| **Huéspedes Activos** | `/admin/reservas?dateRange=current` | Reservas actuales en hotel |
| **Check-ins Hoy** | `/admin/reservas?dateRange=today` | Check-ins de hoy |
| **Check-outs Hoy** | `/admin/reservas?dateRange=checkouts_today` | Check-outs de hoy |
| **Pagos Pendientes** | `/admin/reservas?status=PENDING_PAYMENT` | Estado pendiente de pago |
| **Reservas {año}** | `/admin/reservas?status=CONFIRMED&dateRange=custom&customDateFrom={año}-01-01&customDateTo={año}-12-31` | Reservas confirmadas del año |
| **Ingresos {año}** | `/admin/reservas?status=CONFIRMED&dateRange=custom&customDateFrom={año}-01-01&customDateTo={año}-12-31` | Reservas confirmadas del año |

**Archivo:** `src/app/admin/dashboard/page.js`

---

## 3. ✅ Filtros por Habitación y Tipo de Habitación

### Nuevos Filtros Agregados
- **Tipo de Habitación:** Dropdown con todos los tipos disponibles
- **Número de Habitación:** Dropdown con todas las habitaciones (ordenadas)

### Implementación Técnica
1. **Backend:** Agregado soporte para `roomId` y `roomTypeId` en API
   - `src/app/api/admin/reservations/route.js`
   
2. **Hook:** Actualizado `useReservations` para enviar nuevos parámetros
   - `src/hooks/useReservations.js`

3. **Frontend:** Agregados selectores en UI
   - `src/app/admin/reservas/page.js`
   - `src/app/operador/reservas/page.js`

---

## 4. ✅ Gráfico de Ingresos: Barras clickeables

### Funcionalidad
Al hacer click en una barra del mes, redirige a:
```
/admin/reservas?status=CONFIRMED&dateRange=custom
  &customDateFrom={año}-{mes}-01
  &customDateTo={año}-{mes}-{último día}
```

Muestra todas las reservas **confirmadas** de ese mes específico.

**Archivo:** `src/app/admin/dashboard/page.js`

---

## 5. ✅ Gráfico Pie: Segmentos clickeables

### Funcionalidad
Al hacer click en un segmento del tipo de habitación, redirige a:
```
/admin/reservas?roomTypeId={id}
  &status=CONFIRMED
  &dateRange=custom
  &customDateFrom={año}-01-01
  &customDateTo={año}-12-31
```

Muestra todas las reservas **confirmadas** de ese tipo de habitación en el año seleccionado.

**Archivo:** `src/app/admin/dashboard/page.js`

---

## Archivos Modificados

1. ✅ `src/app/api/admin/reservations/route.js` - Corregido filtros OR, agregado roomTypeId
2. ✅ `src/hooks/useReservations.js` - Agregados parámetros roomId y roomTypeId
3. ✅ `src/app/admin/dashboard/page.js` - Tarjetas y gráficos clickeables
4. ✅ `src/app/admin/reservas/page.js` - Agregados filtros de habitación
5. ✅ `src/app/operador/reservas/page.js` - Agregados filtros de habitación

---

## Comportamiento Esperado

### Por Defecto (sin filtros)
- ✅ Muestra reservas **pendientes de pago** (todas las fechas)
- ✅ Muestra reservas **futuras** (checkIn >= hoy)
- ❌ NO muestra reservas pasadas

### Con Filtro de Estado Específico
- ✅ Muestra SOLO ese estado (sin restricción de fechas)
- ✅ Ejemplo: "Completada" → muestra todas las completadas, incluso antiguas

### Con Filtros de Habitación
- ✅ Filtra por tipo de habitación
- ✅ Filtra por número de habitación específico
- ✅ Ambos filtros funcionan en combinación con otros filtros

### Navegación desde Dashboard
- ✅ Todas las tarjetas redirigen con filtros apropiados
- ✅ Gráfico de barras → filtra por mes específico
- ✅ Gráfico pie → filtra por tipo de habitación
- ✅ Los filtros se aplican automáticamente al cargar la página

---

## Pendientes Previos Ya Resueltos

### ✅ Timezone en fechas personalizadas
Corregido usando `split()` para evitar conversión UTC incorrecta.

### ✅ Total de reservas
Ahora muestra el total global de todas las reservas en DB (no el filtrado).

### ✅ Validación de fechas
- Campo "hasta" tiene `min={desde}` para prevenir fechas inválidas
- Auto-completa "hasta" con +7 días cuando seleccionas "desde"

---

## Testing Recomendado

1. **Dashboard → Tarjetas**: Click en cada tarjeta y verificar filtros aplicados
2. **Dashboard → Gráficos**: Click en barras y segmentos del pie
3. **Reservas → Filtros**: Probar combinaciones de filtros (estado + habitación + fechas)
4. **Pagos Pendientes**: Verificar que se ven por defecto y con filtro específico
5. **Fechas Personalizadas**: Verificar que no hay desfase de días
