import { useEffect, useState } from 'react'
import { api, mensajeError } from '../../lib/api.js'

/** Lista y detalle de clientes (ciudadanos + urbanizaciones). */
export default function Ciudadanos() {
  const [clientes, setClientes] = useState([])
  const [detalle, setDetalle] = useState(null)
  const [error, setError] = useState('')
  const [skip, setSkip] = useState(0)
  const TAKE = 10

  async function cargar(skip) {
    setError('')
    try {
      const { data } = await api.get('/admin/dashboard/clientes', {
        params: { skip, take: TAKE },
      })
      setClientes(data)
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  useEffect(() => {
    cargar(skip)
  }, [skip])

  async function verDetalle(id) {
    setError('')
    try {
      const { data } = await api.get(`/admin/dashboard/clientes/${id}`)
      setDetalle(data)
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Ciudadanos</h1>
      <p className="text-sm text-gray-500">
        Clientes con sus puntos, kg acumulados y recompensas
      </p>
      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-gray-400">
              <th className="px-5 py-3">Cliente</th>
              <th className="px-5 py-3">Rol</th>
              <th className="px-5 py-3">Puntos</th>
              <th className="px-5 py-3">Kg acumulados</th>
              <th className="px-5 py-3">Entregas</th>
              <th className="px-5 py-3">Vouchers</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {clientes.map((c) => (
              <tr key={c.id} className="border-t text-gray-700">
                <td className="px-5 py-3">
                  <p className="font-medium">{c.nombres} {c.apellidos}</p>
                  <p className="text-xs text-gray-400">{c.email}</p>
                </td>
                <td className="px-5 py-3">{c.rol}</td>
                <td className="px-5 py-3 font-semibold text-emerald-600">
                  {c.puntosActuales}
                </td>
                <td className="px-5 py-3">{c.totalKg?.toFixed(1)} kg</td>
                <td className="px-5 py-3">{c.totalEntregas}</td>
                <td className="px-5 py-3">{c.totalVouchers}</td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => verDetalle(c.id)}
                    className="text-sm font-medium text-emerald-600"
                  >
                    Ver detalle
                  </button>
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
          disabled={clientes.length < TAKE}
          onClick={() => setSkip(skip + TAKE)}
          className="rounded-lg border px-3 py-1.5 text-sm disabled:opacity-50"
        >
          Siguiente →
        </button>
      </div>

      {detalle && (
        <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-lg font-bold text-gray-900">
                {detalle.nombres} {detalle.apellidos}
              </h2>
              <p className="text-sm text-gray-500">
                {detalle.email} · {detalle.rol} · {detalle.totalKg.toFixed(1)} kg ·{' '}
                {detalle.puntosActuales} puntos
              </p>
            </div>
            <button
              onClick={() => setDetalle(null)}
              className="text-sm text-gray-400"
            >
              ✕ Cerrar
            </button>
          </div>

          <h3 className="mt-5 font-semibold text-gray-800">Kg por tipo</h3>
          <ul className="mt-2 space-y-1 text-sm text-gray-600">
            {detalle.kgPorTipo.map((k) => (
              <li key={k.tipoResiduo}>
                {k.tipoResiduo}: <b>{k.kg.toFixed(1)} kg</b> ({k.puntos} pts)
              </li>
            ))}
          </ul>

          <h3 className="mt-5 font-semibold text-gray-800">Últimas entregas</h3>
          <ul className="mt-2 space-y-1 text-sm text-gray-600">
            {detalle.entregas.map((e) => (
              <li key={e.id}>
                {new Date(e.fechaCaptura).toLocaleDateString('es-PE')} ·{' '}
                {e.detalles.map((d) => `${d.tipoResiduo} ${d.pesoKg}kg`).join(', ')} · +
                {e.puntosTotales} pts
              </li>
            ))}
          </ul>

          <h3 className="mt-5 font-semibold text-gray-800">Vouchers</h3>
          <ul className="mt-2 space-y-1 text-sm text-gray-600">
            {detalle.vouchers.map((v) => (
              <li key={v.id}>
                {v.oferta?.titulo} · {v.codigoVoucher} · {v.estado}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}
