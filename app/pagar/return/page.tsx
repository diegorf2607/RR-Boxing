import Link from 'next/link'

type Props = {
  searchParams: Record<string, string | string[] | undefined>
}

export default function PagarReturnPage({ searchParams }: Props) {
  const raw = searchParams.session_id
  const sessionId = typeof raw === 'string' ? raw : Array.isArray(raw) ? raw[0] : undefined

  return (
    <main className="min-h-screen bg-dark text-white">
      <div className="container mx-auto max-w-lg px-4 py-16 text-center">
        <h1 className="mb-4 font-heading text-3xl font-bold text-accent">Pago recibido</h1>
        <p className="mb-6 text-neutral-light">
          Stripe redirigió aquí tras completar el checkout embebido. En producción puedes verificar la sesión en el
          servidor con la API de Stripe.
        </p>
        {sessionId ? (
          <p className="mb-8 break-all font-mono text-xs text-neutral-400">session_id: {sessionId}</p>
        ) : null}
        <Link href="/" className="inline-block rounded-lg bg-accent px-6 py-3 font-bold text-dark hover:opacity-90">
          Volver al inicio
        </Link>
      </div>
    </main>
  )
}
