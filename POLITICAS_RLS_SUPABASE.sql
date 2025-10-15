-- ============================================
-- POLÍTICAS DE SUPABASE STORAGE PARA hotel-images
-- ============================================
-- 
-- Copia y ejecuta estos comandos en:
-- Supabase Dashboard → SQL Editor → New Query
--
-- O configúralas manualmente en:
-- Storage → hotel-images → Policies
-- ============================================

-- 1. POLÍTICA: Permitir a usuarios autenticados SUBIR archivos (INSERT)
CREATE POLICY "Allow authenticated users to upload images"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'hotel-images'
);

-- 2. POLÍTICA: Permitir a TODOS leer archivos (SELECT) - Para imágenes públicas
CREATE POLICY "Allow public read access to images"
ON storage.objects
FOR SELECT
TO public
USING (
  bucket_id = 'hotel-images'
);

-- 3. POLÍTICA: Permitir a usuarios autenticados ACTUALIZAR archivos (UPDATE)
CREATE POLICY "Allow authenticated users to update images"
ON storage.objects
FOR UPDATE
TO authenticated
USING (
  bucket_id = 'hotel-images'
)
WITH CHECK (
  bucket_id = 'hotel-images'
);

-- 4. POLÍTICA: Permitir a usuarios autenticados ELIMINAR archivos (DELETE)
CREATE POLICY "Allow authenticated users to delete images"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'hotel-images'
);

-- ============================================
-- ALTERNATIVA SIMPLE (Solo para testing)
-- ============================================
-- Si las políticas anteriores no funcionan,
-- temporalmente puedes desactivar RLS:
-- 
-- NOTA: Esto es INSEGURO en producción
-- ============================================

-- Desactivar RLS (solo para testing)
-- ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;

-- Para reactivarlo después:
-- ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- ============================================
-- VERIFICAR POLÍTICAS EXISTENTES
-- ============================================
-- Ejecuta esto para ver las políticas actuales:

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'objects'
  AND schemaname = 'storage';

-- ============================================
-- ELIMINAR POLÍTICAS ANTIGUAS (si es necesario)
-- ============================================
-- Si tienes políticas conflictivas, elimínalas primero:

-- DROP POLICY IF EXISTS "Allow authenticated users to upload images" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow public read access to images" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow authenticated users to update images" ON storage.objects;
-- DROP POLICY IF EXISTS "Allow authenticated users to delete images" ON storage.objects;

-- Luego vuelve a crear las políticas de arriba
