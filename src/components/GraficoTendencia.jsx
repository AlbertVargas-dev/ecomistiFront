/**
 * Gráfico SVG de tendencia (sin librerías): líneas reciclables/organicos
 * + barras de total. Serie: [{ fecha, kgReciclables, kgOrganicos, totalKg }]
 */
export default function GraficoTendencia({ serie = [] }) {
  const W = 640
  const H = 200
  const PAD = 28

  const max = Math.max(
    1,
    ...serie.map((s) => Math.max(s.kgReciclables, s.kgOrganicos, s.totalKg)),
  )

  const x = (i) =>
    PAD + (serie.length <= 1 ? W / 2 : (i * (W - PAD * 2)) / (serie.length - 1))
  const y = (v) => H - PAD - (v / max) * (H - PAD * 2)

  const linea = (campo) =>
    serie.map((s, i) => `${i === 0 ? 'M' : 'L'}${x(i)},${y(s[campo])}`).join(' ')

  const anchoBarra = serie.length
    ? Math.min(28, ((W - PAD * 2) / serie.length) * 0.5)
    : 0

  if (serie.length === 0) {
    return (
      <p className="flex h-48 items-center justify-center text-sm text-gray-400">
        Sin datos en el período
      </p>
    )
  }

  return (
    <div>
      <div className="mb-2 flex gap-4 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-4 rounded bg-blue-500" /> Residuos
          Recolectados
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-4 rounded bg-emerald-500" /> Material
          Reciclable
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img">
        {/* barras de total */}
        {serie.map((s, i) => (
          <rect
            key={s.fecha}
            x={x(i) - anchoBarra / 2}
            y={y(s.totalKg)}
            width={anchoBarra}
            height={H - PAD - y(s.totalKg)}
            fill="#10b981"
            opacity="0.25"
            rx="2"
          />
        ))}
        <path d={linea('kgReciclables')} fill="none" stroke="#3b82f6" strokeWidth="2.5" />
        <path d={linea('kgOrganicos')} fill="none" stroke="#10b981" strokeWidth="2.5" />
        {serie.map((s, i) => (
          <text
            key={`t-${s.fecha}`}
            x={x(i)}
            y={H - 8}
            textAnchor="middle"
            fontSize="10"
            fill="#9ca3af"
          >
            {s.fecha.slice(5)}
          </text>
        ))}
      </svg>
      <p className="text-right text-xs text-gray-400">Máx: {max} kg</p>
    </div>
  )
}
