import { NextResponse } from 'next/server'
import { randomUUID } from 'crypto'
import { getSession } from '@/shared/lib/auth'
import { getSupabaseAdmin } from '@/shared/lib/supabase-admin'

const MAX_BYTES = 40 * 1024 * 1024

const MIME_EXT: Record<string, string> = {
  'application/pdf': 'pdf',
  'video/mp4': 'mp4',
  'video/webm': 'webm',
  'video/quicktime': 'mov',
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

  const ext = MIME_EXT[file.type]
  if (!ext) {
    return NextResponse.json({ error: 'Solo PDF o video (MP4, WebM, MOV)' }, { status: 400 })
  }

  const arrayBuffer = await file.arrayBuffer()
  const buffer = Buffer.from(arrayBuffer)
  if (buffer.length > MAX_BYTES) {
    return NextResponse.json({ error: 'Archivo demasiado grande (max 40MB)' }, { status: 400 })
  }

  const path = `digital-gifts/${session.sub}/${Date.now()}-${randomUUID()}.${ext}`
  const supabase = getSupabaseAdmin()
  const { error } = await supabase.storage.from('product-images').upload(path, buffer, {
    contentType: file.type,
    upsert: false,
  })

  if (error) {
    return NextResponse.json({ error: error.message || 'Error al subir a Storage' }, { status: 500 })
  }

  const { data } = supabase.storage.from('product-images').getPublicUrl(path)
  return NextResponse.json({ url: data.publicUrl })
}
