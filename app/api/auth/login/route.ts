import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createSession } from '@/shared/lib/auth'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(req: Request) {
  const body = schema.parse(await req.json())
  const adminEmail = process.env.ADMIN_EMAIL ?? 'admin@rrboxing.com'
  const adminPassword = process.env.ADMIN_PASSWORD ?? 'Admin12345'

  if (body.email === adminEmail && body.password === adminPassword) {
    await createSession({ sub: 'admin', email: body.email, role: 'admin' })
    return NextResponse.json({ ok: true })
  }

  await createSession({ sub: body.email, email: body.email, role: 'customer' })
  return NextResponse.json({ ok: true })
}
