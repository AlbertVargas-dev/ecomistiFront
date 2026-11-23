/**
 * Mapa de calor simplificado (SVG): pins posicionados por lat/lng
 * normalizados, coloreados por nivel. Reemplazable por Leaflet/Mapbox.
 * puntos: [{ puntoId, nombre, distrito, latitud, longitud, totalKg, nivel }]
 */
const COLORES = { ALTA: '#16a34a', MEDIA: '#84cc16', BAJA: '#a3e635' }

export default function MapaCalor({ puntos = [] }) {
  if (puntos.length === 0) {
    return (
      <p className="flex h-48 items-center justify-center text-sm text-gray-400">
        Sin puntos con entregas registradas
      </p>
    )
  }

  const lats = puntos.map((p) => p.latitud)
  const lngs = puntos.map((p) => p.longitud)
  const minLat = Math.min(...lats)
  const maxLat = Math.max(...lats)
  const minLng = Math.min(...lngs)
  const maxLng = Math.max(...lngs)
  const rangoLat = maxLat - minLat || 1
  const rangoLng = maxLng - minLng || 1

  const pos = (p) => ({
    x: 20 + ((p.longitud - minLng) / rangoLng) * 600,
    y: 180 - ((p.latitud - minLat) / rangoLat) * 160,
    r: 8 + Math.min(14, p.totalKg / 10),
  })

  return (
    <div>
      <div className="mb-2 flex gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-green-600" /> Zona Alta
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-lime-500" /> Zona Media
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2.5 w-2.5 rounded-full bg-lime-300" /> Zona Baja
        </span>
      </div>
      <svg viewBox="0 0 640 200" className="w-full rounded-xl bg-emerald-50">
        {puntos.map((p) => {
          const { x, y, r } = pos(p)
          return (
            <g key={p.puntoId}>
              <circle cx={x} cy={y} r={r} fill={COLORES[p.nivel]} opacity="0.35" />
              <circle cx={x} cy={y} r={4} fill={COLORES[p.nivel]} />
              <title>{`${p.nombre} (${p.distrito}) — ${p.totalKg.toFixed(1)} kg`}</title>
            </g>
          )
        })}
      </svg>
      <ul className="mt-2 space-y-1 text-xs text-gray-500">
        {puntos.slice(0, 5).map((p) => (
          <li key={p.puntoId}>
            📍 {p.nombre} — {p.distrito}: <b>{p.totalKg.toFixed(1)} kg</b> ({p.totalEntregas} entregas)
          </li>
        ))}
      </ul>
    </div>
  )
}
