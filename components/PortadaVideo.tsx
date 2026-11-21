'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { getImageProps } from 'next/image'
import { Pause, Play } from 'lucide-react'

/**
 * La portada: Richard en guardia, mudo y en bucle, con el titular y dos botones.
 *
 * - El video sale de la foto «B» (ChatGPT, con sus caras reales de referencia) animada en Kling 3.0: 8 s que empiezan
 *   y terminan en el mismo cuadro, así el bucle no salta. Fuente en RR\rrboxing-videos-web\chatgpt-richard\animada.
 * - Escritorio (768 px o más): public/video/portada-richard.mp4 (1600×1066, Richard a la izquierda y la pared oscura a
 *   la derecha, donde va el texto). Celular: portada-richard-movil.mp4 (720×1280, recorte vertical). Cada uno con su
 *   póster. Los dos se anclan arriba (object-top) para no cortarle la cabeza.
 * - El póster va siempre debajo, en un <picture> (el navegador baja solo el que le toca). Es lo que se ve antes de
 *   que cargue el video, sin JavaScript, con «Ahorro de datos» y cuando el sistema pide menos movimiento: ahí el
 *   video no se monta.
 * - «Pausar» queda a la vista, arriba a la derecha (lo que se mueve solo más de 5 s necesita cómo detenerlo,
 *   WCAG 2.2.2). Si la persona lo pausa, sigue pausado; fuera de la pantalla se pausa solo y vuelve a andar al
 *   regresar.
 * - El velo deja limpia la cara: en el celular y la tableta parada oscurece de abajo hacia arriba (el texto va abajo,
 *   sobre los guantes blancos). Desde 1024 px, o desde 768 px con la pantalla acostada, el texto pasa al 46 % de la
 *   derecha y el velo oscurece de derecha a izquierda (clases portada-* en app/globals.css).
 * - La altura es mínima, no fija: si el texto no entra (laptops bajas), la sección crece en vez de cortar el titular,
 *   y el texto deja libre arriba el alto de «Pausar».
 * - La maqueta tenía una etiqueta «En la foto: cuerda de salto»: el video no muestra productos de la tienda, así
 *   que no va.
 */

const CELULAR = '(max-width: 767px)'
const MENOS_MOVIMIENTO = '(prefers-reduced-motion: reduce)'

const FUENTES = {
  escritorio: { video: '/video/portada-richard.mp4', poster: '/video/portada-richard.jpg' },
  celular: { video: '/video/portada-richard-movil.mp4', poster: '/video/portada-richard-movil.jpg' },
} as const

type Pantalla = keyof typeof FUENTES

const comunPoster = { alt: '', sizes: '100vw', quality: 70, priority: true } as const
const posterEscritorio = getImageProps({ ...comunPoster, src: FUENTES.escritorio.poster, width: 1600, height: 1066 }).props
const posterCelular = getImageProps({ ...comunPoster, src: FUENTES.celular.poster, width: 720, height: 1280 }).props

/** «Ahorro de datos» del navegador (solo algunos lo informan). */
function ahorraDatos(): boolean {
  const conexion = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection
  return Boolean(conexion?.saveData)
}

