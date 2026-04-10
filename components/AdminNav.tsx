import Link from 'next/link'

const links = [
  { href: '/admin', label: 'Dashboard' },
  { href: '/admin/products', label: 'Productos' },
  { href: '/admin/orders', label: 'Pedidos' },
  { href: '/admin/settings', label: 'Configuracion' },
]

export default function AdminNav() {
  return (
    <aside className="rounded-2xl border border-dark-300 bg-dark-100 p-4">
      <h2 className="mb-4 text-lg font-bold text-accent">Admin RRBOXING</h2>
      <nav className="space-y-2">
        {links.map((link) => (
          <Link key={link.href} href={link.href} className="block rounded-lg px-3 py-2 text-sm hover:bg-dark-300">
            {link.label}
          </Link>
        ))}
      </nav>
    </aside>
  )
}
