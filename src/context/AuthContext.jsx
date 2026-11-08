import { createContext, useContext, useEffect, useState } from 'react'
import { api } from '../lib/api.js'
import {
  activarSesion,
  guardarSesion,
  leerSesion,
  limpiarSesion,
  sesionesDisponibles,
} from '../lib/auth.js'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => leerSesion().user)
  const [perfiles, setPerfiles] = useState(() => sesionesDisponibles())

  useEffect(() => {
    const onStorage = () => {
      setUser(leerSesion().user)
      setPerfiles(sesionesDisponibles())
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  async function login(credenciales) {
    const { data } = await api.post('/auth/login', credenciales)
    guardarSesion(data)
    setUser(data.user)
    setPerfiles(sesionesDisponibles())
    return data.user
  }

  /** Cambiar entre sesiones guardadas (admin ↔ usuario ↔ recolector). */
  function cambiarPerfil(rol) {
    activarSesion(rol)
    setUser(leerSesion().user)
  }

  function logout() {
    limpiarSesion()
    setUser(leerSesion().user)
    setPerfiles(sesionesDisponibles())
  }

  /** Re-lee la sesión activa (tras registrar, que guarda directo en storage). */
  function recargarSesion() {
    setUser(leerSesion().user)
    setPerfiles(sesionesDisponibles())
  }

  return (
    <AuthContext.Provider
      value={{ user, perfiles, login, logout, cambiarPerfil, recargarSesion }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
