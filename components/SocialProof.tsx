/**
 * Los seguidores de RR Boxing, en una línea debajo de los botones de la portada (components/StoreHero.tsx), como en la
 * maqueta de la línea A. Números redondos del conteo de noviembre de 2026: si cambian, se cambian aquí. Las cuentas
 * enlazadas están en el pie (components/Footer.tsx).
 */
const SEGUIDORES: { red: string; cantidad: string }[] = [
  { red: 'TikTok', cantidad: '250 mil' },
  { red: 'Instagram', cantidad: '50 mil' },
  { red: 'Facebook', cantidad: '250 mil' },
]

export default function SocialProof() {
  return (
    <p className="mt-7 flex flex-wrap gap-y-1.5 text-sm text-neutral">
      {SEGUIDORES.map((s) => (
        <span key={s.red} className="mr-3.5 border-r border-dark-400 pr-3.5 last-of-type:mr-0 last-of-type:border-r-0 last-of-type:pr-0">
          <b className="font-[650] text-white">{s.cantidad}</b> en {s.red}
        </span>
      ))}
      <small className="basis-full text-[12.5px]">Seguidores en números redondos, conteo de noviembre de 2026.</small>
    </p>
  )
}
