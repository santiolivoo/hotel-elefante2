# 📦 Configuración de Supabase Storage para Imágenes

## ¿Por qué necesitas esto?

Las imágenes funcionan en **localhost** porque se guardan en el filesystem local (`/public/uploads`). Pero **Vercel no permite guardar archivos** en el filesystem porque es efímero (se borra después de cada deployment).

**Solución**: Usar **Supabase Storage** para almacenar las imágenes en la nube.

---

## 🔧 Paso 1: Obtener las Credenciales de Supabase

1. Ve a tu proyecto en https://app.supabase.com
2. En el menú lateral, haz clic en **⚙️ Settings** → **API**
3. Copia los siguientes valores:
   - **Project URL** (algo como `https://xxxxx.supabase.co`)
   - **anon public** key (una llave larga que empieza con `eyJ...`)

---

## ✏️ Paso 2: Configurar Variables de Entorno

### **En Local (desarrollo)**

1. Abre tu archivo `.env` (si no existe, créalo copiando `.env.example`)
2. Agrega estas líneas (reemplaza con tus valores):

```env
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.ey..."
```

### **En Vercel (producción)**

1. Ve a tu proyecto en https://vercel.com
2. Haz clic en **Settings** → **Environment Variables**
3. Agrega las mismas dos variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

---

## 🪣 Paso 3: Crear el Bucket de Almacenamiento en Supabase

1. En tu proyecto de Supabase, ve a **Storage** en el menú lateral
2. Haz clic en **"Create a new bucket"** (Crear nuevo bucket)
3. Configura el bucket:
   - **Name**: `hotel-images`
   - **Public bucket**: ✅ **Marcado** (importante para que las imágenes sean accesibles públicamente)
   - **File size limit**: `5 MB` (o el límite que prefieras)
   - **Allowed MIME types**: `image/*` (para aceptar cualquier tipo de imagen)
4. Haz clic en **"Create bucket"**

### Configurar Políticas de Acceso (RLS)

Por defecto, Supabase bloquea el acceso. Necesitas crear políticas:

1. En la vista de **Storage**, haz clic en tu bucket `hotel-images`
2. Ve a la pestaña **"Policies"**
3. Haz clic en **"New Policy"**

#### Política 1: Permitir subir imágenes (INSERT)
- **Name**: `Allow authenticated users to upload`
- **Policy command**: `INSERT`
- **Target roles**: `authenticated`
- **Policy definition**: Usa el editor SQL y pega:
```sql
(bucket_id = 'hotel-images'::text)
```
- Haz clic en **"Review"** → **"Save Policy"**

#### Política 2: Permitir leer imágenes públicamente (SELECT)
- **Name**: `Allow public read access`
- **Policy command**: `SELECT`
- **Target roles**: `public` (o `anon`)
- **Policy definition**: 
```sql
(bucket_id = 'hotel-images'::text)
```
- Haz clic en **"Review"** → **"Save Policy"**

#### Política 3: Permitir eliminar imágenes (DELETE) - Opcional
- **Name**: `Allow authenticated users to delete`
- **Policy command**: `DELETE`
- **Target roles**: `authenticated`
- **Policy definition**:
```sql
(bucket_id = 'hotel-images'::text)
```

---

## 🚀 Paso 4: Re-deployar en Vercel

Después de configurar las variables de entorno en Vercel:

1. Ve a tu proyecto en Vercel
2. Haz clic en **"Deployments"**
3. Haz clic en **"Redeploy"** o simplemente haz un nuevo `git push`

---

## ✅ Paso 5: Verificar que Funciona

### En localhost:
1. Reinicia tu servidor de desarrollo: `npm run dev`
2. Ve a http://localhost:3002/admin/tipos-habitacion
3. Intenta subir una imagen nueva
4. Verifica en Supabase → Storage → hotel-images que se haya subido

### En Vercel (producción):
1. Ve a https://hotel-elefante2.vercel.app/admin/tipos-habitacion
2. Sube una imagen
3. Debería aparecer correctamente

---

## 🔍 Troubleshooting

### Error: "Missing Supabase environment variables"
- Verifica que hayas agregado `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en `.env`
- Reinicia el servidor de desarrollo

### Error: "new row violates row-level security policy"
- Ve a Supabase → Storage → Policies
- Asegúrate de haber creado las políticas de acceso correctamente

### Las imágenes no se ven en producción
- Verifica que el bucket `hotel-images` sea **público**
- Verifica que las variables de entorno estén configuradas en Vercel
- Re-deploya la aplicación después de agregar las variables

### Las imágenes antiguas (de localhost) no se ven
- Las imágenes del sistema de archivos local (`/public/uploads`) **no** se migran automáticamente
- Tendrás que volver a subir las imágenes desde el admin
- Alternativamente, puedes migrarlas manualmente a Supabase Storage

---

## 📊 Migrar Imágenes Existentes (Opcional)

Si tienes imágenes en `/public/uploads/room-types/`, puedes subirlas manualmente:

1. Ve a Supabase → Storage → `hotel-images`
2. Crea una carpeta `room-types`
3. Haz clic en **"Upload files"**
4. Selecciona las imágenes de `public/uploads/room-types/`
5. Sube los archivos

Luego actualiza las URLs en la base de datos:
- Cambia `/uploads/room-types/imagen.jpg` 
- Por `https://xxxxx.supabase.co/storage/v1/object/public/hotel-images/room-types/imagen.jpg`

---

## 🎉 ¡Listo!

Ahora tus imágenes se almacenan en Supabase Storage y funcionarán tanto en desarrollo como en producción (Vercel).

### Ventajas:
✅ Las imágenes persisten entre deployments
✅ No se pierden al reiniciar la aplicación
✅ Escalable y con CDN global de Supabase
✅ Backups automáticos
✅ Plan gratuito: 1 GB de almacenamiento
