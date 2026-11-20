'use client'

import { useEffect } from 'react'
import { registrarOrigen } from '@/shared/lib/origen'

/**
 * Guarda en el navegador de dónde llegó la persona la primera vez (utm o el sitio que la trajo), sin cookies.
 * Va una sola vez en AppProviders; el pedido y la inscripción a la clase lo mandan con leerOrigen().
 */
export default function RegistrarOrigen() {
  useEffect(() => {
    registrarOrigen()
  }, [])
  return null
}
