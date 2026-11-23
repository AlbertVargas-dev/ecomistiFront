import { useEffect, useState } from 'react'
import { api, mensajeError } from '../../lib/api.js'

/** Reportar incidencia (ciudadano/recolector) + mis reportes. */
export default function ReportarIncidencia() {
  const [form, setForm] = useState({ tipo: '', descripcion: '' })
  const [mis, setMis] = useState([])
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')

  async function cargar() {
    try {
      const { data } = await api.get('/incidencias/mias')
      setMis(data)
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  async function enviar(e) {
    e.preventDefault()
    setError('')
    setMsg('')
    try {
      await api.post('/incidencias', form)
      setMsg('Incidencia reportada. Gracias.')
      setForm({ tipo: '', descripcion: '' })
      cargar()
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  const input =
    'mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:border-emerald-500'

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Reportar Incidencia</h1>
      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}
      {msg && (
        <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{msg}</p>
      )}

      <form
        onSubmit={enviar}
        className="mt-6 grid max-w-lg gap-4 rounded-2xl bg-white p-6 shadow-sm"
      >
        <label className="text-sm font-medium text-gray-700">
          Tipo
          <input
            value={form.tipo}
            onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            required
            placeholder="Punto saturado"
            className={input}
          />
        </label>
        <label className="text-sm font-medium text-gray-700">
          Descripción
          <textarea
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            required
            rows={3}
            placeholder="Contenedor desbordado en la esquina…"
            className={input}
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
        >
          Enviar reporte
        </button>
      </form>

      <h2 className="mt-8 font-semibold text-gray-800">Mis reportes</h2>
      <div className="mt-3 space-y-3">
        {mis.map((i) => (
          <div key={i.id} className="rounded-2xl bg-white p-4 shadow-sm">
            <div className="flex justify-between">
              <p className="font-medium text-gray-800">{i.tipo}</p>
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">
                {i.estado}
              </span>
            </div>
            <p className="text-sm text-gray-500">{i.descripcion}</p>
            <p className="text-xs text-gray-400">
              {new Date(i.createdAt).toLocaleString('es-PE')}
            </p>
          </div>
        ))}
      </div>
    </div>
  )
}