export default function PortadaVideo() {
  // null: todavía no se sabe (servidor y primer render) o no va video. Así el HTML del servidor es solo el póster.
  const [pantalla, setPantalla] = useState<Pantalla | null>(null)
  const [reproduciendo, setReproduciendo] = useState(false)
  // La persona tocó «Pausar»: no vuelve a andar solo (ni al cambiar de tamaño ni al volver a la pantalla)
  const detenido = useRef(false)
  const visible = useRef(true)
  const videoRef = useRef<HTMLVideoElement | null>(null)
  const seccionRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const celular = window.matchMedia(CELULAR)
    const menosMovimiento = window.matchMedia(MENOS_MOVIMIENTO)
    const sinVideo = ahorraDatos()
    const leer = () => {
      if (sinVideo || menosMovimiento.matches) setPantalla(null)
      else setPantalla(celular.matches ? 'celular' : 'escritorio')
    }
    leer()
    celular.addEventListener('change', leer)
    menosMovimiento.addEventListener('change', leer)
    return () => {
      celular.removeEventListener('change', leer)
      menosMovimiento.removeEventListener('change', leer)
    }
  }, [])

  const intentarReproducir = useCallback(() => {
    const video = videoRef.current
    if (!video || detenido.current || !visible.current) return
    video.muted = true
    // Si el navegador no deja reproducir solo (modo de bajo consumo, por ejemplo), queda el póster y el botón
    // pasa a «Reproducir».
    video.play().catch(() => setReproduciendo(false))
  }, [])

  // Fuera de la pantalla se pausa (no gasta batería ni datos); al volver, sigue si la persona no lo pausó
  useEffect(() => {
    const seccion = seccionRef.current
    if (!seccion || !pantalla || !('IntersectionObserver' in window)) return
    const observador = new IntersectionObserver(([entrada]) => {
      visible.current = entrada.isIntersecting
      if (entrada.isIntersecting) intentarReproducir()
      else videoRef.current?.pause()
    })
    observador.observe(seccion)
    return () => observador.disconnect()
  }, [pantalla, intentarReproducir])

  const alternar = () => {
    const video = videoRef.current
    if (!video) return
    if (reproduciendo) {
      detenido.current = true
      video.pause()
    } else {
      detenido.current = false
      intentarReproducir()
    }
  }

  const fuente = pantalla ? FUENTES[pantalla] : null

  return (
    <section
      ref={seccionRef}
      aria-labelledby="portada-titulo"
      className="relative flex min-h-[620px] items-end overflow-hidden bg-tinta text-white md:min-h-[max(520px,min(80vh,720px))]"
    >
      <picture>
        <source media="(min-width: 768px)" srcSet={posterEscritorio.srcSet} sizes="100vw" />
        <source media={CELULAR} srcSet={posterCelular.srcSet} sizes="100vw" />
        <img
          {...posterCelular}
          alt=""
          className="absolute inset-0 h-full w-full object-cover object-top md:object-[35%_0%] portada-fondo"
        />
      </picture>

      {fuente ? (
        <video
          // Un video por tamaño de pantalla: al pasar de uno a otro, React monta el otro
          key={fuente.video}
          ref={(el) => {
            videoRef.current = el
            if (el) el.muted = true
          }}
          className="absolute inset-0 h-full w-full object-cover object-top md:object-[35%_0%] portada-fondo"
          // Sin póster propio: hasta el primer cuadro se ve el <picture> de abajo (no se baja la imagen dos veces)
          src={fuente.video}
          autoPlay={!detenido.current}
          muted
          loop
          playsInline
          preload="auto"
          aria-hidden="true"
          tabIndex={-1}
          disablePictureInPicture
          onPlay={() => setReproduciendo(true)}
          onPause={() => setReproduciendo(false)}
          onCanPlay={intentarReproducir}
        />
      ) : null}

      <div
        aria-hidden
        className="portada-velo absolute inset-0 bg-gradient-to-t from-black/90 via-black/50 via-55% to-black/5"
      />

      <div className="contenedor portada-texto relative pb-6 pt-[72px] md:pb-14 md:pt-[92px]">
        <div className="portada-columna">
          <h1 id="portada-titulo" className="titulo-portada portada-titulo">
            Entrena
            <br />a tu ritmo.
          </h1>
          <p className="mb-5 mt-3.5 max-w-[520px] text-[17px] leading-normal text-[#EFEFEF] md:mb-[30px] md:mt-5 md:text-xl">
            Guantes, vendas y cuerda para entrenar boxeo en casa y cuidar tu salud. Sin experiencia, sin pelear.
          </p>
          {/* data-ocultar-whatsapp: en el celular el WhatsApp flotante se esconde mientras estos botones estén a la vista */}
          <div className="flex flex-wrap gap-3" data-ocultar-whatsapp>
            <a href="#catalogo" className="btn-primary md:inline-flex md:w-auto">
              Ver la tienda
            </a>
            <Link href="/product/guantes-boxeo-woesad" className="btn-secondary text-white md:inline-flex md:w-auto">
              Comprar guantes
            </Link>
          </div>
        </div>
      </div>

      {fuente ? (
        // Arriba a la derecha: abajo están los botones (en el celular) y el WhatsApp flotante (en escritorio)
        <div className="pointer-events-none absolute inset-x-0 top-3 md:top-6">
          <div className="contenedor flex justify-end">
            <button
              type="button"
              onClick={alternar}
              aria-label={reproduciendo ? 'Pausar el video de fondo' : 'Reproducir el video de fondo'}
              className="pointer-events-auto flex h-11 min-w-[44px] items-center justify-center gap-2 border border-white/70 bg-black/50 px-3 text-sm font-semibold text-white transition-colors hover:bg-black/80"
            >
              {reproduciendo ? (
                <Pause className="h-4 w-4" strokeWidth={2.2} aria-hidden />
              ) : (
                <Play className="h-4 w-4" strokeWidth={2.2} aria-hidden />
              )}
              <span aria-hidden>{reproduciendo ? 'Pausar' : 'Reproducir'}</span>
            </button>
          </div>
        </div>
      ) : null}
    </section>
  )
}
