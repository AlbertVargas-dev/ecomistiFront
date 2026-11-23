/**
 * Caché liviana en sessionStorage para respuestas del dashboard.
 * Evita llamar a la API en cada visita al panel (rate-limit 100/min).
 */
const TTL_MS = 30_000

export function leerCache(clave) {
  try {
    const raw = sessionStorage.getItem(`cache:${clave}`)
    if (!raw) return null
    const { valor, expira } = JSON.parse(raw)
    if (Date.now() > expira) {
      sessionStorage.removeItem(`cache:${clave}`)
      return null
    }
    return valor
  } catch {
    return null
  }
}

export function guardarCache(clave, valor) {
  try {
    sessionStorage.setItem(
      `cache:${clave}`,
      JSON.stringify({ valor, expira: Date.now() + TTL_MS }),
    )
  } catch {
    // sessionStorage lleno o no disponible: se ignora
  }
}
