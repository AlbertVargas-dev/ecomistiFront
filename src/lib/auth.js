/**
 * Sesiones múltiples por rol (admin / usuario / recolector en el mismo navegador).
 * Cada perfil guarda su propio access+refresh; la activa se elige en el Layout.
 */
const CLAVE = 'ecomisti_sessions'
const ACTIVA = 'ecomisti_active_role'

function leerTodo() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE) || '{}')
  } catch {
    return {}
  }
}

export function guardarSesion(data) {
  const sesiones = leerTodo()
  const rol = data.user.rol
  sesiones[rol] = {
    accessToken: data.accessToken,
    refreshToken: data.refreshToken,
    user: data.user,
  }
  localStorage.setItem(CLAVE, JSON.stringify(sesiones))
  localStorage.setItem(ACTIVA, rol)
}

export function leerSesion() {
  const sesiones = leerTodo()
  const rol = localStorage.getItem(ACTIVA)
  const sesion = rol ? sesiones[rol] : null
  return {
    accessToken: sesion?.accessToken ?? null,
    user: sesion?.user ?? null,
    rol: sesion ? rol : null,
  }
}

export function sesionesDisponibles() {
  return Object.keys(leerTodo())
}

export function activarSesion(rol) {
  localStorage.setItem(ACTIVA, rol)
}

export function limpiarSesion() {
  const rol = localStorage.getItem(ACTIVA)
  if (!rol) return
  const sesiones = leerTodo()
  delete sesiones[rol]
  localStorage.setItem(CLAVE, JSON.stringify(sesiones))
  const restantes = Object.keys(sesiones)
  if (restantes.length > 0) localStorage.setItem(ACTIVA, restantes[0])
  else localStorage.removeItem(ACTIVA)
}

export function limpiarTodo() {
  localStorage.removeItem(CLAVE)
  localStorage.removeItem(ACTIVA)
}
