import { useEffect, useState } from 'react'
import { api, mensajeError } from '../../lib/api.js'
import GraficoTendencia from '../../components/GraficoTendencia.jsx'
import MapaCalor from '../../components/MapaCalor.jsx'

function fechaLocal(offsetDias = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDias)
  return d.toISOString().slice(0, 10)
}

/** Estadísticas a pantalla completa: tendencia + mapa de calor. */
export default function Estadisticas() {
  const [desde, setDesde] = useState(fechaLocal(-29))
  const [hasta, setHasta] = useState(fechaLocal(0))
  const [granularidad, setGranularidad] = useState('dia')
  const [serie, setSerie] = useState([])
  const [puntos, setPuntos] = useState([])
  const [error, setError] = useState('')

  async function cargar() {
    setError('')
    try {
      const params = {
        desde: `${desde}T00:00:00.000Z`,
        hasta: `${hasta}T23:59:59.000Z`,
        granularidad,
      }
      const [{ data: t }, { data: m }] = await Promise.all([
        api.get('/admin/estadisticas/tendencia', { params }),
        api.get('/admin/estadisticas/mapa-calor'),
      ])
      setSerie(t.serie)
      setPuntos(m)
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  useEffect(() => {
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [granularidad])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Estadísticas</h1>
      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      <form
        className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl bg-white p-4 text-sm shadow-sm"
        onSubmit={(e) => {
          e.preventDefault()
          cargar()
        }}
      >
        <input
          type="date"
          value={desde}
          onChange={(e) => setDesde(e.target.value)}
          className="rounded-lg border px-2 py-1.5"
        />
        <span>–</span>
        <input
          type="date"
          value={hasta}
          onChange={(e) => setHasta(e.target.value)}
          className="rounded-lg border px-2 py-1.5"
        />
        <select
          value={granularidad}
          onChange={(e) => setGranularidad(e.target.value)}
          className="rounded-lg border px-2 py-1.5"
        >
          <option value="dia">Por día</option>
          <option value="semana">Por semana</option>
          <option value="mes">Por mes</option>
        </select>
        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-4 py-1.5 font-medium text-white hover:bg-emerald-700"
        >
          Aplicar
        </button>
      </form>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-gray-800">Tendencia de Recolección</h2>
          <GraficoTendencia serie={serie} />
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-gray-800">Mapa de Calor</h2>
          <MapaCalor puntos={puntos} />
        </div>
      </div>
    </div>
  )
}
