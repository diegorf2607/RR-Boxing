import type { Config } from 'tailwindcss'

/**
 * Línea visual A, «Oscuro sobrio» (la maqueta de RR\rrboxing-tienda-auditoria\opciones-visuales\opcion-a.html).
 * Los colores conservan los nombres que ya usaba el código (dark, accent, neutral) para que todo el sitio cambie de
 * una vez; dos cambiaron de sentido (ver los comentarios de accent.dark y dark.300). Los mismos valores están como
 * variables CSS en app/globals.css (--bg, --line, --ac…).
 */
const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './features/**/*.{js,ts,jsx,tsx,mdx}',
    './shared/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // El único acento: el amarillo del logo. El texto encima va en text-dark (#0B0B0B).
        accent: {
          DEFAULT: '#FFD60A',
          // Ojo: «dark» ahora es el amarillo del hover, MÁS CLARO que el acento (antes era uno más oscuro). Todo el
          // código lo usa como hover:bg-accent-dark, así que el hover queda como en la maqueta sin tocar las páginas.
          dark: '#FFE14D',
          light: '#FFE14D',
          hover: '#FFE14D',
        },
        // Fondos y líneas. dark = fondo de la página; 100 = cajas y tarjetas; 200 = un gris más arriba (hover, campos
        // sobre cajas); 300 = la línea fina de toda caja (antes era un gris de relleno: sigue sirviendo de fondo de
        // íconos, pero su uso principal es border-dark-300); 400 = la línea más marcada (bordes de botones y campos).
        dark: {
          DEFAULT: '#0B0B0B',
          100: '#131313',
          200: '#1A1A1A',
          300: '#272727',
          400: '#3A3A3A',
        },
        // Textos secundarios. light = texto de apoyo (párrafos); DEFAULT = etiquetas, notas y datos chicos.
        // dark = igual que DEFAULT: se usa en placeholders y en el borde del hover, y en esos dos casos la maqueta usa
        // este gris (con uno más oscuro los placeholders no llegarían a AA).
        neutral: {
          DEFAULT: '#8C8C88',
          light: '#B9B9B5',
          dark: '#8C8C88',
        },
        // Alias con nombre claro para código nuevo: border-line = border-dark-300; border-line-2 = border-dark-400.
        line: {
          DEFAULT: '#272727',
          2: '#3A3A3A',
        },
        // Fondo claro de las fotos de producto (con mix-blend-multiply el blanco de la foto se funde con él).
        tile: '#ECECEA',
      },
      // El texto «blanco» de la maqueta es un blanco roto. Solo cambia text-white; bg-white sigue siendo blanco puro
      // (las fotos de producto tienen fondo blanco y no deben verse como un recuadro).
      textColor: {
        white: '#F4F4F2',
      },
      // Bordes de la maqueta: 16 px cajas (rounded-2xl), 12 px fotos chicas (rounded-xl), 10 px botones y campos.
      borderRadius: {
        lg: '10px',
      },
      fontFamily: {
        // Una sola letra: Archivo (variable, con ancho). La carga next/font en app/layout.tsx y deja --font-archivo.
        // font-heading es la misma letra: lo angosto, el peso y el interlineado de los titulares los pone
        // .font-heading en globals.css.
        sans: ['var(--font-archivo)', 'Helvetica Neue', 'Arial', 'sans-serif'],
        heading: ['var(--font-archivo)', 'Helvetica Neue', 'Arial', 'sans-serif'],
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'bounce-slow': 'bounce 2s infinite',
      },
    },
  },
  plugins: [],
}
export default config
