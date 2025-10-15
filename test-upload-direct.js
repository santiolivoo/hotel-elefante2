const { createClient } = require('@supabase/supabase-js')
require('dotenv').config()

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

console.log('\n🔍 === TEST DE UPLOAD DIRECTO ===\n')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseKey ? supabaseKey.substring(0, 20) + '...' : 'NO ENCONTRADA')

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Variables de entorno no configuradas')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

console.log('\n📤 Intentando subir archivo de prueba al bucket hotel-images...')

const testContent = Buffer.from('Test - ' + new Date().toISOString())
const testFileName = `test-${Date.now()}.txt`
const testPath = `room-types/${testFileName}`

console.log('Ruta:', testPath)

supabase.storage
  .from('hotel-images')
  .upload(testPath, testContent, {
    contentType: 'text/plain',
    cacheControl: '3600',
    upsert: false
  })
  .then(({ data, error }) => {
    if (error) {
      console.error('\n❌ ERROR AL SUBIR:', error)
      console.error('Mensaje:', error.message)
      
      if (error.message.includes('row-level security') || error.statusCode === '42501') {
        console.log('\n💡 PROBLEMA: Políticas RLS no configuradas')
        console.log('\n✅ SOLUCIÓN RÁPIDA:')
        console.log('1. Ve a: https://app.supabase.com → SQL Editor')
        console.log('2. Ejecuta este comando:\n')
        console.log('ALTER TABLE storage.objects DISABLE ROW LEVEL SECURITY;\n')
        console.log('⚠️ Solo para testing. Para producción usa las políticas en POLITICAS_RLS_SUPABASE.sql')
      }
      return
    }
    
    console.log('\n✅ ARCHIVO SUBIDO EXITOSAMENTE')
    console.log('Path:', data.path)
    
    const { data: publicUrlData } = supabase.storage
      .from('hotel-images')
      .getPublicUrl(testPath)
    
    console.log('URL pública:', publicUrlData.publicUrl)
    console.log('\n✨ TODO FUNCIONA CORRECTAMENTE')
    console.log('Ahora intenta subir imágenes desde la aplicación\n')
  })
