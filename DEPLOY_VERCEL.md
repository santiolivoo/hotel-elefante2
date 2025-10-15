# 🚀 Guía: Deploy a Vercel - Solución de Upload

## ⚠️ Por Qué Funciona en Local pero NO en Vercel

### Problema 1: Código Desactualizado
Los cambios que corrigen el upload **solo están en tu máquina local**. Vercel tiene la versión anterior del código.

### Problema 2: Variables de Entorno
Las variables en tu `.env` local **NO se copian automáticamente** a Vercel.

---

## 📋 Pasos para Hacer Funcionar en Vercel

### Paso 1: Hacer Push de los Cambios

```bash
# En la terminal, en la carpeta del proyecto:
git status                                          # Ver los archivos modificados
git add .                                          # Agregar todos los cambios
git commit -m "Fix: Corregir upload de imágenes"  # Hacer commit
git push                                           # Subir a GitHub/repositorio
```

**¿Qué hace esto?**
- Sube el código corregido a tu repositorio
- Vercel detecta el push y automáticamente hace un nuevo deploy

---

### Paso 2: Configurar Variables de Entorno en Vercel

#### 2.1. Ir a Vercel Dashboard
1. Ve a https://vercel.com
2. Selecciona tu proyecto (hotel-elefante2)
3. Click en **Settings** (pestaña superior)
4. Click en **Environment Variables** (menú lateral)

#### 2.2. Agregar Variables Requeridas

Agrega estas **3 variables** (copia los valores de tu `.env` local):

| Name | Value | Environments |
|------|-------|--------------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | ✅ Production, ✅ Preview, ✅ Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI...` | ✅ Production, ✅ Preview, ✅ Development |
| `SUPABASE_SERVICE_ROLE` | `eyJhbGciOiJIUzI...` | ✅ Production, ✅ Preview, ✅ Development |

**⚠️ IMPORTANTE**: 
- `SUPABASE_SERVICE_ROLE` es **CRÍTICA** - sin ella las subidas fallarán
- Marca los 3 checkboxes (Production, Preview, Development) para cada variable
- Los valores deben ser exactamente los mismos que en tu `.env` local

#### 2.3. Guardar
Click en **Save** después de agregar cada variable.

---

### Paso 3: Re-deployar (si es necesario)

Si ya hiciste push pero agregaste variables después:

1. Ve a **Deployments** (pestaña superior)
2. Click en los **tres puntos** (...) del deployment más reciente
3. Click en **Redeploy**
4. Selecciona **Use existing Build Cache** (más rápido)
5. Click en **Redeploy**

---

## 🧪 Verificar que Funciona

### 1. Esperar el Deploy
Vercel tomará 1-3 minutos en deployar. Verás un mensaje:
```
✅ Deployment Ready
```

### 2. Probar en Producción
1. Ve a https://hotel-elefante2.vercel.app/admin/tipos-habitacion
2. Intenta subir una imagen
3. Si funciona, verás la imagen cargada

### 3. Ver Logs (si falla)
1. Ve a Vercel → **Deployments**
2. Click en el deployment más reciente
3. Ve a **Functions** (pestaña)
4. Click en `/api/upload`
5. Ve a **Logs** - verás los mensajes `[UPLOAD]` que agregué

**Logs exitosos se verán así:**
```
📤 [UPLOAD] Iniciando subida de archivo...
📁 [UPLOAD] Archivo recibido: { nombre: 'foto.jpg', tipo: 'image/jpeg', tamaño: '123.45 KB' }
🔄 [UPLOAD] Subiendo a Supabase: uploads/1234567890-foto.jpg
✅ [UPLOAD] Archivo subido exitosamente
🔗 [UPLOAD] URL pública generada: https://xxxxx.supabase.co/...
```

---

## 🔍 Troubleshooting

### Error: "Missing Supabase environment variables"
**Causa**: Falta alguna variable de entorno en Vercel  
**Solución**: 
- Verifica que las 3 variables estén en Vercel Settings
- Asegúrate que estén marcadas para "Production"
- Re-deploya después de agregar variables

### Error: "No se encontró archivo"
**Causa**: El código viejo aún está en Vercel  
**Solución**:
- Verifica que hiciste `git push`
- Espera a que termine el deploy automático
- Si no se deployó, hace Redeploy manual

### Error: "Invalid API key" o "JWT expired"
**Causa**: La `SUPABASE_SERVICE_ROLE` es incorrecta o falta  
**Solución**:
- Ve a Supabase → Settings → API
- Copia nuevamente la clave `service_role`
- Actualiza la variable en Vercel
- Re-deploya

### Error: "Bucket not found"
**Causa**: El bucket no existe o no es público  
**Solución**:
- Ve a Supabase → Storage
- Verifica que `hotel-images` existe
- Márcalo como público

---

## 📊 Checklist Completo

### En Local (Ya funcionando ✅)
- [x] Código corregido
- [x] Variables en `.env`
- [x] Servidor reiniciado
- [x] Upload funciona

### Para Vercel (Hacer ahora)
- [ ] **Push del código**: `git add . && git commit -m "Fix upload" && git push`
- [ ] **Variables en Vercel**: Agregar las 3 variables
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE` ⚠️
- [ ] **Esperar deploy**: Ver que termine en Vercel
- [ ] **Probar**: Subir imagen en producción
- [ ] **Verificar logs**: Si falla, revisar función `/api/upload`

---

## 💡 Tip: Verificar Variables en Vercel

Para verificar que las variables están configuradas:

1. Ve a Vercel → Settings → Environment Variables
2. Deberías ver al menos estas 3:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE`
3. Si ves "Hidden" en el valor, es normal (por seguridad)
4. Las variables con `NEXT_PUBLIC_` son visibles en el cliente
5. `SUPABASE_SERVICE_ROLE` debe estar oculta (solo servidor)

---

## ⏱️ Tiempo Estimado

- **Push del código**: 10 segundos
- **Configurar variables**: 2 minutos
- **Deploy automático**: 1-3 minutos
- **Total**: ~5 minutos

---

## 🎯 Resumen

**Sí, necesitas hacer push** porque:
1. ✅ Los cambios de código solo están en local
2. ✅ Vercel no sabe de tus cambios hasta que hagas push
3. ✅ Las variables `.env` no se sincronizan automáticamente

**Pasos mínimos:**
```bash
git add .
git commit -m "Fix upload"
git push
```

Luego agregar las 3 variables en Vercel Settings y esperar el deploy.

---

**Estado Actual**:
- ✅ Local: Funcionando
- ❌ Vercel: Esperando push + variables

Después de hacer estos pasos, ambos funcionarán. 🚀
