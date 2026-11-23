import { useState } from 'react'
import { api, mensajeError } from '../../lib/api.js'

/**
 * Sincronizar: enviar entregas capturadas offline.
 * Cada captura se guarda en localStorage con su idempotencyKey;
 * al reintentar se reutiliza la MISMA clave (no duplica puntos).
 */
const CLAVE_COLA = 'cola_sync_recolector'

function leerCola() {
  try {
    return JSON.parse(localStorage.getItem(CLAVE_COLA) || '[]')
  } catch {
    return []
  }
}

export default function Sincronizar() {
  const [cola, setCola] = useState(leerCola)
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')

  function guardarCola(nueva) {
    setCola(nueva)
    localStorage.setItem(CLAVE_COLA, JSON.stringify(nueva))
  }

  async function capturar() {
    // Demo: captura manual mínima (en prod viene del escáner offline).
    const captura = {
      idempotencyKey: crypto.randomUUID(),
      qrCode: prompt('Pegá el qrCode del ciudadano:') || '',
      fechaCaptura: new Date().toISOString(),
      detalles: [{ tipoResiduo: 'RECICLABLE', pesoKg: 1 }],
    }
    if (!captura.qrCode) return
    guardarCola([...cola, captura])
    setMsg('Captura guardada en la cola. Podés sincronizar cuando tengas red.')
  }

  async function sincronizar() {
    setError('')
    setMsg('')
    if (cola.length === 0) return
    try {
      const { data } = await api.post('/recoleccion/sincronizar-entrega', {
        deviceId: 'web-recolector',
        entregas: cola,
      })
      const aceptadas = data.resultados.filter(
        (r) => r.estado === 'ACEPTADA' || r.estado === 'DUPLICADA',
      )
      const pendientes = data.resultados.filter((r) => r.estado === 'RECHAZADA')
      // Las aceptadas/duplicadas salen de la cola; las rechazadas quedan para revisar.
      guardarCola(
        cola.filter((c) =>
          pendientes.some((r) => r.idempotencyKey === c.idempotencyKey),
        ),
      )
      setMsg(
        `Sincronizado: ${aceptadas.length} aceptadas, ${pendientes.length} rechazadas.`,
      )
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Sincronizar entregas</h1>
      <p className="text-sm text-gray-500">
        Cola offline: {cola.length} captura(s) pendiente(s)
      </p>
      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}
      {msg && (
        <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{msg}</p>
      )}

      <div className="mt-4 flex gap-2">
        <button
          onClick={capturar}
          className="rounded-lg border px-4 py-2 text-sm font-semibold hover:bg-gray-50"
        >
          + Captura manual (demo)
        </button>
        <button
          onClick={sincronizar}
          disabled={cola.length === 0}
          className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
        >
          Sincronizar ahora
        </button>
      </div>

      <ul className="mt-4 space-y-2">
        {cola.map((c) => (
          <li key={c.idempotencyKey} className="rounded-xl bg-white p-4 text-sm shadow-sm">
            <p className="font-mono text-xs">{c.idempotencyKey}</p>
            <p className="text-gray-500">
              {new Date(c.fechaCaptura).toLocaleString('es-PE')} ·{' '}
              {c.detalles.map((d) => `${d.tipoResiduo} ${d.pesoKg}kg`).join(', ')}
            </p>
          </li>
        ))}
      </ul>
    </div>
  )
}
