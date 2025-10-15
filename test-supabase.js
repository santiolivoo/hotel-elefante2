// test-supabase.js (versión imagen)
require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const bucket = 'hotel-images'

const supabase = createClient(url, anon, { auth: { persistSession: false } })

;(async () => {
  console.log('1) Listar objetos del bucket...')
  const { data: list, error: listErr } = await supabase.storage.from(bucket).list('', { limit: 10 })
  if (listErr) return console.error('List error:', listErr)
  console.log('Objetos:', list)

  console.log('2) Subir PNG 1x1...')
  // PNG transparente 1x1
  const base64 = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII='
  const buffer = Buffer.from(base64, 'base64')

  const path = `tests/pixel-${Date.now()}.png`
  const { data: up, error: upErr } = await supabase
    .storage.from(bucket)
    .upload(path, buffer, { upsert: true, contentType: 'image/png' })
  if (upErr) return console.error('Upload error:', upErr)
  console.log('Subido en:', up.path)

  console.log('3) URL pública (si el bucket es público)...')
  const { data: pub } = supabase.storage.from(bucket).getPublicUrl(path)
  console.log(pub?.publicUrl)

  console.log('4) Verificar que ahora haya objetos...')
  const { data: list2 } = await supabase.storage.from(bucket).list('tests', { limit: 10 })
  console.log('Objetos en /tests:', list2)
})()
