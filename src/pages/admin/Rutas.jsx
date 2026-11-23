import { useEffect, useState } from 'react'
import { api, mensajeError } from '../../lib/api.js'

/** Rutas: lista + crear/editar con recolector asignado (diseño: menú Rutas). */
export default function Rutas() {
  const [rutas, setRutas] = useState([])
  const [recolectores, setRecolectores] = useState([])
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({
    nombre: '',
    zona: '',
    recolectorId: '',
    estado: 'ACTIVA',
  })
  const [editando, setEditando] = useState(null)

  async function cargar() {
    try {
      const [{ data: r }, { data: rec }] = await Promise.all([
        api.get('/admin/rutas'),
        api.get('/admin/recolectores'),
      ])
      setRutas(r)
      setRecolectores(rec)
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  async function guardar(e) {
    e.preventDefault()
    setError('')
    setMsg('')
    try {
      const payload = {
        nombre: form.nombre,
        zona: form.zona || undefined,
        recolectorId: form.recolectorId || undefined,
        estado: form.estado,
      }
      if (editando) {
        await api.patch(`/admin/rutas/${editando}`, payload)
      } else {
        await api.post('/admin/rutas', payload)
      }
      setMsg(editando ? 'Ruta actualizada.' : 'Ruta creada.')
      setEditando(null)
      setForm({ nombre: '', zona: '', recolectorId: '', estado: 'ACTIVA' })
      cargar()
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  function editar(r) {
    setEditando(r.id)
    setForm({
      nombre: r.nombre,
      zona: r.zona ?? '',
      recolectorId: r.recolectorId ?? '',
      estado: r.estado,
    })
  }

  const input =
    'mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:border-emerald-500'

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Rutas</h1>
      <p className="text-sm text-gray-500">Recorridos y recolectores asignados</p>
      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}
      {msg && (
        <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{msg}</p>
      )}

      <form
        onSubmit={guardar}
        className="mt-6 grid gap-3 rounded-2xl bg-white p-5 shadow-sm md:grid-cols-2"
      >
        <h2 className="font-semibold text-gray-800 md:col-span-2">
          {editando ? 'Editar ruta' : 'Nueva ruta'}
        </h2>
        <label className="text-sm font-medium text-gray-700">
          Nombre
          <input
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            required
            placeholder="Ruta Sur 1"
            className={input}
          />
        </label>
        <label className="text-sm font-medium text-gray-700">
          Zona
          <input
            value={form.zona}
            onChange={(e) => setForm({ ...form, zona: e.target.value })}
            placeholder="Paucarpata"
            className={input}
          />
        </label>
        <label className="text-sm font-medium text-gray-700">
          Recolector asignado
          <select
            value={form.recolectorId}
            onChange={(e) => setForm({ ...form, recolectorId: e.target.value })}
            className={input}
          >
            <option value="">Sin asignar</option>
            {recolectores.map((r) => (
              <option key={r.id} value={r.id}>
                {r.nombres} {r.apellidos}
              </option>
            ))}
          </select>
        </label>
        <label className="text-sm font-medium text-gray-700">
          Estado
          <select
            value={form.estado}
            onChange={(e) => setForm({ ...form, estado: e.target.value })}
            className={input}
          >
            <option value="ACTIVA">Activa</option>
            <option value="SUSPENDIDA">Suspendida</option>
          </select>
        </label>
        <div className="flex gap-2 md:col-span-2">
          <button
            type="submit"
            className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
          >
            {editando ? 'Guardar cambios' : 'Crear ruta'}
          </button>
          {editando && (
            <button
              type="button"
              onClick={() => {
                setEditando(null)
                setForm({ nombre: '', zona: '', recolectorId: '', estado: 'ACTIVA' })
              }}
              className="rounded-lg border px-4 py-2 text-sm"
            >
              Cancelar
            </button>
          )}
        </div>
      </form>

      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-gray-400">
              <th className="px-5 py-3">Ruta</th>
              <th className="px-5 py-3">Zona</th>
              <th className="px-5 py-3">Recolector</th>
              <th className="px-5 py-3">Entregas</th>
              <th className="px-5 py-3">Estado</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rutas.map((r) => (
              <tr key={r.id} className="border-t text-gray-700">
                <td className="px-5 py-3 font-medium">{r.nombre}</td>
                <td className="px-5 py-3">{r.zona || '—'}</td>
                <td className="px-5 py-3">
                  {r.recolector ? `${r.recolector.nombres} ${r.recolector.apellidos}` : '—'}
                </td>
                <td className="px-5 py-3">{r._count?.entregas ?? 0}</td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      r.estado === 'ACTIVA'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {r.estado}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => editar(r)}
                    className="text-sm font-medium text-emerald-600"
                  >
                    Editar
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
