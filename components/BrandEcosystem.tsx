import Link from 'next/link'

export default function BrandEcosystem() {
  return (
    <section className="bg-dark py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h2 className="section-title">RRBOXING: Marca, Academia y Ecosistema</h2>
          <p className="section-subtitle">
            Entrenamiento real, disciplina y transformacion fisica/mental respaldada por una comunidad activa.
          </p>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          <article className="card">
            <p className="mb-2 text-sm text-neutral-light">Comunidad</p>
            <h3 className="text-3xl font-bold text-accent">+400K</h3>
            <p className="mt-2 text-sm text-neutral-light">Seguidores en redes y alumnos en todo LATAM.</p>
          </article>
          <article className="card">
            <p className="mb-2 text-sm text-neutral-light">Metodo</p>
            <h3 className="text-3xl font-bold">Tecnica + Disciplina</h3>
            <p className="mt-2 text-sm text-neutral-light">Desde cero hasta alto rendimiento con seguimiento real.</p>
          </article>
          <article className="card">
            <p className="mb-2 text-sm text-neutral-light">Conversion principal</p>
            <h3 className="text-3xl font-bold">Clases 1 a 1</h3>
            <Link href="/consulta" className="mt-2 inline-block text-accent underline">
              Quiero clases personalizadas
            </Link>
          </article>
        </div>
      </div>
    </section>
  )
}
