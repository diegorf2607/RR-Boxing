import Image from 'next/image'
import Link from 'next/link'

/** Ancho de cada tarjeta: 2 columnas hasta lg; desde lg, 4 columnas dentro de max-w-6xl (~270 px). */
const TAMANO_TARJETA = '(min-width: 1024px) 280px, 50vw'

const socialStats = [
  {
    platform: 'TikTok',
    handle: '@rrboxingperu',
    url: 'https://tiktok.com/@rrboxingperu',
    followers: '250 mil',
    followersLabel: 'Seguidores',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-5.2 1.74 2.89 2.89 0 012.31-4.64 2.93 2.93 0 01.88.13V9.4a6.84 6.84 0 00-1-.05A6.33 6.33 0 005 20.1a6.34 6.34 0 0010.86-4.43v-7a8.16 8.16 0 004.77 1.52v-3.4a4.85 4.85 0 01-1-.1z" />
      </svg>
    ),
    color: 'bg-dark-300',
    image: '/TT.PNG',
  },
  {
    platform: 'Instagram',
    handle: '@rrboxingperu',
    url: 'https://instagram.com/rrboxingperu',
    followers: '50 mil',
    followersLabel: 'Seguidores',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
      </svg>
    ),
    color: 'bg-dark-300',
    image: '/IG.PNG',
  },
  {
    platform: 'Facebook',
    handle: 'RR Boxing Peru',
    url: 'https://www.facebook.com/p/RR-Boxing-Peru-100083217998125/',
    followers: '250 mil',
    followersLabel: 'Seguidores',
    icon: (
      <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
      </svg>
    ),
    color: 'bg-dark-300',
    image: '/FB.PNG',
  },
]

export default function SocialProof() {
  return (
    <section id="comunidad" className="scroll-mt-24 border-t border-dark-300 bg-dark py-12 md:py-16">
      <div className="container mx-auto max-w-6xl px-4">
        <div className="mb-8">
          <h2 className="section-title">
            Unos <span className="text-accent">550 mil</span> seguidores
          </h2>
          <p className="section-subtitle">
            Sumando TikTok, Instagram y Facebook, en números redondos de noviembre de 2026.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 md:gap-6 lg:grid-cols-4">
          {/* Social Cards */}
          {socialStats.map((social, index) => (
            <Link 
              key={index} 
              href={social.url}
              target="_blank"
              rel="noopener noreferrer"
              className="card overflow-hidden p-0"
            >
              {/* Captura del perfil con los seguidores. Los PNG pesan ~2,4 MB cada uno: next/image baja una versión
                  del ancho de la tarjeta y solo cuando la sección se acerca a la pantalla. */}
              <div className="relative h-48 sm:h-64 md:h-80 lg:h-96">
                <Image
                  src={social.image}
                  alt={`Perfil de RR Boxing en ${social.platform}`}
                  fill
                  sizes={TAMANO_TARJETA}
                  className="object-cover object-top"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-100 via-transparent to-transparent"></div>
              </div>

              {/* Card Content */}
              <div className="p-3 md:p-4">
                {/* La red y la cuenta, como texto (sin píldora) */}
                <p className="mb-1 flex items-center gap-2 text-sm font-medium text-white md:text-base">
                  <span className="h-5 w-5 flex-shrink-0 text-neutral-light">{social.icon}</span>
                  <span className="min-w-0 truncate">{social.handle}</span>
                </p>
                {/* Follower count */}
                <div className="hidden md:block">
                  <p className="text-2xl lg:text-3xl font-bold text-white">{social.followers}</p>
                  <p className="text-sm text-neutral">{social.followersLabel}</p>
                </div>
              </div>
            </Link>
          ))}

          {/* Instructor Card */}
          <div className="card overflow-hidden p-0">
            {/* Card Image */}
            <div className="relative h-48 sm:h-64 md:h-80 lg:h-96">
              <Image
                src="/Richard.jpeg"
                alt="Richard Rodríguez, entrenador de RR Boxing"
                fill
                className="object-cover object-center"
                sizes={TAMANO_TARJETA}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-dark-100 via-transparent to-transparent" />
            </div>

            {/* Card Content */}
            <div className="p-2 md:p-4">
              <h3 className="text-sm md:text-xl font-bold text-white mb-0.5">Richard Rodríguez</h3>
              <p className="text-accent text-xs md:text-sm font-medium mb-1 md:mb-3">
                Entrenador de RR Boxing
              </p>
              <p className="hidden md:block text-sm text-neutral">
                Es el profe de las clases 1 a 1.
              </p>
            </div>
          </div>
        </div>

      </div>
    </section>
  )
}
