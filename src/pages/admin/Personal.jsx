import { useEffect, useState } from 'react'
import { api, mensajeError } from '../../lib/api.js'

export default function Personal() {
  const [personal, setPersonal] = useState([])
  const [cooperativas, setCooperativas] = useState([])
  const [error, setError] = useState('')
  const [form, setForm] = useState({
    dni: '',
    nombres: '',
    apellidos: '',
    telefono: '',
    zonaCamion: '',
    pin: '',
  })
  const [pinCreado, setPinCreado] = useState('')

  async function cargar() {
    try {
      const [{ data: rec }, { data: coop }] = await Promise.all([
        api.get('/admin/recolectores'),
        api.get('/admin/cooperativas'),
      ])
      setPersonal(rec)
      setCooperativas(coop)
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  async function cambiarEstado(p) {
    setError('')
    try {
      await api.patch(`/admin/recolectores/${p.id}/estado`, { activo: !p.activo })
      cargar()
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  async function asignarCooperativa(p, cooperativaId) {
    setError('')
    try {
      await api.patch(`/admin/recolectores/${p.id}/cooperativa`, {
        cooperativaId: cooperativaId || null,
      })
      cargar()
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  async function crear(e) {
    e.preventDefault()
    setError('')
    setPinCreado('')
    try {
      const payload = { ...form }
      if (!payload.pin) delete payload.pin
      const { data } = await api.post('/admin/recolectores', payload)
      setPinCreado(data.pinInicial)
      setForm({ dni: '', nombres: '', apellidos: '', telefono: '', zonaCamion: '', pin: '' })
      cargar()
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Personal</h1>
      <p className="text-sm text-gray-500">Recolectores y su última actividad</p>
      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}
      {pinCreado && (
        <p className="mt-4 rounded-xl bg-amber-50 px-4 py-3 text-sm text-amber-700">
          Recolector creado. PIN inicial (mostrar una sola vez):{' '}
          <b className="font-mono text-base">{pinCreado}</b>
        </p>
      )}

      <form
        onSubmit={crear}
        className="mt-6 grid gap-3 rounded-2xl bg-white p-5 shadow-sm md:grid-cols-3"
      >
        <h2 className="font-semibold text-gray-800 md:col-span-3">
          Nuevo recolector
        </h2>
        {[
          ['dni', 'DNI (8 dígitos)', '72882624'],
          ['nombres', 'Nombres', 'Carlos'],
          ['apellidos', 'Apellidos', 'Quispe'],
          ['telefono', 'Teléfono (opcional)', '954123456'],
          ['zonaCamion', 'Zona/Camión (opcional)', 'Camión 03 - Zona Norte'],
          ['pin', 'PIN 6 dígitos (vacío = autogenerar)', '123456'],
        ].map(([campo, label, ejemplo]) => (
          <label key={campo} className="text-sm font-medium text-gray-700">
            {label}
            <input
              value={form[campo]}
              onChange={(e) => setForm({ ...form, [campo]: e.target.value })}
              placeholder={ejemplo}
              required={['dni', 'nombres', 'apellidos'].includes(campo)}
              className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:border-emerald-500"
            />
          </label>
        ))}
        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 md:col-span-3"
        >
          Crear recolector
        </button>
      </form>
      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-gray-400">
              <th className="px-5 py-3">Nombre</th>
              <th className="px-5 py-3">DNI</th>
              <th className="px-5 py-3">Zona/Camión</th>
              <th className="px-5 py-3">Cooperativa</th>
              <th className="px-5 py-3">Entregas</th>
              <th className="px-5 py-3">Última entrega</th>
              <th className="px-5 py-3">Estado</th>
              <th className="px-5 py-3">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {personal.map((p) => (
              <tr key={p.id} className="border-t text-gray-700">
                <td className="px-5 py-3 font-medium">
                  {p.nombres} {p.apellidos}
                </td>
                <td className="px-5 py-3">{p.dni}</td>
                <td className="px-5 py-3">{p.zonaCamion || '—'}</td>
                <td className="px-5 py-3">
                  <select
                    value={p.cooperativaId ?? ''}
                    onChange={(e) => asignarCooperativa(p, e.target.value)}
                    className="rounded-lg border px-2 py-1 text-sm"
                  >
                    <option value="">Sin cooperativa</option>
                    {cooperativas.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-5 py-3">{p.totalEntregas}</td>
                <td className="px-5 py-3">
                  {p.ultimaEntrega
                    ? new Date(p.ultimaEntrega).toLocaleString('es-PE')
                    : '—'}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      p.activo
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {p.activo ? 'Activo' : 'Revocado'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => cambiarEstado(p)}
                    className="text-sm font-medium text-emerald-600"
                  >
                    {p.activo ? 'Revocar' : 'Reactivar'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
