import { NextResponse } from 'next/server'
import { z } from 'zod'
import { getSession } from '@/shared/lib/auth'
import {
  countUnreadAdminNotifications,
  listAdminNotifications,
  markAdminNotificationRead,
  markAllAdminNotificationsRead,
} from '@/shared/lib/data-store'

export async function GET() {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const [notifications, unread] = await Promise.all([listAdminNotifications(80), countUnreadAdminNotifications()])
  return NextResponse.json({ notifications, unread })
}

const patchSchema = z.object({
  id: z.string().min(1).optional(),
  markAllRead: z.boolean().optional(),
})

export async function PATCH(req: Request) {
  const session = await getSession()
  if (!session || session.role !== 'admin') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = patchSchema.parse(await req.json())
  if (body.markAllRead) {
    await markAllAdminNotificationsRead()
    return NextResponse.json({ ok: true })
  }
  if (body.id) {
    await markAdminNotificationRead(body.id)
    return NextResponse.json({ ok: true })
  }
  return NextResponse.json({ error: 'id o markAllRead requerido' }, { status: 400 })
}
