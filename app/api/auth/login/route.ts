import { NextResponse } from 'next/server'
import { z } from 'zod'
import { createSession } from '@/shared/lib/auth'
import { getSupabasePublic } from '@/shared/lib/supabase-public'
import { getSupabaseAdmin } from '@/shared/lib/supabase-admin'

const schema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function POST(req: Request) {
  try {
    const body = schema.parse(await req.json())
    const debugAuth = process.env.AUTH_DEBUG === '1'
    const supabasePublic = getSupabasePublic()
    const { data, error } = await supabasePublic.auth.signInWithPassword({
      email: body.email,
      password: body.password,
    })

    if (error || !data.user) {
      return NextResponse.json(
        {
          error: 'Credenciales invalidas',
          ...(debugAuth
            ? {
                debug: {
                  supabaseMessage: error?.message ?? 'No user returned',
                  supabaseCode: (error as { code?: string } | null)?.code ?? null,
                  projectHost: process.env.NEXT_PUBLIC_SUPABASE_URL ?? null,
                },
              }
            : {}),
        },
        { status: 401 }
      )
    }

    const supabaseAdmin = getSupabaseAdmin()
    const { data: appUserRaw, error: appUserError } = await supabaseAdmin
      .from('app_users')
      .select('role')
      .eq('id', data.user.id)
      .maybeSingle()

    if (appUserError) {
      return NextResponse.json(
        {
          error: 'No se pudo validar rol de usuario',
          ...(debugAuth
            ? {
                debug: {
                  supabaseMessage: appUserError.message,
                  projectHost: process.env.NEXT_PUBLIC_SUPABASE_URL ?? null,
                },
              }
            : {}),
        },
        { status: 500 }
      )
    }

    const appUser = appUserRaw as { role?: 'admin' | 'customer' } | null
    const role = appUser?.role === 'admin' ? 'admin' : 'customer'
    await createSession({
      sub: data.user.id,
      email: data.user.email ?? body.email,
      role,
    })

    return NextResponse.json({ ok: true, role })
  } catch (error) {
    const debugAuth = process.env.AUTH_DEBUG === '1'
    const message = error instanceof Error ? error.message : 'Error inesperado'
    return NextResponse.json(
      {
        error: 'Error al iniciar sesion',
        ...(debugAuth ? { debug: { message, projectHost: process.env.NEXT_PUBLIC_SUPABASE_URL ?? null } } : {}),
      },
      { status: 500 }
    )
  }
}
