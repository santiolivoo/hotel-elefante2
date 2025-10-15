# 🔍 Debug: Imágenes no se suben a Supabase Storage

## Paso 1: Verificar Variables de Entorno

Abre la terminal y ejecuta esto para verificar que las variables estén configuradas:

```bash
npm run dev
```

En otra terminal, ejecuta:
```bash
node -e "console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL); console.log('Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configurada ✓' : 'NO configurada ✗')"
```

**IMPORTANTE**: Las variables que empiezan con `NEXT_PUBLIC_` deben estar en `.env` o `.env.local`

## Paso 2: Verificar Configuración del Bucket

Ve a Supabase → Storage → hotel-images:

### 2.1: Verificar que el bucket sea PÚBLICO
- En el bucket `hotel-images`, ve a Configuration
- Debe decir **"Public bucket: Yes"**
- Si dice "No", haz clic en Edit y márcalo como público

### 2.2: Verificar Políticas (RLS)

Ve a Storage → hotel-images → Policies

**Deberías tener al menos estas 2 políticas:**

#### Política 1: INSERT (Subir archivos)
```sql
-- Name: Enable insert for authenticated users
-- Operation: INSERT
-- Target: authenticated

CREATE POLICY "Enable insert for authenticated users"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'hotel-images');
```

#### Política 2: SELECT (Leer archivos públicamente)
```sql
-- Name: Enable read access for all users
-- Operation: SELECT
-- Target: public

CREATE POLICY "Enable read access for all users"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'hotel-images');
```

**TRUCO RÁPIDO**: Si no funciona, puedes deshabilitar RLS temporalmente:
1. Ve a Storage → hotel-images → Policies
2. Click en "Disable RLS" (solo para testing)

## Paso 3: Ver Errores en Consola

### En el Navegador:
1. Abre DevTools (F12)
2. Ve a la pestaña Console
3. Intenta subir una imagen
4. Copia cualquier error que aparezca

### En el Terminal del servidor:
1. Mira la terminal donde corre `npm run dev`
2. Debería mostrar errores detallados

## Paso 4: Probar Conexión Directa

Crea un archivo temporal para probar:

**test-supabase.js** (en la raíz del proyecto):
```javascript
const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('Testing Supabase connection...')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'NOT FOUND')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno no encontradas')
  console.log('\nAsegúrate de tener en tu archivo .env:')
  console.log('NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJ..."')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

// Listar buckets
supabase.storage.listBuckets().then(({ data, error }) => {
  if (error) {
    console.error('❌ Error al listar buckets:', error)
  } else {
    console.log('✅ Buckets disponibles:', data.map(b => b.name))
    
    // Verificar si existe hotel-images
    const hotelBucket = data.find(b => b.name === 'hotel-images')
    if (hotelBucket) {
      console.log('✅ Bucket "hotel-images" encontrado')
      console.log('   - Público:', hotelBucket.public ? 'SÍ ✓' : 'NO ✗')
    } else {
      console.error('❌ Bucket "hotel-images" NO encontrado')
    }
  }
})
```

Ejecuta:
```bash
node test-supabase.js
```

## Paso 5: Errores Comunes y Soluciones

### Error: "Missing Supabase environment variables"
**Causa**: Variables no configuradas
**Solución**: 
- Verifica que `.env` tenga las variables `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Reinicia el servidor: Ctrl+C y luego `npm run dev`

### Error: "new row violates row-level security policy"
**Causa**: Las políticas de RLS bloquean el acceso
**Solución**:
1. Ve a Storage → hotel-images → Policies
2. Asegúrate de tener las políticas de INSERT y SELECT
3. O desactiva RLS temporalmente para probar

### Error: "The resource already exists"
**Causa**: Ya existe un archivo con ese nombre
**Solución**: El código debería usar timestamps únicos, pero verifica que no haya duplicados

### Error: "Bucket not found"
**Causa**: El bucket no existe o tiene otro nombre
**Solución**: 
- Ve a Supabase Storage y verifica que el bucket se llame exactamente `hotel-images`
- Si tiene otro nombre, actualiza el código en `/src/app/api/upload/route.js`

### Las imágenes se suben pero no se ven
**Causa**: El bucket no es público
**Solución**:
1. Ve a Storage → hotel-images → Configuration
2. Edit → Marcar "Public bucket" → Save

## Paso 6: Alternativa Temporal - Desactivar RLS

Si nada funciona, prueba desactivar RLS temporalmente:

1. Ve a Supabase
2. SQL Editor (en el menú lateral)
3. Ejecuta este comando:

```sql
-- Desactivar RLS para el bucket hotel-images
ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;
```

⚠️ **Advertencia**: Esto desactiva la seguridad. Es solo para testing.

Para reactivarlo después:
```sql
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
```

## Paso 7: Contactarme con Info

Si aún no funciona, dame esta información:

1. ✅ ¿Las variables de entorno están configuradas? (Sí/No)
2. ✅ ¿El bucket "hotel-images" existe? (Sí/No)
3. ✅ ¿El bucket es público? (Sí/No)
4. ✅ ¿Qué errores ves en la consola del navegador?
5. ✅ ¿Qué errores ves en la terminal del servidor?
6. ✅ Resultado de ejecutar `node test-supabase.js`
