# 🚨 SOLUCIÓN: Imágenes no se suben a Supabase

## Diagnóstico Rápido

Sigue estos pasos **EN ORDEN** para diagnosticar y solucionar el problema:

---

## ✅ PASO 1: Ejecutar Test de Conexión

En la terminal, ejecuta:

```bash
node test-supabase.js
```

Este script te dirá exactamente qué está mal. Lee los mensajes y sigue las instrucciones.

**Posibles resultados:**

### ❌ "Variables de entorno no encontradas"
**Problema**: No tienes configuradas las credenciales de Supabase

**Solución**:
1. Ve a https://app.supabase.com → Tu proyecto → Settings → API
2. Copia:
   - **Project URL** 
   - **anon public key**
3. Crea o edita el archivo `.env` en la raíz del proyecto:
```env
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```
4. **Reinicia el servidor**: `Ctrl+C` → `npm run dev`

---

### ❌ "Bucket hotel-images NO encontrado"
**Problema**: El bucket no existe en Supabase

**Solución**:
1. Ve a https://app.supabase.com → Storage
2. Click en **"Create a new bucket"**
3. Configuración:
   - **Name**: `hotel-images`
   - **Public bucket**: ✅ **MARCADO** (muy importante)
   - **File size limit**: 5 MB (o lo que prefieras)
   - **Allowed MIME types**: `image/*`
4. Click en **"Create bucket"**

---

### ❌ "Bucket hotel-images NO es público"
**Problema**: El bucket existe pero es privado

**Solución**:
1. Ve a Storage → hotel-images
2. Click en el ícono de configuración (⚙️) o los tres puntos
3. Click en **"Edit bucket"**
4. Marca **"Public bucket"** ✅
5. Click en **"Save"**

---

### ❌ "Error: row-level security policy" o código 42501
**Problema**: Las políticas de acceso (RLS) están bloqueando las subidas

**Solución**: Ve al **PASO 2**

---

## ✅ PASO 2: Configurar Políticas de Acceso (RLS)

### Opción A: Configuración Manual (Recomendada)

1. Ve a https://app.supabase.com → Storage → hotel-images
2. Click en la pestaña **"Policies"**
3. Click en **"New policy"**

#### Política 1: INSERT (Subir archivos)
- Click en **"New policy"** → **"Create a custom policy"**
- **Policy name**: `Allow authenticated users to upload images`
- **Policy command**: `INSERT`
- **Target roles**: `authenticated`
- En **"WITH CHECK expression"**, pega:
```sql
bucket_id = 'hotel-images'
```
- Click en **"Review"** → **"Save policy"**

#### Política 2: SELECT (Leer archivos)
- Click en **"New policy"** → **"Create a custom policy"**
- **Policy name**: `Allow public read access to images`
- **Policy command**: `SELECT`
- **Target roles**: `public`
- En **"USING expression"**, pega:
```sql
bucket_id = 'hotel-images'
```
- Click en **"Review"** → **"Save policy"**

---

### Opción B: Usando SQL (Más rápido)

1. Ve a https://app.supabase.com → **SQL Editor**
2. Click en **"New query"**
3. Copia y pega el contenido del archivo `POLITICAS_RLS_SUPABASE.sql`
4. Click en **"Run"** (o presiona `Ctrl+Enter`)

---

### Opción C: Desactivar RLS temporalmente (Solo para testing)

⚠️ **ADVERTENCIA**: Esto es inseguro en producción. Úsalo solo para probar.

