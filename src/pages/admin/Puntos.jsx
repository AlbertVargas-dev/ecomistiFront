import { useEffect, useState } from 'react'
import { api, mensajeError } from '../../lib/api.js'
import Modal from '../../components/Modal.jsx'
import SelectorMapa from '../../components/SelectorMapa.jsx'

const VACIO = {
  nombre: '',
  distrito: '',
  direccion: '',
  latitud: '',
  longitud: '',
  horario: '',
  activo: true,
}

function FormPunto({ inicial, textoBoton, onGuardar, onCancelar, enModal = false }) {
  const [form, setForm] = useState(inicial)
  const [nombreEditadoManual, setNombreEditadoManual] = useState(
    Boolean(inicial.nombre),
  )

  const input =
    'mt-1 w-full rounded-lg border px-3 py-2 outline-none focus:border-emerald-500'

  function alSeleccionarEnMapa({
    latitud,
    longitud,
    distrito,
    direccion,
    sugerenciaNombre,
  }) {
    setForm((prev) => ({
      ...prev,
      latitud,
      longitud,
      ...(distrito ? { distrito } : {}),
      ...(direccion ? { direccion } : {}),
      ...(!nombreEditadoManual && sugerenciaNombre
        ? { nombre: sugerenciaNombre }
        : {}),
    }))
  }

  async function submit(e) {
    e.preventDefault()
    const ok = await onGuardar(form)
    if (ok && !onCancelar) {
      setForm(inicial)
      setNombreEditadoManual(false)
    }
  }

  return (
    <form
      onSubmit={submit}
      className={
        enModal
          ? 'grid gap-6 lg:grid-cols-2'
          : 'mt-6 grid gap-6 rounded-2xl bg-white p-5 shadow-sm lg:grid-cols-2'
      }
    >
      <div className="grid gap-3 sm:grid-cols-2">
        {!enModal && (
          <h2 className="font-semibold text-gray-800 sm:col-span-2">Nuevo punto</h2>
        )}

        <label className="text-sm font-medium text-gray-700">
          Nombre
          <input
            value={form.nombre}
            onChange={(e) => {
              setNombreEditadoManual(e.target.value.trim().length > 0)
              setForm({ ...form, nombre: e.target.value })
            }}
            required
            placeholder="Parque Bolognesi - Paucarpata"
            className={input}
          />
        </label>
        <label className="text-sm font-medium text-gray-700">
          Distrito
          <input
            value={form.distrito}
            onChange={(e) => setForm({ ...form, distrito: e.target.value })}
            required
            placeholder="Paucarpata"
            className={input}
          />
        </label>
        <label className="text-sm font-medium text-gray-700 sm:col-span-2">
          Dirección
          <input
            value={form.direccion}
            onChange={(e) => setForm({ ...form, direccion: e.target.value })}
            required
            placeholder="Av. Jesús 123"
            className={input}
          />
        </label>
        <label className="text-sm font-medium text-gray-700">
          Latitud
          <input
            type="number"
            step="any"
            value={form.latitud}
            onChange={(e) => setForm({ ...form, latitud: e.target.value })}
            required
            placeholder="-16.409047"
            className={input}
          />
        </label>
        <label className="text-sm font-medium text-gray-700">
          Longitud
          <input
            type="number"
            step="any"
            value={form.longitud}
            onChange={(e) => setForm({ ...form, longitud: e.target.value })}
            required
            placeholder="-71.537451"
            className={input}
          />
        </label>
        <label className="text-sm font-medium text-gray-700">
          Horario
          <input
            value={form.horario}
            onChange={(e) => setForm({ ...form, horario: e.target.value })}
            required
            placeholder="Martes y Jueves 08:00 - 11:00"
            className={input}
          />
        </label>
        <label className="text-sm font-medium text-gray-700">
          Estado
          <select
            value={String(form.activo)}
            onChange={(e) => setForm({ ...form, activo: e.target.value === 'true' })}
            className={input}
          >
            <option value="true">Activo</option>
            <option value="false">Inactivo</option>
          </select>
        </label>

        <div className="flex gap-2 pt-1 sm:col-span-2">
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
      </div>

      <SelectorMapa
        latitud={form.latitud}
        longitud={form.longitud}
        onSeleccionar={alSeleccionarEnMapa}
      />
    </form>
  )
}

export default function Puntos() {
  const [puntos, setPuntos] = useState([])
  const [error, setError] = useState('')
  const [errorModal, setErrorModal] = useState('')
  const [msg, setMsg] = useState('')
  const [editando, setEditando] = useState(null)

  async function cargar() {
    try {
      const { data } = await api.get('/puntos-encuentro')
      setPuntos(data)
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  useEffect(() => {
    let activo = true
    api
      .get('/puntos-encuentro')
      .then(({ data }) => activo && setPuntos(data))
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
        distrito: form.distrito,
        direccion: form.direccion,
        latitud: Number(form.latitud),
        longitud: Number(form.longitud),
        horario: form.horario,
        activo: form.activo === true || form.activo === 'true',
      }
      if (idEdicion) await api.patch(`/admin/puntos-encuentro/${idEdicion}`, payload)
      else await api.post('/admin/puntos-encuentro', payload)
      setMsg(idEdicion ? 'Punto actualizado.' : 'Punto creado.')
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

  const puntoActual = puntos.find((p) => p.id === editando)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Puntos de EcoReciclaje</h1>
      <p className="text-sm text-gray-500">
        Selecciona un punto en el mapa para completar su ubicación automáticamente
      </p>
      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}
      {msg && (
        <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{msg}</p>
      )}

      <FormPunto
        inicial={VACIO}
        textoBoton="Guardar"
        onGuardar={(form) => guardar(form)}
      />

      <Modal
        abierto={!!puntoActual}
        titulo="Editar punto"
        ancho="max-w-4xl"
        error={errorModal}
        onCerrar={() => {
          setEditando(null)
          setErrorModal('')
        }}
      >
        {puntoActual && (
          <FormPunto
            key={puntoActual.id}
            enModal
            inicial={{
              nombre: puntoActual.nombre,
              distrito: puntoActual.distrito,
              direccion: puntoActual.direccion,
              latitud: puntoActual.latitud,
              longitud: puntoActual.longitud,
              horario: puntoActual.horario,
              activo: puntoActual.activo,
            }}
            textoBoton="Guardar cambios"
            onGuardar={(form) => guardar(form, puntoActual.id)}
            onCancelar={() => {
              setEditando(null)
              setErrorModal('')
            }}
          />
        )}
      </Modal>

      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {puntos.map((p) => (
          <div key={p.id} className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-gray-800">{p.nombre}</h2>
            <p className="text-sm text-gray-500">{p.distrito} · {p.direccion}</p>
            <p className="mt-2 text-sm text-gray-600">🕐 {p.horario}</p>
            <p className="text-xs text-gray-400">📍 {p.latitud}, {p.longitud}</p>
            <button
              onClick={() => {
                setErrorModal('')
                setEditando(p.id)
              }}
              className="mt-3 text-sm font-medium text-emerald-600"
            >
              Editar
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
