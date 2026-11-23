import { useCallback, useEffect, useRef } from 'react'
import L from 'leaflet'
import { CENTRO_AREQUIPA, ICONO_PIN } from '../lib/mapa.js'

/** Mapa interactivo de solo lectura con los puntos de EcoReciclaje activos. */
export default function MapaPuntos({
  puntos = [],
  puntoActivoId = null,
  onSeleccionarPunto,
}) {
  const contenedorRef = useRef(null)
  const mapaRef = useRef(null)
  const capaRef = useRef(null)
  const marcadoresRef = useRef({})
  const onSelectRef = useRef(onSeleccionarPunto)

  useEffect(() => {
    onSelectRef.current = onSeleccionarPunto
  }, [onSeleccionarPunto])

  const encuadrarTodos = useCallback((lista) => {
    const mapa = mapaRef.current
    if (!mapa) return
    const coords = lista
      .filter((p) => Number.isFinite(p.latitud) && Number.isFinite(p.longitud))
      .map((p) => [p.latitud, p.longitud])
    if (coords.length === 1) {
      mapa.setView(coords[0], 15)
    } else if (coords.length > 1) {
      mapa.fitBounds(coords, { padding: [32, 32], maxZoom: 15 })
    } else {
      mapa.setView(CENTRO_AREQUIPA, 13)
    }
  }, [])

  useEffect(() => {
    const el = contenedorRef.current
    if (!el || mapaRef.current) return

    const mapa = L.map(el, { zoomControl: true }).setView(CENTRO_AREQUIPA, 13)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(mapa)

    const capa = L.layerGroup().addTo(mapa)
    mapaRef.current = mapa
    capaRef.current = capa

    const raf = requestAnimationFrame(() => mapa.invalidateSize())
    const ro = new ResizeObserver(() => mapa.invalidateSize())
    ro.observe(el)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      mapa.remove()
      mapaRef.current = null
      capaRef.current = null
      marcadoresRef.current = {}
    }
  }, [])

  useEffect(() => {
    const mapa = mapaRef.current
    const capa = capaRef.current
    if (!mapa || !capa) return

    capa.clearLayers()
    marcadoresRef.current = {}

    for (const p of puntos) {
      if (!Number.isFinite(p.latitud) || !Number.isFinite(p.longitud)) continue
      const marker = L.marker([p.latitud, p.longitud], { icon: ICONO_PIN }).addTo(capa)
      const urlMaps = `https://www.google.com/maps/search/?api=1&query=${p.latitud},${p.longitud}`
      marker.bindPopup(
        `<div style="min-width:180px;line-height:1.4">
          <b>${escapeHtml(p.nombre)}</b><br/>
          <span style="color:#4b5563">${escapeHtml(p.distrito)} · ${escapeHtml(p.direccion)}</span><br/>
          <small>🕐 ${escapeHtml(p.horario)}</small><br/>
          <a href="${urlMaps}" target="_blank" rel="noopener noreferrer" style="color:#059669;font-weight:600;text-decoration:underline;display:inline-block;margin-top:4px">Cómo llegar ↗</a>
        </div>`,
      )
      marker.on('click', () => onSelectRef.current?.(p.id))
      marcadoresRef.current[p.id] = marker
    }

    encuadrarTodos(puntos)
  }, [puntos, encuadrarTodos])

  useEffect(() => {
    if (!puntoActivoId) return
    const mapa = mapaRef.current
    const marker = marcadoresRef.current[puntoActivoId]
    if (!mapa || !marker) return
    mapa.setView(marker.getLatLng(), 16, { animate: true })
    marker.openPopup()
  }, [puntoActivoId])

  return (
    <div className="relative">
      <div
        ref={contenedorRef}
        className="z-0 h-80 w-full overflow-hidden rounded-xl border border-gray-200 lg:h-[360px]"
      />
      {puntoActivoId && puntos.length > 1 && (
        <button
          type="button"
          onClick={() => {
            onSeleccionarPunto?.(null)
            mapaRef.current?.closePopup()
            encuadrarTodos(puntos)
          }}
          className="absolute right-3 top-3 z-[400] rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-gray-700 shadow-md hover:bg-gray-50"
        >
          Ver todos los puntos
        </button>
      )}
    </div>
  )
}

function escapeHtml(txt) {
  return String(txt ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
