import { useEffect, useState } from 'react'
import { api, mensajeError } from '../../lib/api.js'

export default function Ofertas() {
  const [ofertas, setOfertas] = useState([])
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')

  async function cargar() {
    try {
      const { data } = await api.get('/ofertas')
      setOfertas(data)
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  async function canjear(id) {
    setError('')
    setMsg('')
    try {
      const { data } = await api.post(`/ofertas/${id}/canjear`)
      setMsg(
        `¡Canjeado! Tu voucher es ${data.codigoVoucher} (vence el ${new Date(data.fechaVencimiento).toLocaleDateString('es-PE')}).`,
      )
      cargar()
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Recompensas</h1>
      <p className="text-sm text-gray-500">Canjea tus EcoPuntos por premios</p>
      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}
      {msg && (
        <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{msg}</p>
      )}
      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {ofertas.map((o) => (
          <div key={o.id} className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-gray-800">{o.titulo}</h2>
            <p className="text-sm text-gray-500">{o.descripcion}</p>
            <p className="mt-2 text-sm font-bold text-emerald-600">
              {o.costoPuntos} puntos
            </p>
            {o.stockDisponible != null && (
              <p className="text-xs text-gray-400">Quedan {o.stockDisponible}</p>
            )}
            <button
              onClick={() => canjear(o.id)}
              className="mt-3 w-full rounded-lg bg-emerald-600 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Canjear
            </button>
          </div>
        ))}
        {ofertas.length === 0 && !error && (
          <p className="text-sm text-gray-400">No hay recompensas disponibles.</p>
        )}
      </div>
    </div>
  )
}
