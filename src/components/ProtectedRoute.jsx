import { Navigate } from 'react-router-dom'
import { leerSesion } from '../lib/auth.js'

/** Protege rutas: exige sesión y, si se pasa `roles`, que el rol coincida. */
export default function ProtectedRoute({ children, roles }) {
  const { accessToken, user } = leerSesion()
  if (!accessToken || !user) return <Navigate to="/login" replace />
  if (roles && !roles.includes(user.rol)) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="rounded-xl bg-white px-6 py-4 text-gray-700 shadow">
          Acceso denegado para tu rol ({user.rol}).
        </p>
      </div>
    )
  }
  return children
}
