import { useEffect, useState } from 'react'
import { api, mensajeError } from '../../lib/api.js'
import Modal from '../../components/Modal.jsx'
import FormCrud from './FormCrud.jsx'

const CAMPOS = [
  { clave: 'placa', label: 'Placa', required: true, placeholder: 'ABC-123' },
  { clave: 'tipo', label: 'Tipo', required: true, placeholder: 'Camion' },
  { clave: 'capacidadKg', label: 'Capacidad (kg)', tipo: 'number', required: true, placeholder: '500' },
  { clave: 'activo', label: 'Estado', opciones: [{ value: true, label: 'Activo' }, { value: false, label: 'Inactivo' }] },
]

export default function Vehiculos() {
  const [vehiculos, setVehiculos] = useState([])
  const [recolectores, setRecolectores] = useState([])
  const [error, setError] = useState('')
  const [errorModal, setErrorModal] = useState('')
  const [msg, setMsg] = useState('')
  const [editando, setEditando] = useState(null)

  async function cargar() {
    try {
      const [{ data: v }, { data: r }] = await Promise.all([
        api.get('/admin/vehiculos'),
        api.get('/admin/recolectores'),
      ])
      setVehiculos(v)
      setRecolectores(r)
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  useEffect(() => {
    let activo = true
    Promise.all([api.get('/admin/vehiculos'), api.get('/admin/recolectores')])
      .then(([{ data: v }, { data: r }]) => {
        if (!activo) return
        setVehiculos(v)
        setRecolectores(r)
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
        placa: form.placa,
        tipo: form.tipo,
        capacidadKg: Number(form.capacidadKg),
        recolectorId: form.recolectorId || undefined,
        activo: form.activo === true || form.activo === 'true',
      }
      if (idEdicion) await api.patch(`/admin/vehiculos/${idEdicion}`, payload)
      else await api.post('/admin/vehiculos', payload)
      setMsg(idEdicion ? 'Vehículo actualizado.' : 'Vehículo creado.')
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

  const campos = [
    ...CAMPOS,
    {
      clave: 'recolectorId',
      label: 'Recolector asignado',
      opciones: [
        { value: '', label: 'Sin asignar' },
        ...recolectores.map((r) => ({
          value: r.id,
          label: `${r.nombres} ${r.apellidos}`,
        })),
      ],
    },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Vehículos</h1>
      <p className="text-sm text-gray-500">Flota asignada a recolectores</p>
      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}
      {msg && (
        <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{msg}</p>
      )}

      <FormCrud
        titulo="Nuevo vehículo"
        campos={campos}
        inicial={{ activo: true }}
        onGuardar={(form) => guardar(form)}
      />

      <Modal
        abierto={!!editando}
        titulo="Editar vehículo"
        error={errorModal}
        onCerrar={() => {
          setEditando(null)
          setErrorModal('')
        }}
      >
        <FormCrud
          key={editando}
          enModal
          campos={campos}
          inicial={vehiculos.find((v) => v.id === editando) || {}}
          onGuardar={(form) => guardar(form, editando)}
          onCancelar={() => {
            setEditando(null)
            setErrorModal('')
          }}
        />
      </Modal>

      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-gray-400">
              <th className="px-5 py-3">Placa</th>
              <th className="px-5 py-3">Tipo</th>
              <th className="px-5 py-3">Capacidad (kg)</th>
              <th className="px-5 py-3">Recolector</th>
              <th className="px-5 py-3">Estado</th>
              <th className="px-5 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {vehiculos.map((v) => (
              <tr key={v.id} className="border-t text-gray-700">
                <td className="px-5 py-3 font-mono font-semibold">{v.placa}</td>
                <td className="px-5 py-3">{v.tipo}</td>
                <td className="px-5 py-3">{v.capacidadKg}</td>
                <td className="px-5 py-3">
                  {v.recolector ? `${v.recolector.nombres} ${v.recolector.apellidos}` : '—'}
                </td>
                <td className="px-5 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                      v.activo ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-500'
                    }`}
                  >
                    {v.activo ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td className="px-5 py-3">
                  <button
                    onClick={() => {
                      setErrorModal('')
                      setEditando(v.id)
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
