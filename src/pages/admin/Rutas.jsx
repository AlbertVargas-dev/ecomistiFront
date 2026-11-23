import { useEffect, useState } from 'react'
import { api, mensajeError } from '../../lib/api.js'
import Modal from '../../components/Modal.jsx'

const VACIO = { nombre: '', zona: '', recolectorId: '', estado: 'ACTIVA' }

function FormRuta({ inicial, recolectores, textoBoton, onGuardar, onCancelar, enModal = false }) {
  const [form, setForm] = useState(inicial)
  const input =
    'mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:border-emerald-500'

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
        <h2 className="font-semibold text-gray-800 md:col-span-2">Nueva ruta</h2>
      )}
      <label className="text-sm font-medium text-gray-700">
        Nombre
        <input
          value={form.nombre}
          onChange={(e) => setForm({ ...form, nombre: e.target.value })}
          required
          placeholder="Ruta Sur 1"
          className={input}
        />
      </label>
      <label className="text-sm font-medium text-gray-700">
        Zona
        <input
          value={form.zona}
          onChange={(e) => setForm({ ...form, zona: e.target.value })}
          placeholder="Paucarpata"
          className={input}
        />
      </label>
      <label className="text-sm font-medium text-gray-700">
        Recolector asignado
        <select
          value={form.recolectorId}
          onChange={(e) => setForm({ ...form, recolectorId: e.target.value })}
          className={input}
        >
          <option value="">Sin asignar</option>
          {recolectores.map((r) => (
            <option key={r.id} value={r.id}>
              {r.nombres} {r.apellidos}
            </option>
          ))}
        </select>
      </label>
      <label className="text-sm font-medium text-gray-700">
        Estado
        <select
          value={form.estado}
          onChange={(e) => setForm({ ...form, estado: e.target.value })}
          className={input}
        >
          <option value="ACTIVA">Activa</option>
          <option value="SUSPENDIDA">Suspendida</option>
        </select>
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

/** Rutas: lista + crear/editar en modal con recolector asignado. */
export default function Rutas() {
  const [rutas, setRutas] = useState([])
  const [recolectores, setRecolectores] = useState([])
  const [error, setError] = useState('')
  const [errorModal, setErrorModal] = useState('')
  const [msg, setMsg] = useState('')
  const [editando, setEditando] = useState(null)

  async function cargar() {
    try {
      const [{ data: r }, { data: rec }] = await Promise.all([
        api.get('/admin/rutas'),
        api.get('/admin/recolectores'),
      ])
      setRutas(r)
      setRecolectores(rec)
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  useEffect(() => {
    let activo = true
    Promise.all([api.get('/admin/rutas'), api.get('/admin/recolectores')])
      .then(([{ data: r }, { data: rec }]) => {
        if (!activo) return
        setRutas(r)
        setRecolectores(rec)
      })
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
        nombre: form.nombre,
        zona: form.zona || undefined,
        recolectorId: form.recolectorId || undefined,
        estado: form.estado,
      }
      if (idEdicion) {
        await api.patch(`/admin/rutas/${idEdicion}`, payload)
      } else {
        await api.post('/admin/rutas', payload)
      }
      setMsg(idEdicion ? 'Ruta actualizada.' : 'Ruta creada.')
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

  const rutaActual = rutas.find((r) => r.id === editando)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Rutas</h1>
      <p className="text-sm text-gray-500">Recorridos y recolectores asignados</p>
      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}
      {msg && (
        <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{msg}</p>
      )}

      <FormRuta
        inicial={VACIO}
        recolectores={recolectores}
        textoBoton="Crear ruta"
        onGuardar={(form) => guardar(form)}
      />

      <Modal
        abierto={!!rutaActual}
        titulo="Editar ruta"
        error={errorModal}
        onCerrar={() => {
          setEditando(null)
          setErrorModal('')
        }}
      >
        {rutaActual && (
          <FormRuta
            key={rutaActual.id}
            enModal
            inicial={{
              nombre: rutaActual.nombre,
              zona: rutaActual.zona ?? '',
              recolectorId: rutaActual.recolectorId ?? '',
              estado: rutaActual.estado,
            }}
            recolectores={recolectores}
            textoBoton="Guardar cambios"
            onGuardar={(form) => guardar(form, rutaActual.id)}
            onCancelar={() => {
              setEditando(null)
              setErrorModal('')
            }}
          />
        )}
      </Modal>

      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-gray-400">
              <th className="px-5 py-3">Ruta</th>
              <th className="px-5 py-3">Zona</th>
              <th className="px-5 py-3">Recolector</th>
              <th className="px-5 py-3">Entregas</th>
              <th className="px-5 py-3">Estado</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {rutas.map((r) => (
              <tr key={r.id} className="border-t text-gray-700">
                <td className="px-5 py-3 font-medium">{r.nombre}</td>
                <td className="px-5 py-3">{r.zona || '—'}</td>
                <td className="px-5 py-3">
                  {r.recolector ? `${r.recolector.nombres} ${r.recolector.apellidos}` : '—'}
                </td>
                <td className="px-5 py-3">{r._count?.entregas ?? 0}</td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      r.estado === 'ACTIVA'
                        ? 'bg-emerald-100 text-emerald-700'
                        : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {r.estado}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => {
                      setErrorModal('')
                      setEditando(r.id)
                    }}
                    className="text-sm font-medium text-emerald-600"
                  >
                    Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
