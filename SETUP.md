# 🚀 Guía de Configuración - Hotel Elefante

Guía completa para configurar y desplegar el sistema de gestión hotelera Hotel Elefante.

---

## 📋 Índice

1. [Instalación Inicial](#instalación-inicial)
2. [Configuración de Base de Datos](#configuración-de-base-de-datos)
3. [Configuración de Supabase Storage](#configuración-de-supabase-storage)
4. [Configuración de Email](#configuración-de-email)
5. [Deploy a Vercel](#deploy-a-vercel)
6. [Troubleshooting](#troubleshooting)

---

## 🎯 Instalación Inicial

### Prerrequisitos
- Node.js 18+ 
- npm o yarn
- Cuenta en Supabase (gratuita)
- Git

### Paso 1: Clonar e Instalar

```bash
# Clonar repositorio
git clone <repository-url>
cd hotel-elefante-2

# Instalar dependencias
npm install
```

### Paso 2: Variables de Entorno

Copia el archivo de ejemplo:
```bash
cp .env.example .env
```

---

## 🗄️ Configuración de Base de Datos

### Opción A: Supabase (Recomendado para Producción)

1. **Crear proyecto en Supabase**
   - Ve a https://app.supabase.com
   - Click en "New Project"
   - Configura nombre, contraseña y región

2. **Obtener URLs de conexión**
   - Ve a Settings → Database
   - Copia **Connection Pooling** (puerto 6543) para `DATABASE_URL`
   - Copia **Direct Connection** (puerto 5432) para `DIRECT_URL`

3. **Configurar en .env**
   ```env
   DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true"
   DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-us-east-1.pooler.supabase.com:5432/postgres"
   ```

4. **Ejecutar migraciones**
   ```bash
   npx prisma generate
   npx prisma migrate deploy
   npm run prisma:seed
   ```

### Opción B: SQLite (Solo para Desarrollo Local)

En `.env`:
```env
DATABASE_URL="file:./dev.db"
```

Ejecutar:
```bash
npx prisma generate
npx prisma migrate dev
npm run prisma:seed
```

---

## 📦 Configuración de Supabase Storage

### ⚠️ Importante: Requerido para subir imágenes

### Paso 1: Crear Bucket

1. Ve a tu proyecto en Supabase → **Storage**
2. Click en **"Create a new bucket"**
3. Configuración:
   - **Name:** `hotel-images`
   - ✅ **Public bucket:** ACTIVADO
   - Click **"Create"**

### Paso 2: Configurar Políticas RLS

**Método 1 - SQL Editor (Recomendado):**

1. Ve a **SQL Editor** en Supabase
2. Copia y pega este SQL:

```sql
-- Política para lectura pública
CREATE POLICY "Allow public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'hotel-images');

-- Política para subida autenticada
CREATE POLICY "Allow authenticated uploads"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'hotel-images');

-- Política para actualización autenticada
CREATE POLICY "Allow authenticated updates"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'hotel-images')
WITH CHECK (bucket_id = 'hotel-images');

-- Política para eliminación autenticada
CREATE POLICY "Allow authenticated deletes"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'hotel-images');
```

3. Click **"Run"**

**Método 2 - Interfaz Manual:**

1. Ve a Storage → hotel-images → **Policies**
2. Click **"New policy"**
3. Crea las siguientes políticas:

**Política de SELECT:**
- Name: `Allow public read access`
- Policy command: `SELECT`
- Target roles: `public`
- USING expression: `bucket_id = 'hotel-images'`

**Política de INSERT:**
- Name: `Allow authenticated uploads`
- Policy command: `INSERT`
- Target roles: `authenticated`
- WITH CHECK expression: `bucket_id = 'hotel-images'`

### Paso 3: Obtener Credenciales

1. Ve a Settings → **API**
2. Copia las siguientes claves:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key → `SUPABASE_SERVICE_ROLE` ⚠️

### Paso 4: Configurar en .env

```env
NEXT_PUBLIC_SUPABASE_URL="https://[PROJECT-REF].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
SUPABASE_SERVICE_ROLE="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

⚠️ **CRÍTICO:** `SUPABASE_SERVICE_ROLE` es diferente a `ANON_KEY`. Sin esta variable, las subidas no funcionarán.

### Paso 5: Verificar

```bash
# Reiniciar servidor
npm run dev

# Probar subida
# Ve a http://localhost:3002/admin/tipos-habitacion
# Intenta subir una imagen
```

---

## 📧 Configuración de Email

### Opción A: Gmail (Recomendado para desarrollo)

1. **Habilitar autenticación de 2 pasos** en tu cuenta Gmail
2. **Crear contraseña de aplicación:**
   - Ve a Cuenta de Google → Seguridad
   - Contraseñas de aplicaciones
   - Selecciona "Correo" y "Otro"
   - Copia la contraseña generada

3. **Configurar en .env:**
   ```env
   SMTP_HOST="smtp.gmail.com"
   SMTP_PORT=587
   SMTP_USER="tu-email@gmail.com"
   SMTP_PASSWORD="tu-contraseña-de-aplicación"
   ```

### Opción B: Resend (Producción)

1. Crea cuenta en https://resend.com
2. Obtén tu API key
3. Configura:
   ```env
   RESEND_API_KEY="re_xxxxxxxxxxxxx"
   ```

---

## 🚀 Deploy a Vercel

### Preparación

1. **Push a GitHub:**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Verificar archivos:**
   - ✅ `.env` está en `.gitignore`
   - ✅ `package.json` tiene script de build
   - ✅ Todas las migraciones aplicadas

### Deploy

1. **Conectar a Vercel:**
   - Ve a https://vercel.com
   - Click "New Project"
   - Importa tu repositorio de GitHub

2. **Configurar variables de entorno:**

   En Vercel → Settings → Environment Variables, agrega:

   ```
   DATABASE_URL=postgresql://...
   DIRECT_URL=postgresql://...
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
   SUPABASE_SERVICE_ROLE=eyJ...
   NEXTAUTH_URL=https://tu-dominio.vercel.app
   NEXTAUTH_SECRET=tu-secret-key-seguro
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=tu-email@gmail.com
   SMTP_PASSWORD=tu-app-password
   ```

3. **Deploy:**
   - Click "Deploy"
   - Espera a que termine el build
   - Tu app estará en `https://tu-proyecto.vercel.app`

### Post-Deploy

1. **Verificar funcionalidad:**
   - ✅ Login/registro funcionan
   - ✅ Imágenes se cargan correctamente
   - ✅ Reservas se crean
   - ✅ Emails se envían

2. **Dominio personalizado (Opcional):**
   - Ve a Settings → Domains
   - Agrega tu dominio
   - Actualiza `NEXTAUTH_URL` con el nuevo dominio

---

## 🐛 Troubleshooting

### Error: "Bucket not found"

**Causa:** El bucket `hotel-images` no existe  
**Solución:** 
1. Ve a Supabase → Storage
2. Crea el bucket `hotel-images`
3. Márcalo como público

### Error: "row-level security policy violation"

**Causa:** Las políticas RLS no están configuradas  
**Solución:** Ejecuta el SQL del Paso 2 de Supabase Storage

### Error: "Invalid API key" o "JWT expired"

**Causa:** Credenciales incorrectas o falta `SUPABASE_SERVICE_ROLE`  
**Solución:**
1. Verifica que copiaste las claves correctamente
2. Asegúrate de tener las 3 variables de Supabase en `.env`
3. Reinicia el servidor: `npm run dev`

### Error: "Cannot find module '@prisma/client'"

**Causa:** Prisma Client no está generado  
**Solución:**
```bash
npx prisma generate
```

### Error en deploy de Vercel: "Build failed"

**Causas comunes:**
1. Variables de entorno faltantes
2. Migraciones de Prisma no aplicadas

**Solución:**
1. Verifica todas las variables en Vercel
2. Asegúrate de que `package.json` tenga:
   ```json
   "build": "prisma generate && next build"
   ```
3. Redeploya

### Imágenes no se ven después del deploy

**Causa:** URLs de Supabase no configuradas  
**Solución:**
1. Verifica que `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` estén en Vercel
2. Las variables con `NEXT_PUBLIC_` deben estar configuradas
3. Redeploya después de agregar variables

### Emails no se envían

**Causa:** Credenciales SMTP incorrectas  
**Solución:**
1. Si usas Gmail, verifica que uses una "Contraseña de aplicación", no tu contraseña normal
2. Verifica que las 4 variables SMTP estén configuradas
3. Prueba con el endpoint `/api/test-email` (si no lo eliminaste)

---

## 🔑 Credenciales de Prueba

Una vez completado el seed, puedes acceder con:

- **Admin:** `admin@hotelelefante.com` / `admin123`
- **Operador:** `operador@hotelelefante.com` / `operador123`
- **Usuario:** `usuario@hotelelefante.com` / `usuario123`

---

## 📱 Próximos Pasos

1. ✅ Configurar todo según esta guía
2. ✅ Probar localmente con `npm run dev`
3. ✅ Hacer deploy a Vercel
4. 🎨 Personalizar contenido (imágenes, textos, precios)
5. 📧 Configurar dominio de email profesional
6. 🔐 Cambiar credenciales de prueba

---

## 📞 Soporte

Si tienes problemas:
1. Revisa la sección de Troubleshooting
2. Verifica los logs del servidor (terminal o Vercel)
3. Verifica los logs del navegador (F12 → Console)
4. Asegúrate de que todas las variables de entorno estén configuradas

---

**¡Listo!** Tu sistema de gestión hotelera está configurado y funcionando. 🎉
