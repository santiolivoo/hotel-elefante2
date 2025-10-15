# 📸 Sistema de Imágenes - Supabase Storage

## 🎯 Estado Actual

✅ **Código actualizado** para usar Supabase Storage en lugar del filesystem local
✅ **Scripts de diagnóstico** listos para usar
⚠️ **Requiere configuración** de Supabase Storage

---

## 🚀 Inicio Rápido

### 1. Ejecutar diagnóstico
```bash
npm run test:supabase
```

### 2. Seguir instrucciones del script

El script te dirá exactamente qué falta y cómo solucionarlo.

---

## 📁 Archivos Importantes

| Archivo | Descripción |
|---------|-------------|
| `INSTRUCCIONES_RAPIDAS.md` | ⚡ **EMPIEZA AQUÍ** - Solución en 3 pasos |
| `test-supabase.js` | 🔍 Script de diagnóstico automático |
| `SOLUCION_IMAGENES.md` | 📖 Guía completa paso a paso |
| `DEBUG_SUPABASE.md` | 🐛 Troubleshooting detallado |
| `POLITICAS_RLS_SUPABASE.sql` | 🔐 Scripts SQL para políticas |
| `CONFIGURAR_SUPABASE_STORAGE.md` | ⚙️ Guía de configuración inicial |

---

## 🔧 Configuración Requerida

### Variables de Entorno

Necesitas estas 2 variables en `.env` (o `.env.local`):

```env
NEXT_PUBLIC_SUPABASE_URL="https://xxxxx.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Dónde obtenerlas**: https://app.supabase.com → Settings → API

### Bucket de Supabase

1. Nombre: `hotel-images`
2. Tipo: **Público** ✅
3. Políticas RLS: INSERT y SELECT configuradas

---

## 📊 Flujo de Upload

```
Usuario → Frontend → /api/upload → Supabase Storage → URL Pública → Base de Datos
```

### Antes (Local - ❌ No funciona en Vercel)
```
/api/upload → filesystem local → /public/uploads/room-types/
```

### Ahora (Cloud - ✅ Funciona en Vercel)
```
/api/upload → Supabase Storage → https://xxxxx.supabase.co/storage/v1/object/public/hotel-images/room-types/
```

---

## 🎬 Uso en el Código

### Subir Imagen
```javascript
const formData = new FormData()
formData.append('image', file)

const response = await fetch('/api/upload', {
  method: 'POST',
  body: formData,
})

const { url } = await response.json()
// url: "https://xxxxx.supabase.co/storage/v1/object/public/hotel-images/room-types/123456789-foto.jpg"
```

### Mostrar Imagen
```jsx
<img src={url} alt="Habitación" />
```

Las URLs son públicas y accesibles desde cualquier lugar.

---

## 🔍 Debugging

### Ver logs detallados

**En local**:
- Mira la terminal donde corre `npm run dev`
- Deberías ver logs como:
```
=== INICIO DE UPLOAD ===
Supabase URL: ✓ Configurada
Supabase Key: ✓ Configurada
Archivo recibido: { nombre: 'foto.jpg', tipo: 'image/jpeg', tamaño: '123.45 KB' }
...
✅ Archivo subido exitosamente
```

**En Vercel**:
- Ve a Deployments → Click en el deployment → Functions → `/api/upload`
- Busca los logs de la función

### Errores comunes

| Error | Solución |
|-------|----------|
| `Missing Supabase environment variables` | Agrega las variables en `.env` y reinicia |
| `Bucket not found` | Crea el bucket `hotel-images` en Supabase |
| `row-level security policy` (42501) | Configura las políticas RLS |
| `The resource already exists` | Cambia `upsert: false` a `upsert: true` |

---

## 🌍 Producción (Vercel)

### Configurar Variables
1. Ve a tu proyecto en Vercel
2. Settings → Environment Variables
3. Agrega:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### Re-deployar
```bash
git add .
git commit -m "Configure Supabase Storage"
git push
```

O en Vercel Dashboard → Deployments → Redeploy

---

## 💾 Migrar Imágenes Existentes (Opcional)

Si tienes imágenes en `/public/uploads/room-types/`:

1. Ve a Supabase → Storage → hotel-images
2. Crea carpeta `room-types`
3. Upload los archivos manualmente
4. Actualiza las URLs en la base de datos:
```sql
UPDATE "RoomType" 
SET "imageUrl" = REPLACE("imageUrl", '/uploads/', 'https://xxxxx.supabase.co/storage/v1/object/public/hotel-images/')
WHERE "imageUrl" LIKE '/uploads/%';
```

---

## ✅ Checklist de Configuración

- [ ] Variables de entorno configuradas en `.env`
- [ ] Bucket `hotel-images` creado en Supabase
- [ ] Bucket marcado como **público**
- [ ] Políticas RLS configuradas (INSERT y SELECT)
- [ ] Ejecuté `npm run test:supabase` sin errores
- [ ] Reinicié el servidor local
- [ ] Variables configuradas en Vercel (para producción)
- [ ] Re-deploye en Vercel

---

## 📞 Soporte

Si después de seguir todos los pasos aún no funciona:

1. Ejecuta `npm run test:supabase` y copia el output completo
2. Intenta subir una imagen y copia los logs del servidor
3. Copia los errores de la consola del navegador (F12 → Console)
4. Envía toda esta información

---

## 🎉 Beneficios de Supabase Storage

✅ **Persistente**: Las imágenes no se pierden entre deployments
✅ **Escalable**: Hasta 1GB gratis, luego paga por lo que uses
✅ **CDN Global**: Las imágenes se sirven rápido desde cualquier lugar
✅ **Backups**: Automáticos incluidos
✅ **Seguro**: Políticas de acceso granulares
✅ **Compatible**: Funciona en Vercel, Netlify, etc.

---

**Versión**: 1.0.0  
**Última actualización**: Octubre 2024
