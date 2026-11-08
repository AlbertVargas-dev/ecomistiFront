import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api, mensajeError } from '../../lib/api.js'

/**
 * Panel/Home del recolector: resumen de su actividad + accesos rápidos.
 * (Antes el login mandaba directo al escáner sin home — corregido.)
 */
export default function PanelRecolector() {
  const [entregas, setEntregas] = useState([])
  const [error, setError] = useState('')

  useEffect(() => {
    api
      .get('/recoleccion/mis-entregas')
      .then(({ data }) => setEntregas(data))
      .catch((err) => setError(mensajeError(err)))
  }, [])

  const totalKg = entregas.reduce(
    (s, e) => s + e.detalles.reduce((x, d) => x + Number(d.pesoKg), 0),
    0,
  )
  const totalPuntos = entregas.reduce((s, e) => s + e.puntosTotales, 0)

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Mi Panel</h1>
      <p className="text-sm text-gray-500">Tu actividad como recolector</p>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      <div className="mt-6 grid gap-5 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Entregas registradas</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{entregas.length}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Kg recolectados</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{totalKg.toFixed(1)} kg</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-sm text-gray-500">Puntos generados</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{totalPuntos}</p>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <Link
          to="/recolector/escanear"
          className="rounded-lg bg-emerald-600 px-5 py-2.5 font-semibold text-white hover:bg-emerald-700"
        >
          📷 Escanear QR / Ingresar DNI
        </Link>
        <Link
          to="/recolector/sincronizar"
          className="rounded-lg border px-5 py-2.5 font-semibold text-gray-700 hover:bg-gray-50"
        >
          ⟳ Sincronizar
        </Link>
      </div>

      <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm">
        <h2 className="font-semibold text-gray-800">Mis últimas entregas</h2>
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs uppercase text-gray-400">
                <th className="py-2 pr-4">Fecha</th>
                <th className="py-2 pr-4">Ciudadano</th>
                <th className="py-2 pr-4">Peso</th>
                <th className="py-2">Puntos</th>
              </tr>
            </thead>
            <tbody>
              {entregas.map((e) => (
                <tr key={e.id} className="border-t text-gray-700">
                  <td className="py-2.5 pr-4">
                    {new Date(e.fechaCaptura).toLocaleString('es-PE')}
                  </td>
                  <td className="py-2.5 pr-4">
                    {e.usuario?.nombres} {e.usuario?.apellidos}
                  </td>
                  <td className="py-2.5 pr-4">
                    {e.detalles
                      .reduce((s, d) => s + Number(d.pesoKg), 0)
                      .toFixed(1)}{' '}
                    kg
                  </td>
                  <td className="py-2.5 font-semibold text-emerald-600">
                    +{e.puntosTotales}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {entregas.length === 0 && !error && (
            <p className="py-4 text-sm text-gray-400">
              Aún no registraste entregas. Escaneá el QR de un ciudadano.
            </p>
          )}
        </div>
      </div>
    </div>
  )
}
