import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext.jsx'
import { mensajeError } from '../../lib/api.js'

/**
 * Login con dos modos (spec §4):
 * - Usuario (ciudadano/urbanización/admin/rentas): email + contraseña
 * - Recolector: DNI + PIN de 6 dígitos (sin email)
 */
export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [modo, setModo] = useState('usuario') // 'usuario' | 'recolector'
  const [form, setForm] = useState({
    email: '',
    password: '',
    dni: '',
    pin: '',
  })
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setCargando(true)
    try {
      const credenciales =
        modo === 'recolector'
          ? { dni: form.dni, pin: form.pin }
          : { email: form.email, password: form.password }
      const user = await login(credenciales)
      // Destino según rol: admin → Panel General, recolector → escáner, resto → Mi Panel
      navigate(
        user.rol === 'ADMIN'
          ? '/'
          : user.rol === 'RECOLECTOR'
            ? '/recolector'
            : '/panel',
      )
    } catch (err) {
      setError(mensajeError(err))
    } finally {
      setCargando(false)
    }
  }

  const tab = (valor, label) => (
    <button
      key={valor}
      type="button"
      onClick={() => {
        setModo(valor)
        setError('')
      }}
      className={`flex-1 rounded-lg py-2 text-sm font-semibold transition ${
        modo === valor
          ? 'bg-emerald-600 text-white'
          : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
      }`}
    >
      {label}
    </button>
  )

  return (
    <div className="flex min-h-screen items-center justify-center bg-emerald-50 px-4">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-sm rounded-2xl bg-white p-8 shadow-xl"
      >
        <div className="mb-6 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-2xl text-white">
            ♻
          </span>
          <h1 className="mt-3 text-xl font-bold text-gray-800">EcoMisti</h1>
          <p className="text-sm text-gray-500">Inicia sesión en tu cuenta</p>
        </div>

        <div className="mb-6 flex gap-2">
          {tab('usuario', 'Ciudadano / Admin')}
          {tab('recolector', 'Recolector')}
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        {modo === 'usuario' ? (
          <>
            <label className="mb-3 block text-sm font-medium text-gray-700">
              Correo electrónico
              <input
                type="email"
                required
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:border-emerald-500"
                placeholder="usuario@correo.pe"
              />
            </label>
            <label className="mb-5 block text-sm font-medium text-gray-700">
              Contraseña
              <input
                type="password"
                required
                value={form.password}
                onChange={(e) =>
                  setForm({ ...form, password: e.target.value })
                }
                className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:border-emerald-500"
                placeholder="••••••••"
              />
            </label>
          </>
        ) : (
          <>
            <label className="mb-3 block text-sm font-medium text-gray-700">
              DNI
              <input
                type="text"
                inputMode="numeric"
                required
                pattern="\d{8}"
                title="El DNI debe tener 8 dígitos"
                value={form.dni}
                onChange={(e) => setForm({ ...form, dni: e.target.value })}
                className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:border-emerald-500"
                placeholder="72882624"
              />
            </label>
            <label className="mb-5 block text-sm font-medium text-gray-700">
              PIN (6 dígitos)
              <input
                type="password"
                inputMode="numeric"
                required
                pattern="\d{6}"
                title="El PIN debe tener 6 dígitos"
                value={form.pin}
                onChange={(e) => setForm({ ...form, pin: e.target.value })}
                className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:border-emerald-500"
                placeholder="••••••"
              />
            </label>
          </>
        )}

        <button
          type="submit"
          disabled={cargando}
          className="w-full rounded-lg bg-emerald-600 py-2.5 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {cargando ? 'Ingresando…' : 'Ingresar'}
        </button>

        {modo === 'usuario' && (
          <p className="mt-4 text-center text-sm text-gray-500">
            ¿No tienes cuenta?{' '}
            <a href="/registro-ciudadano" className="text-emerald-600 font-medium">
              Ciudadano
            </a>{' '}
            ·{' '}
            <a href="/registro-urbanizacion" className="text-emerald-600 font-medium">
              Urbanización
            </a>
          </p>
        )}
        {modo === 'recolector' && (
          <p className="mt-4 text-center text-sm text-gray-500">
            Los recolectores los crea el administrador con tu DNI y PIN inicial.
          </p>
        )}
      </form>
    </div>
  )
}
