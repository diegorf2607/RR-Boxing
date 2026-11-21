'use client'

import { useState } from 'react'
import { AlertCircle } from 'lucide-react'

// Campos rectos de 52 px con línea gris, como en /checkout; el foco es el contorno negro del sitio (globals.css)
const campo =
  'mt-2 block min-h-[52px] w-full border border-linea-fuerte bg-white px-4 py-3 text-base font-normal text-tinta hover:border-tinta focus:border-tinta'

export default function LoginForm() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault()
    setError('')
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    })
    if (!res.ok) {
      setError('Correo o contraseña incorrectos')
      return
    }
    const data = (await res.json()) as { role?: string }
    window.location.href = data.role === 'admin' ? '/admin' : '/'
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <label className="block text-[15px] font-semibold">
        Correo
        <input
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          type="email"
          required
          autoComplete="username"
          className={campo}
        />
      </label>
      <label className="block text-[15px] font-semibold">
        Contraseña
        <input
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          type="password"
          required
          autoComplete="current-password"
          className={campo}
        />
      </label>
      {error && (
        <p role="alert" className="flex items-start gap-1.5 text-sm font-semibold">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          {error}
        </p>
      )}
      <button className="btn-primary">Entrar</button>
    </form>
  )
}
