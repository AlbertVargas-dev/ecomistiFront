import { createContext, useContext } from 'react'

export const AuthContext = createContext(null)

/** Devuelve el contexto de autenticación actual. */
export function useAuth() {
  return useContext(AuthContext)
}
