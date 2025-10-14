# Hotel Elefante - Sistema de Gestión Hotelera

Un sistema completo de gestión hotelera desarrollado con **Next.js 14** y **JavaScript puro**, ubicado en San Lorenzo, Salta, Argentina, cerca del Cerro Elefante.

## 🏨 Características Principales

### ✨ Funcionalidades Completas
- **Sistema de Reservas** - Búsqueda, reserva y gestión completa
- **Autenticación** - Login/registro con roles (USER, OPERATOR, ADMIN)
- **Panel de Operador** - Gestión de reservas, mensajes y mapa del hotel
- **Panel de Admin** - Analytics completos y gestión de usuarios
- **Mapa Interactivo** - Ubicación del hotel y atracciones cercanas
- **Sistema de Mensajes** - Gestión de consultas de contacto
- **Responsive Design** - Optimizado para móviles y desktop

### 🎯 Páginas Implementadas

#### Páginas Públicas
- `/` - Landing page con hero, habitaciones y servicios
- `/habitaciones` - Catálogo completo con filtros
- `/habitaciones/[id]` - Detalle de habitación individual
- `/servicios` - Servicios del hotel
- `/contacto` - Formulario de contacto
- `/reservar` - Sistema de reservas (requiere login)

#### Páginas de Usuario
- `/login` - Iniciar sesión
- `/register` - Registro de usuarios
- `/mis-reservas` - Historial de reservas del usuario

#### Panel Operador (`/operador/`)
- `/operador/reservas` - Gestión de reservas
- `/operador/mensajes` - Gestión de mensajes de contacto
- `/operador/mapa` - Mapa interactivo del hotel

#### Panel Admin (`/admin/`)
- `/admin/dashboard` - Dashboard principal con analytics
- `/admin/reservas` - Gestión completa de reservas
- `/admin/habitaciones` - Gestión de habitaciones
- `/admin/operadores` - Gestión de operadores

## 🛠️ Stack Tecnológico

- **Frontend:** Next.js 14 + React 18 (JavaScript puro)
- **Base de datos:** SQLite / PostgreSQL (Supabase) con Prisma ORM
- **Autenticación:** NextAuth.js v4
- **UI:** Tailwind CSS + Radix UI components
- **Gráficos:** Recharts para analytics
- **Mapas:** Leaflet para ubicación del hotel
- **Email:** Nodemailer (opcional)

## 📊 Analytics Completos

### Gráficos Implementados
1. **Revenue Chart** - Ingresos por mes con doble eje Y
2. **Room Type Chart** - Reservas por tipo de habitación (pie chart)
3. **Occupancy Chart** - Tendencias de ocupación diaria
4. **Cancellation Chart** - Cancelaciones vs confirmadas
5. **Lead Time Chart** - Análisis de tiempo de anticipación
6. **Weekly Heatmap** - Mapa de calor de ocupación semanal

### Indicadores Financieros
- **RevPAR** (Revenue per Available Room)
- **ADR** (Average Daily Rate)
- **Desglose de ingresos** por tipo de habitación
- **Top 5 habitaciones** más rentables

### Métricas Operacionales
- **Tasa de ocupación**
- **Duración promedio** de estadía
- **Análisis de lead time**
- **Huéspedes únicos** vs recurrentes
- **Tasa de retención** de clientes

## 🚀 Instalación y Configuración

### Prerrequisitos
- Node.js 18+ 
- SQLite (incluido) o cuenta en Supabase
- npm o yarn

### Instalación

1. **Clonar el repositorio**
```bash
git clone <repository-url>
cd hotel-elefante-2
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**
```bash
cp .env.example .env
```

Editar `.env` con tus configuraciones:

**Opción A: SQLite (desarrollo rápido)**
```env
DATABASE_URL="file:./dev.db"
NEXTAUTH_URL="http://localhost:3002"
NEXTAUTH_SECRET="tu-secret-key-aqui"
```

**Opción B: Supabase (producción)**
Ver la [Guía de Migración a Supabase](./MIGRACION_SUPABASE.md) para instrucciones detalladas.
```env
DATABASE_URL="postgresql://..."
DIRECT_URL="postgresql://..."
NEXTAUTH_URL="http://localhost:3002"
NEXTAUTH_SECRET="tu-secret-key-aqui"
```

4. **Configurar base de datos**
```bash
# Generar cliente Prisma
npx prisma generate

