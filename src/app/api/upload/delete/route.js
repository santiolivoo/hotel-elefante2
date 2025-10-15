import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Credenciales solo del servidor (SERVICE ROLE)
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE

if (!SUPABASE_URL) {
  console.warn('⚠️ Falta SUPABASE_URL en el entorno')
}
if (!SUPABASE_SERVICE_ROLE) {
  console.warn('⚠️ Falta SUPABASE_SERVICE_ROLE — la eliminación fallará')
}

// Cliente administrador (usa service_role)
const supabaseAdmin = createClient(SUPABASE_URL ?? '', SUPABASE_SERVICE_ROLE ?? '', {
  auth: { persistSession: false },
})

// Ejecutar en Node (la service key no puede ir en Edge)
export const runtime = 'nodejs'

export async function DELETE(req) {
  try {
    console.log('🗑️ [DELETE] Iniciando eliminación de archivo...')
    
    const body = await req.json()
    const { url } = body

    if (!url) {
      console.error('❌ [DELETE] No se proporcionó URL')
      return NextResponse.json({ error: 'URL requerida' }, { status: 400 })
    }

    // Extraer el path del archivo de la URL
    // Ejemplo URL: https://xxx.supabase.co/storage/v1/object/public/hotel-images/uploads/1760502322126-imagen.jpg
    // Path necesario: uploads/1760502322126-imagen.jpg
    
    let filePath = ''
    
    if (url.includes('/storage/v1/object/public/hotel-images/')) {
      // URL de Supabase
      filePath = url.split('/storage/v1/object/public/hotel-images/')[1]
    } else if (url.includes('hotel-images/uploads/')) {
      // URL relativa o parcial
      filePath = url.split('hotel-images/')[1]
    } else {
      console.error('❌ [DELETE] URL no válida:', url)
      return NextResponse.json({ error: 'URL no válida' }, { status: 400 })
    }

    console.log('📁 [DELETE] Path extraído:', filePath)

    const { data, error } = await supabaseAdmin
      .storage
      .from('hotel-images')
      .remove([filePath])

    if (error) {
      console.error('❌ [DELETE] Error al eliminar de Supabase:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log('✅ [DELETE] Archivo eliminado exitosamente:', filePath)

    return NextResponse.json({
      success: true,
      message: 'Archivo eliminado correctamente',
      path: filePath
    })
  } catch (err) {
    console.error('❌ [DELETE] Error inesperado:', err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
