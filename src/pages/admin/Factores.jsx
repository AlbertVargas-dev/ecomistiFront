import { useEffect, useState } from 'react'
import { api, mensajeError } from '../../lib/api.js'
import FormCrud from './FormCrud.jsx'

const CAMPOS = [
  {
    clave: 'tipoResiduo',
    label: 'Tipo de residuo',
    opciones: [
      { value: 'RECICLABLE', label: 'Reciclable' },
      { value: 'ORGANICO', label: 'Orgánico' },
    ],
  },
  { clave: 'factor', label: 'Puntos por kg', tipo: 'number', required: true, placeholder: '10' },
  { clave: 'vigenteDesde', label: 'Vigente desde (vacío = hoy)', placeholder: '2026-11-07T00:00:00.000Z' },
]

export default function Factores() {
  const [factores, setFactores] = useState([])
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')

  async function cargar() {
    try {
      const { data } = await api.get('/admin/factores')
      setFactores(data)
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
      await api.post('/admin/factores', {
        tipoResiduo: form.tipoResiduo,
        factor: Number(form.factor),
        vigenteDesde: form.vigenteDesde || undefined,
      })
      setMsg('Factor creado. Los factores nunca se editan: se versionan.')
      cargar()
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Factores de Puntos</h1>
      <p className="text-sm text-gray-500">
        Conversión kg → puntos, versionada por fecha de captura
      </p>
      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}
      {msg && (
        <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{msg}</p>
      )}

      <FormCrud
        titulo="Nuevo factor"
        campos={CAMPOS}
        inicial={{ tipoResiduo: 'RECICLABLE' }}
        onGuardar={guardar}
      />

      <div className="mt-6 overflow-x-auto rounded-2xl bg-white shadow-sm">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs uppercase text-gray-400">
              <th className="px-5 py-3">Tipo</th>
              <th className="px-5 py-3">Puntos/kg</th>
              <th className="px-5 py-3">Vigente desde</th>
            </tr>
          </thead>
          <tbody>
            {factores.map((f) => (
              <tr key={f.id} className="border-t text-gray-700">
                <td className="px-5 py-3">{f.tipoResiduo}</td>
                <td className="px-5 py-3 font-semibold">{Number(f.factor)}</td>
                <td className="px-5 py-3">
                  {new Date(f.vigenteDesde).toLocaleDateString('es-PE')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
