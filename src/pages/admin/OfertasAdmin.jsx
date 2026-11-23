import { useEffect, useState } from 'react'
import { api, mensajeError } from '../../lib/api.js'
import Modal from '../../components/Modal.jsx'

const VACIO = {
  titulo: '',
  descripcion: '',
  costoPuntos: '',
  dirigidoA: 'CIUDADANO',
  stockDisponible: '',
  diasVigenciaVoucher: 90,
}

function FormOferta({ inicial, textoBoton, onGuardar, onCancelar, enModal = false }) {
  const [form, setForm] = useState(inicial)

  async function submit(e) {
    e.preventDefault()
    const ok = await onGuardar(form)
    if (ok && !onCancelar) setForm(inicial)
  }

  return (
    <form
      onSubmit={submit}
      className={
        enModal
          ? 'grid gap-3 md:grid-cols-2'
          : 'mt-6 grid gap-3 rounded-2xl bg-white p-5 shadow-sm md:grid-cols-2'
      }
    >
      {!enModal && (
        <h2 className="font-semibold text-gray-800 md:col-span-2">Nueva recompensa</h2>
      )}
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
      <div className="flex gap-2 md:col-span-2">
        <button
          type="submit"
          className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
        >
          {textoBoton}
        </button>
        {onCancelar && (
          <button
            type="button"
            onClick={onCancelar}
            className="rounded-lg border px-4 py-2 text-sm"
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  )
}

/**
 * Admin: crear y editar recompensas (en modal). `dirigidoA` decide quién la ve:
 * solo CIUDADANO o solo URBANIZACION (el otro rol nunca la ve).
 */
export default function OfertasAdmin() {
  const [ofertas, setOfertas] = useState([])
  const [editando, setEditando] = useState(null)
  const [error, setError] = useState('')
  const [errorModal, setErrorModal] = useState('')
  const [msg, setMsg] = useState('')

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
    let activo = true
    api
      .get('/admin/ofertas', { params: { take: 50 } })
      .then(({ data }) => activo && setOfertas(data))
      .catch((err) => activo && setError(mensajeError(err)))
    return () => {
      activo = false
    }
  }, [])

  async function guardar(form, idEdicion = null) {
    setError('')
    setErrorModal('')
    setMsg('')
    try {
      const payload = {
        titulo: form.titulo,
        descripcion: form.descripcion,
        costoPuntos: Number(form.costoPuntos),
        dirigidoA: form.dirigidoA,
        stockDisponible:
          form.stockDisponible !== '' && form.stockDisponible != null
            ? Number(form.stockDisponible)
            : null,
        diasVigenciaVoucher: Number(form.diasVigenciaVoucher),
      }
      if (idEdicion) {
        await api.patch(`/admin/ofertas/${idEdicion}`, payload)
        setMsg('Recompensa actualizada.')
      } else {
        await api.post('/admin/ofertas', payload)
        setMsg('Recompensa creada. Solo la verá el público elegido.')
      }
      setEditando(null)
      cargar()
      return true
    } catch (err) {
      const m = mensajeError(err)
      if (idEdicion) setErrorModal(m)
      else setError(m)
      return false
    }
  }

  const ofertaActual = ofertas.find((o) => o.id === editando)

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

      <FormOferta
        inicial={VACIO}
        textoBoton="Crear recompensa"
        onGuardar={(form) => guardar(form)}
      />

      <Modal
        abierto={!!ofertaActual}
        titulo="Editar recompensa"
        error={errorModal}
        onCerrar={() => {
          setEditando(null)
          setErrorModal('')
        }}
      >
        {ofertaActual && (
          <FormOferta
            key={ofertaActual.id}
            enModal
            inicial={{
              titulo: ofertaActual.titulo,
              descripcion: ofertaActual.descripcion,
              costoPuntos: ofertaActual.costoPuntos,
              dirigidoA: ofertaActual.dirigidoA,
              stockDisponible: ofertaActual.stockDisponible ?? '',
              diasVigenciaVoucher: ofertaActual.diasVigenciaVoucher,
            }}
            textoBoton="Guardar cambios"
            onGuardar={(form) => guardar(form, ofertaActual.id)}
            onCancelar={() => {
              setEditando(null)
              setErrorModal('')
            }}
          />
        )}
      </Modal>

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
              onClick={() => {
                setErrorModal('')
                setEditando(o.id)
              }}
              className="text-sm font-medium text-emerald-600"
            >
              Editar
            </button>
          </div>
        ))}
      </div>

      <p className="mt-4 text-xs text-gray-400">
        Nota: para desactivar o borrar, editar desde API o crear una nueva versión.
      </p>
    </div>
  )
}
