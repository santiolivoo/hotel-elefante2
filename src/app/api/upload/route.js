import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

export async function POST(request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session || (session.user.role !== 'ADMIN' && session.user.role !== 'OPERATOR')) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('image')
    
    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      )
    }

    // Generar nombre único para el archivo
    const timestamp = Date.now()
    const originalName = file.name.replace(/\s+/g, '-')
    const fileName = `${timestamp}-${originalName}`
    
    // Convertir el archivo a buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Subir a Supabase Storage
    const { data, error } = await supabase.storage
      .from('hotel-images')
      .upload(`room-types/${fileName}`, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: false
      })

    if (error) {
      console.error('Error uploading to Supabase:', error)
      return NextResponse.json(
        { error: 'Error al subir la imagen a Supabase Storage' },
        { status: 500 }
      )
    }

    // Obtener URL pública de la imagen
    const { data: publicUrlData } = supabase.storage
      .from('hotel-images')
      .getPublicUrl(`room-types/${fileName}`)

    return NextResponse.json({ url: publicUrlData.publicUrl }, { status: 200 })
  } catch (error) {
    console.error('Error al subir imagen:', error)
    return NextResponse.json(
      { error: 'Error al subir la imagen' },
      { status: 500 }
    )
  }
}
