/**
 * Tabla "Recolecciones Recientes": entregas del endpoint /admin/entregas.
 * columnas: ID, Fecha, Tipo, Peso, Estado, Personal asignado.
 */
export default function TablaEntregas({ entregas = [] }) {
  if (entregas.length === 0) {
    return (
      <p className="flex h-32 items-center justify-center text-sm text-gray-400">
        Sin entregas en el período
      </p>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase text-gray-400">
            <th className="py-2 pr-4">ID</th>
            <th className="py-2 pr-4">Fecha y hora</th>
            <th className="py-2 pr-4">Ruta</th>
            <th className="py-2 pr-4">Tipo de Residuo</th>
            <th className="py-2 pr-4">Peso (kg)</th>
            <th className="py-2 pr-4">Volumen (m³)</th>
            <th className="py-2 pr-4">Puntos</th>
            <th className="py-2 pr-4">Estado</th>
            <th className="py-2">Personal Asignado</th>
          </tr>
        </thead>
        <tbody>
          {entregas.map((e) => (
            <tr key={e.id} className="border-t text-gray-700">
              <td className="py-2.5 pr-4 font-mono text-xs">{e.id.slice(0, 8)}</td>
              <td className="py-2.5 pr-4">
                {new Date(e.fechaCaptura).toLocaleString('es-PE')}
              </td>
              <td className="py-2.5 pr-4">{e.ruta?.nombre || '—'}</td>
              <td className="py-2.5 pr-4">
                {e.detalles?.map((d) => d.tipoResiduo).join(', ') || '—'}
              </td>
              <td className="py-2.5 pr-4">
                {e.detalles
                  ?.reduce((s, d) => s + Number(d.pesoKg), 0)
                  .toFixed(1) ?? e.puntosTotales}
              </td>
              <td className="py-2.5 pr-4">
                {e.volumenM3 != null ? Number(e.volumenM3).toFixed(2) : '—'}
              </td>
              <td className="py-2.5 pr-4">{e.puntosTotales}</td>
              <td className="py-2.5 pr-4">
                <span
                  className={`rounded-full px-2 py-0.5 text-xs font-medium ${
                    e.estado === 'VALIDA'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-red-100 text-red-600'
                  }`}
                >
                  {e.estado === 'VALIDA' ? 'Completado' : 'Anulada'}
                </span>
              </td>
              <td className="py-2.5">
                {e.recolector?.nombres} {e.recolector?.apellidos}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
