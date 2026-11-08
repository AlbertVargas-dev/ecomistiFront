import { useEffect, useState } from 'react'
import { api, mensajeError } from '../../lib/api.js'
import { leerSesion } from '../../lib/auth.js'

function hoy(offset = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d.toISOString().slice(0, 10)
}

/** Reportes: agregados con filtros de fecha/zona + exportar CSV/XLSX. */
export default function Reportes() {
  const [desde, setDesde] = useState(hoy(-29))
  const [hasta, setHasta] = useState(hoy(0))
  const [distrito, setDistrito] = useState('')
  const [reporte, setReporte] = useState(null)
  const [error, setError] = useState('')

  async function cargar() {
    setError('')
    try {
      const params = {
        desde: `${desde}T00:00:00.000Z`,
        hasta: `${hasta}T23:59:59.000Z`,
        ...(distrito ? { distrito } : {}),
      }
      const { data } = await api.get('/admin/reportes/residuos', { params })
      setReporte(data)
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  useEffect(() => {
    cargar()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function exportar(formato) {
    setError('')
    try {
      const { accessToken } = leerSesion()
      const res = await fetch(
        `${import.meta.env.VITE_API_URL}/admin/reportes/exportar?formato=${formato}`,
        { headers: { Authorization: `Bearer ${accessToken}` } },
      )
      if (!res.ok) throw new Error('No se pudo exportar')
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `reporte-recolecciones.${formato}`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  const campo =
    'rounded-lg border px-2 py-1.5 text-sm outline-none focus:border-emerald-500'

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Reportes</h1>
          <p className="text-sm text-gray-500">Agregados de recolección y exportación</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => exportar('csv')}
            className="rounded-lg border px-4 py-2 text-sm font-medium hover:bg-gray-50"
          >
            Exportar CSV
          </button>
          <button
            onClick={() => exportar('xlsx')}
            className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Exportar XLSX
          </button>
        </div>
      </div>

      <form
        className="mt-4 flex flex-wrap items-center gap-2 rounded-2xl bg-white p-4 text-sm shadow-sm"
        onSubmit={(e) => {
          e.preventDefault()
          cargar()
        }}
      >
        <input type="date" value={desde} onChange={(e) => setDesde(e.target.value)} className={campo} />
        <span>–</span>
        <input type="date" value={hasta} onChange={(e) => setHasta(e.target.value)} className={campo} />
        <input
          value={distrito}
          onChange={(e) => setDistrito(e.target.value)}
          placeholder="Zona / distrito (ej. Paucarpata)"
          className={campo}
        />
        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-4 py-1.5 font-medium text-white hover:bg-emerald-700"
        >
          Aplicar
        </button>
        {reporte && (
          <span className="ml-auto text-gray-500">
            Total: <b>{reporte.totalKg.toFixed(1)} kg</b>
          </span>
        )}
      </form>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      {reporte && (
        <div className="mt-6 grid gap-5 lg:grid-cols-2">
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-gray-800">Kg por tipo</h2>
            <ul className="mt-3 space-y-2 text-sm text-gray-700">
              {reporte.porTipo.map((r) => (
                <li key={r.tipoResiduo} className="flex justify-between">
                  <span>{r.tipoResiduo}</span>
                  <b>
                    {r.kg.toFixed(1)} kg · {r.puntos} pts · {r.entregas} entregas
                  </b>
                </li>
              ))}
            </ul>
          </div>
          <div className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-gray-800">Top recolectores</h2>
            <ul className="mt-3 space-y-2 text-sm text-gray-700">
              {reporte.topRecolectores.map((r) => (
                <li key={r.recolectorId} className="flex justify-between">
                  <span>{r.nombre}</span>
                  <b>
                    {r.puntos} pts · {r.entregas} entregas
                  </b>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  )
}
