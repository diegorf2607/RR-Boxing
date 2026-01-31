import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        accent: {
          DEFAULT: '#FFD700',
          dark: '#E6C200',
          light: '#FFE44D',
        },
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
        }
      },
      fontFamily: {
        sans: ['var(--font-geist-sans)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-bebas)', 'Impact', 'sans-serif'],
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
