'use client'

import { useState } from 'react'

/** Los campos, como los del resto de la tienda en la línea A: 50 px de alto, línea marcada y foco amarillo */
const campo =
  'block min-h-[50px] w-full rounded-lg border border-dark-300 bg-dark px-4 py-3 text-base text-white placeholder:text-neutral focus:border-accent focus:outline-none'

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
    <form onSubmit={onSubmit} className="space-y-4 rounded-2xl border border-line bg-dark-100 p-5 md:p-6">
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        required
        placeholder="Correo"
        aria-label="Correo"
        autoComplete="username"
        className={campo}
      />
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        required
        placeholder="Contraseña"
        aria-label="Contraseña"
        autoComplete="current-password"
        className={campo}
      />
      {error && (
        <p role="alert" className="text-sm text-red-400">
          {error}
        </p>
      )}
      <button className="btn-primary">Entrar</button>
    </form>
  )
}
