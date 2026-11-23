import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, mensajeError } from '../../lib/api.js'
import MapaPuntos from '../../components/MapaPuntos.jsx'

/**
 * Mi Panel (ciudadano/urbanización): puntos, kg acumulados,
 * puntos de EcoReciclaje en mapa y recompensas disponibles.
 */
export default function Panel() {
  const [panel, setPanel] = useState(null)
  const [puntos, setPuntos] = useState([])
  const [errorPuntos, setErrorPuntos] = useState('')
  const [distrito, setDistrito] = useState('')
  const [busqueda, setBusqueda] = useState('')
  const [puntoActivoId, setPuntoActivoId] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    let activo = true
    Promise.allSettled([
      api.get('/usuarios/me/panel'),
      api.get('/puntos-encuentro'),
    ]).then(([resPanel, resPuntos]) => {
      if (!activo) return
      if (resPanel.status === 'fulfilled') {
        setPanel(resPanel.value.data)
      } else {
        setError(mensajeError(resPanel.reason))
      }
      if (resPuntos.status === 'fulfilled') {
        setPuntos(resPuntos.value.data)
      } else {
        setErrorPuntos(mensajeError(resPuntos.reason))
      }
    })
    return () => {
      activo = false
    }
  }, [])

  if (error)
    return (
      <p className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
    )
  if (!panel)
    return <p className="text-sm text-gray-400">Cargando tu panel…</p>

  const distritos = [...new Set(puntos.map((p) => p.distrito).filter(Boolean))]
  const q = busqueda.trim().toLowerCase()
  const puntosFiltrados = puntos.filter((p) => {
    if (distrito && p.distrito !== distrito) return false
    if (!q) return true
    return (
      p.nombre.toLowerCase().includes(q) ||
      p.distrito.toLowerCase().includes(q) ||
      p.direccion.toLowerCase().includes(q)
    )
  })

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
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-semibold text-gray-800">
                Puntos de EcoReciclaje
              </h2>
              <span className="rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                {puntosFiltrados.length}{' '}
                {puntosFiltrados.length === 1 ? 'activo' : 'activos'}
              </span>
            </div>
            <p className="text-xs text-gray-400">
              Selecciona un punto para ubicarlo en el mapa o abrir la ruta en Google Maps
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <input
              type="text"
              value={busqueda}
              onChange={(e) => {
                setBusqueda(e.target.value)
                setPuntoActivoId(null)
              }}
              placeholder="Buscar punto o dirección…"
              className="rounded-lg border px-3 py-1.5 text-sm outline-none focus:border-emerald-500"
            />
            {distritos.length > 1 && (
              <select
                value={distrito}
                onChange={(e) => {
                  setDistrito(e.target.value)
                  setPuntoActivoId(null)
                }}
                className="rounded-lg border px-3 py-1.5 text-sm outline-none focus:border-emerald-500"
              >
                <option value="">Todos los distritos</option>
                {distritos.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            )}
          </div>
        </div>

        {errorPuntos && (
          <p className="mt-3 rounded-xl bg-red-50 px-4 py-2 text-sm text-red-600">
            {errorPuntos}
          </p>
        )}

        <div className="mt-4 grid gap-5 lg:grid-cols-2">
          <div className="max-h-[360px] space-y-2.5 overflow-y-auto pr-1">
            {puntosFiltrados.map((p) => {
              const seleccionado = puntoActivoId === p.id
              return (
                <div
                  key={p.id}
                  onClick={() => setPuntoActivoId(p.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      setPuntoActivoId(p.id)
                    }
                  }}
                  className={`cursor-pointer rounded-xl border p-3.5 transition ${
                    seleccionado
                      ? 'border-emerald-500 bg-emerald-50/70'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-medium text-gray-800">{p.nombre}</p>
                    <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-[11px] font-medium text-gray-600">
                      {p.distrito}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-gray-500">📍 {p.direccion}</p>
                  <div className="mt-2 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="text-emerald-700">🕐 {p.horario}</span>
                    <a
                      href={`https://www.google.com/maps/search/?api=1&query=${p.latitud},${p.longitud}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="font-medium text-emerald-600 hover:underline"
                    >
                      Cómo llegar ↗
                    </a>
                  </div>
                </div>
              )
            })}
            {puntosFiltrados.length === 0 && !errorPuntos && (
              <p className="text-sm text-gray-400">
                No se encontraron puntos de reciclaje activos.
              </p>
            )}
          </div>

          <MapaPuntos
            puntos={puntosFiltrados}
            puntoActivoId={puntoActivoId}
            onSeleccionarPunto={setPuntoActivoId}
          />
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Recompensas disponibles</h2>
          <Link to="/ofertas" className="text-sm font-medium text-emerald-600">
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
