import { useEffect, useState } from 'react'
import { api, mensajeError } from '../../lib/api.js'

/** Recolecciones: tabla de entregas con filtros (diseño: Recolecciones Recientes). */
export default function Recolecciones() {
  const [entregas, setEntregas] = useState([])
  const [error, setError] = useState('')
  const [filtros, setFiltros] = useState({
    estado: '',
    tipoResiduo: '',
    desde: '',
    hasta: '',
    search: '',
  })
  const [skip, setSkip] = useState(0)
  const TAKE = 20

  async function cargar(skip, f) {
    setError('')
    try {
      const params = { skip, take: TAKE, ...f }
      Object.keys(params).forEach((k) => !params[k] && delete params[k])
      const { data } = await api.get('/admin/entregas', { params })
      setEntregas(data)
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  useEffect(() => {
    cargar(skip, filtros)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skip])

  function aplicar(e) {
    e.preventDefault()
    setSkip(0)
    cargar(0, filtros)
  }

  const campo =
    'rounded-lg border px-3 py-2 text-sm outline-none focus:border-emerald-500'

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Recolecciones</h1>
      <p className="text-sm text-gray-500">Todas las entregas registradas</p>

      <form
        onSubmit={aplicar}
        className="mt-4 flex flex-wrap gap-2 rounded-2xl bg-white p-4 shadow-sm"
      >
        <select
          value={filtros.estado}
          onChange={(e) => setFiltros({ ...filtros, estado: e.target.value })}
          className={campo}
        >
          <option value="">Todos los estados</option>
          <option value="VALIDA">Completado (válida)</option>
          <option value="ANULADA">Anulada</option>
        </select>
        <select
          value={filtros.tipoResiduo}
          onChange={(e) => setFiltros({ ...filtros, tipoResiduo: e.target.value })}
          className={campo}
        >
          <option value="">Todos los tipos</option>
          <option value="RECICLABLE">Reciclable</option>
          <option value="ORGANICO">Orgánico</option>
        </select>
        <input
          type="date"
          value={filtros.desde}
          onChange={(e) => setFiltros({ ...filtros, desde: e.target.value })}
          className={campo}
        />
        <input
          type="date"
          value={filtros.hasta}
          onChange={(e) => setFiltros({ ...filtros, hasta: e.target.value })}
          className={campo}
        />
        <input
          value={filtros.search}
          onChange={(e) => setFiltros({ ...filtros, search: e.target.value })}
          placeholder="Buscar (id, nombre…)"
          className={campo}
        />
        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
        >
          Filtrar
        </button>
      </form>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      <div className="mt-4 overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-gray-400">
              <th className="px-5 py-3">ID</th>
              <th className="px-5 py-3">Ruta</th>
              <th className="px-5 py-3">Fecha y hora</th>
              <th className="px-5 py-3">Tipo</th>
              <th className="px-5 py-3">Peso (kg)</th>
              <th className="px-5 py-3">Volumen (m³)</th>
              <th className="px-5 py-3">Estado</th>
              <th className="px-5 py-3">Personal Asignado</th>
            </tr>
          </thead>
          <tbody>
            {entregas.map((e) => (
              <tr key={e.id} className="border-t text-gray-700">
                <td className="px-5 py-3 font-mono text-xs">{e.id.slice(0, 8)}</td>
                <td className="px-5 py-3">{e.ruta?.nombre || '—'}</td>
                <td className="px-5 py-3">
                  {new Date(e.fechaCaptura).toLocaleString('es-PE')}
                </td>
                <td className="px-5 py-3">{e.detalles.map((d) => d.tipoResiduo).join(', ')}</td>
                <td className="px-5 py-3">
                  {e.detalles.reduce((s, d) => s + Number(d.pesoKg), 0).toFixed(1)}
                </td>
                <td className="px-5 py-3">
                  {e.volumenM3 != null ? Number(e.volumenM3).toFixed(2) : '—'}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      e.estado === 'VALIDA'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-red-100 text-red-600'
                    }`}
                  >
                    {e.estado === 'VALIDA' ? 'Completado' : 'Anulada'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  {e.recolector?.nombres} {e.recolector?.apellidos}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 flex gap-2">
        <button
          disabled={skip === 0}
          onClick={() => setSkip(Math.max(0, skip - TAKE))}
          className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50"
        >
          ← Anterior
        </button>
        <button
          disabled={entregas.length < TAKE}
          onClick={() => setSkip(skip + TAKE)}
          className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50"
        >
          Siguiente →
        </button>
      </div>
    </div>
  )
}
