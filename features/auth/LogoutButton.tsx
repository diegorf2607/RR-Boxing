'use client'

export default function LogoutButton() {
  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    window.location.href = '/login'
  }

  return (
    <button onClick={handleLogout} className="rounded-lg border border-dark-300 px-3 py-2 text-sm hover:bg-dark-100">
      Cerrar sesion
    </button>
  )
}
