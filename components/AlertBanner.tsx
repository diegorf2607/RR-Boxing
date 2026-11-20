'use client'

import { useEffect, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { X } from 'lucide-react'
import { claseVigente } from '@/shared/lib/clase-virtual'
import { COMBO_MIN_UNITS } from '@/shared/lib/combo-promo'
import { WHATSAPP_LEGIBLE, enlaceWhatsapp } from '@/shared/lib/whatsapp'

/** El aviso de la clase lleva este id: al hidratar, si está en el HTML del servidor, se queda (ver vigenciaInicial). */
const ID_AVISO_CLASE = 'aviso-clase-virtual'
/** Desde este ancho los avisos caben en una línea y se ven todos juntos; debajo se ve uno y van rotando. */
const ANCHO_EN_LINEA = '(min-width: 1360px)'
const SEGUNDOS_POR_AVISO = 5

const WHATSAPP_PEDIDOS = enlaceWhatsapp('Hola, RR Boxing. Quiero información.')

/**
 * Las páginas se generan de antemano, así que el servidor decide con la hora en que se armó la página.
 * Al hidratar, el navegador parte de lo mismo que pintó el servidor (si el aviso de la clase está en el HTML,
 * se queda) para no dar error de hidratación; después el efecto vuelve a mirar la hora y lo quita si la
 * clase ya terminó.
 */
function vigenciaInicial(): boolean {
  if (typeof document === 'undefined') return claseVigente()
  if (document.getElementById(ID_AVISO_CLASE)) return true
  return claseVigente()
}

// El foco va por dentro del enlace (la franja está pegada al borde de arriba y un contorno por fuera se cortaría)
const claseEnlace =
  'inline-flex min-h-[44px] items-center px-0.5 transition-colors hover:text-white focus-visible:outline-offset-[-2px] motion-reduce:transition-none'

/**
 * La franja de avisos de la maqueta de la línea A: gris oscuro, letra chica, un dato por aviso (la clase virtual
 * mientras esté vigente, el 10% del combo, el envío estándar gratis y el WhatsApp). En pantallas anchas se ven todos
 * en una línea, separados por líneas finas. En las angostas se ve uno y cambian solos cada 5 segundos, salvo con
 * «menos movimiento» del sistema, con el puntero encima o con el foco adentro (el aviso con foco es el que se ve);
 * ahí la «×» los cierra. El lector de pantalla los lee todos.
 */
export default function AlertBanner() {
  const [vigente, setVigente] = useState(vigenciaInicial)
  const [cerrada, setCerrada] = useState(false)
  const [activo, setActivo] = useState(0)
  const [enPausa, setEnPausa] = useState(false)

  useEffect(() => {
    if (!claseVigente()) setVigente(false)
  }, [])

  const avisos: { id: string; contenido: ReactNode }[] = [
    ...(vigente
      ? [
          {
            id: 'clase',
            contenido: (
              <Link href="/clase" id={ID_AVISO_CLASE} className={claseEnlace}>
                <span>
                  <span className="sm:hidden">
                    <b className="font-semibold text-white">Clase virtual gratis:</b> sáb 28 nov, 9 a. m. ·{' '}
                  </span>
                  <span className="hidden sm:inline">
                    <b className="font-semibold text-white">Clase virtual gratis:</b> sábado 28 de noviembre, 9 a. m.
                    (hora Perú) ·{' '}
                  </span>
                  <span className="font-semibold text-white underline underline-offset-2">Inscríbete</span>
                </span>
              </Link>
            ),
          },
        ]
      : []),
    {
      id: 'combo',
      contenido: (
        <span>
          <b className="font-semibold text-white">10% de descuento</b> llevando {COMBO_MIN_UNITS} o más unidades
        </span>
      ),
    },
    {
      id: 'envio',
      contenido: (
        <span>
          <b className="font-semibold text-white">Envío estándar gratis</b> dentro del Perú
        </span>
      ),
    },
    {
      id: 'whatsapp',
      contenido: (
        <a href={WHATSAPP_PEDIDOS} target="_blank" rel="noopener noreferrer" className={claseEnlace}>
          <span>
            Pide por WhatsApp: <b className="font-semibold text-white">{WHATSAPP_LEGIBLE}</b>
          </span>
        </a>
      ),
    },
  ]
  const total = avisos.length
  const visible = activo < total ? activo : 0

  // La rotación: solo en pantallas angostas, sin «menos movimiento» y mientras nadie la esté mirando de cerca.
  useEffect(() => {
    if (cerrada || enPausa || total < 2) return
    const enLinea = window.matchMedia(ANCHO_EN_LINEA)
    const quieto = window.matchMedia('(prefers-reduced-motion: reduce)')
    let reloj: ReturnType<typeof setInterval> | undefined
    const programar = () => {
      if (reloj) clearInterval(reloj)
      reloj = undefined
      if (enLinea.matches || quieto.matches) return
      reloj = setInterval(() => setActivo((i) => (i + 1) % total), SEGUNDOS_POR_AVISO * 1000)
    }
    programar()
    enLinea.addEventListener('change', programar)
    quieto.addEventListener('change', programar)
    return () => {
      if (reloj) clearInterval(reloj)
      enLinea.removeEventListener('change', programar)
      quieto.removeEventListener('change', programar)
    }
  }, [cerrada, enPausa, total])

  if (cerrada) return null

  return (
    <div className="relative z-50 border-b border-dark-300 bg-dark-100 text-[13px] leading-snug text-neutral-light min-[1360px]:text-[13.5px]">
      <ul
        aria-label="Avisos"
        className="grid min-h-[44px] items-center px-11 text-center min-[1360px]:flex min-[1360px]:justify-center min-[1360px]:px-4"
        onMouseEnter={() => setEnPausa(true)}
        onMouseLeave={() => setEnPausa(false)}
      >
        {avisos.map((aviso, i) => (
          <li
            key={aviso.id}
            onFocus={() => {
              setActivo(i)
              setEnPausa(true)
            }}
            onBlur={() => setEnPausa(false)}
            className={`flex min-h-[44px] items-center justify-center [grid-area:1_/_1] transition-opacity duration-300 motion-reduce:transition-none min-[1360px]:whitespace-nowrap min-[1360px]:px-[18px] min-[1360px]:opacity-100 min-[1360px]:[grid-area:auto] min-[1360px]:[pointer-events:auto] ${
              i > 0 ? 'min-[1360px]:border-l min-[1360px]:border-dark-400' : ''
            } ${i === visible ? 'opacity-100' : 'pointer-events-none opacity-0'}`}
          >
            {aviso.contenido}
          </li>
        ))}
      </ul>
      {/* En las pantallas angostas los avisos se mueven solos: la «×» los cierra (44 × 44 px para el dedo). */}
      <button
        type="button"
        onClick={() => setCerrada(true)}
        className="absolute inset-y-0 right-0 flex w-11 items-center justify-center text-neutral transition-colors hover:text-white focus-visible:outline-offset-[-4px] motion-reduce:transition-none min-[1360px]:hidden"
        aria-label="Cerrar avisos"
      >
        <X className="h-4 w-4" aria-hidden />
      </button>
    </div>
  )
}
