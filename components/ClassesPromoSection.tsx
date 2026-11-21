import Image from 'next/image'
import { MENSAJE_CLASES_1A1 } from '@/shared/config/clases'
import { enlaceWhatsapp } from '@/shared/lib/whatsapp'

const WHATSAPP_CLASES = enlaceWhatsapp(MENSAJE_CLASES_1A1)

function IconoWhatsapp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.5 14.4c-.3-.1-1.8-.9-2-1-.3-.1-.5-.1-.7.2-.2.3-.8 1-.9 1.2-.2.2-.3.2-.6.1-.3-.1-1.3-.5-2.4-1.5-.9-.8-1.5-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.4-.5.3-.5c.1-.2 0-.4 0-.5l-.9-2.2c-.2-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.2 5.1 4.5 2.5 1 3 .8 3.6.8.6-.1 1.8-.7 2-1.4.2-.7.2-1.3.2-1.4-.1-.2-.3-.3-.6-.4ZM12 21.8a9.9 9.9 0 0 1-5-1.4l-.4-.2-3.7 1 1-3.6-.2-.4A9.8 9.8 0 1 1 12 21.8Zm8.4-18.3A11.8 11.8 0 0 0 1.7 17.8L0 24l6.3-1.7a11.9 11.9 0 0 0 5.7 1.5 11.9 11.9 0 0 0 8.4-20.3Z" />
    </svg>
  )
}

/**
 * «Clases 1 a 1»: la foto de Richard con manoplas y el pedido de información por WhatsApp, con el mismo mensaje que
 * /consulta (shared/config/clases.ts). Reúne lo que antes estaba en dos secciones («RR Boxing: tienda y clases» y
 * «Clases personalizadas 1 a 1»).
 */
export default function ClassesPromoSection() {
  return (
    <section
      id="clases-1-a-1"
      aria-labelledby="clases-1a1-titulo"
      className="scroll-mt-20 bg-white py-12 md:scroll-mt-24 md:py-[72px]"
    >
      <div className="contenedor grid gap-7 md:grid-cols-2 md:items-center md:gap-14">
        <div className="relative aspect-[5/4] overflow-hidden bg-gris">
          <Image
            src="/Richard.jpeg"
            alt="Richard, el profe de RR Boxing, con manoplas"
            fill
            sizes="(min-width: 1320px) 636px, (min-width: 768px) 50vw, 100vw"
            className="object-cover"
          />
        </div>
        <div>
          <h2 id="clases-1a1-titulo" className="mb-[18px] font-heading text-[64px] leading-[0.9] md:text-[96px]">
            Clases 1 a 1
          </h2>
          <p className="mb-7 max-w-[480px] text-[17px] leading-normal text-tinta-2 md:text-[19px]">
            Un plan a tu medida con Richard, el profe de RR Boxing. Escríbenos y te contamos cómo son, qué horarios hay
            y cuánto cuestan.
          </p>
          <a
            href={WHATSAPP_CLASES}
            target="_blank"
            rel="noopener noreferrer"
            className="btn-negro md:inline-flex md:w-auto"
          >
            <IconoWhatsapp className="h-5 w-5 shrink-0" />
            Pedir información por WhatsApp
          </a>
        </div>
      </div>
    </section>
  )
}
