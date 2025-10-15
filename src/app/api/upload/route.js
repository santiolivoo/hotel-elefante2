import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Credenciales solo del servidor (SERVICE ROLE)
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_ROLE = process.env.SUPABASE_SERVICE_ROLE

if (!SUPABASE_URL) {
  console.warn('⚠️ Falta SUPABASE_URL en el entorno')
}
if (!SUPABASE_SERVICE_ROLE) {
  console.warn('⚠️ Falta SUPABASE_SERVICE_ROLE — la subida fallará')
}

// Cliente administrador (usa service_role)
const supabaseAdmin = createClient(SUPABASE_URL ?? '', SUPABASE_SERVICE_ROLE ?? '', {
  auth: { persistSession: false },
})

// Ejecutar en Node (la service key no puede ir en Edge)
export const runtime = 'nodejs'

export async function POST(req) {
  try {
    console.log('📤 [UPLOAD] Iniciando subida de archivo...')
    
    const contentType = req.headers.get('content-type') || ''
    if (!contentType.includes('multipart/form-data')) {
      console.error('❌ [UPLOAD] Content-Type incorrecto:', contentType)
      return NextResponse.json({ error: 'Expected multipart/form-data' }, { status: 400 })
    }

    const formData = await req.formData()
    // Intentar obtener el archivo con diferentes nombres de campo
    const file = formData.get('file') || formData.get('image')

    if (!file) {
      console.error('❌ [UPLOAD] No se encontró archivo en formData')
      return NextResponse.json({ error: "No se encontró archivo en los campos 'file' o 'image'" }, { status: 400 })
    }

    console.log('📁 [UPLOAD] Archivo recibido:', {
      nombre: file.name,
      tipo: file.type,
      tamaño: `${(file.size / 1024).toFixed(2)} KB`
    })

    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)
    const path = `uploads/${Date.now()}-${file.name}`

    console.log('🔄 [UPLOAD] Subiendo a Supabase:', path)

    const { data, error } = await supabaseAdmin
      .storage
      .from('hotel-images')
      .upload(path, buffer, {
        contentType: file.type || 'application/octet-stream',
        upsert: false,
      })

    if (error) {
      console.error('❌ [UPLOAD] Error al subir a Supabase:', error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    console.log('✅ [UPLOAD] Archivo subido exitosamente')

    const { data: pub } = supabaseAdmin
      .storage
      .from('hotel-images')
      .getPublicUrl(path)

    const publicUrl = pub?.publicUrl ?? null
    console.log('🔗 [UPLOAD] URL pública generada:', publicUrl)

    return NextResponse.json({
      path: data?.path ?? path,
      url: publicUrl,
    })
  } catch (err) {
    console.error('❌ [UPLOAD] Error inesperado:', err)
    return NextResponse.json({ error: err.message || String(err) }, { status: 500 })
  }
}