1. Ve a SQL Editor
2. Ejecuta:
```sql
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

Para reactivarlo después:
```sql
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
```

---

## ✅ PASO 3: Verificar en la Aplicación

### En Local:

1. **Reinicia el servidor**:
```bash
# Presiona Ctrl+C para detener
npm run dev
```

2. Abre tu navegador en http://localhost:3002/admin/tipos-habitacion

3. Abre la **consola del navegador** (F12 → Console)

4. Intenta subir una imagen

5. En la **terminal del servidor**, deberías ver:
```
=== INICIO DE UPLOAD ===
Supabase URL: ✓ Configurada
Supabase Key: ✓ Configurada
Sesión: Usuario: admin@hotelelefante.com
Archivo recibido: { nombre: 'foto.jpg', tipo: 'image/jpeg', tamaño: '123.45 KB' }
...
✅ Archivo subido exitosamente
✅ URL pública generada: https://xxxxx.supabase.co/...
=== FIN DE UPLOAD ===
```

6. Si ves errores, **copia el mensaje completo** y búscalo en `DEBUG_SUPABASE.md`

---

### En Vercel (Producción):

1. Ve a tu proyecto en Vercel → **Settings** → **Environment Variables**

2. Agrega estas variables (si no las tienes):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

3. **Re-deploya** el proyecto:
   - Opción 1: En Vercel → Deployments → Redeploy
   - Opción 2: Haz un `git push` nuevo

4. Ve a https://hotel-elefante2.vercel.app/admin/tipos-habitacion

5. Intenta subir una imagen

6. Para ver logs en Vercel:
   - Ve a tu proyecto → **Deployments** → Click en el deployment más reciente
   - Ve a la pestaña **"Functions"** o **"Logs"**
   - Busca los logs de la función `/api/upload`

---

## ✅ PASO 4: Verificar en Supabase

1. Ve a https://app.supabase.com → Storage → hotel-images
2. Navega a la carpeta `room-types/`
3. Deberías ver las imágenes subidas
4. Click en una imagen para ver su URL pública

---

## 🔍 Problemas Comunes y Soluciones

### 1. "Variables de entorno no configuradas"
- ✅ Verifica que `.env` tenga las variables `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- ✅ Reinicia el servidor con `npm run dev`
- ✅ Las variables deben empezar con `NEXT_PUBLIC_` para ser accesibles en el cliente

### 2. "Bucket not found"
- ✅ Ve a Storage y verifica que el bucket se llame exactamente `hotel-images` (sin espacios, sin mayúsculas)
- ✅ Si tiene otro nombre, actualiza el código en `/src/app/api/upload/route.js` línea 69

### 3. Error 42501 o "row-level security"
- ✅ Sigue el **PASO 2** para configurar las políticas
- ✅ O desactiva RLS temporalmente para probar

### 4. "The resource already exists"
- ✅ Ya existe un archivo con ese nombre en Supabase
- ✅ Elimínalo desde Storage o cambia `upsert: false` a `upsert: true` en el código

### 5. La imagen se sube pero no se ve
- ✅ Verifica que el bucket sea **público**
- ✅ Verifica que la política de SELECT permita acceso público

### 6. Funciona en local pero no en Vercel
- ✅ Verifica que las variables de entorno estén en Vercel
- ✅ Re-deploya después de agregar las variables
- ✅ Verifica los logs en Vercel → Deployments → Functions

---

## 📊 Checklist Final

Marca cada item antes de decir que no funciona:

- [ ] Ejecuté `node test-supabase.js` y pasó sin errores
- [ ] Las variables de entorno están en `.env` (local) y en Vercel (producción)
- [ ] El bucket `hotel-images` existe en Supabase
- [ ] El bucket es **público** (Public bucket: Yes)
- [ ] Las políticas de RLS están configuradas (INSERT y SELECT)
- [ ] Reinicié el servidor local después de agregar las variables
- [ ] Re-deploye en Vercel después de agregar las variables
- [ ] Veo los logs detallados en la terminal cuando intento subir

---

## 🆘 Aún No Funciona?

Si seguiste todos los pasos y aún no funciona:

1. Ejecuta `node test-supabase.js` y **copia todo el output**
2. Intenta subir una imagen en http://localhost:3002/admin/tipos-habitacion
3. **Copia los logs de la terminal** (donde corre `npm run dev`)
4. **Copia los errores de la consola del navegador** (F12 → Console)
5. Envíame esta información

---

## 📚 Archivos de Referencia

- `test-supabase.js` - Script de diagnóstico
- `DEBUG_SUPABASE.md` - Guía detallada de troubleshooting
- `POLITICAS_RLS_SUPABASE.sql` - Scripts SQL para políticas
- `CONFIGURAR_SUPABASE_STORAGE.md` - Guía completa de configuración inicial
