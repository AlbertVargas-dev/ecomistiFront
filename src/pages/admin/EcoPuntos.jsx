import { useEffect, useState } from 'react'
import { api, mensajeError } from '../../lib/api.js'

/** EcoPuntos: resumen de emisión + top clientes por saldo. */
export default function EcoPuntos() {
  const [resumen, setResumen] = useState(null)
  const [clientes, setClientes] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    Promise.all([
      api.get('/admin/dashboard/resumen'),
      api.get('/admin/dashboard/clientes', { params: { take: 10 } }),
    ])
      .then(([{ data: r }, { data: c }]) => {
        setResumen(r)
        setClientes(c)
      })
      .catch((err) => setError(mensajeError(err)))
  }, [])

  const top = [...clientes]
    .sort((a, b) => b.puntosActuales - a.puntosActuales)
    .slice(0, 5)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">EcoPuntos</h1>
      <p className="text-sm text-gray-500">Emisión y saldos del sistema</p>
      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Puntos emitidos (período)</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">
            {resumen?.totalPuntosEmitidos ?? '—'}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Clientes activos</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">
            {resumen?.totalClientes ?? '—'}
          </p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Ofertas activas</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">
            {resumen?.ofertasActivas ?? '—'}
          </p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-gray-800">Top clientes por saldo</h2>
        <ul className="mt-3 space-y-2 text-sm text-gray-700">
          {top.map((c) => (
            <li key={c.id} className="flex justify-between border-b py-2 last:border-0">
              <span>
                {c.nombres} {c.apellidos} <span className="text-gray-400">({c.rol})</span>
              </span>
              <b className="text-emerald-600">{c.puntosActuales} pts</b>
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
