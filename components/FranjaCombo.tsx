import { COMBO_DISCOUNT_RATE, COMBO_MIN_UNITS } from '@/shared/lib/combo-promo'

const PORCENTAJE = Math.round(COMBO_DISCOUNT_RATE * 100)

/**
 * La franja amarilla del −10%, debajo de la portada. El descuento es el único que hay (shared/lib/combo-promo.ts):
 * 2 o más unidades, aunque sean del mismo producto, y se calcula solo en el carrito. «Ver combos» lleva a los combos
 * de la grilla de la tienda (id="combos", en features/store/StoreClient.tsx).
 * En el celular la franja cae al pie de la primera pantalla, justo donde flota el WhatsApp (56 px a 16 px del borde):
 * por eso deja 84 px libres a la derecha, para que el botón no tape el texto. Hasta 1439 px pasa lo mismo con
 * «Ver combos» al bajar (el botón queda dentro del ancho de la página), así que ahí reserva 80 px.
 */
export default function FranjaCombo() {
  return (
    <div className="bg-accent text-tinta">
      <div className="contenedor flex flex-wrap items-center gap-x-4 gap-y-1 py-4 max-md:pr-[84px] md:min-h-[96px] md:max-[1439px]:pr-20 md:flex-nowrap md:gap-7 md:py-3.5">
        <p className="font-heading text-[52px] leading-[0.9] md:text-[72px]">−{PORCENTAJE}%</p>
        <p className="min-w-0 flex-[1_1_200px] text-base font-medium leading-normal md:max-w-[620px] md:flex-initial md:text-[19px]">
          Llevando {COMBO_MIN_UNITS} o más unidades, aunque sean del mismo producto. Se descuenta solo en el carrito.
        </p>
        <a
          href="#combos"
          className="flex min-h-[44px] items-center whitespace-nowrap font-bold underline decoration-1 underline-offset-4 hover:decoration-2 md:ml-auto"
        >
          Ver combos
        </a>
      </div>
    </div>
  )
}
