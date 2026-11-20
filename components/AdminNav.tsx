'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import LogoutButton from '@/features/auth/LogoutButton'

// El menú del panel. En el celular es una fila que se desliza de lado (para que el título de cada página se vea sin
// bajar); desde 768 px, la columna de la izquierda. Va primero lo que Richard usa cada día.
const links = [
  { href: '/admin', label: 'Panel' },
  { href: '/admin/orders', label: 'Pedidos' },
  { href: '/admin/ventas', label: 'Registrar venta' },
  { href: '/admin/clase', label: 'Clase virtual' },
  { href: '/admin/reclamos', label: 'Libro de reclamaciones' },
  { href: '/admin/products', label: 'Productos' },
  { href: '/admin/digital-gifts', label: 'Regalos digitales' },
  { href: '/admin/settings', label: 'Configuración' },
]

export default function AdminNav() {
  const pathname = usePathname()
  const [unread, setUnread] = useState(0)
  const fila = useRef<HTMLElement>(null)

  useEffect(() => {
    let cancelled = false
    const tick = () => {
      void fetch('/api/admin/notifications', { cache: 'no-store' })
        .then((r) => r.json())
        .then((d) => {
          if (!cancelled && typeof d.unread === 'number') setUnread(d.unread)
        })
        .catch(() => {})
    }
    tick()
    const id = window.setInterval(tick, 12000)
    return () => {
      cancelled = true
      window.clearInterval(id)
    }
  }, [pathname])

  // En el celular, la fila se corre para que se vea la página en la que estás (sin mover la página hacia abajo)
  useEffect(() => {
    const nav = fila.current
    const activo = nav?.querySelector<HTMLElement>('[aria-current="page"]')
    if (!nav || !activo || nav.scrollWidth <= nav.clientWidth) return
    // Solo si no se ve entera: así «Panel» y «Pedidos», que van primero, no corren la fila
    if (activo.offsetLeft + activo.offsetWidth > nav.clientWidth - 16) nav.scrollLeft = Math.max(0, activo.offsetLeft - 16)
  }, [pathname])

  return (
    <aside className="-mx-4 min-w-0 border-b border-dark-300 md:mx-0 md:self-start md:rounded-2xl md:border md:bg-dark-100 md:p-5">
      <div className="mb-4 hidden md:block">
        <p className="text-sm text-neutral">RR Boxing</p>
        <h2 className="font-heading text-2xl leading-none text-white">Administración</h2>
      </div>
      <nav
        ref={fila}
        aria-label="Secciones del panel"
        className="relative flex gap-5 overflow-x-auto px-4 md:block md:space-y-1 md:overflow-visible md:px-0"
      >
        {links.map((link) => {
          const active =
            link.href === '/admin' ? pathname === '/admin' : pathname === link.href || pathname.startsWith(`${link.href}/`)
          const badge = link.href === '/admin' && unread > 0 ? unread : null
          return (
            <Link
              key={link.href}
              href={link.href}
              aria-current={active ? 'page' : undefined}
              className={`flex min-h-[44px] shrink-0 items-center justify-between gap-2 whitespace-nowrap border-b-2 text-sm transition-colors md:border-b-0 md:border-l-2 md:px-3 ${
                active
                  ? 'border-accent font-semibold text-white'
                  : 'border-transparent text-neutral-light hover:text-white'
              }`}
            >
              <span>{link.label}</span>
              {badge != null && (
                <span className="text-xs font-semibold tabular-nums text-accent">
                  {badge > 99 ? '99+' : badge}
                  <span className="sr-only"> avisos sin leer</span>
                </span>
              )}
            </Link>
          )
        })}
        {/* En el celular, al final de la fila; desde 768 px van abajo, separados */}
        <Link
          href="/"
          className="flex min-h-[44px] shrink-0 items-center whitespace-nowrap border-b-2 border-transparent text-sm text-neutral hover:text-white md:hidden"
        >
          Ver la tienda
        </Link>
        <span className="flex shrink-0 items-center pr-4 md:hidden">
          <LogoutButton />
        </span>
      </nav>
      <div className="mt-6 hidden flex-wrap items-center gap-x-4 gap-y-2 border-t border-dark-300 pt-5 md:flex">
        <LogoutButton />
        <Link href="/" className="text-sm text-neutral-light hover:text-white">
          Ver la tienda
        </Link>
      </div>
    </aside>
  )
}
