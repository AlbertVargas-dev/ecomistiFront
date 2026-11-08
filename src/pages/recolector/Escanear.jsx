import { useEffect, useRef, useState } from 'react'
import { api, mensajeError } from '../../lib/api.js'

/**
 * Escanear QR o ingresar DNI → identificar ciudadano → registrar entrega.
 * El idempotencyKey se genera al capturar y se conserva al reintentar.
 * El escáner se carga dinámicamente: si la cámara falla, hay fallback manual.
 */
export default function Escanear() {
  const [modo, setModo] = useState('qr') // 'qr' | 'dni'
  const [dni, setDni] = useState('')
  const [qrManual, setQrManual] = useState('')
  const [identificado, setIdentificado] = useState(null)
  const [error, setError] = useState('')
  const [avisoCamara, setAvisoCamara] = useState('')
  const [detalles, setDetalles] = useState([
    { tipoResiduo: 'RECICLABLE', pesoKg: '' },
  ])
  const [resultado, setResultado] = useState(null)
  const [cargando, setCargando] = useState(false)
  const scannerRef = useRef(null)
  const escaneando = useRef(false)

  // --- Escáner QR (cámara) con carga dinámica y fallback ---
  useEffect(() => {
    if (modo !== 'qr' || identificado) return
    let cancelado = false
    let scanner = null

    async function iniciar() {
      try {
        const { Html5Qrcode } = await import('html5-qrcode')
        if (cancelado) return
        scanner = new Html5Qrcode('lector-qr')
        scannerRef.current = scanner
        escaneando.current = true
        await scanner.start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          async (texto) => {
            if (escaneando.current && !cancelado) {
              escaneando.current = false
              await scanner.stop().catch(() => {})
              identificarQr(texto)
            }
          },
          () => {},
        )
      } catch {
        if (!cancelado) {
          setAvisoCamara(
            'No se pudo iniciar la cámara. Pegá el código del QR manualmente abajo.',
          )
        }
      }
    }

    iniciar()
    return () => {
      cancelado = true
      if (escaneando.current && scanner) {
        escaneando.current = false
        scanner.stop().catch(() => {})
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modo, identificado])

  async function identificarQr(qrCode) {
    setError('')
    try {
      const { data } = await api.post('/recoleccion/identificar-qr', { qrCode })
      setIdentificado({ ...data, qrCode })
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  async function identificarDni(e) {
    e.preventDefault()
    setError('')
    try {
      const { data } = await api.post('/recoleccion/identificar-dni', { dni })
      setIdentificado(data)
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  function agregarDetalle() {
    if (detalles.length < 20)
      setDetalles([...detalles, { tipoResiduo: 'RECICLABLE', pesoKg: '' }])
  }

  function quitarDetalle(i) {
    setDetalles(detalles.filter((_, idx) => idx !== i))
  }

  async function sincronizar() {
    setError('')
    setResultado(null)
    setCargando(true)
    try {
      const { data } = await api.post('/recoleccion/sincronizar-entrega', {
        deviceId: 'web-recolector',
        entregas: [
          {
            idempotencyKey: crypto.randomUUID(),
            qrCode: identificado.qrCode,
            fechaCaptura: new Date().toISOString(),
            detalles: detalles.map((d) => ({
              tipoResiduo: d.tipoResiduo,
              pesoKg: Number(d.pesoKg),
            })),
          },
        ],
      })
      setResultado(data.resultados[0])
    } catch (err) {
      setError(mensajeError(err))
    } finally {
      setCargando(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Escanear QR</h1>
      <p className="text-sm text-gray-500">
        Identificá al ciudadano por su QR o por su DNI (único)
      </p>

      <div className="mt-4 flex gap-2">
        <button
          onClick={() => setModo('qr')}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${
            modo === 'qr' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600'
          }`}
        >
          📷 Escanear QR
        </button>
        <button
          onClick={() => setModo('dni')}
          className={`rounded-lg px-4 py-2 text-sm font-semibold ${
            modo === 'dni' ? 'bg-emerald-600 text-white' : 'bg-white text-gray-600'
          }`}
        >
          ⌨ Ingresar DNI
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}

      {modo === 'qr' && !identificado && (
        <div className="mt-4 max-w-md">
          <div id="lector-qr" className="overflow-hidden rounded-2xl" />
          {avisoCamara && (
            <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-700">
              {avisoCamara}
            </p>
          )}
          <form
            className="mt-3 flex gap-2"
            onSubmit={(e) => {
              e.preventDefault()
              if (qrManual.trim()) identificarQr(qrManual.trim())
            }}
          >
            <input
              value={qrManual}
              onChange={(e) => setQrManual(e.target.value)}
              placeholder="O pegá el código del QR aquí"
              className="flex-1 rounded-lg border bg-white px-3 py-2 text-sm outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              Usar código
            </button>
          </form>
        </div>
      )}

      {modo === 'dni' && !identificado && (
        <form onSubmit={identificarDni} className="mt-4 flex max-w-md gap-2">
          <input
            value={dni}
            onChange={(e) => setDni(e.target.value)}
            placeholder="DNI del ciudadano (8 dígitos)"
            pattern="\d{8}"
            required
            className="flex-1 rounded-lg border bg-white px-3 py-2 outline-none focus:border-emerald-500"
          />
          <button
            type="submit"
            className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700"
          >
            Buscar
          </button>
        </form>
      )}

      {identificado && (
        <div className="mt-6 max-w-xl rounded-2xl bg-white p-5 shadow-sm">
          <p className="text-lg font-bold text-gray-900">
            {identificado.nombreParcial}
          </p>
          <p className="text-sm text-gray-500">
            Tipo de cuenta: {identificado.tipoCuenta}
          </p>

          <h2 className="mt-5 font-semibold text-gray-800">Registrar entrega</h2>
          <div className="mt-3 space-y-2">
            {detalles.map((d, i) => (
              <div key={i} className="flex gap-2">
                <select
                  value={d.tipoResiduo}
                  onChange={(e) =>
                    setDetalles(
                      detalles.map((x, idx) =>
                        idx === i ? { ...x, tipoResiduo: e.target.value } : x,
                      ),
                    )
                  }
                  className="rounded-lg border px-3 py-2"
                >
                  <option value="RECICLABLE">Reciclable</option>
                  <option value="ORGANICO">Orgánico</option>
                </select>
                <input
                  type="number"
                  min="0.1"
                  max="50"
                  step="0.1"
                  required
                  placeholder="kg (0.1–50)"
                  value={d.pesoKg}
                  onChange={(e) =>
                    setDetalles(
                      detalles.map((x, idx) =>
                        idx === i ? { ...x, pesoKg: e.target.value } : x,
                      ),
                    )
                  }
                  className="w-32 rounded-lg border px-3 py-2 outline-none focus:border-emerald-500"
                />
                {detalles.length > 1 && (
                  <button
                    type="button"
                    onClick={() => quitarDetalle(i)}
                    className="text-red-500"
                  >
                    ✕
                  </button>
                )}
              </div>
            ))}
          </div>
          <button
            type="button"
            onClick={agregarDetalle}
            className="mt-2 text-sm text-emerald-600 font-medium"
          >
            + Agregar residuo (máx. 20)
          </button>

          <button
            onClick={sincronizar}
            disabled={cargando}
            className="mt-4 w-full rounded-lg bg-emerald-600 py-2.5 font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
          >
            {cargando ? 'Sincronizando…' : 'Sincronizar entrega'}
          </button>

          {resultado && (
            <p
              className={`mt-3 rounded-lg px-3 py-2 text-sm ${
                resultado.estado === 'ACEPTADA'
                  ? 'bg-emerald-50 text-emerald-700'
                  : 'bg-red-50 text-red-600'
              }`}
            >
              {resultado.estado}
              {resultado.motivo ? ` — ${resultado.motivo}` : ''}
              {resultado.puntosOtorgados != null &&
                ` · ${resultado.puntosOtorgados} puntos acreditados`}
            </p>
          )}

          <button
            onClick={() => {
              setIdentificado(null)
              setResultado(null)
              setDetalles([{ tipoResiduo: 'RECICLABLE', pesoKg: '' }])
            }}
            className="mt-3 text-sm text-gray-500 underline"
          >
            Identificar otro ciudadano
          </button>
        </div>
      )}
    </div>
  )
}
