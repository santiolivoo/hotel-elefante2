# 🚀 Guía de Migración a Supabase

Esta guía te ayudará a migrar tu base de datos de SQLite a Supabase (PostgreSQL).

## 📋 Requisitos Previos

- Cuenta en Supabase (gratuita): https://app.supabase.com
- Node.js instalado
- Dependencias del proyecto instaladas (`npm install`)

## 🔧 Paso 1: Crear Proyecto en Supabase

1. Ve a https://app.supabase.com
2. Haz clic en "New Project"
3. Completa los datos:
   - **Name**: Hotel Elefante
   - **Database Password**: Elige una contraseña segura (¡guárdala!)
   - **Region**: Elige la más cercana (por ejemplo, South America)
4. Espera 2-3 minutos mientras se crea el proyecto

## 🔑 Paso 2: Obtener Credenciales de Conexión

1. En tu proyecto de Supabase, ve a **Settings** (⚙️) > **Database**
2. Busca la sección **Connection string**
3. Verás dos tipos de URLs:

### Connection Pooling (para la app)
```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true
```

### Direct Connection (para migraciones)
```
postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres
```

> **Nota**: Reemplaza `[YOUR-PASSWORD]` con la contraseña que creaste en el Paso 1

## ✏️ Paso 3: Configurar Variables de Entorno

1. Abre el archivo `.env` en la raíz del proyecto
2. Reemplaza las URLs con tus credenciales:

```env
# Database - Supabase PostgreSQL
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[YOUR-PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
```

## 🗂️ Paso 4: Ejecutar Migraciones

Ahora ejecuta estos comandos en orden:

### 1. Limpiar build anterior (si existe)
```bash
rm -rf .next
rm -rf node_modules/.prisma
```

### 2. Generar el cliente de Prisma
```bash
npx prisma generate
```

### 3. Crear y aplicar la migración inicial
```bash
npx prisma migrate dev --name init
```

Este comando creará todas las tablas en tu base de datos Supabase.

### 4. Poblar la base de datos con datos de prueba
```bash
npm run prisma:seed
```

Este comando creará:
- 13 usuarios (admin, operador, y usuarios de prueba)
- 5 tipos de habitaciones
- 15 habitaciones
- Reservas de ejemplo
- Mensajes de contacto
- Servicios del hotel

## ✅ Paso 5: Verificar la Migración

### Verificar en Prisma Studio
```bash
npx prisma studio
```

Esto abrirá una interfaz web donde puedes ver todas tus tablas y datos.

### Verificar en Supabase Dashboard
1. Ve a tu proyecto en Supabase
2. Haz clic en **Table Editor** en el menú lateral
3. Deberías ver todas tus tablas: User, Room, RoomType, Reservation, etc.

## 🚀 Paso 6: Iniciar la Aplicación

```bash
npm run dev
```

La aplicación debería iniciarse en http://localhost:3002

## 🔐 Credenciales de Prueba

Después del seed, puedes usar estas credenciales:

- **Admin**: admin@hotelelefante.com / admin123
- **Operador**: operador@hotelelefante.com / operador123
- **Usuario**: usuario@hotelelefante.com / usuario123

## 🔍 Comandos Útiles

### Ver el estado de las migraciones
```bash
npx prisma migrate status
```

### Abrir Prisma Studio
```bash
npx prisma studio
```

### Reset completo de la base de datos (¡cuidado!)
```bash
npx prisma migrate reset
```

Este comando eliminará todos los datos y volverá a crear las tablas y ejecutar el seed.

## ⚠️ Troubleshooting

### Error: "Can't reach database server"
- Verifica que las URLs en `.env` sean correctas
- Asegúrate de haber reemplazado `[YOUR-PASSWORD]` con tu contraseña real
- Verifica que no haya espacios extra en las URLs

### Error: "SSL connection required"
- Agrega `?sslmode=require` al final de tus URLs si es necesario

### Error al ejecutar migraciones
1. Intenta limpiar y regenerar:
```bash
rm -rf prisma/migrations
npx prisma migrate dev --name init
```

### La app no se conecta a la base de datos
- Verifica que estés usando `DATABASE_URL` (puerto 6543) para la app
- Verifica que estés usando `DIRECT_URL` (puerto 5432) para migraciones
- Reinicia el servidor de desarrollo

## 🎉 ¡Listo!

Tu aplicación ahora está conectada a Supabase. Los beneficios incluyen:

✅ Base de datos PostgreSQL escalable
✅ Backups automáticos
✅ Panel de administración visual
✅ API REST automática
✅ Autenticación integrada (opcional)
✅ Storage para archivos (opcional)
✅ Plan gratuito generoso

## 📦 Paso 7: Configurar Supabase Storage para Imágenes (IMPORTANTE)

**⚠️ REQUERIDO para producción en Vercel**

Las imágenes funcionan en localhost pero **NO** en Vercel porque Vercel usa un filesystem efímero. 

👉 **Sigue la guía completa**: [CONFIGURAR_SUPABASE_STORAGE.md](./CONFIGURAR_SUPABASE_STORAGE.md)

**Resumen rápido:**
1. Crea un bucket `hotel-images` en Supabase Storage (público)
2. Configura las variables de entorno:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Configura políticas de acceso (RLS) para el bucket
4. Re-deploya en Vercel

## 📚 Recursos Adicionales

- [Documentación de Supabase](https://supabase.com/docs)
- [Documentación de Prisma](https://www.prisma.io/docs)
- [Guía de Prisma con Supabase](https://supabase.com/docs/guides/integrations/prisma)
- [Supabase Storage](https://supabase.com/docs/guides/storage)

---

**¿Problemas?** Revisa los logs de error y asegúrate de haber seguido todos los pasos.
