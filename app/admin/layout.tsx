// El panel conserva el tema oscuro de antes (fondo negro, texto blanco, Inter y Bebas Neue) aunque la tienda sea
// blanca: .tema-oscuro en app/globals.css. Solo envuelve; la sesión la sigue cuidando middleware.ts.
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="tema-oscuro min-h-screen">{children}</div>
}
