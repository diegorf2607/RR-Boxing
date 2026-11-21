/**
 * Los seguidores, en una banda gris: la cifra grande, la red y la cuenta. Cada uno abre el perfil.
 * Las cifras son números redondos de noviembre de 2026 (las mismas que ya mostraba la tienda).
 */
const REDES = [
  { red: 'TikTok', cuenta: '@rrboxingperu', url: 'https://tiktok.com/@rrboxingperu', seguidores: '250 mil' },
  { red: 'Instagram', cuenta: '@rrboxingperu', url: 'https://instagram.com/rrboxingperu', seguidores: '50 mil' },
  {
    red: 'Facebook',
    cuenta: 'RR Boxing Peru',
    url: 'https://www.facebook.com/p/RR-Boxing-Peru-100083217998125/',
    seguidores: '250 mil',
  },
]

export default function SocialProof() {
  return (
    <section id="comunidad" aria-labelledby="comunidad-titulo" className="scroll-mt-20 bg-gris py-10 md:scroll-mt-24 md:py-14">
      <h2 id="comunidad-titulo" className="sr-only">
        Seguidores de RR Boxing
      </h2>
      <div className="contenedor">
        <ul className="grid grid-cols-3 gap-3 md:gap-6">
          {REDES.map((r) => (
            <li key={r.red}>
              <a href={r.url} target="_blank" rel="noopener noreferrer" className="group block min-h-[44px]">
                <span className="block font-heading text-[38px] leading-[0.9] min-[381px]:text-[44px] md:text-[88px]">
                  {r.seguidores}
                </span>
                <span className="mt-1 block text-sm font-semibold decoration-1 underline-offset-[3px] group-hover:underline md:text-[17px]">
                  en {r.red}
                </span>
                <span className="block break-words text-sm font-medium text-suave">{r.cuenta}</span>
              </a>
            </li>
          ))}
        </ul>
        <p className="mt-6 border-t border-[#D4D4D4] pt-4 text-sm font-medium text-suave">
          Seguidores en números redondos, noviembre de 2026.
        </p>
      </div>
    </section>
  )
}
