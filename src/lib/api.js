import axios from 'axios'
import { activarSesion, leerSesion, limpiarSesion } from './auth.js'

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
})

api.interceptors.request.use((config) => {
  const { accessToken } = leerSesion()
  if (accessToken) config.headers.Authorization = `Bearer ${accessToken}`
  return config
})

api.interceptors.response.use(
  (res) => res,
  async (error) => {
    const original = error.config
    if (error.response?.status === 401 && !original._retried) {
      original._retried = true
      try {
        const { refreshToken, rol } = leerSesion()
        if (!refreshToken) throw new Error('Sin refresh token')
        const { data } = await axios.post(
          `${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/auth/refresh`,
          { refreshToken },
        )
        // Actualizar solo el perfil activo (los demás quedan intactos).
        const sesiones = JSON.parse(
          localStorage.getItem('ecomisti_sessions') || '{}',
        )
        sesiones[rol] = {
          accessToken: data.accessToken,
          refreshToken: data.refreshToken,
          user: data.user,
        }
        localStorage.setItem('ecomisti_sessions', JSON.stringify(sesiones))
        activarSesion(rol)
        original.headers.Authorization = `Bearer ${data.accessToken}`
        return api(original)
      } catch {
        limpiarSesion()
        if (window.location.pathname !== '/login') {
          window.location.href = '/login'
        }
      }
    }
    return Promise.reject(error)
  },
)

export function mensajeError(error) {
  const m = error?.response?.data?.message
  if (Array.isArray(m)) return m.join(', ')
  return m || error?.message || 'Error de red. ¿Está el backend levantado?'
}

/** Descarga el reporte de recolecciones en CSV o XLSX usando el cliente autenticado. */
export async function exportarReporte(formato) {
  const { data } = await api.get('/admin/reportes/exportar', {
    params: { formato },
    responseType: 'blob',
  })
  const url = URL.createObjectURL(data)
  const a = document.createElement('a')
  a.href = url
  a.download = `reporte-recolecciones.${formato}`
  a.click()
  URL.revokeObjectURL(url)
}
