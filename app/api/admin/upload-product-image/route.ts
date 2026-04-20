import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { getSession } from '@/shared/lib/auth'
import { getSupabaseAdmin } from '@/shared/lib/supabase-admin'

const ALLOWED = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/gif'])

function extFromMime(mime: string): string {
  if (mime === 'image/jpeg') return 'jpg'
  if (mime === 'image/png') return 'png'
  if (mime === 'image/webp') return 'webp'
  if (mime === 'image/gif') return 'gif'
  return 'bin'
}

export async function POST(req: Request) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const formData = await req.formData()
  const file = formData.get('file')
  if (!(file instanceof File)) {
    return NextResponse.json({ error: 'Falta archivo' }, { status: 400 })
  }

  if (!ALLOWED.has(file.type)) {
    return NextResponse.json({ error: 'Solo JPEG, PNG, WebP o GIF' }, { status: 400 })
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  if (buffer.length > 5 * 1024 * 1024) {
    return NextResponse.json({ error: 'Archivo demasiado grande (max 5MB)' }, { status: 400 })
  }

  const ext = extFromMime(file.type)
  const path = `catalog/${session.sub}/${Date.now()}-${randomUUID()}.${ext}`

  const supabase = getSupabaseAdmin()
  const { error } = await supabase.storage.from('product-images').upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  })

  if (error) {
    return NextResponse.json(
      { error: error.message || 'Error al subir a Storage' },
      { status: 500 }
    )
  }

  const { data } = supabase.storage.from('product-images').getPublicUrl(path)
  return NextResponse.json({ url: data.publicUrl })
}
