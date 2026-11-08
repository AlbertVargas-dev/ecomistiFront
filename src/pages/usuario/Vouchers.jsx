import { useEffect, useState } from 'react'
import { api, mensajeError } from '../../lib/api.js'

export default function Vouchers() {
  const [vouchers, setVouchers] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/vouchers/mis-vouchers')
      .then(({ data }) => setVouchers(data))
      .catch((err) => setError(mensajeError(err)))
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Mis Vouchers</h1>
      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}
      <div className="mt-6 space-y-4">
        {vouchers.map((v) => (
          <div key={v.id} className="rounded-2xl bg-white p-5 shadow-sm">
            <div className="flex flex-wrap justify-between gap-2">
              <div>
                <p className="font-semibold text-gray-800">
                  {v.oferta?.titulo || 'Recompensa'}
                </p>
                <p className="font-mono text-sm text-emerald-600">{v.codigoVoucher}</p>
                <p className="text-xs text-gray-400">
                  Vence: {new Date(v.fechaVencimiento).toLocaleDateString('es-PE')} ·{' '}
                  {v.puntosUsados} puntos
                </p>
              </div>
              <span
                className={`h-fit rounded-full px-2.5 py-1 text-xs font-medium ${
                  v.estado === 'APLICADO'
                    ? 'bg-emerald-100 text-emerald-700'
                    : v.estado === 'VENCIDO' || v.estado === 'CANCELADO'
                      ? 'bg-red-100 text-red-600'
                      : 'bg-amber-100 text-amber-700'
                }`}
              >
                {v.estado}
              </span>
            </div>
          </div>
        ))}
        {vouchers.length === 0 && !error && (
          <p className="text-sm text-gray-400">Aún no tienes vouchers. Canjea una recompensa.</p>
        )}
      </div>
    </div>
  )
}
