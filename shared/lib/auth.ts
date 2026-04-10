import { SignJWT, jwtVerify } from 'jose'
import { cookies } from 'next/headers'
import type { UserSession } from '@/shared/types/commerce'

const cookieName = 'rrboxing_session'
const encoder = new TextEncoder()

function getJwtSecret() {
  return encoder.encode(process.env.AUTH_SECRET ?? 'rrboxing-dev-secret-change-me')
}

export async function createSession(session: UserSession) {
  const token = await new SignJWT({ ...session })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getJwtSecret())

  cookies().set(cookieName, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  })
}

export async function clearSession() {
  cookies().delete(cookieName)
}

export async function getSession(): Promise<UserSession | null> {
  const token = cookies().get(cookieName)?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, getJwtSecret())
    return payload as unknown as UserSession
  } catch {
    return null
  }
}
