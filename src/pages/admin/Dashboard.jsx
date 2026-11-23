import { useCallback, useEffect, useState } from 'react'
import { api, mensajeError } from '../../lib/api.js'
import { leerSesion } from '../../lib/auth.js'
import { guardarCache, leerCache } from '../../lib/cache.js'
import GraficoTendencia from '../../components/GraficoTendencia.jsx'
import MapaCalor from '../../components/MapaCalor.jsx'
import TablaEntregas from '../../components/TablaEntregas.jsx'

function fechaLocal(offsetDias = 0) {
  const d = new Date()
  d.setDate(d.getDate() + offsetDias)
  return d.toISOString().slice(0, 10)
}

function Tarjeta({ titulo, valor, unidad, delta, icono }) {
  const positivo = delta != null && delta >= 0
  return (
    <div className="rounded-2xl bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-500">{titulo}</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">
            {valor?.toLocaleString('es-PE') ?? '—'}{' '}
            <span className="text-base font-medium text-gray-500">{unidad}</span>
          </p>
        </div>
        <span className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-2xl text-emerald-600">
          {icono}
        </span>
      </div>
      {delta != null ? (
        <p className={`mt-2 text-xs ${positivo ? 'text-emerald-600' : 'text-red-500'}`}>
          {positivo ? '↑' : '↓'} {Math.abs(delta)}% vs período anterior
        </p>
      ) : (
        <p className="mt-2 text-xs text-gray-400">Sin datos del período anterior</p>
      )}
    </div>
  )
}

export default function Dashboard() {
  const [desde, setDesde] = useState(fechaLocal(-6))
  const [hasta, setHasta] = useState(fechaLocal(0))
  const [resumen, setResumen] = useState(null)
  const [serie, setSerie] = useState([])
  const [puntos, setPuntos] = useState([])
  const [entregas, setEntregas] = useState([])
  const [error, setError] = useState('')
  const [cargando, setCargando] = useState(false)

  const cargar = useCallback(async () => {
    // Caché de 30 s: entrar 5-6 veces al panel no repite las 4 llamadas.
    const clave = `panel:${desde}:${hasta}`
    const cacheado = leerCache(clave)
    if (cacheado) {
      setResumen(cacheado.resumen)
      setSerie(cacheado.serie)
      setPuntos(cacheado.mapa)
      setEntregas(cacheado.tabla)
      return
    }
    setCargando(true)
    setError('')
    try {
      const params = {
        desde: `${desde}T00:00:00.000Z`,
        hasta: `${hasta}T23:59:59.000Z`,
      }
      const [{ data }, { data: tendencia }, { data: mapa }, { data: tabla }] =
        await Promise.all([
          api.get('/admin/dashboard/resumen', { params }),
          api.get('/admin/estadisticas/tendencia', {
            params: { ...params, granularidad: 'dia' },
          }),
          api.get('/admin/estadisticas/mapa-calor'),
          api.get('/admin/entregas', { params: { take: 10 } }),
        ])
      setResumen(data)
      setSerie(tendencia.serie)
      setPuntos(mapa)
      setEntregas(tabla)
      guardarCache(clave, {
        resumen: data,
        serie: tendencia.serie,
        mapa,
        tabla,
      })
    } catch (err) {
      setError(mensajeError(err))
    } finally {
      setCargando(false)
    }
  }, [desde, hasta])

  useEffect(() => {
    cargar()
  }, [cargar])

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Resumen General</h1>
          <p className="text-sm text-gray-500">
            Gestión de residuos sólidos municipales{' '}
            <span className="text-emerald-600">●</span>
          </p>
        </div>
        <form
          className="flex items-center gap-2 text-sm"
          onSubmit={(e) => {
            e.preventDefault()
            cargar()
          }}
        >
          <span className="text-gray-500">Período:</span>
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
          <button
            type="submit"
            disabled={cargando}
            className="rounded-lg bg-emerald-600 px-4 py-1.5 font-medium text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {cargando ? 'Cargando…' : 'Aplicar'}
          </button>
        </form>
      </div>

      {error && (
        <p className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </p>
      )}

      <div className="grid gap-5 md:grid-cols-3">
        <Tarjeta
          titulo="Residuos recolectados"
          valor={resumen?.totalKg}
          unidad="kg"
          delta={resumen?.deltaPct?.residuosKg}
          icono="🗑"
        />
        <Tarjeta
          titulo="Material reciclable"
          valor={resumen?.materialReciclableKg}
          unidad="kg"
          delta={resumen?.deltaPct?.reciclableKg}
          icono="♻"
        />
        <Tarjeta
          titulo="EcoPuntos emitidos"
          valor={resumen?.totalPuntosEmitidos}
          unidad="pts"
          delta={resumen?.deltaPct?.ecoPuntos}
          icono="◐"
        />
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-gray-800">Tendencia de Recolección</h2>
          <div className="mt-4">
            <GraficoTendencia serie={serie} />
          </div>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <h2 className="font-semibold text-gray-800">Mapa de Calor</h2>
          <p className="text-xs text-gray-400">Zonas de mayor recolección</p>
          <div className="mt-4">
            <MapaCalor puntos={puntos} />
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-gray-800">Recolecciones Recientes</h2>
          <div className="flex gap-2">
            {['csv', 'xlsx'].map((formato) => (
              <button
                key={formato}
                onClick={async () => {
                  try {
                    const { accessToken: token } = leerSesion()
                    const res = await fetch(
                      `${import.meta.env.VITE_API_URL}/admin/reportes/exportar?formato=${formato}`,
                      { headers: { Authorization: `Bearer ${token}` } },
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
                }}
                className="rounded-lg border px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
              >
                Exportar {formato.toUpperCase()}
              </button>
            ))}
          </div>
        </div>
        <div className="mt-4">
          <TablaEntregas entregas={entregas} />
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-400">
        Clientes totales: {resumen?.totalClientes ?? '—'} · Entregas del período:{' '}
        {resumen?.totalEntregas ?? '—'} · Ofertas activas: {resumen?.ofertasActivas ?? '—'}
      </p>
    </div>
  )
}
