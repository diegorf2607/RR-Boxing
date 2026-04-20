'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import LogoutButton from '@/features/auth/LogoutButton'

const links = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/products', label: 'Productos' },
  { href: '/admin/orders', label: 'Pedidos' },
  { href: '/admin/settings', label: 'Configuración' },
]

export default function AdminNav() {
  const pathname = usePathname()

  return (
    <aside className="rounded-2xl border border-dark-300/80 bg-dark-100/90 p-5 shadow-lg backdrop-blur-sm">
      <div className="mb-6">
        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-accent">RRBOXING</p>
        <h2 className="font-heading text-xl font-bold tracking-wide text-white">Administración</h2>
      </div>
      <nav className="space-y-1">
        {links.map((link) => {
          const active =
            link.href === '/admin' ? pathname === '/admin' : pathname.startsWith(link.href)
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`block rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${
                active
                  ? 'bg-accent/15 text-accent ring-1 ring-accent/40'
                  : 'text-neutral-light hover:bg-dark-300/60 hover:text-white'
              }`}
            >
              {link.label}
            </Link>
          )
        })}
      </nav>
      <div className="mt-8 border-t border-dark-300 pt-5">
        <LogoutButton />
      </div>
    </aside>
  )
}
