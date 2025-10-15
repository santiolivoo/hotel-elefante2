# 🔍 Diagnóstico: Problema de Carga de Imágenes

## ✅ Problema Identificado y Solucionado

### 🔴 Causa Principal
**Discrepancia en el nombre del campo de archivo**

- **API Route esperaba**: `formData.get('file')`
- **Frontend enviaba**: `formData.append('image', file)`

### ✅ Solución Aplicada
El endpoint `/api/upload/route.js` ahora acepta **ambos nombres de campo**:
```javascript
const file = formData.get('file') || formData.get('image')
```

---

## 🚨 Verificación Requerida: Variables de Entorno

El API route requiere estas variables para funcionar:

### Variables Necesarias en `.env`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### ⚠️ IMPORTANTE: `SUPABASE_SERVICE_ROLE`
Esta variable es **crítica** para que las subidas funcionen. Es diferente a `ANON_KEY`.

**Dónde encontrarla:**
1. Ve a https://app.supabase.com
2. Selecciona tu proyecto
3. Ve a **Settings → API**
4. Copia la clave **`service_role`** (NO la `anon` key)
5. ⚠️ **NUNCA compartas esta clave** - tiene permisos de administrador

---

## 📋 Checklist de Verificación

### 1. Variables de Entorno ✓
- [ ] `NEXT_PUBLIC_SUPABASE_URL` está configurada
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` está configurada
- [ ] `SUPABASE_SERVICE_ROLE` está configurada ⚠️ **CRÍTICA**

### 2. Configuración de Supabase Storage ✓
- [ ] El bucket `hotel-images` existe
- [ ] El bucket es **público**
- [ ] Las políticas RLS están configuradas

### 3. Después de Configurar ✓
- [ ] Reiniciar el servidor: `Ctrl+C` → `npm run dev`

---

## 🧪 Cómo Probar

### Paso 1: Verificar Variables
Ejecuta el script de diagnóstico:
```bash
node test-supabase.js
```

### Paso 2: Probar Upload
1. Abre http://localhost:3002/admin/tipos-habitacion
2. Intenta crear/editar un tipo de habitación
3. Selecciona una imagen
4. Guarda

### Paso 3: Revisar Logs
En la **terminal del servidor** verás:
```
📤 [UPLOAD] Iniciando subida de archivo...
📁 [UPLOAD] Archivo recibido: { nombre: 'foto.jpg', tipo: 'image/jpeg', tamaño: '123.45 KB' }
🔄 [UPLOAD] Subiendo a Supabase: uploads/1234567890-foto.jpg
✅ [UPLOAD] Archivo subido exitosamente
🔗 [UPLOAD] URL pública generada: https://xxxxx.supabase.co/...
```

Si ves errores, el log te dirá exactamente qué falta.

---

## 🐛 Errores Comunes

### Error: "No se encontró archivo en los campos 'file' o 'image'"
**Causa**: El FormData no contiene el archivo  
**Solución**: Verifica que el input `type="file"` tenga archivos seleccionados

### Error: "Bucket not found" o "storage/bucket-not-found"
**Causa**: El bucket `hotel-images` no existe en Supabase  
**Solución**: 
1. Ve a Supabase → Storage
2. Crea el bucket `hotel-images`
3. Márcalo como **público**

### Error: "row-level security policy" (código 42501)
**Causa**: Las políticas RLS bloquean las subidas  
**Solución**: Ejecuta las políticas SQL en `POLITICAS_RLS_SUPABASE.sql`

### Error: "Invalid API key" o "JWT expired"
**Causa**: Las credenciales de Supabase son incorrectas o falta `SUPABASE_SERVICE_ROLE`  
**Solución**: 
1. Verifica que las variables estén correctas
2. Copia nuevamente desde Supabase → Settings → API
3. **Agrega `SUPABASE_SERVICE_ROLE`** si falta

---

## 🔄 Cambios Realizados

### 1. `/src/app/api/upload/route.js`
- ✅ Acepta ambos nombres de campo: `'file'` e `'image'`
- ✅ Logging detallado para debugging
- ✅ Mensajes de error más claros

### 2. `/src/app/admin/tipos-habitacion/page.js`
- ✅ Manejo de errores mejorado
- ✅ Alerta al usuario si falla la subida
- ✅ No guarda datos si las imágenes fallan

### 3. `/src/app/admin/servicios/page.js`
- ✅ Manejo de errores mejorado
- ✅ Toast notification si falla la subida
- ✅ No guarda datos si las imágenes fallan

---

## 🚀 Próximos Pasos

1. **Verificar variables de entorno** (especialmente `SUPABASE_SERVICE_ROLE`)
2. **Reiniciar el servidor**
3. **Probar la subida** de imágenes
4. **Revisar los logs** en la terminal

Si después de configurar `SUPABASE_SERVICE_ROLE` y reiniciar el servidor aún tienes problemas, ejecuta:
```bash
node test-supabase-auth.js
```

Este script te mostrará si hay problemas con la autenticación.

---

## 📞 Soporte Adicional

Si aún no funciona después de seguir estos pasos:

1. Copia el **output completo** del comando `node test-supabase.js`
2. Copia los **logs del servidor** cuando intentas subir
3. Copia cualquier **error en la consola del navegador** (F12)
4. Verifica que `.env` contenga las 3 variables mencionadas

---

**Última actualización**: Análisis completado
**Estado**: Código corregido - Requiere verificación de variables de entorno
