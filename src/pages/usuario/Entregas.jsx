import { useEffect, useState } from 'react'
import { api, mensajeError } from '../../lib/api.js'

export default function Entregas() {
  const [entregas, setEntregas] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/usuarios/me/entregas', { params: { take: 50 } })
      .then(({ data }) => setEntregas(data))
      .catch((err) => setError(mensajeError(err)))
  }, [])

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Mis Entregas</h1>
      <p className="text-sm text-gray-500">Residuos que entregaste y sus puntos</p>
      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}
      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-gray-400">
              <th className="px-5 py-3">Fecha</th>
              <th className="px-5 py-3">Detalles</th>
              <th className="px-5 py-3">Peso total</th>
              <th className="px-5 py-3">Puntos</th>
            </tr>
          </thead>
          <tbody>
            {entregas.map((e) => (
              <tr key={e.id} className="border-t text-gray-700">
                <td className="px-5 py-3">
                  {new Date(e.fechaCaptura).toLocaleString('es-PE')}
                </td>
                <td className="px-5 py-3">
                  {e.detalles
                    ?.map((d) => `${d.tipoResiduo} ${d.pesoKg}kg`)
                    .join(', ') || '—'}
                </td>
                <td className="px-5 py-3">
                  {e.detalles
                    ?.reduce((s, d) => s + Number(d.pesoKg), 0)
                    .toFixed(1)}{' '}
                  kg
                </td>
                <td className="px-5 py-3 font-semibold text-emerald-600">
                  +{e.puntosTotales}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
