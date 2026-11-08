import { useEffect, useState } from 'react'
import { api, mensajeError } from '../../lib/api.js'
import FormCrud from './FormCrud.jsx'

const CAMPOS = [
  { clave: 'nombre', label: 'Nombre', required: true, placeholder: 'Parque Bolognesi - Paucarpata' },
  { clave: 'distrito', label: 'Distrito', required: true, placeholder: 'Paucarpata' },
  { clave: 'direccion', label: 'Dirección', required: true, placeholder: 'Av. Jesús 123' },
  { clave: 'latitud', label: 'Latitud', tipo: 'number', required: true, placeholder: '-16.4' },
  { clave: 'longitud', label: 'Longitud', tipo: 'number', required: true, placeholder: '-71.53' },
  { clave: 'horario', label: 'Horario', required: true, placeholder: 'Martes y Jueves 08:00 - 11:00' },
  { clave: 'activo', label: 'Estado', opciones: [{ value: true, label: 'Activo' }, { value: false, label: 'Inactivo' }] },
]

export default function Puntos() {
  const [puntos, setPuntos] = useState([])
  const [error, setError] = useState('')
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
    cargar()
  }, [])

  async function guardar(form) {
    setError('')
    setMsg('')
    try {
      const payload = {
        ...form,
        latitud: Number(form.latitud),
        longitud: Number(form.longitud),
        activo: form.activo === true || form.activo === 'true',
      }
      if (editando) await api.patch(`/admin/puntos-encuentro/${editando}`, payload)
      else await api.post('/admin/puntos-encuentro', payload)
      setMsg(editando ? 'Punto actualizado.' : 'Punto creado.')
      setEditando(null)
      cargar()
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Puntos de EcoReciclaje</h1>
      <p className="text-sm text-gray-500">Puntos activos visibles en el mapa</p>
      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}
      {msg && (
        <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{msg}</p>
      )}

      <FormCrud
        titulo={editando ? 'Editar punto' : 'Nuevo punto'}
        campos={CAMPOS}
        inicial={
          editando
            ? puntos.find((p) => p.id === editando) || {}
            : { activo: true }
        }
        onGuardar={guardar}
        onCancelar={editando ? () => setEditando(null) : null}
      />

      <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {puntos.map((p) => (
          <div key={p.id} className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="font-semibold text-gray-800">{p.nombre}</h2>
            <p className="text-sm text-gray-500">{p.distrito} · {p.direccion}</p>
            <p className="mt-2 text-sm text-gray-600">🕐 {p.horario}</p>
            <p className="text-xs text-gray-400">📍 {p.latitud}, {p.longitud}</p>
            <button
              onClick={() => setEditando(p.id)}
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
