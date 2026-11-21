import type { Config } from 'tailwindcss'

/**
 * Línea «Tienda deportiva»: página blanca con texto negro, menú y pie negros y un solo acento amarillo.
 * Los colores de la tienda nueva son tinta, suave, gris, linea, claro y tenue (más accent). Los dark-* y neutral-*
 * siguen siendo los del tema oscuro: los usa el panel /admin, que conserva su estilo.
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
        // Amarillo de la marca: fondo de botones, etiquetas y la franja del −10%. Nunca como color de texto sobre
        // blanco (no se lee); sobre negro sí.
        accent: {
          DEFAULT: '#FCDD03',
          dark: '#E5C800',
          light: '#FDE84D',
        },
        // Tienda (fondo blanco)
        tinta: {
          DEFAULT: '#0A0A0A', // texto, menú, pie y botón negro
          2: '#333333', // párrafos largos
        },
        suave: '#5A5A5A', // texto secundario sobre blanco o gris (6,9:1 sobre blanco)
        gris: '#F2F2F2', // fondo de las fotos de producto, del aviso y de bandas
        linea: {
          DEFAULT: '#E1E1E1', // líneas finas entre filas
          fuerte: '#C9C9C9', // borde de opciones, cantidad y campos
          oscura: '#2A2A2A', // líneas sobre negro (pie)
        },
        // Sobre negro (menú, pie, banda de la clase)
        claro: '#B5B5B5', // texto secundario sobre negro
        tenue: '#8A8A8A', // texto terciario sobre negro (5,6:1)
        // Tema oscuro del panel /admin (no cambiar su sentido)
        dark: {
          DEFAULT: '#0a0a0a',
          100: '#1a1a1a',
          200: '#2a2a2a',
          300: '#3a3a3a',
          400: '#4a4a4a',
        },
        neutral: {
          DEFAULT: '#9ca3af',
          light: '#d1d5db',
          dark: '#6b7280',
        },
      },
      fontFamily: {
        // Variables que deja next/font en <html> (app/layout.tsx)
        sans: ['var(--font-barlow)', 'system-ui', 'sans-serif'],
        // Titulares: Barlow Condensed 800 itálica. Con .font-heading van además en mayúsculas (globals.css).
        heading: ['var(--font-titulo)', '"Arial Narrow"', 'sans-serif'],
        // Precios y cifras: Barlow Condensed 700 recta, con números del mismo ancho.
        cond: ['var(--font-cifra)', '"Arial Narrow"', 'sans-serif'],
      },
      maxWidth: {
        tienda: '1320px',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'hero-gradient': 'linear-gradient(180deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.9) 100%)',
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
