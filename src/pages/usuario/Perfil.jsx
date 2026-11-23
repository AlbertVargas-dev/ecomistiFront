import { useEffect, useState } from 'react'
import { api, mensajeError } from '../../lib/api.js'

/** Mi Perfil: actualizar datos personales + cambiar contraseña. */
export default function Perfil() {
  const [form, setForm] = useState({
    nombres: '',
    apellidos: '',
    telefono: '',
  })
  const [passwords, setPasswords] = useState({
    passwordActual: '',
    passwordNueva: '',
  })
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    api
      .get('/usuarios/me')
      .then(({ data }) =>
        setForm({
          nombres: data.nombres ?? '',
          apellidos: data.apellidos ?? '',
          telefono: data.telefono ?? '',
        }),
      )
      .catch((err) => setError(mensajeError(err)))
  }, [])

  async function guardar(e) {
    e.preventDefault()
    setError('')
    setMsg('')
    try {
      await api.patch('/usuarios/me', {
        nombres: form.nombres,
        apellidos: form.apellidos,
        telefono: form.telefono || undefined,
      })
      setMsg('Datos actualizados correctamente.')
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  async function cambiarPassword(e) {
    e.preventDefault()
    setError('')
    setMsg('')
    try {
      const { data } = await api.patch('/usuarios/me/cambiar-password', passwords)
      setMsg(data.message)
      setPasswords({ passwordActual: '', passwordNueva: '' })
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  const input =
    'mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:border-emerald-500'

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Mi Perfil</h1>
      <p className="text-sm text-gray-500">Actualizá tus datos personales</p>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}
      {msg && (
        <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {msg}
        </p>
      )}

      <form
        onSubmit={guardar}
        className="mt-6 grid max-w-lg gap-4 rounded-2xl bg-white p-6 shadow-sm md:grid-cols-2"
      >
        <h2 className="font-semibold text-gray-800 md:col-span-2">Datos personales</h2>
        <label className="text-sm font-medium text-gray-700">
          Nombres
          <input
            value={form.nombres}
            onChange={(e) => setForm({ ...form, nombres: e.target.value })}
            required
            className={input}
          />
        </label>
        <label className="text-sm font-medium text-gray-700">
          Apellidos
          <input
            value={form.apellidos}
            onChange={(e) => setForm({ ...form, apellidos: e.target.value })}
            required
            className={input}
          />
        </label>
        <label className="text-sm font-medium text-gray-700 md:col-span-2">
          Teléfono (9 dígitos)
          <input
            value={form.telefono}
            onChange={(e) => setForm({ ...form, telefono: e.target.value })}
            placeholder="954123456"
            pattern="9\d{8}"
            title="9 dígitos comenzando con 9"
            className={input}
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 md:col-span-2"
        >
          Guardar cambios
        </button>
      </form>

      <form
        onSubmit={cambiarPassword}
        className="mt-6 grid max-w-lg gap-4 rounded-2xl bg-white p-6 shadow-sm"
      >
        <h2 className="font-semibold text-gray-800">Cambiar contraseña</h2>
        <label className="text-sm font-medium text-gray-700">
          Contraseña actual
          <input
            type="password"
            required
            value={passwords.passwordActual}
            onChange={(e) =>
              setPasswords({ ...passwords, passwordActual: e.target.value })
            }
            className={input}
          />
        </label>
        <label className="text-sm font-medium text-gray-700">
          Nueva contraseña (mín. 8, letras y números)
          <input
            type="password"
            required
            minLength={8}
            pattern="^(?=.*[A-Za-z])(?=.*\d).+$"
            title="Mínimo 8 caracteres con letras y números"
            value={passwords.passwordNueva}
            onChange={(e) =>
              setPasswords({ ...passwords, passwordNueva: e.target.value })
            }
            className={input}
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-gray-800 px-4 py-2 font-semibold text-white hover:bg-gray-700"
        >
          Cambiar contraseña
        </button>
      </form>
    </div>
  )
}
