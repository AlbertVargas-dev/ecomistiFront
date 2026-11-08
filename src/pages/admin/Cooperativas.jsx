import { useEffect, useState } from 'react'
import { api, mensajeError } from '../../lib/api.js'
import FormCrud from './FormCrud.jsx'

const CAMPOS = [
  { clave: 'nombre', label: 'Nombre', required: true, placeholder: 'Cooperativa Recicladores Arequipa' },
  { clave: 'ruc', label: 'RUC (11 dígitos)', placeholder: '20123456789' },
  { clave: 'direccion', label: 'Dirección', placeholder: 'Av. Jesús 123' },
  { clave: 'telefono', label: 'Teléfono', placeholder: '954123456' },
  { clave: 'activo', label: 'Estado', opciones: [{ value: true, label: 'Activa' }, { value: false, label: 'Inactiva' }] },
]

export default function Cooperativas() {
  const [cooperativas, setCooperativas] = useState([])
  const [recolectores, setRecolectores] = useState([])
  const [miembros, setMiembros] = useState({})
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const [editando, setEditando] = useState(null)

  async function cargar() {
    try {
      const [{ data: c }, { data: r }] = await Promise.all([
        api.get('/admin/cooperativas'),
        api.get('/admin/recolectores'),
      ])
      setCooperativas(c)
      setRecolectores(r)
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  async function asignar(coopId, recolectorId) {
    setError('')
    setMsg('')
    try {
      await api.patch(`/admin/recolectores/${recolectorId}/cooperativa`, {
        cooperativaId: coopId,
      })
      setMsg('Recolector asignado a la cooperativa.')
      cargar()
      verMiembros(coopId)
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  async function verMiembros(id) {
    try {
      const { data } = await api.get(`/admin/cooperativas/${id}/miembros`)
      setMiembros((m) => ({ ...m, [id]: data }))
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  async function guardar(form) {
    setError('')
    setMsg('')
    try {
      const payload = {
        ...form,
        ruc: form.ruc || undefined,
        direccion: form.direccion || undefined,
        telefono: form.telefono || undefined,
        activo: form.activo === true || form.activo === 'true',
      }
      if (editando) await api.patch(`/admin/cooperativas/${editando}`, payload)
      else await api.post('/admin/cooperativas', payload)
      setMsg(editando ? 'Cooperativa actualizada.' : 'Cooperativa creada.')
      setEditando(null)
      cargar()
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Cooperativas (Copaff)</h1>
      <p className="text-sm text-gray-500">Cooperativas y asociaciones de recicladores</p>
      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}
      {msg && (
        <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{msg}</p>
      )}
      {''}

      <FormCrud
        titulo={editando ? 'Editar cooperativa' : 'Nueva cooperativa'}
        campos={CAMPOS}
        inicial={editando ? cooperativas.find((c) => c.id === editando) || {} : { activo: true }}
        onGuardar={guardar}
        onCancelar={editando ? () => setEditando(null) : null}
      />

      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {cooperativas.map((c) => (
          <div key={c.id} className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-gray-800">{c.nombre}</h2>
            <p className="text-sm text-gray-500">RUC: {c.ruc || '—'}</p>
            <p className="text-sm text-gray-500">{c.direccion || '—'}</p>
            <p className="text-sm text-gray-500">{c.telefono || '—'}</p>
            <span
              className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${
                c.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {c.activo ? 'Activa' : 'Inactiva'}
            </span>
            <p className="mt-2 text-sm text-gray-600">
              {c._count?.miembros ?? 0} recolectores
            </p>
            <div className="mt-2 flex gap-3">
              <button
                onClick={() => verMiembros(c.id)}
                className="text-sm font-medium text-emerald-600"
              >
                Ver miembros
              </button>
              <button
                onClick={() => setEditando(c.id)}
                className="text-sm font-medium text-emerald-600"
              >
                Editar
              </button>
            </div>
            {miembros[c.id] && (
              <ul className="mt-2 space-y-1 text-sm text-gray-600">
                {miembros[c.id].length === 0 && (
                  <li className="text-gray-400">Sin miembros todavía.</li>
                )}
                {miembros[c.id].map((m) => (
                  <li key={m.id}>
                    👤 {m.nombres} {m.apellidos} · {m._count.entregasRegistradas} entregas
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-3 flex gap-2">
              <select
                id={`asignar-${c.id}`}
                className="flex-1 rounded-lg border px-2 py-1.5 text-sm"
                defaultValue=""
              >
                <option value="">Asignar recolector…</option>
                {recolectores
                  .filter((r) => r.cooperativaId !== c.id)
                  .map((r) => (
                    <option key={r.id} value={r.id}>
                      {r.nombres} {r.apellidos}
                    </option>
                  ))}
              </select>
              <button
                onClick={() => {
                  const sel = document.getElementById(`asignar-${c.id}`)
                  if (sel?.value) asignar(c.id, sel.value)
                }}
                className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-semibold text-white hover:bg-emerald-700"
              >
                Unir
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
