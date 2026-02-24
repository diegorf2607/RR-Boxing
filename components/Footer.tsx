import Link from 'next/link'
import Image from 'next/image'

export default function Footer() {
  return (
    <footer className="bg-dark-100 border-t border-dark-300 py-6 md:py-12">
      <div className="container mx-auto px-4">
        {/* Mobile: Simple compact footer */}
        <div className="md:hidden">
          <div className="flex items-center justify-between mb-4">
            <Image
              src="/rr-boxing-logo.png"
              alt="RR Boxing"
              width={36}
              height={36}
              className="w-9 h-9"
            />
            {/* Social Icons */}
            <div className="flex gap-2">
              <Link href="https://instagram.com/rrboxingperu" target="_blank" className="w-8 h-8 bg-dark-300 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                </svg>
              </Link>
              <Link href="https://facebook.com/rrboxingperu" target="_blank" className="w-8 h-8 bg-dark-300 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
              </Link>
              <Link href="https://tiktok.com/@rrboxingperu" target="_blank" className="w-8 h-8 bg-dark-300 rounded-full flex items-center justify-center">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                </svg>
              </Link>
            </div>
          </div>
          {/* Links in row */}
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-neutral mb-3">
            <Link href="#pricing" className="hover:text-accent">Precio</Link>
            <Link href="/terminos" className="hover:text-accent">Términos</Link>
            <Link href="/privacidad" className="hover:text-accent">Privacidad</Link>
            <Link href="/reembolso" className="hover:text-accent">Reembolso</Link>
          </div>
          <p className="text-center text-neutral text-xs">
            © 2025 RR Boxing Academy
          </p>
        </div>

        {/* Desktop: Full footer */}
        <div className="hidden md:block">
          <div className="grid grid-cols-4 gap-8 mb-8">
            {/* Logo & Tagline */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Image
                  src="/rr-boxing-logo.png"
                  alt="RR Boxing"
                  width={40}
                  height={40}
                  className="w-10 h-10"
                />
              </div>
              <p className="text-neutral text-sm mb-4">
                Aprende boxeo desde cero en solo 7 días. Sin gimnasio, sin experiencia previa. Solo motivación.
              </p>
              <div className="flex gap-3">
                <Link href="https://instagram.com/rrboxingperu" target="_blank" className="w-9 h-9 bg-dark-300 hover:bg-accent hover:text-dark rounded-full flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                  </svg>
                </Link>
                <Link href="https://facebook.com/rrboxingperu" target="_blank" className="w-9 h-9 bg-dark-300 hover:bg-accent hover:text-dark rounded-full flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                  </svg>
                </Link>
                <Link href="https://tiktok.com/@rrboxingperu" target="_blank" className="w-9 h-9 bg-dark-300 hover:bg-accent hover:text-dark rounded-full flex items-center justify-center transition-colors">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
                  </svg>
                </Link>
              </div>
            </div>

            <div></div>

            {/* Curso Links */}
            <div>
              <h4 className="font-bold text-white mb-4">Curso</h4>
              <ul className="space-y-2">
                <li><Link href="#video" className="text-neutral hover:text-accent transition-colors text-sm">Programa</Link></li>
                <li><Link href="#social" className="text-neutral hover:text-accent transition-colors text-sm">Instructor</Link></li>
                <li><Link href="#pricing" className="text-neutral hover:text-accent transition-colors text-sm">Precio</Link></li>
                <li><Link href="#testimonials" className="text-neutral hover:text-accent transition-colors text-sm">Testimonios</Link></li>
              </ul>
            </div>

            {/* Legal Links */}
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2">
                <li><Link href="/terminos" className="text-neutral hover:text-accent transition-colors text-sm">Términos y Condiciones</Link></li>
                <li><Link href="/privacidad" className="text-neutral hover:text-accent transition-colors text-sm">Política de Privacidad</Link></li>
                <li><Link href="/reembolso" className="text-neutral hover:text-accent transition-colors text-sm">Política de Reembolso</Link></li>
              </ul>
            </div>
          </div>

          {/* Copyright */}
          <div className="border-t border-dark-300 pt-8">
            <p className="text-center text-neutral text-sm">
              © 2025 RR Boxing Academy. Todos los derechos reservados.
            </p>
          </div>
        </div>
      </div>
    </footer>
  )
}
