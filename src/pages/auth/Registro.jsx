import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api, mensajeError } from '../../lib/api.js'
import { guardarSesion } from '../../lib/auth.js'
import { useAuth } from '../../context/AuthContext.jsx'

/**
 * Registro público (spec §4/§11): el rol lo fija el endpoint, nunca el body.
 * `tipo`: 'ciudadano' | 'urbanizacion'
 */
export default function Registro({ tipo }) {
  const navigate = useNavigate()
  const { recargarSesion } = useAuth()
  const [form, setForm] = useState({
    email: '',
    password: '',
    nombres: '',
    apellidos: '',
    dni: '',
    telefono: '',
    aceptoTerminos: false,
    urbanizacionId: '',
    nombreUrbanizacion: '',
    direccionUrbanizacion: '',
  })
  const [urbanizaciones, setUrbanizaciones] = useState([])

  // Solo urbanización: listar existentes para el selector
  useEffect(() => {
    if (tipo !== 'urbanizacion') return
    fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:3000/api'}/urbanizaciones`)
      .then((r) => r.json())
      .then(setUrbanizaciones)
      .catch(() => {})
  }, [tipo])
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const esCiudadano = tipo === 'ciudadano'

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setCargando(true)
    try {
      const endpoint = esCiudadano
        ? '/auth/register-ciudadano'
        : '/auth/register-urbanizacion'
      const payload = {
        email: form.email.toLowerCase(),
        password: form.password,
        nombres: form.nombres,
        apellidos: form.apellidos,
        dni: form.dni,
        telefono: form.telefono || undefined,
        aceptoTerminos: form.aceptoTerminos,
      }
      if (!esCiudadano) {
        // Representante legal: indicar a qué urbanización pertenece.
        if (form.urbanizacionId) {
          payload.urbanizacionId = form.urbanizacionId
        } else {
          payload.nombreUrbanizacion = form.nombreUrbanizacion
          payload.direccionUrbanizacion = form.direccionUrbanizacion || undefined
        }
      }
      const { data } = await api.post(endpoint, payload)
      guardarSesion(data)
      recargarSesion() // sin esto, el Layout seguía mostrando la sesión anterior (admin)
      navigate('/panel')
    } catch (err) {
      setError(mensajeError(err))
    } finally {
      setCargando(false)
    }
  }

  const campo = (clave, label, props = {}) => (
    <label className="block text-sm font-medium text-gray-700">
      {label}
      <input
        value={form[clave]}
        onChange={(e) => setForm({ ...form, [clave]: e.target.value })}
        className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:border-emerald-500"
        {...props}
      />
    </label>
  )

  return (
    <div className="flex min-h-screen items-center justify-center bg-emerald-50 px-4 py-8">
      <form
        onSubmit={onSubmit}
        className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl"
      >
        <div className="mb-6 text-center">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-2xl text-white">
            ♻
          </span>
          <h1 className="mt-3 text-xl font-bold text-gray-800">
            {esCiudadano ? 'Registro de ciudadano' : 'Registro de urbanización'}
          </h1>
          <p className="text-sm text-gray-500">
            {esCiudadano
              ? 'Creá tu cuenta para acumular EcoPuntos'
              : 'Creá la cuenta de tu urbanización'}
          </p>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="space-y-4">
          {campo('nombres', 'Nombres', { required: true, placeholder: 'Juan Carlos' })}
          {campo('apellidos', 'Apellidos', { required: true, placeholder: 'Pérez Gómez' })}
          {campo('dni', 'DNI (8 dígitos)', {
            required: true,
            pattern: '\\d{8}',
            title: 'El DNI debe tener 8 dígitos',
            placeholder: '72882624',
          })}
          {campo('email', 'Correo electrónico', {
            type: 'email',
            required: true,
            placeholder: 'usuario@correo.pe',
          })}
          {campo('password', 'Contraseña (mín. 8, letras y números)', {
            type: 'password',
            required: true,
            minLength: 8,
            pattern: '^(?=.*[A-Za-z])(?=.*\\d).+$',
            title: 'Mínimo 8 caracteres con letras y números',
            placeholder: 'Secreto123',
          })}
          {campo('telefono', 'Teléfono (opcional, 9 dígitos)', {
            placeholder: '954123456',
            pattern: '9\\d{8}',
            title: '9 dígitos comenzando con 9',
          })}
        </div>

        {!esCiudadano && (
          <div className="space-y-4 rounded-xl border border-emerald-100 bg-emerald-50 p-4">
            <p className="text-sm font-semibold text-gray-700">
              ¿A qué urbanización pertenece?
            </p>
            <label className="block text-sm font-medium text-gray-700">
              Urbanización existente
              <select
                value={form.urbanizacionId}
                onChange={(e) =>
                  setForm({ ...form, urbanizacionId: e.target.value, nombreUrbanizacion: '', direccionUrbanizacion: '' })
                }
                className="mt-1 w-full rounded-lg border bg-white px-3 py-2 outline-none focus:border-emerald-500"
              >
                <option value="">— Nueva urbanización —</option>
                {urbanizaciones.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.nombre}
                  </option>
                ))}
              </select>
            </label>
            {!form.urbanizacionId && (
              <>
                {campo('nombreUrbanizacion', 'Nombre de la urbanización', {
                  required: !form.urbanizacionId,
                  placeholder: 'Urb. Los Jardines de Paucarpata',
                })}
                {campo('direccionUrbanizacion', 'Dirección de la urbanización', {
                  placeholder: 'Av. Jesús 123, Paucarpata',
                })}
              </>
            )}
          </div>
        )}

        <label className="mt-5 flex items-start gap-2 text-sm text-gray-600">
          <input
            type="checkbox"
            required
            checked={form.aceptoTerminos}
            onChange={(e) =>
              setForm({ ...form, aceptoTerminos: e.target.checked })
            }
            className="mt-1"
          />
          Acepto el tratamiento de mis datos personales (Ley 29733)
        </label>

        <button
          type="submit"
          disabled={cargando}
          className="mt-6 w-full rounded-lg bg-emerald-600 py-2.5 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          {cargando ? 'Registrando…' : 'Crear cuenta'}
        </button>
        <p className="mt-4 text-center text-sm text-gray-500">
          ¿Ya tenés cuenta?{' '}
          <a href="/login" className="font-medium text-emerald-600">
            Iniciar sesión
          </a>
        </p>
      </form>
    </div>
  )
}
