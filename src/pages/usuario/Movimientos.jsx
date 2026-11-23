import { useEffect, useState } from 'react'
import { api, mensajeError } from '../../lib/api.js'

export default function Movimientos() {
  const [movimientos, setMovimientos] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/usuarios/me/movimientos', { params: { take: 50 } })
      .then(({ data }) => setMovimientos(data))
      .catch((err) => setError(mensajeError(err)))
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Movimientos</h1>
      <p className="text-sm text-gray-500">Historial de tus EcoPuntos (ledger)</p>
      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}
      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-gray-400">
              <th className="px-5 py-3">Fecha</th>
              <th className="px-5 py-3">Tipo</th>
              <th className="px-5 py-3">Monto</th>
              <th className="px-5 py-3">Saldo posterior</th>
            </tr>
          </thead>
          <tbody>
            {movimientos.map((m) => (
              <tr key={m.id} className="border-t text-gray-700">
                <td className="px-5 py-3">
                  {new Date(m.createdAt).toLocaleString('es-PE')}
                </td>
                <td className="px-5 py-3">{m.tipo}</td>
                <td
                  className={`px-5 py-3 font-semibold ${
                    m.monto >= 0 ? 'text-emerald-600' : 'text-red-500'
                  }`}
                >
                  {m.monto >= 0 ? '+' : ''}
                  {m.monto}
                </td>
                <td className="px-5 py-3">{m.saldoPosterior}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
