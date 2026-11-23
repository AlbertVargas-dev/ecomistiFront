import { useEffect, useState } from 'react'
import { api, mensajeError } from '../../lib/api.js'

/**
 * Admin: crear recompensas. El campo `dirigidoA` decide quién la ve:
 * solo CIUDADANO o solo URBANIZACION (el otro rol nunca la ve).
 */
export default function OfertasAdmin() {
  const [ofertas, setOfertas] = useState([])
  const [editando, setEditando] = useState(null)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')
  const [form, setForm] = useState({
    titulo: '',
    descripcion: '',
    costoPuntos: '',
    dirigidoA: 'CIUDADANO',
    stockDisponible: '',
    diasVigenciaVoucher: 90,
  })

  async function cargar() {
    try {
      const { data } = await api.get('/admin/ofertas', {
        params: { take: 50 },
      })
      setOfertas(data)
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  useEffect(() => {
    cargar()
  }, [])

  async function guardar(e) {
    e.preventDefault()
    setError('')
    setMsg('')
    try {
      const payload = {
        titulo: form.titulo,
        descripcion: form.descripcion,
        costoPuntos: Number(form.costoPuntos),
        dirigidoA: form.dirigidoA,
        stockDisponible: form.stockDisponible
          ? Number(form.stockDisponible)
          : null,
        diasVigenciaVoucher: Number(form.diasVigenciaVoucher),
      }
      if (editando) {
        await api.patch(`/admin/ofertas/${editando}`, payload)
        setMsg('Recompensa actualizada.')
      } else {
        await api.post('/admin/ofertas', payload)
        setMsg('Recompensa creada. Solo la verá el público elegido.')
      }
      setEditando(null)
      setForm({
        titulo: '',
        descripcion: '',
        costoPuntos: '',
        dirigidoA: 'CIUDADANO',
        stockDisponible: '',
        diasVigenciaVoucher: 90,
      })
      cargar()
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  function editar(o) {
    setEditando(o.id)
    setForm({
      titulo: o.titulo,
      descripcion: o.descripcion,
      costoPuntos: o.costoPuntos,
      dirigidoA: o.dirigidoA,
      stockDisponible: o.stockDisponible ?? '',
      diasVigenciaVoucher: o.diasVigenciaVoucher,
    })
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Recompensas</h1>
      <p className="text-sm text-gray-500">
        Creá una recompensa y elegí quién la ve (ciudadanos o urbanizaciones)
      </p>
      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}
      {msg && (
        <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{msg}</p>
      )}

      <form
        onSubmit={guardar}
        className="mt-6 grid gap-3 rounded-2xl bg-white p-5 shadow-sm md:grid-cols-2"
      >
        <h2 className="font-semibold text-gray-800 md:col-span-2">
          {editando ? 'Editar recompensa' : 'Nueva recompensa'}
        </h2>
        <label className="text-sm font-medium text-gray-700">
          Título
          <input
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            required
            className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:border-emerald-500"
            placeholder="Vale de mercado"
          />
        </label>
        <label className="text-sm font-medium text-gray-700">
          Costo (puntos)
          <input
            type="number"
            min="1"
            required
            value={form.costoPuntos}
            onChange={(e) => setForm({ ...form, costoPuntos: e.target.value })}
            className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:border-emerald-500"
            placeholder="100"
          />
        </label>
        <label className="text-sm font-medium text-gray-700 md:col-span-2">
          Descripción
          <input
            value={form.descripcion}
            onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
            required
            className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:border-emerald-500"
            placeholder="Vale canjeable en mercados afiliados"
          />
        </label>
        <label className="text-sm font-medium text-gray-700">
          ¿Quién la ve?
          <select
            value={form.dirigidoA}
            onChange={(e) => setForm({ ...form, dirigidoA: e.target.value })}
            className="mt-1 w-full rounded-lg border px-3 py-2"
          >
            <option value="CIUDADANO">Solo ciudadanos</option>
            <option value="URBANIZACION">Solo urbanizaciones</option>
          </select>
        </label>
        <label className="text-sm font-medium text-gray-700">
          Stock (vacío = ilimitado)
          <input
            type="number"
            min="0"
            value={form.stockDisponible}
            onChange={(e) => setForm({ ...form, stockDisponible: e.target.value })}
            className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:border-emerald-500"
            placeholder="50"
          />
        </label>
        <label className="text-sm font-medium text-gray-700">
          Vigencia del voucher (días)
          <input
            type="number"
            min="1"
            value={form.diasVigenciaVoucher}
            onChange={(e) =>
              setForm({ ...form, diasVigenciaVoucher: e.target.value })
            }
            className="mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:border-emerald-500"
          />
        </label>
        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 md:col-span-2"
        >
          {editando ? 'Guardar cambios' : 'Crear recompensa'}
        </button>
        {editando && (
          <button
            type="button"
            onClick={() => setEditando(null)}
            className="rounded-lg border px-4 py-2 text-sm"
          >
            Cancelar
          </button>
        )}
      </form>

      <div className="mt-6 space-y-3">
        {ofertas.map((o) => (
          <div key={o.id} className="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm">
            <div>
              <p className="font-medium text-gray-800">{o.titulo}</p>
              <p className="text-sm text-gray-500">
                {o.costoPuntos} pts · {o.dirigidoA} · {o.activo ? 'Activa' : 'Inactiva'}
              </p>
            </div>
            <button
              onClick={() => editar(o)}
              className="text-sm font-medium text-emerald-600"
            >
              Editar
            </button>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-gray-400">
        Al alcanzar el costo, cada ciudadano/urbanización recibe una
        notificación “¡Llegaste al hito de una recompensa!”.
      </p>
    </div>
  )
}
