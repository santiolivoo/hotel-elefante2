# 🔧 Pasos para Solucionar el Error de Creación

## ⚠️ IMPORTANTE: Sigue estos pasos EN ORDEN

### **Paso 1: Detener el Servidor**
Si el servidor está corriendo, deténlo:
- Presiona `Ctrl + C` en la terminal donde corre `npm run dev`

---

### **Paso 2: Regenerar Cliente de Prisma**
En la terminal, ejecuta:

```bash
npx prisma generate
```

**Nota:** Ignora el error EPERM si aparece, es normal en Windows.

---

### **Paso 3: Reiniciar el Servidor**
Inicia el servidor de nuevo:

```bash
npm run dev
```

Espera a que diga: `✓ Ready in ...`

---

### **Paso 4: Probar Crear Tipo de Habitación**

1. **Abre el navegador** en `http://localhost:3002`

2. **Inicia sesión como Admin:**
   - Email: `admin@hotelelefante.com`
   - Password: `admin123`

3. **Ve a:** Admin → Tipos de Habitación

4. **Abre la Consola del Navegador:**
   - Presiona `F12`
   - Ve a la pestaña "Console"

5. **Clic en "Nuevo Tipo"**

6. **Completa el formulario:**
   - Nombre: `Suite Test`
   - Descripción: `Prueba de creación`
   - Precio Base: `10000`
   - Huéspedes Máximos: `2`
   - Imagen: (opcional por ahora)

7. **Antes de hacer clic en Guardar:**
   - Mira la consola del navegador (F12)
   - También mira la terminal donde corre el servidor

8. **Clic en "Crear Tipo"**

9. **Observa ambas consolas:**

---

## 📊 Qué Buscar en los Logs

### **En la Consola del Navegador (F12):**

Deberías ver algo como:
```
Enviando datos: {
  name: "Suite Test",
  description: "Prueba de creación",
  basePrice: 10000,
  maxGuests: 2,
  images: [],
  imageUrl: null
}
```

Luego:
```
Respuesta del servidor: { roomType: {...} }
```

### **En la Terminal del Servidor:**

Deberías ver algo como:
```
Session: { user: { ... role: 'ADMIN' } }
Body recibido: { name: "Suite Test", ... }
Datos a crear: { name: "Suite Test", ... }
Tipo creado: { id: 1, name: "Suite Test", ... }
```

---

## ❌ Si Aparece un Error

### **Error en Navegador:**

Si ves en la consola del navegador:
```
Error completo: ...
```

**Copia TODO el error** y pégalo aquí abajo para analizarlo.

---

### **Error en Terminal:**

Si ves en la terminal:
```
Error al crear tipo de habitación: ...
```

**Copia TODO el error** incluyendo el "Stack trace".

---

## 🔍 Errores Comunes y Soluciones

### **Error: "No autorizado"**
**Solución:**
- Cierra sesión y vuelve a iniciar como admin
- Verifica el email: `admin@hotelelefante.com`

---

### **Error: "Faltan campos requeridos"**
**Solución:**
- Verifica que completaste: Nombre, Precio Base, Huéspedes Máximos
- Revisa la consola del navegador para ver qué campo falta

---

### **Error: PRISMA related**
**Solución:**
```bash
# Detener servidor (Ctrl+C)
npx prisma migrate reset
npx prisma generate
npm run dev
```

---

### **Error: Cannot read property 'create' of undefined**
**Solución:**
El cliente de Prisma no se generó correctamente.

```bash
# Detener servidor
rm -rf node_modules/.prisma
npx prisma generate
npm run dev
```

En Windows PowerShell:
```powershell
# Detener servidor
Remove-Item -Recurse -Force node_modules\.prisma
npx prisma generate
npm run dev
```

---

## 📋 Checklist de Verificación

Antes de reportar el error, verifica:

- [ ] El servidor está corriendo sin errores
- [ ] Iniciaste sesión como Admin
- [ ] Estás en la página `/admin/tipos-habitacion`
- [ ] Abriste la consola del navegador (F12)
- [ ] Completaste todos los campos requeridos
- [ ] Copiaste los logs de AMBAS consolas (navegador y terminal)

---

## 💡 Información Adicional para Debugging

### **Verificar que la tabla existe:**
```bash
npx prisma studio
```

1. Abre en `http://localhost:5555`
2. Busca la tabla `RoomType`
3. Verifica que tenga las columnas: `id`, `name`, `description`, `basePrice`, `maxGuests`, `imageUrl`, `images`

---

### **Ver el Schema actual:**
```bash
npx prisma db push --preview-feature
```

Esto sincronizará el schema sin crear migración.

---

## 📞 Siguiente Paso

**Una vez que hagas la prueba:**

1. Copia los logs de la consola del navegador (F12)
2. Copia los logs de la terminal del servidor
3. Pégalos para poder ayudarte mejor

**El sistema ahora tiene logs detallados que mostrarán exactamente dónde está el problema.**
