// test-supabase-auth.js
require('dotenv').config()
const { createClient } = require('@supabase/supabase-js')

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const email = process.env.TEST_EMAIL
const password = process.env.TEST_PASSWORD
const bucket = 'hotel-images'

// PNG transparente 1x1 (Base64)
const base64 =
  'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR4nGNgYAAAAAMAASsJTYQAAAAASUVORK5CYII='
const buffer = Buffer.from(base64, 'base64')

const supabase = createClient(url, anon, { auth: { persistSession: false } })
async function tryUpload(client, path) {
  console.log(`   → Subiendo a: ${path}`)
  const { data, error } = await client
    .storage
    .from(bucket)
    .upload(path, buffer, { contentType: 'image/png', upsert: true })

  if (error) {
    // Mostrar mensaje más legible
    const msg = error?.message || error?.statusText || String(error)
    console.error('   Upload error:', msg)
    if (error?.status || error?.statusCode) {
      console.error('   Status:', error.status || error.statusCode)
    }
    return { ok: false, error }
  }

  console.log('   ✅ Subida OK:', data.path)
  const publicUrl = client.storage.from(bucket).getPublicUrl(data.path).data.publicUrl
  console.log('   Public URL:', publicUrl)
  return { ok: true, path: data.path, publicUrl }
}

;(async () => {
  console.log('[Supabase Storage Auth Test]')

  // 1) Login
  console.log('1) Login...')
  const { data: sign, error: signErr } = await supabase.auth.signInWithPassword({ email, password })
  if (signErr) {
    console.error('   Login error:', signErr)
    process.exit(1)
  }
  const uid = sign.user.id
  console.log('   OK, uid:', uid)

  // 1.1) Chequear que la sesión esté activa (token presente)
  const { data: sess } = await supabase.auth.getSession()
  const accessToken = sess?.session?.access_token
  console.log('   token set?', !!accessToken)

  // crear cliente con token para Storage (envía Authorization header)
  const authed = createClient(url, anon, {
    auth: { persistSession: false },
    global: { headers: { Authorization: `Bearer ${accessToken}` } }
  })

  // Intentar subida de prueba
  try {
    await tryUpload(authed, `test-upload-${Date.now()}.png`)
  } catch (err) {
    console.error('Upload failed:', err)
    process.exit(1)
  }
})().catch(err => {
  console.error('Fatal error:', err)
  process.exit(1)
})

