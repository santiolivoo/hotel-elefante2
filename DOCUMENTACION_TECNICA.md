# 📚 DOCUMENTACIÓN TÉCNICA - HOTEL ELEFANTE

## Sistema de Gestión Hotelera Completo

**Versión:** 1.0.0  
**Ubicación:** Hotel Elefante, San Lorenzo, Salta, Argentina  
**Última actualización:** Octubre 2024

---

## 📑 ÍNDICE

1. [Arquitectura General](#arquitectura-general)
2. [Stack Tecnológico](#stack-tecnológico)
3. [Base de Datos](#base-de-datos)
4. [Sistema de Autenticación](#sistema-de-autenticación)
5. [Sistema de Reservas](#sistema-de-reservas)
6. [APIs y Endpoints](#apis-y-endpoints)
7. [Roles y Permisos](#roles-y-permisos)
8. [Componentes Frontend](#componentes-frontend)
9. [Gestión de Estado](#gestión-de-estado)
10. [Emails y Notificaciones](#emails-y-notificaciones)
11. [Variables de Entorno](#variables-de-entorno)
12. [Configuración y Despliegue](#configuración-y-despliegue)

---

## 🏗️ ARQUITECTURA GENERAL

### Patrón Arquitectónico
El proyecto implementa una **arquitectura monolítica Full-Stack** utilizando Next.js 14 con el App Router.

```
┌─────────────────────────────────────────────────────────────┐
│                         CLIENTE                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐         │
│  │   Público   │  │  Usuarios   │  │   Admins    │         │
│  │   Website   │  │  Reservas   │  │  Dashboard  │         │
│  └─────────────┘  └─────────────┘  └─────────────┘         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    NEXT.JS 14 APP ROUTER                     │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Server Components  │  Client Components  │  API      │   │
│  │  (SSR/SSG)         │  (CSR)              │  Routes   │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    CAPA DE SERVICIOS                         │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  NextAuth    │  │  Prisma ORM  │  │  Nodemailer  │      │
│  │  (Auth)      │  │  (Database)  │  │  (Emails)    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    BASE DE DATOS                             │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  PostgreSQL (Supabase)                               │   │
│  │  - Users, Reservations, Rooms, RoomTypes, etc.      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

### Principios de Diseño

1. **Server-First Rendering**: Maximizar el uso de Server Components para mejor SEO y performance
2. **API Routes**: RESTful endpoints en `/api/*` para operaciones CRUD
3. **Type Safety**: Prisma como ORM con tipado automático
4. **Component-Based**: Arquitectura modular con componentes reutilizables
5. **Role-Based Access Control (RBAC)**: Sistema de permisos por roles

---

## 🛠️ STACK TECNOLÓGICO

### Frontend
- **Next.js 14.1.0**: Framework React con App Router
- **React 18.2.0**: Biblioteca de UI
- **TailwindCSS 3.4.1**: Framework CSS utility-first
- **Radix UI**: Componentes UI accesibles y sin estilos
- **Lucide React**: Iconografía
- **Recharts 2.15.4**: Gráficos y visualización de datos
- **React Leaflet 4.2.1**: Mapas interactivos
- **TanStack Query 5.90.5**: Gestión de estado asíncrono y caché

### Backend
- **Next.js API Routes**: Endpoints RESTful
- **Prisma 5.9.1**: ORM para PostgreSQL
- **NextAuth 4.24.6**: Sistema de autenticación
- **bcryptjs 2.4.3**: Encriptación de contraseñas
- **Nodemailer 6.10.1**: Envío de emails

### Base de Datos
- **PostgreSQL**: Base de datos relacional
- **Supabase**: Hosting de PostgreSQL con conexión directa

### Bibliotecas Auxiliares
- **class-variance-authority**: Variantes de componentes
- **clsx + tailwind-merge**: Utilidades para clases CSS
- **tailwindcss-animate**: Animaciones predefinidas

### Desarrollo
- **ESLint**: Linter de código
- **PostCSS**: Procesador CSS
- **Autoprefixer**: Prefijos CSS automáticos

---

## 🗄️ BASE DE DATOS

### Esquema Prisma

El proyecto utiliza **Prisma ORM** con PostgreSQL. El esquema está definido en `prisma/schema.prisma`.

#### Modelos Principales

```prisma
// Usuario del sistema
model User {
  id            String        // CUID único
  email         String        @unique
  passwordHash  String        // Bcrypt hash
  name          String
  role          String        @default("USER") // USER, OPERATOR, ADMIN
  operatorInfo  Operator?     // Relación 1:1 con Operator
  reservations  Reservation[] // Relación 1:N con Reservations
  createdAt     DateTime      @default(now())
  updatedAt     DateTime      @updatedAt
}

// Información adicional de operadores
model Operator {
  id     String
  userId String  @unique
  phone  String?
  active Boolean @default(true)
  user   User    @relation(fields: [userId], references: [id], onDelete: Cascade)
}

// Tipos de habitación (templates)
model RoomType {
  id               Int      @id @default(autoincrement())
  name             String   // Ej: "Suite Deluxe"
  shortDescription String?
  description      String?
  basePrice        Decimal  // Precio base por noche
  maxGuests        Int      // Capacidad máxima
  size             String?  // Ej: "45m²"
  bedType          String?  // Ej: "King size"
  imageUrl         String?  // URL principal
  images           String?  // JSON array de URLs
  rooms            Room[]   // Relación 1:N con habitaciones físicas
  createdAt        DateTime @default(now())
  updatedAt        DateTime @updatedAt
}

// Habitaciones físicas
model Room {
  id           Int           @id @default(autoincrement())
  number       String        @unique  // Ej: "101", "205"
  floor        Int           // Piso del hotel
  roomTypeId   Int           // FK a RoomType
  status       String        @default("AVAILABLE") // AVAILABLE, OCCUPIED, RESERVED, MAINTENANCE
  description  String?
  images       String?       // JSON array
  roomType     RoomType      @relation(fields: [roomTypeId], references: [id])
  reservations Reservation[]
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
}

// Reservas
model Reservation {
  id          String    @id @default(cuid())
  roomId      Int       // FK a Room
  userId      String    // FK a User
  checkIn     DateTime  // Fecha de entrada
  checkOut    DateTime  // Fecha de salida
  guests      Int       // Número de huéspedes
  status      String    @default("PENDING_PAYMENT") 
  // Estados: PENDING_PAYMENT, CONFIRMED, COMPLETED, CANCELLED
  totalAmount Decimal   // Monto total
  paidAmount  Decimal   @default(0) // Monto pagado
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  room        Room      @relation(fields: [roomId], references: [id])
  user        User      @relation(fields: [userId], references: [id])
}

// Mensajes de contacto
model ContactMessage {
  id        String    @id @default(cuid())
  name      String
  email     String
  phone     String?
  subject   String
  message   String
  status    String    @default("RECEIVED") // RECEIVED, IN_PROGRESS, RESOLVED
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  replies   Reply[]
}

// Respuestas a mensajes
model Reply {
  id         String         @id @default(cuid())
  contactId  String         // FK a ContactMessage
  operatorId String?        // ID del operador que respondió
  body       String         // Contenido de la respuesta
  sentAt     DateTime       @default(now())
  contact    ContactMessage @relation(fields: [contactId], references: [id], onDelete: Cascade)
}

// Servicios del hotel
model Service {
  id          Int      @id @default(autoincrement())
  title       String
  description String
  icon        String    // Nombre del icono Lucide
  features    String    // JSON array de características
  hours       String    // Horarios de servicio
  images      String?   // JSON array de URLs
  imageUrl    String?   // Compatibilidad con imagen única
  featured    Boolean   @default(false) // Si aparece destacado
  active      Boolean   @default(true)
  order       Int       @default(0)     // Orden de visualización
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}
```

### Relaciones entre Modelos

```
User (1) ──── (1) Operator
User (1) ──── (N) Reservation
RoomType (1) ──── (N) Room
Room (1) ──── (N) Reservation
ContactMessage (1) ──── (N) Reply
```

### Índices y Constraints

- **User.email**: UNIQUE - Evita duplicados de email
- **Room.number**: UNIQUE - Números de habitación únicos
- **Cascading Deletes**: 
  - Al eliminar User → elimina Operator relacionado
  - Al eliminar ContactMessage → elimina Replies relacionadas

---

## 🔐 SISTEMA DE AUTENTICACIÓN

### NextAuth v4 Configuration

Ubicación: `src/lib/auth.js`

#### Providers

**Credentials Provider**: Autenticación basada en email/password

```javascript
CredentialsProvider({
  credentials: {
    email: { label: 'Email', type: 'email' },
    password: { label: 'Password', type: 'password' }
  },
  async authorize(credentials) {
    // 1. Validar credenciales
    // 2. Buscar usuario en DB con Prisma
    // 3. Comparar password con bcrypt
    // 4. Retornar objeto user con role y operatorInfo
  }
})
```

#### Session Strategy

- **Tipo**: JWT (JSON Web Tokens)
- **Storage**: Cookies HTTP-only
- **No se usa base de datos** para sesiones (stateless)

#### Callbacks

**JWT Callback**: Agrega información custom al token

```javascript
async jwt({ token, user }) {
  if (user) {
    token.role = user.role          // ADMIN, OPERATOR, USER
    token.operatorInfo = user.operatorInfo
  }
  return token
}
```

**Session Callback**: Expone datos en la sesión del cliente

```javascript
async session({ session, token }) {
  session.user.id = token.sub
  session.user.role = token.role
  session.user.operatorInfo = token.operatorInfo
  return session
}
```

#### Pages Customizadas

```javascript
pages: {
  signIn: '/login',
  signUp: '/register',
}
```

### Encriptación de Passwords

**Biblioteca**: bcryptjs  
**Salt Rounds**: 12

```javascript
const hashedPassword = await bcrypt.hash(password, 12)
const isValid = await bcrypt.compare(inputPassword, hashedPassword)
```

### Protección de Rutas

#### Client-Side (React)

```javascript
import { useSession } from 'next-auth/react'

const { data: session, status } = useSession()

if (status === 'loading') return <Loading />
if (status === 'unauthenticated') router.push('/login')
```

#### Server-Side (API Routes)

```javascript
import { getServerSession } from 'next-auth/next'
import { authOptions } from '@/lib/auth'

const session = await getServerSession(authOptions)
if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
```

---

## 📅 SISTEMA DE RESERVAS

### Flujo de Reserva

```
1. Usuario selecciona fechas (checkIn, checkOut, guests)
   ↓
2. Sistema verifica disponibilidad en tiempo real
   - Consulta RoomTypes con capacidad >= guests
   - Para cada Room de ese tipo, verifica reservas conflictivas
   - Retorna solo tipos con al menos 1 habitación disponible
   ↓
3. Usuario selecciona tipo de habitación
   ↓
4. Sistema calcula precio total (basePrice × nights)
   ↓
5. Usuario confirma reserva
   ↓
6. Sistema asigna automáticamente una habitación disponible
   - Crea registro Reservation
   - Status inicial: PENDING_PAYMENT
   - Envía email de confirmación
   ↓
7. Admin/Operador puede cambiar status a CONFIRMED
```

### Algoritmo de Detección de Conflictos

Para determinar si una habitación está disponible, se buscan reservas que cumplan:

```sql
WHERE roomId = X 
AND status IN ('PENDING_PAYMENT', 'CONFIRMED')
AND (
  -- Caso 1: Reserva comienza antes y termina durante
  (checkIn <= fecha_entrada_nueva AND checkOut > fecha_entrada_nueva)
  OR
  -- Caso 2: Reserva comienza durante y termina después  
  (checkIn < fecha_salida_nueva AND checkOut >= fecha_salida_nueva)
  OR
  -- Caso 3: Reserva completamente contenida
  (checkIn >= fecha_entrada_nueva AND checkOut <= fecha_salida_nueva)
)
```

Si encuentra conflictos, la habitación NO está disponible.

### Estados de Reserva

| Estado | Descripción | Transiciones Permitidas |
|--------|-------------|-------------------------|
| `PENDING_PAYMENT` | Creada, esperando confirmación de pago | → CONFIRMED, CANCELLED |
| `CONFIRMED` | Pago confirmado, reserva activa | → COMPLETED, CANCELLED |
| `COMPLETED` | Check-out realizado | - |
| `CANCELLED` | Cancelada por usuario/admin | - |

### Asignación Automática de Habitaciones

Cuando el usuario reserva un **RoomType** (no una habitación específica):

1. Sistema obtiene todas las `Room` de ese tipo (excluyendo MAINTENANCE)
2. Itera cada habitación verificando disponibilidad
3. Asigna la **primera habitación disponible**
4. Guarda `roomId` en la reserva

Esto permite flexibilidad operativa: el hotel puede tener múltiples habitaciones del mismo tipo.

---

## 🌐 APIs Y ENDPOINTS

### Estructura de API Routes

```
/api
├── auth/[...nextauth]     # NextAuth endpoints
├── contact                # Mensajes de contacto
├── reservations           # Reservas de usuarios
├── rooms                  # Habitaciones públicas
│   ├── available          # Disponibilidad por fechas
│   └── [id]
│       ├── availability   # Disponibilidad de habitación específica
│       └── route.js       # CRUD de habitación
├── services               # Servicios del hotel
├── user                   # Perfil de usuario
└── admin                  # Endpoints administrativos
    ├── dashboard          # Estadísticas y métricas
    ├── messages           # Gestión de mensajes
    ├── reservations       # Gestión de reservas
    ├── room-types         # Gestión de tipos
    ├── rooms              # Gestión de habitaciones
    ├── services           # Gestión de servicios
    └── users              # Gestión de usuarios
```

### Endpoints Principales

#### POST /api/reservations
**Descripción**: Crear nueva reserva  
**Autenticación**: Requerida  
**Rol**: USER, OPERATOR, ADMIN

**Request Body**:
```json
{
  "roomId": 1,              // ID del RoomType
  "checkIn": "2024-12-25",
  "checkOut": "2024-12-28",
  "guests": 2,
  "totalAmount": 75000
}
```

**Validaciones**:
- checkIn debe ser >= hoy
- checkOut debe ser > checkIn
- guests debe ser <= maxGuests del tipo
- Verificar disponibilidad en fechas

**Response 201**:
```json
{
  "message": "Reserva creada exitosamente",
  "reservation": {
    "id": "clx123abc",
    "checkIn": "2024-12-25T00:00:00.000Z",
    "checkOut": "2024-12-28T00:00:00.000Z",
    "guests": 2,
    "totalAmount": 75000,
    "status": "PENDING_PAYMENT",
    "room": {
      "id": 5,
      "number": "201",
      "roomType": { "name": "Suite Deluxe" }
    }
  }
}
```

**Lógica de Asignación**:
1. Si `roomId` corresponde a un RoomType → busca habitación disponible
2. Si `roomId` corresponde a una Room específica → verifica esa habitación
3. En ambos casos, valida conflictos de fechas

#### GET /api/rooms/available
**Descripción**: Obtener tipos de habitación disponibles para fechas  
**Autenticación**: No requerida  
**Parámetros Query**:
- `checkIn`: Fecha de entrada (YYYY-MM-DD)
- `checkOut`: Fecha de salida (YYYY-MM-DD)
- `guests`: Número de huéspedes (opcional, default: 1)

**Response 200**:
```json
{
  "roomTypes": [
    {
      "id": 1,
      "name": "Suite Estándar",
      "description": "...",
      "price": 15000,
      "maxGuests": 2,
      "available": 2,  // Habitaciones disponibles
      "image": "https://...",
      "images": ["https://..."]
    }
  ],
  "checkIn": "2024-12-25",
  "checkOut": "2024-12-28",
  "guests": 2
}
```

#### GET /api/admin/reservations
**Descripción**: Listar reservas con filtros avanzados  
**Autenticación**: Requerida  
**Rol**: ADMIN, OPERATOR

**Query Parameters**:
- `status`: Filtro por estado (PENDING_PAYMENT, CONFIRMED, etc.)
- `roomId`: Filtro por habitación
- `roomTypeId`: Filtro por tipo de habitación
- `userId`: Filtro por usuario
- `search`: Búsqueda por ID, nombre, email, número de habitación
- `dateRange`: Filtro temporal (today, upcoming, current, checkouts_today, custom, all)
- `customDateFrom`, `customDateTo`: Fechas personalizadas
- `page`: Página actual (default: 1)
- `limit`: Resultados por página (default: 50)

**Response 200**:
```json
{
  "reservations": [...],
  "pagination": {
    "total": 150,
    "page": 1,
    "limit": 50,
    "totalPages": 3
  },
  "stats": {
    "checkInsToday": 3,
    "checkOutsToday": 2,
    "pendingPayments": 5,
    "activeReservations": 12,
    "totalReservations": 150,
    "filteredReservations": 50
  }
}
```

**Lógica de Filtrado**:
- Por defecto muestra reservas relevantes (PENDING_PAYMENT o futuras)
- Ordena por prioridad: PENDING_PAYMENT primero, luego por fecha checkIn
- Soporta filtros combinados (AND lógico)

#### GET /api/admin/dashboard
**Descripción**: Métricas y estadísticas del hotel  
**Autenticación**: Requerida  
**Rol**: ADMIN

**Query Parameters**:
- `year`: Año para estadísticas (default: año actual)

**Response 200**:
```json
{
  "stats": {
    "totalReservations": 45,      // Del año seleccionado
    "totalRevenue": 1250000,      // Del año seleccionado
    "occupancyRate": 68,          // % ocupación anual
    "checkInsToday": 3,           // Globales (independientes del año)
    "checkOutsToday": 2,
    "activeReservations": 12,
    "pendingPayments": 5,
    "newMessages": 8
  },
  "revenueData": [               // Ingresos mensuales
    { "month": "Ene", "monthNumber": 1, "revenue": 125000, "reservations": 10 },
    ...
  ],
  "roomTypeData": [              // Distribución por tipo
    { "name": "Suite Deluxe", "value": 15, "roomTypeId": 2 },
    ...
  ]
}
```

**Cálculos**:
- **Ocupación**: (noches reservadas / noches disponibles) × 100
- **Ingresos**: Suma de `paidAmount` de reservas CONFIRMED y COMPLETED
- Filtros por año aplican a `checkIn` (no `createdAt`)

#### POST /api/contact
**Descripción**: Enviar mensaje de contacto  
**Autenticación**: No requerida

**Request Body**:
```json
{
  "name": "Juan Pérez",
  "email": "juan@email.com",
  "phone": "+54 387 123-4567",  // Opcional
  "subject": "Consulta de reserva",
  "message": "Quisiera información sobre..."
}
```

**Response 201**:
```json
{
  "message": "Mensaje enviado exitosamente",
  "contactMessage": {
    "id": "clx456def",
    "name": "Juan Pérez",
    "email": "juan@email.com",
    "subject": "Consulta de reserva",
    "createdAt": "2024-10-17T15:30:00.000Z"
  }
}
```

### Patrones de Response

#### Éxito
```json
{
  "message": "Operación exitosa",
  "data": { ... }
}
```

#### Error
```json
{
  "error": "Descripción del error",
  "message": "Mensaje detallado"
}
```

### Códigos HTTP

- **200 OK**: GET exitoso
- **201 Created**: POST exitoso
- **400 Bad Request**: Validación fallida
- **401 Unauthorized**: No autenticado
- **403 Forbidden**: No autorizado (rol insuficiente)
- **404 Not Found**: Recurso no encontrado
- **409 Conflict**: Conflicto de recursos (ej: habitación no disponible)
- **500 Internal Server Error**: Error del servidor

---

## 👥 ROLES Y PERMISOS

### Tipos de Rol

#### USER (Usuario Regular)
**Capacidades**:
- ✅ Ver habitaciones y servicios públicos
- ✅ Crear reservas para sí mismo
- ✅ Ver sus propias reservas
- ✅ Editar su perfil
- ✅ Enviar mensajes de contacto
- ❌ Acceso a paneles administrativos

**Rutas Accesibles**:
- `/` (Home)
- `/habitaciones` (Catálogo)
- `/servicios` (Servicios)
- `/reservar` (Booking)
- `/mis-reservas` (Mis reservas)
- `/perfil` (Perfil)
- `/contacto` (Contacto)

#### OPERATOR (Operador del Hotel)
**Capacidades**:
- ✅ Todo lo de USER
- ✅ Ver todas las reservas (solo lectura y actualización de status)
- ✅ Ver y actualizar status de habitaciones
- ✅ Responder mensajes de contacto
- ✅ Ver tipos de habitación (solo lectura)
- ❌ Crear/editar habitaciones o tipos
- ❌ Gestionar usuarios
- ❌ Ver estadísticas/dashboard completo

**Rutas Accesibles**:
- Todo lo de USER
- `/operador/reservas` (Gestión de reservas)
- `/operador/habitaciones` (Ver habitaciones)
- `/operador/tipos-habitacion` (Ver tipos)
- `/operador/mensajes` (Mensajes de contacto)

**Panel**: Sidebar con navegación limitada

#### ADMIN (Administrador)
**Capacidades**:
- ✅ Acceso total al sistema
- ✅ CRUD completo de reservas
- ✅ CRUD completo de habitaciones y tipos
- ✅ CRUD de servicios
- ✅ Gestión de usuarios y operadores
- ✅ Ver dashboard y estadísticas
- ✅ Responder mensajes
- ✅ Cambiar entre vista Admin y Operador

**Rutas Accesibles**:
- Todo lo de USER y OPERATOR
- `/admin/dashboard` (Dashboard con métricas)
- `/admin/reservas` (Gestión avanzada de reservas)
- `/admin/habitaciones` (CRUD habitaciones)
- `/admin/tipos-habitacion` (CRUD tipos)
- `/admin/servicios` (CRUD servicios)
- `/admin/operadores` (Gestión de usuarios)

**Panel**: Sidebar completo con todas las opciones

### Implementación de Verificación

#### Middleware de Rutas (Client-Side)

```javascript
// En layout.js de /admin
const { data: session } = useSession()

useEffect(() => {
  if (session?.user?.role !== 'ADMIN') {
    router.push('/')  // Redirect si no es admin
  }
}, [session])
```

#### Verificación en API Routes

```javascript
// En /api/admin/dashboard/route.js
const session = await getServerSession(authOptions)

if (!session || session.user.role !== 'ADMIN') {
  return NextResponse.json({ error: 'No autorizado' }, { status: 401 })
}
```

### Tabla de Comparación de Permisos

| Funcionalidad | USER | OPERATOR | ADMIN |
|--------------|------|----------|-------|
| Ver sitio público | ✅ | ✅ | ✅ |
| Crear reservas propias | ✅ | ✅ | ✅ |
| Ver propias reservas | ✅ | ✅ | ✅ |
| Ver todas las reservas | ❌ | ✅ | ✅ |
| Actualizar status de reservas | ❌ | ✅ | ✅ |
| Cancelar reservas | ❌ | ✅ | ✅ |
| Ver habitaciones | ✅ | ✅ | ✅ |
| Actualizar status habitaciones | ❌ | ✅ | ✅ |
| CRUD habitaciones | ❌ | ❌ | ✅ |
| CRUD tipos de habitación | ❌ | ❌ | ✅ |
| Ver mensajes de contacto | ❌ | ✅ | ✅ |
| Responder mensajes | ❌ | ✅ | ✅ |
| CRUD servicios | ❌ | ❌ | ✅ |
| Gestionar usuarios | ❌ | ❌ | ✅ |
| Ver dashboard/estadísticas | ❌ | ❌ | ✅ |

---

## 🎨 COMPONENTES FRONTEND

### Estructura de Componentes

```
src/components/
├── layout/                 # Componentes de layout
│   ├── header.jsx         # Header público
│   └── footer.jsx         # Footer público
├── sections/              # Secciones de páginas
│   ├── hero-section.jsx
│   ├── featured-rooms.jsx
│   ├── services-section.jsx
│   ├── map-section.jsx
│   ├── location-section.jsx
│   └── contact-section.jsx
├── ui/                    # Componentes reutilizables
│   ├── button.jsx
│   ├── card.jsx
│   ├── input.jsx
│   ├── dialog.jsx
│   ├── select.jsx
│   ├── table.jsx
│   ├── tabs.jsx
│   ├── toast.jsx
│   ├── booking-wizard.jsx
│   ├── room-filters.jsx
│   ├── room-comparison.jsx
│   └── availability-calendar.js
├── providers/             # Context providers
│   └── auth-provider.js  # SessionProvider wrapper
└── map/                  # Componentes de mapa
    └── hotel-map.jsx
```

### Componentes Clave

#### BookingWizard (`ui/booking-wizard.jsx`)
**Propósito**: Indicador visual de progreso en el flujo de reserva

**Props**:
```typescript
interface BookingWizardProps {
  currentStep: 1 | 2 | 3  // 1: Buscar, 2: Seleccionar, 3: Confirmar
}
```

**Estados**:
1. **Paso 1 - Buscar Disponibilidad**: Usuario ingresa fechas
2. **Paso 2 - Seleccionar Habitación**: Usuario elige de resultados
3. **Paso 3 - Confirmar Reserva**: Usuario revisa y confirma

#### RoomFilters (`ui/room-filters.jsx`)
**Propósito**: Filtros avanzados para búsqueda de habitaciones

**Filtros disponibles**:
- Precio máximo
- Capacidad mínima
- Tipo de habitación
- Tipo de cama
- Ordenamiento (precio, capacidad, nombre, relevancia)

#### RoomComparison (`ui/room-comparison.jsx`)
**Propósito**: Comparación lado a lado de hasta 3 habitaciones

**Funcionalidades**:
- Tabla comparativa de características
- Eliminar habitaciones de comparación
- Seleccionar directamente desde la comparación

#### InteractiveAvailabilityCalendar (`ui/interactive-availability-calendar.jsx`)
**Propósito**: Calendario visual de disponibilidad por tipo de habitación

**Características**:
- Vista mensual de disponibilidad
- Códigos de color por disponibilidad
- Tooltips con información detallada
- Navegación entre meses

#### AvailabilityCalendar (`ui/availability-calendar.js`)
**Propósito**: Calendario de disponibilidad de habitación específica

**Estados**:
- 🟢 **Disponible**: Sin reservas
- 🟡 **Parcialmente reservado**: Algunas habitaciones ocupadas
- 🔴 **No disponible**: Todas ocupadas o en mantenimiento

### Arquitectura de Componentes UI

Basados en **Radix UI** para accesibilidad:

- **Button**: Variantes (default, outline, ghost, destructive)
- **Card**: Contenedores con header, content, footer
- **Dialog/Modal**: Overlays modales
- **Select**: Dropdowns accesibles
- **Toast**: Notificaciones temporales
- **Table**: Tablas con sorting y paginación
- **Tabs**: Navegación por pestañas

### Estilos con TailwindCSS

**Configuración personalizada** (`tailwind.config.js`):

```javascript
theme: {
  extend: {
    colors: {
      primary: 'hsl(var(--primary))',      // Color principal del hotel
      secondary: 'hsl(var(--secondary))',
      destructive: 'hsl(var(--destructive))',
      // ... más colores
    },
    borderRadius: {
      lg: 'var(--radius)',
      md: 'calc(var(--radius) - 2px)',
      sm: 'calc(var(--radius) - 4px)',
    }
  }
}
```

**Variables CSS** (`globals.css`):
```css
:root {
  --primary: 263 70% 50%;        /* Púrpura */
  --secondary: 214 32% 91%;
  --destructive: 0 84% 60%;      /* Rojo */
  --radius: 0.5rem;
}
```

### Patrones de Diseño

#### Compound Components
Para componentes complejos como Card:

```jsx
<Card>
  <CardHeader>
    <CardTitle>Título</CardTitle>
  </CardHeader>
  <CardContent>Contenido</CardContent>
</Card>
```

#### Render Props
Para componentes flexibles:

```jsx
<DataTable
  data={reservations}
  columns={columns}
  renderRow={(row) => <CustomRow data={row} />}
/>
```

#### Composition Over Inheritance
Componentes pequeños y componibles en vez de grandes y monolíticos.

---

## 🔄 GESTIÓN DE ESTADO

### TanStack Query (React Query)

**Configuración** (`src/app/providers.js`):

```javascript
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,           // 1 minuto - datos frescos
      cacheTime: 5 * 60 * 1000,       // 5 minutos en caché
      refetchOnWindowFocus: false,    // No refetch al cambiar pestaña
      refetchOnMount: true,           // Refetch al montar
      retry: 1,                       // 1 reintento en caso de error
    },
  },
})
```

### Custom Hooks

#### useDashboard (`hooks/useDashboard.js`)
**Propósito**: Obtener métricas del dashboard

```javascript
const { data, isLoading, isError } = useDashboard(selectedYear)
```

**Características**:
- Caché de 10 minutos
- Refetch automático cada 2 minutos
- Manejo de errores con toast

**Retorna**:
```typescript
{
  stats: {
    totalReservations: number
    totalRevenue: number
    occupancyRate: number
    checkInsToday: number
    checkOutsToday: number
    activeReservations: number
    pendingPayments: number
    newMessages: number
  }
  revenueData: Array<MonthlyRevenue>
  roomTypeData: Array<RoomTypeDistribution>
}
```

#### useReservations (`hooks/useReservations.js`)
**Propósito**: Obtener y filtrar reservas

```javascript
const { data, isLoading } = useReservations(filters, page)
```

**Parámetros**:
```typescript
interface Filters {
  status?: string
  roomId?: number
  roomTypeId?: number
  search?: string
  dateRange?: string
  customDateFrom?: string
  customDateTo?: string
}
```

**Características**:
- Paginación automática
- Invalidación de caché al actualizar
- Filtros dinámicos

#### useUpdateReservationStatus
**Propósito**: Mutación para actualizar estado de reserva

```javascript
const updateStatus = useUpdateReservationStatus()

await updateStatus.mutateAsync({
  reservationId: 'clx123',
  newStatus: 'CONFIRMED'
})
```

**Características**:
- Optimistic updates
- Invalidación automática de queries relacionadas
- Manejo de errores

### Estado Local (useState)

Para estado de UI temporal:
- Modals abiertos/cerrados
- Filtros de formularios
- Paso actual en wizards
- Elementos seleccionados

### Estado de Sesión (NextAuth)

```javascript
const { data: session, status } = useSession()

// session.user contiene:
// - id
// - name
// - email
// - role (ADMIN, OPERATOR, USER)
// - operatorInfo (si es operador)
```

### Patrón de Fetching

**Server Components** (por defecto en App Router):
```javascript
// Fetch directo en server component
const data = await prisma.roomType.findMany()
return <RoomList rooms={data} />
```

**Client Components** (cuando se necesita interactividad):
```javascript
'use client'
const { data } = useQuery({
  queryKey: ['rooms'],
  queryFn: () => fetch('/api/rooms').then(r => r.json())
})
```

---

## 📧 EMAILS Y NOTIFICACIONES

### Sistema de Emails (Nodemailer)

**Configuración** (`src/lib/email.js`):

Soporta dos proveedores:

#### 1. Resend (Recomendado)
```javascript
{
  host: 'smtp.resend.com',
  port: 587,
  auth: {
    user: 'resend',
    pass: process.env.RESEND_API_KEY
  }
}
```

#### 2. Gmail SMTP
```javascript
{
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT) || 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD
  }
}
```

### Templates de Email

#### Confirmación de Reserva

**Función**: `sendReservationConfirmation(reservation)`

**Disparado**: Al crear una nueva reserva

**Contenido**:
- Número de reserva
- Tipo de habitación y número
- Fechas de check-in/check-out
- Número de huéspedes
- Monto total
- Información del hotel
- Horarios de check-in/check-out

**HTML Template**: Diseño responsive con gradiente púrpura

#### Respuesta a Mensaje de Contacto

**Función**: `sendContactReply(contactMessage, replyBody)`

**Disparado**: Cuando operador/admin responde un mensaje

**Contenido**:
- Respuesta del operador
- Mensaje original del usuario
- Información de contacto del hotel

### Manejo de Errores de Email

```javascript
try {
  await sendReservationConfirmation(reservation)
  console.log('✅ Email enviado')
} catch (emailError) {
  console.error('⚠️ Error enviando email:', emailError)
  // NO se falla la reserva si el email falla
  // Solo se registra el error
}
```

**Filosofía**: Los emails son **best-effort**, no críticos. Si falla el envío, la reserva se crea igual.

### Formato de Fechas en Emails

**Problema común**: Timezone offset al formatear fechas

**Solución** (`formatLocalDate` helper):
```javascript
const formatLocalDate = (dateString) => {
  const [year, month, day] = dateString.split('-')
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('es-AR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
```

Esto evita que "2024-12-25" se muestre como "24 de diciembre" por offset UTC.

### Notificaciones en UI (Toast)

**Biblioteca**: Radix UI Toast + Custom hook

**Uso**:
```javascript
import { useToast } from '@/hooks/use-toast'

const { toast } = useToast()

toast({
  title: 'Reserva creada',
  description: 'Tu reserva ha sido creada exitosamente',
  variant: 'default' // o 'destructive'
})
```

**Variantes**:
- `default`: Notificación normal (verde/azul)
- `destructive`: Error (rojo)

**Posición**: Bottom-right  
**Duración**: 5 segundos (auto-dismiss)

---

## 🔧 VARIABLES DE ENTORNO

### Archivo `.env` (NO incluir en git)

```bash
# Base de datos PostgreSQL
DATABASE_URL="postgresql://user:password@host:port/database?schema=public"
DIRECT_URL="postgresql://user:password@host:port/database?schema=public"

# NextAuth
NEXTAUTH_SECRET="random-secret-string-here"
NEXTAUTH_URL="http://localhost:3000"

# Email (Opción 1: Resend)
RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"

# Email (Opción 2: Gmail SMTP)
SMTP_HOST="smtp.gmail.com"
SMTP_PORT="587"
SMTP_USER="tu-email@gmail.com"
SMTP_PASSWORD="tu-app-password"  # App Password, no contraseña normal

# Supabase Storage (Opcional)
NEXT_PUBLIC_SUPABASE_URL="https://xxxxxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGc..."
```

### Variables Críticas

#### DATABASE_URL
**Formato Supabase**:
```
postgresql://postgres.[project-ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres?pgbouncer=true
```

- Usa **connection pooling** (puerto 6543)
- Para migraciones, usar DIRECT_URL (puerto 5432)

#### NEXTAUTH_SECRET
**Generar**:
```bash
openssl rand -base64 32
```

**Propósito**: Firmar y encriptar tokens JWT

#### SMTP Credentials (Gmail)

**No usar contraseña normal**, usar **App Password**:

1. Habilitar 2FA en cuenta Google
2. Ir a configuración de seguridad
3. Generar "App Password" para "Mail"
4. Usar esa password de 16 caracteres

### Variables Públicas (NEXT_PUBLIC_*)

**Solo estas** son accesibles en el cliente:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`

**Regla**: Nunca exponer secrets (API keys, passwords) con `NEXT_PUBLIC_*`

### Validación de Variables

En producción, validar que existan:

```javascript
if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL no está definida')
}
```

---

## 🚀 CONFIGURACIÓN Y DESPLIEGUE

### Requisitos Previos

- **Node.js**: 18.x o superior
- **npm**: 9.x o superior
- **PostgreSQL**: 14.x o superior (Supabase recomendado)

### Instalación Local

```bash
# 1. Clonar repositorio
git clone <repo-url>
cd hotel-elefante-2

# 2. Instalar dependencias
npm install

# 3. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus credenciales

# 4. Ejecutar migraciones de Prisma
npx prisma migrate dev

# 5. Seed de base de datos (datos de prueba)
npm run prisma:seed

# 6. Iniciar servidor de desarrollo
npm run dev
```

Visitar: `http://localhost:3000`

### Scripts NPM

```json
{
  "dev": "next dev -p 3000",                    // Dev server
  "build": "prisma generate && next build",     // Build producción
  "start": "next start",                        // Start producción
  "lint": "next lint",                          // Linter
  "prisma:migrate": "prisma migrate dev",       // Crear migración
  "prisma:seed": "node prisma/seed.js",         // Seed DB
  "prisma:studio": "prisma studio"              // UI de base de datos
}
```

### Prisma Workflow

#### Crear nueva migración
```bash
# 1. Editar prisma/schema.prisma
# 2. Ejecutar
npx prisma migrate dev --name add_new_feature

# Esto crea:
# - SQL migration file
# - Actualiza Prisma Client
# - Aplica cambios a DB
```

#### Ver datos en Prisma Studio
```bash
npm run prisma:studio
# Abre http://localhost:5555
```

#### Regenerar Prisma Client
```bash
npx prisma generate
```

### Deployment (Vercel)

**Pasos**:

1. **Push a GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git push origin main
```

2. **Conectar a Vercel**
   - Ir a vercel.com
   - Import proyecto de GitHub
   - Framework Preset: Next.js (auto-detectado)

3. **Configurar Variables de Entorno**
   - En Vercel dashboard → Settings → Environment Variables
   - Agregar todas las variables del `.env`

4. **Build Settings**
   - Build Command: `prisma generate && next build` (ya configurado en package.json)
   - Output Directory: `.next`
   - Install Command: `npm install`

5. **Deploy**
   - Vercel hace deploy automático en cada push a `main`

### Database en Producción (Supabase)

1. **Crear proyecto** en supabase.com
2. **Obtener connection strings**:
   - Database URL (pooling): Para la app
   - Direct URL: Para migraciones

3. **Ejecutar migraciones en producción**:
```bash
# Local, apuntando a DB de producción
DATABASE_URL="<direct-url>" npx prisma migrate deploy
```

### Optimizaciones de Producción

#### Next.js

```javascript
// next.config.js
module.exports = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.supabase.co' }
    ],
    formats: ['image/avif', 'image/webp'],  // Formatos modernos
  },
  compress: true,                            // Gzip compression
  poweredByHeader: false,                    // Seguridad
}
```

#### Prisma

```javascript
// Singleton pattern para evitar múltiples instancias
const globalForPrisma = globalThis
export const prisma = globalForPrisma.prisma || new PrismaClient()

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma
}
```

#### React Query

- Prefetch en Server Components
- Stale time apropiado
- Cache time balanceado

### Monitoreo

**Logs en Vercel**:
- Runtime Logs: Errores de server
- Build Logs: Errores de build
- Analytics: Performance metrics

**Logging en la app**:
```javascript
console.log('✅ Operación exitosa')
console.error('❌ Error:', error)
console.warn('⚠️ Advertencia')
```

### Seguridad

#### Headers de Seguridad
```javascript
// next.config.js
async headers() {
  return [
    {
      source: '/:path*',
      headers: [
        { key: 'X-DNS-Prefetch-Control', value: 'on' },
        { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
      ],
    },
  ]
}
```

#### Protección de Endpoints
- Siempre validar sesión en API routes
- Validar roles antes de operaciones sensibles
- Sanitizar inputs de usuario
- Rate limiting (considerar en futuro)

---

## 📊 DATOS DE PRUEBA

### Usuarios Seeded

| Email | Password | Rol | Descripción |
|-------|----------|-----|-------------|
| admin@hotelelefante.com | admin123 | ADMIN | Acceso completo |
| operador@hotelelefante.com | operador123 | OPERATOR | Panel operador |
| usuario@hotelelefante.com | usuario123 | USER | Usuario regular |

**Más usuarios**: `juan.perez@email.com`, `maria.garcia@email.com`, etc. (todos con password `usuario123`)

### Habitaciones Seeded

- **Suite Estándar**: 101-103 (3 habitaciones)
- **Suite Deluxe**: 201-204 (4 habitaciones)
- **Suite Familiar**: 301-303 (3 habitaciones)
- **Suite Presidencial**: 401-402 (2 habitaciones)
- **Suite VIP**: 501-503 (3 habitaciones)

**Total**: 15 habitaciones

### Servicios Destacados

1. **Casino & Entretenimiento**: Juegos, shows, bar premium
2. **Parapente en Salta**: Vuelos tandem con vistas espectaculares
3. **Piscina con Vista Panorámica**: Piscina climatizada con bar

### Reservas de Ejemplo

- Reserva confirmada (Suite Estándar 101)
- Reserva pendiente de pago (Suite Deluxe 201)
- Reserva completada (Suite Familiar 301)

---

## 🏗️ MEJORAS FUTURAS SUGERIDAS

### Funcionalidades

1. **Sistema de Pagos**
   - Integración con Mercado Pago / Stripe
   - Pagos parciales (señas)
   - Historial de transacciones

2. **Check-in/Check-out Digital**
   - QR codes para check-in
   - Firma digital de documentos
   - Llavero digital (integración con cerraduras inteligentes)

3. **Programa de Fidelidad**
   - Puntos por estadías
   - Descuentos para clientes frecuentes
   - Niveles (Bronze, Silver, Gold)

4. **Multi-idioma (i18n)**
   - Español (actual)
   - Inglés
   - Portugués

5. **Sistema de Reviews**
   - Calificaciones de habitaciones
   - Reviews de usuarios
   - Moderación por admin

### Optimizaciones Técnicas

1. **Performance**
   - Image optimization con next/image
   - Lazy loading de componentes pesados
   - Service Workers para PWA
   - CDN para assets estáticos

2. **SEO**
   - Metadata dinámicos por página
   - Sitemap XML automático
   - Structured data (JSON-LD)
   - Open Graph tags optimizados

3. **Testing**
   - Unit tests (Jest + React Testing Library)
   - E2E tests (Playwright / Cypress)
   - API tests
   - Visual regression tests

4. **DevOps**
   - CI/CD pipelines
   - Automated deployments
   - Database backups automáticos
   - Staging environment

5. **Monitoring**
   - Error tracking (Sentry)
   - Performance monitoring (Vercel Analytics)
   - User analytics (Google Analytics / Plausible)
   - Uptime monitoring

---

## 📝 NOTAS IMPORTANTES

### Manejo de Fechas

**Problema**: JavaScript Date tiene issues con timezones.

**Solución Implementada**:
```javascript
// Para fechas sin hora (check-in/check-out)
const formatLocalDate = (dateString) => {
  const [year, month, day] = dateString.split('-')
  const date = new Date(year, month - 1, day)
  return date.toLocaleDateString('es-AR')
}

// Evita que "2024-12-25" se muestre como "24 dic" por UTC offset
```

### JSON en PostgreSQL

Algunos campos usan JSON strings (no JSONB):
- `RoomType.images`: `JSON.stringify(['url1', 'url2'])`
- `Service.features`: `JSON.stringify(['Feature 1', 'Feature 2'])`

**Al leer**: `JSON.parse(room.images || '[]')`

### Status de Habitaciones vs Disponibilidad

**Importante**: El `status` de una Room (AVAILABLE, OCCUPIED, etc.) es **solo informativo**.

**La disponibilidad real** se calcula por:
1. Reservas activas en el rango de fechas
2. Status != MAINTENANCE

Una habitación puede tener `status: "AVAILABLE"` pero estar reservada.

### Prisma Client Singleton

En desarrollo, Next.js hace hot reload frecuente. Sin singleton pattern, se crearían múltiples instancias de Prisma Client.

**Solución** (`lib/prisma.js`):
```javascript
const globalForPrisma = globalThis
export const prisma = globalForPrisma.prisma || new PrismaClient()
if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

---

## 🆘 TROUBLESHOOTING

### Error: "Prisma Client is not generated"
```bash
npx prisma generate
```

### Error: "Database connection refused"
- Verificar DATABASE_URL en `.env`
- Verificar que PostgreSQL esté corriendo
- Verificar firewall / network rules

### Error: "NextAuth session undefined"
- Verificar NEXTAUTH_SECRET en `.env`
- Verificar NEXTAUTH_URL (debe coincidir con URL de la app)
- Clear cookies del navegador

### Migraciones fallan en producción
- Usar DIRECT_URL para migraciones
- No usar connection pooling para `prisma migrate`

### Emails no se envían
- Verificar credenciales SMTP
- Si usas Gmail, verificar App Password (no contraseña normal)
- Verificar logs de servidor para errores específicos

### Imágenes no cargan
- Verificar que URLs estén en `remotePatterns` de `next.config.js`
- Verificar CORS del proveedor de imágenes

---

## 📚 RECURSOS

### Documentación Oficial
- [Next.js](https://nextjs.org/docs)
- [Prisma](https://www.prisma.io/docs)
- [NextAuth](https://next-auth.js.org)
- [TailwindCSS](https://tailwindcss.com/docs)
- [Radix UI](https://www.radix-ui.com)
- [TanStack Query](https://tanstack.com/query/latest)

### Deployment
- [Vercel](https://vercel.com/docs)
- [Supabase](https://supabase.com/docs)

### Herramientas
- [Prisma Studio](https://www.prisma.io/studio)
- [Postman](https://www.postman.com) - Testing de APIs

---

## ✅ CHECKLIST DE SETUP

- [ ] Node.js instalado (v18+)
- [ ] Repositorio clonado
- [ ] Dependencias instaladas (`npm install`)
- [ ] PostgreSQL configurado (Supabase recomendado)
- [ ] `.env` creado y configurado
- [ ] Migraciones ejecutadas (`npx prisma migrate dev`)
- [ ] Seed ejecutado (`npm run prisma:seed`)
- [ ] Dev server funcionando (`npm run dev`)
- [ ] Login con usuario de prueba funcionando
- [ ] Crear una reserva de prueba

---

**Fin de la documentación técnica**

Para cualquier duda o contribución, consultar con el equipo de desarrollo.
