# Migración: Sistema de Tipos de Habitación

## Cambios Realizados

### 1. **Base de Datos**
Se agregó el campo `imageUrl` al modelo `RoomType` en el schema de Prisma.

### 2. **Nuevas Funcionalidades**
- ✅ CRUD completo de tipos de habitación en `/admin/tipos-habitacion`
- ✅ Subida de imágenes para tipos de habitación
- ✅ Las habitaciones heredan información del tipo (descripción, precio, capacidad)
- ✅ Formulario simplificado para crear habitaciones (solo número, tipo y piso)

### 3. **APIs Creadas**
- `POST /api/admin/room-types` - Crear tipo de habitación
- `GET /api/admin/room-types` - Listar tipos de habitación
- `PATCH /api/admin/room-types/[id]` - Actualizar tipo
- `DELETE /api/admin/room-types/[id]` - Eliminar tipo
- `POST /api/upload` - Subir imágenes

## Instrucciones de Aplicación

### Paso 1: Aplicar Migración de Base de Datos

```bash
npx prisma migrate dev --name add-image-url-to-room-types
```

Este comando:
- Creará una nueva migración con el campo `imageUrl`
- Aplicará los cambios a la base de datos
- Regenerará el cliente de Prisma

### Paso 2: Actualizar Tipos de Habitación Existentes (Opcional)

Si deseas agregar imágenes a los tipos existentes, ejecuta el seed actualizado:

```bash
# Primero, actualiza el archivo prisma/seed.js con las rutas de imágenes
# Luego ejecuta:
npx prisma db seed
```

O actualiza manualmente desde el panel admin en `/admin/tipos-habitacion`

### Paso 3: Crear Directorio para Uploads

Asegúrate de que existe el directorio para las imágenes:

```bash
mkdir -p public/uploads/room-types
```

## Uso del Sistema

### Gestión de Tipos de Habitación (Admin)

1. Ve a **Admin → Tipos de Habitación**
2. Haz clic en "Nuevo Tipo"
3. Completa:
   - Nombre (ej: Suite Deluxe)
   - Descripción
   - Precio base por noche
   - Huéspedes máximos
   - Imagen (se subirá automáticamente)
4. Guarda

### Crear Habitaciones

1. Ve a **Admin → Habitaciones**
2. Haz clic en "Nueva Habitación"
3. Solo completa:
   - **Número** (ej: 101)
   - **Tipo** (selecciona de la lista)
   - **Piso** (1, 2, 3...)
4. La descripción, precio y capacidad se heredan del tipo

### Subir Imágenes

- **Formatos aceptados**: JPG, PNG, WebP
- **Dónde**: Al crear/editar un tipo de habitación
- **Permisos**: Admin y Operador
- **Almacenamiento**: `public/uploads/room-types/`

## Beneficios del Sistema

✅ **Consistencia** - Todos los datos centralizados en el tipo  
✅ **Simplicidad** - Crear habitaciones es más rápido  
✅ **Mantenibilidad** - Actualizar un tipo afecta todas sus habitaciones  
✅ **Imágenes propias** - No dependes de servicios externos  
✅ **Flexibilidad** - Fácil agregar nuevos tipos  

## Notas Importantes

- ⚠️ No puedes eliminar un tipo si hay habitaciones usándolo
- 📁 Las imágenes se guardan con timestamp para evitar duplicados
- 🔒 Solo Admin y Operador pueden subir imágenes
- 💾 Las imágenes anteriores del seed siguen funcionando como fallback

## Próximos Pasos Opcionales

- [ ] Implementar galería de imágenes múltiples por tipo
- [ ] Agregar campo de amenidades personalizadas por tipo
- [ ] Sistema de tags/categorías para tipos
- [ ] Reportes de ocupación por tipo de habitación
