import { useEffect, useState } from 'react'
import QRCode from 'qrcode'
import { api, mensajeError } from '../../lib/api.js'

/**
 * Mi QR: genera la imagen QR real del qrCode (UUID) con la librería `qrcode`.
 * El recolector la escanea y el backend recibe el UUID como texto.
 */
export default function MiQr() {
  const [qr, setQr] = useState('')
  const [imagen, setImagen] = useState('')
  const [error, setError] = useState('')
  const [msg, setMsg] = useState('')

  async function generarImagen(codigo) {
    const url = await QRCode.toDataURL(codigo, {
      width: 320,
      margin: 2,
      color: { dark: '#111827', light: '#ffffff' },
    })
    setImagen(url)
  }

  useEffect(() => {
    api
      .get('/usuarios/me')
      .then(({ data }) => {
        setQr(data.qrCode)
        generarImagen(data.qrCode)
      })
      .catch((err) => setError(mensajeError(err)))
  }, [])

  async function regenerar() {
    setError('')
    setMsg('')
    try {
      const { data } = await api.post('/usuarios/me/regenerar-qr')
      setQr(data.qrCode)
      await generarImagen(data.qrCode)
      setMsg('QR regenerado. El anterior ya no funciona.')
    } catch (err) {
      setError(mensajeError(err))
    }
  }

  function descargar() {
    const a = document.createElement('a')
    a.href = imagen
    a.download = 'mi-qr.png'
    a.click()
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900">Mi QR</h1>
      <p className="text-sm text-gray-500">
        Mostrá este código al recolector cuando entregues residuos
      </p>
      {error && (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
      )}
      {msg && (
        <p className="mt-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700">{msg}</p>
      )}
      <div className="mt-6 max-w-sm rounded-2xl bg-white p-6 text-center shadow-sm">
        {imagen ? (
          <img
            src={imagen}
            alt="Código QR de EcoMisti"
            className="mx-auto h-56 w-56 rounded-xl"
          />
        ) : (
          <div className="mx-auto flex h-56 w-56 items-center justify-center rounded-xl bg-gray-100 text-sm text-gray-400">
            Generando QR…
          </div>
        )}
        <p className="mt-3 break-all font-mono text-xs text-gray-500">{qr}</p>
        <div className="mt-4 flex gap-2">
          <button
            onClick={descargar}
            disabled={!imagen}
            className="flex-1 rounded-lg border px-3 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 disabled:opacity-60"
          >
            Descargar PNG
          </button>
          <button
            onClick={regenerar}
            className="flex-1 rounded-lg bg-emerald-600 px-3 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
          >
            Regenerar QR
          </button>
        </div>
        <p className="mt-2 text-xs text-gray-400">
          Al regenerar, el QR anterior queda inválido al instante.
        </p>
      </div>
    </div>
  )
}
