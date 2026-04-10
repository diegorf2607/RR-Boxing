'use client'

import { useState } from 'react'

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
      setError('Credenciales invalidas')
      return
    }
    window.location.href = '/account'
  }

  return (
    <form onSubmit={onSubmit} className="card space-y-4">
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        type="email"
        required
        placeholder="Correo"
        className="w-full rounded-lg border border-dark-300 bg-dark px-3 py-2"
      />
      <input
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        type="password"
        required
        placeholder="Contrasena"
        className="w-full rounded-lg border border-dark-300 bg-dark px-3 py-2"
      />
      {error && <p className="text-sm text-red-400">{error}</p>}
      <button className="w-full rounded-lg bg-accent px-4 py-2 font-bold text-dark">Entrar</button>
    </form>
  )
}
