import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

async function getPayload(token: string) {
  const secret = new TextEncoder().encode(process.env.AUTH_SECRET ?? 'rrboxing-dev-secret-change-me')
  const { payload } = await jwtVerify(token, secret)
  return payload as { role?: string }
}

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('rrboxing_session')?.value
  const path = request.nextUrl.pathname
  const isProtected = path.startsWith('/account') || path.startsWith('/admin')
  const isAdmin = path.startsWith('/admin')

  if (!isProtected) return NextResponse.next()
  if (!token) return NextResponse.redirect(new URL('/login', request.url))

  try {
    const payload = await getPayload(token)
    if (isAdmin && payload.role !== 'admin') {
      return NextResponse.redirect(new URL('/account', request.url))
    }
    return NextResponse.next()
  } catch {
    return NextResponse.redirect(new URL('/login', request.url))
  }
}

export const config = {
  matcher: ['/account/:path*', '/admin/:path*'],
}
