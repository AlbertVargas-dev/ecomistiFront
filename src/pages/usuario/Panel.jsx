import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, mensajeError } from '../../lib/api.js'

/**
 * Mi Panel (ciudadano/urbanización): puntos, kg acumulados y
 * recompensas disponibles — GET /usuarios/me/panel
 */
export default function Panel() {
  const [panel, setPanel] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/usuarios/me/panel')
      .then(({ data }) => setPanel(data))
      .catch((err) => setError(mensajeError(err)))
  }, [])

  if (error)
    return (
      <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
    )
  if (!panel)
    return <p className="text-sm text-gray-400">Cargando tu panel…</p>

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Mi Panel</h1>
      <p className="text-sm text-gray-500">Tus puntos, tu basura y tus recompensas</p>

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Puntos actuales</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">
            {panel.puntosActuales}
          </p>
          <p className="text-xs text-gray-400">
            Históricos: {panel.puntosHistoricos}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Basura acumulada</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">
            {panel.totalKg.toFixed(1)} kg
          </p>
          <p className="text-xs text-gray-400">{panel.totalEntregas} entregas</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Por tipo de residuo</p>
          <ul className="mt-2 space-y-1 text-sm text-gray-700">
            {panel.kgPorTipo.map((k) => (
              <li key={k.tipoResiduo}>
                {k.tipoResiduo}: <b>{k.kg.toFixed(1)} kg</b> ({k.puntos} pts)
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Recompensas disponibles</h2>
          <Link to="/ofertas" className="text-sm text-emerald-600 font-medium">
            Ver todas →
          </Link>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {panel.recompensasDisponibles.map((o) => (
            <div key={o.id} className="rounded-xl border p-4">
              <p className="font-medium text-gray-800">{o.titulo}</p>
              <p className="text-sm text-gray-500">{o.descripcion}</p>
              <p className="mt-2 text-sm font-bold text-emerald-600">
                {o.costoPuntos} puntos
              </p>
            </div>
          ))}
          {panel.recompensasDisponibles.length === 0 && (
            <p className="text-sm text-gray-400">
              Aún no hay recompensas para tu cuenta.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
