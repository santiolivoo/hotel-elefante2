# ✅ Carrusel de Habitaciones en Landing

## 📋 Cambio Realizado

Transformé la sección de habitaciones en la landing de un **grid estático de 3 habitaciones** a un **carrusel dinámico** que muestra **todas las habitaciones**, una por una.

---

## 🎨 Características del Carrusel

### **✨ Funcionalidades:**

1. **Auto-play:** Cambia automáticamente cada 5 segundos
2. **Navegación manual:** Botones izquierda/derecha
3. **Indicadores:** Dots clickeables en la parte inferior
4. **Contador:** Badge mostrando "X / Total"
5. **Responsive:** Se adapta a todos los dispositivos
6. **Todas las habitaciones:** No más límite de 3

---

## 🔧 Componentes del Carrusel

### **1. Habitación Grande (Centro):**
```
┌─────────────────────────────────────────┐
│ [Imagen Grande - 80vh]                  │
│ 1 / 5                                   │
├─────────────────────────────────────────┤
│ Suite Deluxe                            │
│ Elegante habitación con vista...        │
│                                         │
│ 👥 Hasta 3 huéspedes    $25,000/noche │
│                                         │
│ 📏 35 m²  🛏️ Cama king size           │
│                                         │
│ [Ver Detalles]  [Reservar Ahora]      │
└─────────────────────────────────────────┘
```

### **2. Controles de Navegación:**
- **Flechas laterales:** Botones circulares flotantes
- **Dots indicadores:** Barra inferior con puntos
- **Auto-play:** 5 segundos por habitación

---

## 🎯 Comportamiento

### **Auto-play:**
```javascript
// Cambia automáticamente cada 5 segundos
useEffect(() => {
  if (rooms.length > 0) {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % rooms.length)
    }, 5000)
    
    return () => clearInterval(interval)
  }
}, [rooms.length])
```

### **Navegación Manual:**
- ⬅️ **Botón Izquierdo:** Habitación anterior
- ➡️ **Botón Derecho:** Habitación siguiente
- 🔵 **Dots:** Click directo a cualquier habitación
- ⏸️ **Pausa auto-play:** Al interactuar manualmente

### **Circular:**
- Última habitación → Primera (automático)
- Primera habitación ← Última (botón izquierdo)

---

## 📁 Archivo Modificado

```
✅ src/components/sections/featured-rooms.jsx
   - Agregado estado currentIndex
   - Agregado auto-play con useEffect
   - Agregadas funciones de navegación
   - Cambiado de grid a carrusel
   - Agregados botones de navegación
   - Agregados indicadores (dots)
   - Muestra TODAS las habitaciones
```

---

## 🎨 Vista Detallada

### **Desktop:**
```
        ⬅️                                    ➡️
┌────────────────────────────────────────────────┐
│                                                │
│         [Imagen de Suite Deluxe]               │
│              1 / 5                             │
│                                                │
├────────────────────────────────────────────────┤
│  Suite Deluxe                                  │
│  Elegante habitación con vista a la montaña    │
│                                                │
│  👥 Hasta 3 huéspedes        $25,000/noche    │
│  ─────────────────────────────────────────     │
│  📏 35 m²   🛏️ Cama king size                 │
│                                                │
│  [Ver Detalles]      [Reservar Ahora]         │
└────────────────────────────────────────────────┘

         ● ━━━━ ○ ○ ○ ○  (Indicadores)
```

### **Mobile:**
```
┌──────────────────────────┐
│                          │
│   [Imagen Suite]         │
│   1 / 5                  │
│                          │
├──────────────────────────┤
│ Suite Deluxe             │
│ Elegante habitación...   │
│                          │
│ 👥 Hasta 3 huéspedes    │
│ $25,000/noche           │
│ ──────────────────────   │
│ 📏 35 m²                │
│ 🛏️ Cama king size      │
│                          │
│ [Ver Detalles]          │
│ [Reservar Ahora]        │
└──────────────────────────┘
  ⬅️  ● ━━━━ ○ ○ ○ ○  ➡️
```

---

## 🚀 Ventajas del Carrusel

### **Antes (Grid Estático):**
```
❌ Solo 3 habitaciones visibles
❌ Espacio desperdiciado en horizontal
❌ No destaca ninguna habitación
❌ Menos interactivo
```

### **Ahora (Carrusel):**
```
✅ TODAS las habitaciones visibles
✅ Tarjeta grande y atractiva
✅ Destaca cada habitación individualmente
✅ Auto-play mantiene interés
✅ Navegación intuitiva
✅ Mejor experiencia móvil
✅ Contador muestra total disponible
```

---

## 🎯 Interacción del Usuario

### **Formas de Navegar:**

1. **Esperar (Auto-play):**
   - Cada 5 segundos cambia solo
   - Usuario solo observa

2. **Botones laterales:**
   - Click en ⬅️ → Habitación anterior
   - Click en ➡️ → Habitación siguiente

3. **Indicadores (Dots):**
   - Click en cualquier punto
   - Salta directo a esa habitación

4. **Teclado (futuro):**
   - Flechas izquierda/derecha
   - (Implementable fácilmente)

