# ⚡ INSTRUCCIONES RÁPIDAS - Solución Imágenes

## 🎯 Problema
Las imágenes no se suben al bucket de Supabase ni en local ni en Vercel.

## 🔥 Solución en 3 Pasos

### 1️⃣ EJECUTAR DIAGNÓSTICO (2 minutos)

```bash
node test-supabase.js
```

Este script te dirá **exactamente** qué está mal.

---

### 2️⃣ CONFIGURAR SEGÚN EL ERROR

#### Error A: "Variables no configuradas"
```bash
# Crea o edita .env en la raíz del proyecto
nano .env
```

Agrega (reemplaza con tus valores):
```env
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Obtener valores**: https://app.supabase.com → Settings → API

**Luego reinicia**:
```bash
npm run dev
```

---

#### Error B: "Bucket no encontrado"

1. Ve a https://app.supabase.com → Storage
2. Click **"Create a new bucket"**
3. Nombre: `hotel-images`
4. ✅ **Marca "Public bucket"**
5. Click **"Create"**

---

#### Error C: "row-level security" (error 42501)

**Opción 1 - Manual**:
1. Ve a Storage → hotel-images → **Policies**
2. Click **"New policy"** → **"Create a custom policy"**
3. Crea 2 políticas:

**INSERT policy**:
- Name: `Allow authenticated users to upload`
- Command: `INSERT`
- Target: `authenticated`
- WITH CHECK: `bucket_id = 'hotel-images'`

**SELECT policy**:
- Name: `Allow public read`
- Command: `SELECT`
- Target: `public`
- USING: `bucket_id = 'hotel-images'`

**Opción 2 - SQL (más rápido)**:
1. Ve a SQL Editor en Supabase
2. Copia y pega de `POLITICAS_RLS_SUPABASE.sql`
3. Click **"Run"**

---

### 3️⃣ VERIFICAR

```bash
# Reinicia el servidor
npm run dev
```

Ve a http://localhost:3002/admin/tipos-habitacion y sube una imagen.

**Mira la terminal** - deberías ver:
```
=== INICIO DE UPLOAD ===
Supabase URL: ✓ Configurada
Supabase Key: ✓ Configurada
...
✅ Archivo subido exitosamente
```

---

## 🚀 Para Vercel (Producción)

1. Ve a tu proyecto en Vercel → **Settings** → **Environment Variables**
2. Agrega:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. **Re-deploya** (Deployments → Redeploy)

---

## 📱 ¿Necesitas más ayuda?

- **Guía detallada**: `SOLUCION_IMAGENES.md`
- **Debug avanzado**: `DEBUG_SUPABASE.md`
- **SQL para políticas**: `POLITICAS_RLS_SUPABASE.sql`

---

## ✅ Checklist Mínimo

- [ ] Ejecuté `node test-supabase.js` sin errores
- [ ] Variables en `.env`: `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- [ ] Bucket `hotel-images` existe y es **público**
- [ ] Políticas RLS configuradas (INSERT y SELECT)
- [ ] Reinicié servidor local
- [ ] Variables configuradas en Vercel
- [ ] Re-deploye en Vercel

Si todo está ✅ → **Funciona**
Si algo está ❌ → Vuelve al paso correspondiente
