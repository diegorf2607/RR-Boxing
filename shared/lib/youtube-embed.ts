/** Convierte URL de YouTube (watch, youtu.be) en URL de embed. */
export function toYouTubeEmbedUrl(url: string): string | null {
  const trimmed = url.trim()
  if (!trimmed) return null
  if (trimmed.includes('youtube.com/embed/')) return trimmed.split('&')[0]
  try {
    const u = new URL(trimmed)
    if (u.hostname === 'youtu.be') {
      const id = u.pathname.replace(/^\//, '').split('/')[0]
      return id ? `https://www.youtube.com/embed/${id}` : null
    }
    if (u.hostname.includes('youtube.com')) {
      const v = u.searchParams.get('v')
      if (v) return `https://www.youtube.com/embed/${v}`
    }
  } catch {
    return null
  }
  return null
}