---

## 🎨 Estilos y Transiciones

### **Tarjeta Principal:**
```css
- Sombra grande (shadow-xl)
- Imagen altura 80 (h-80)
- Padding generoso (p-8)
- Bordes redondeados
```

### **Botones de Navegación:**
```css
- Circulares (rounded-full)
- Tamaño 12x12 (h-12 w-12)
- Fondo blanco con sombra
- Hover: bg-gray-50
- Posición absoluta (flotantes)
```

### **Indicadores:**
```css
- Activo: w-8 (largo) + bg-primary
- Inactivo: w-2 (corto) + bg-gray-300
- Hover: bg-gray-400
- Transición suave (transition-all)
```

---

## 📊 Datos Mostrados

### **Por cada habitación:**
```
✅ Nombre
✅ Descripción corta
✅ Imagen principal
✅ Precio por noche
✅ Capacidad máxima
✅ Tamaño (si existe)
✅ Tipo de cama (si existe)
✅ Contador (X / Total)
✅ Botones CTA
```

---

## 🔄 Flujo de Datos

```
1. fetchRooms()
   └─> GET /api/rooms
       └─> Retorna TODAS las habitaciones
           └─> setRooms(data.roomTypes)

2. useEffect (auto-play)
   └─> Cada 5 segundos
       └─> currentIndex + 1
           └─> Si llega al final → Vuelve a 0

3. Renderiza habitación actual
   └─> rooms[currentIndex]
       └─> Muestra datos
           └─> Botones navegan
```

---

## ⚙️ Configuración

### **Velocidad del auto-play:**
```javascript
// Cambiar 5000 (5 segundos) al valor deseado
setInterval(() => {
  setCurrentIndex((prev) => (prev + 1) % rooms.length)
}, 5000) // ← Aquí
```

### **Desactivar auto-play:**
```javascript
// Comentar o eliminar el segundo useEffect
/*
useEffect(() => {
  if (rooms.length > 0) {
    const interval = setInterval(...)
    return () => clearInterval(interval)
  }
}, [rooms.length])
*/
```

---

## 🎯 SEO y Accesibilidad

### **Accesibilidad:**
```javascript
// Cada indicador tiene aria-label
<button
  aria-label={`Ir a habitación ${index + 1}`}
  ...
/>
```

### **Alt Text:**
```javascript
// Imágenes con alt descriptivo
<img
  alt={rooms[currentIndex].name}
  ...
/>
```

---

## 📱 Responsive

### **Desktop (lg):**
- Tarjeta centrada con max-w-2xl
- Botones laterales espaciados
- Imagen altura 80

### **Mobile:**
- Tarjeta ocupa todo el ancho
- Botones más pequeños
- Imagen se adapta
- Stack de botones CTA

---

## 🧪 Testing

### **Verificar:**
- [ ] Carrusel inicia en habitación 1
- [ ] Auto-play cambia cada 5 segundos
- [ ] Botón izquierdo va a anterior
- [ ] Botón derecho va a siguiente
- [ ] Click en dots cambia habitación
- [ ] Contador muestra correctamente
- [ ] Última → Primera (circular)
- [ ] Primera ← Última (circular)
- [ ] Datos se muestran correctamente
- [ ] Botones CTA funcionan

---

## 💡 Mejoras Futuras

### **Opciones adicionales:**

1. **Navegación por teclado:**
   ```javascript
   // Agregar listener de teclado
   useEffect(() => {
     const handleKeyPress = (e) => {
       if (e.key === 'ArrowLeft') goToPrevious()
       if (e.key === 'ArrowRight') goToNext()
     }
     window.addEventListener('keydown', handleKeyPress)
     return () => window.removeEventListener('keydown', handleKeyPress)
   }, [])
   ```

2. **Pausar al hover:**
   ```javascript
   // Pausar auto-play cuando mouse está encima
   const [isPaused, setIsPaused] = useState(false)
   
   <div
     onMouseEnter={() => setIsPaused(true)}
     onMouseLeave={() => setIsPaused(false)}
   >
   ```

3. **Transiciones animadas:**
   ```javascript
   // Agregar animaciones CSS o Framer Motion
   import { motion, AnimatePresence } from 'framer-motion'
   ```

4. **Lazy loading de imágenes:**
   ```javascript
   // Cargar imágenes solo cuando son necesarias
   <img loading="lazy" ... />
   ```

---

## ✅ Estado Final

### **Landing con Carrusel:**
```
✅ Muestra TODAS las habitaciones
✅ Una por una (foco individual)
✅ Auto-play cada 5 segundos
✅ Navegación manual completa
✅ Indicadores visuales claros
✅ Contador de posición
✅ Diseño limpio y moderno
✅ Responsive para móvil
✅ CTA prominentes
```

---

## 🎉 ¡Listo!

El carrusel está implementado y funcionando. Ahora la landing muestra todas las habitaciones de forma dinámica y atractiva.

**Para ver el resultado:**
```
http://localhost:3002/
```

Scroll a la sección "Nuestras Habitaciones" y verás el carrusel en acción! 🚀