# Ejecutar migraciones
npx prisma migrate dev

# Poblar con datos de prueba
npm run prisma:seed
```

5. **Ejecutar en desarrollo**
```bash
npm run dev
```

La aplicación estará disponible en `http://localhost:3002`

## 🔑 Credenciales de Prueba

### Usuarios Predefinidos
- **Admin:** `admin@hotelelefante.com` / `admin123`
- **Operador:** `operador@hotelelefante.com` / `operador123`
- **Usuario:** `usuario@hotelelefante.com` / `usuario123`

## 📁 Estructura del Proyecto

```
src/
├── app/                    # App Router de Next.js
│   ├── (auth)/            # Rutas de autenticación
│   ├── admin/             # Panel de administración
│   ├── operador/          # Panel de operador
│   ├── api/               # API Routes
│   └── ...                # Páginas públicas
├── components/
│   ├── ui/                # Componentes base (Radix UI)
│   ├── layout/            # Header, Footer
│   └── sections/          # Secciones de páginas
├── lib/                   # Utilidades y configuraciones
├── hooks/                 # Custom hooks
└── middleware.js          # Middleware de autenticación
```

## 🎨 Componentes UI

Todos los componentes están construidos con **Radix UI** + **Tailwind CSS**:

- `Button` - Botones con variantes
- `Card` - Tarjetas de contenido
- `Input` - Campos de entrada
- `Select` - Selectores dropdown
- `Dialog` - Modales
- `Tabs` - Pestañas
- `Table` - Tablas de datos
- `Badge` - Insignias de estado
- `Toast` - Notificaciones

## 🗄️ Base de Datos

### Modelos Principales
- **User** - Usuarios del sistema
- **Room** / **RoomType** - Habitaciones y tipos
- **Reservation** - Reservas
- **Payment** - Pagos
- **ContactMessage** - Mensajes de contacto
- **Promotion** - Promociones de email

### Datos de Prueba
El seed incluye:
- 3 tipos de habitaciones (Standard, Deluxe, Suite)
- 15 habitaciones distribuidas en 3 pisos
- 5 amenidades básicas
- Usuarios de prueba (admin, operador, clientes)
- 10 reservas de ejemplo
- Mensajes de contacto y respuestas

## 🔒 Seguridad y Autenticación

- **NextAuth.js** para autenticación
- **Middleware** para protección de rutas
- **Roles de usuario** (USER, OPERATOR, ADMIN)
- **Sesiones persistentes**
- **Validación de permisos** en API routes

## 📱 Responsive Design

- **Mobile-first** approach
- **Breakpoints** optimizados
- **Navegación móvil** con sidebar
- **Tablas responsivas**
- **Formularios adaptables**

## 🚀 Deployment

### Build para Producción
```bash
npm run build
npm start
```

### Variables de Entorno Requeridas
- `DATABASE_URL` - Conexión a base de datos (SQLite o Supabase)
- `DIRECT_URL` - Conexión directa (solo para Supabase)
- `NEXTAUTH_URL` - URL de la aplicación
- `NEXTAUTH_SECRET` - Secret para NextAuth
- `RESEND_API_KEY` - API key para emails (opcional)

## 📈 Performance

- **Server Components** por defecto
- **Lazy loading** de componentes
- **Optimización de imágenes** con Next.js
- **Caching** estratégico
- **Bundle splitting** automático

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver `LICENSE` para más detalles.

## 🏔️ Sobre Hotel Elefante

Hotel Elefante está ubicado en San Lorenzo, Salta, Argentina, cerca del majestuoso Cerro Elefante. Ofrecemos una experiencia única de hospitalidad en el corazón de los valles salteños, combinando confort moderno con la belleza natural de la región.

---

**Desarrollado con ❤️ usando únicamente JavaScript puro y las mejores prácticas de desarrollo web.**
