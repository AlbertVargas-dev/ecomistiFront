import { useEffect, useState } from 'react'
import { api, mensajeError } from '../../lib/api.js'

const ESTADOS = ['ABIERTA', 'EN_REVISION', 'RESUELTA']

export default function Incidencias() {
  const [incidencias, setIncidencias] = useState([])
  const [error, setError] = useState('')

  async function cargar() {
    try {
      const { data } = await api.get('/admin/incidencias', { params: { take: 50 } })
      setIncidencias(data)
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  async function cambiarEstado(id, estado) {
    try {
      await api.patch(`/admin/incidencias/${id}/estado`, { estado })
      cargar()
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Incidencias</h1>
      <p className="text-sm text-gray-500">Reportes de ciudadanos y recolectores</p>
      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}
      <div className="mt-6 space-y-4">
        {incidencias.map((i) => (
          <div key={i.id} className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-semibold text-gray-800">{i.tipo}</p>
                <p className="text-sm text-gray-500">{i.descripcion}</p>
                <p className="mt-1 text-xs text-gray-400">
                  {i.usuario?.nombres} {i.usuario?.apellidos} ·{' '}
                  {new Date(i.createdAt).toLocaleString('es-PE')}
                </p>
              </div>
              <select
                value={i.estado}
                onChange={(e) => cambiarEstado(i.id, e.target.value)}
                className="rounded-lg border px-2 py-1.5 text-sm"
              >
                {ESTADOS.map((e) => (
                  <option key={e} value={e}>
                    {e}
                  </option>
                ))}
              </select>
            </div>
          </div>
        ))}
        {incidencias.length === 0 && !error && (
          <p className="text-sm text-gray-400">Sin incidencias reportadas.</p>
        )}
      </div>
    </div>
  )
}
