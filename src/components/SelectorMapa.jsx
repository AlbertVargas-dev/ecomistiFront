import { useEffect, useRef, useState } from 'react'
import L from 'leaflet'
import { CENTRO_AREQUIPA, ICONO_PIN } from '../lib/mapa.js'

function extraerDatosLugar(data) {
  const a = data?.address || {}
  const distritoBruto =
    a.city_district ||
    a.suburb ||
    a.town ||
    a.village ||
    a.municipality ||
    a.county ||
    ''
  const distrito = distritoBruto.replace(/^Distrito de\s+/i, '').trim()
  const calle = [a.road || a.pedestrian || a.footway, a.house_number]
    .filter(Boolean)
    .join(' ')
    .trim()
  const direccion =
    calle ||
    a.neighbourhood ||
    a.quarter ||
    data?.display_name?.split(',')[0]?.trim() ||
    ''
  const lugar = a.park || a.leisure || a.amenity || a.building || a.neighbourhood
  const sugerenciaNombre = lugar
    ? distrito
      ? `${lugar} - ${distrito}`
      : lugar
    : direccion
      ? distrito
        ? `${direccion} - ${distrito}`
        : direccion
      : ''
  return { distrito, direccion, sugerenciaNombre }
}

/**
 * Minimapa interactivo (OpenStreetMap + Leaflet) para elegir coordenadas
 * y autocompletar distrito, dirección y nombre sugerido mediante geocodificación inversa.
 */
export default function SelectorMapa({ latitud, longitud, onSeleccionar }) {
  const contenedorRef = useRef(null)
  const mapaRef = useRef(null)
  const marcadorRef = useRef(null)
  const abortRef = useRef(null)
  const callbackRef = useRef(onSeleccionar)
  const elegirRef = useRef(null)
  const [busqueda, setBusqueda] = useState('')
  const [cargando, setCargando] = useState(false)
  const [aviso, setAviso] = useState('')

  useEffect(() => {
    callbackRef.current = onSeleccionar
  }, [onSeleccionar])

  async function elegirCoordenadas(lat, lng, moverVista = false) {
    const latNum = Number(lat.toFixed(6))
    const lngNum = Number(lng.toFixed(6))

    if (mapaRef.current) {
      if (marcadorRef.current) {
        marcadorRef.current.setLatLng([latNum, lngNum])
      } else {
        marcadorRef.current = L.marker([latNum, lngNum], {
          icon: ICONO_PIN,
          draggable: true,
        }).addTo(mapaRef.current)
        marcadorRef.current.on('dragend', (ev) => {
          const pos = ev.target.getLatLng()
          void elegirCoordenadas(pos.lat, pos.lng)
        })
      }
      if (moverVista) {
        mapaRef.current.setView([latNum, lngNum], Math.max(mapaRef.current.getZoom(), 16))
      }
    }

    // Actualiza coordenadas al instante mientras resuelve la dirección.
    callbackRef.current({ latitud: latNum, longitud: lngNum })
    setAviso('')
    setCargando(true)

    abortRef.current?.abort()
    const controller = new AbortController()
    abortRef.current = controller

    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latNum}&lon=${lngNum}&accept-language=es&addressdetails=1`,
        { signal: controller.signal },
      )
      if (!res.ok) throw new Error('Sin respuesta del servicio de mapa')
      const data = await res.json()
      const { distrito, direccion, sugerenciaNombre } = extraerDatosLugar(data)
      callbackRef.current({
        latitud: latNum,
        longitud: lngNum,
        distrito,
        direccion,
        sugerenciaNombre,
      })
    } catch (err) {
      if (err.name !== 'AbortError') {
        setAviso('Coordenadas fijadas; si no cargó la calle, complétala manualmente.')
      }
    } finally {
      if (abortRef.current === controller) setCargando(false)
    }
  }

  useEffect(() => {
    elegirRef.current = elegirCoordenadas
  })

  // Inicializar Leaflet una sola vez.
  useEffect(() => {
    const el = contenedorRef.current
    if (!el || mapaRef.current) return

    const latIni = Number(latitud)
    const lngIni = Number(longitud)
    const tieneIni = Number.isFinite(latIni) && Number.isFinite(lngIni) && (latIni !== 0 || lngIni !== 0)
    const centro = tieneIni ? [latIni, lngIni] : CENTRO_AREQUIPA

    const mapa = L.map(el, { zoomControl: true }).setView(centro, tieneIni ? 16 : 13)
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap',
      maxZoom: 19,
    }).addTo(mapa)

    if (tieneIni) {
      const marker = L.marker(centro, { icon: ICONO_PIN, draggable: true }).addTo(mapa)
      marker.on('dragend', (ev) => {
        const pos = ev.target.getLatLng()
        void elegirCoordenadas(pos.lat, pos.lng)
      })
      marcadorRef.current = marker
    }

    mapa.on('click', (e) => {
      void elegirCoordenadas(e.latlng.lat, e.latlng.lng)
    })

    mapaRef.current = mapa
    const raf = requestAnimationFrame(() => mapa.invalidateSize())
    const ro = new ResizeObserver(() => mapa.invalidateSize())
    ro.observe(el)

    return () => {
      cancelAnimationFrame(raf)
      ro.disconnect()
      abortRef.current?.abort()
      mapa.remove()
      mapaRef.current = null
      marcadorRef.current = null
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Sincronizar marcador cuando el usuario escribe lat/lng manualmente.
  useEffect(() => {
    const mapa = mapaRef.current
    const lat = Number(latitud)
    const lng = Number(longitud)
    if (!mapa || latitud === '' || longitud === '' || !Number.isFinite(lat) || !Number.isFinite(lng)) {
      return
    }
    if (marcadorRef.current) {
      const actual = marcadorRef.current.getLatLng()
      if (Math.abs(actual.lat - lat) < 1e-6 && Math.abs(actual.lng - lng) < 1e-6) return
      marcadorRef.current.setLatLng([lat, lng])
    } else {
      const marker = L.marker([lat, lng], { icon: ICONO_PIN, draggable: true }).addTo(mapa)
      marker.on('dragend', (ev) => {
        const pos = ev.target.getLatLng()
        void elegirRef.current?.(pos.lat, pos.lng)
      })
      marcadorRef.current = marker
    }
    mapa.panTo([lat, lng])
  }, [latitud, longitud])

  async function buscarLugar() {
    const q = busqueda.trim()
    if (!q) return
    setAviso('')
    setCargando(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?format=jsonv2&q=${encodeURIComponent(q)}&limit=1&countrycodes=pe&accept-language=es&addressdetails=1`,
      )
      const lista = await res.json()
      if (!lista.length) {
        setAviso('No se encontró ese lugar. Prueba agregando "Arequipa" o haz clic en el mapa.')
        return
      }
      const item = lista[0]
      await elegirCoordenadas(Number(item.lat), Number(item.lon), true)
    } catch {
      setAviso('No se pudo buscar la dirección. Puedes hacer clic directo en el mapa.')
    } finally {
      setCargando(false)
    }
  }

  function usarMiUbicacion() {
    if (!navigator.geolocation) {
      setAviso('Tu navegador no soporta geolocalización.')
      return
    }
    setAviso('')
    setCargando(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => void elegirCoordenadas(pos.coords.latitude, pos.coords.longitude, true),
      () => {
        setCargando(false)
        setAviso('No se pudo obtener tu ubicación actual.')
      },
    )
  }

  return (
    <div className="flex h-full flex-col">
      <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
        <span className="text-sm font-medium text-gray-700">
          Ubicación en el mapa (haz clic o arrastra el pin)
        </span>
        {cargando && (
          <span className="text-xs font-medium text-emerald-600">
            Obteniendo dirección…
          </span>
        )}
      </div>

      <div className="mb-2 flex flex-wrap gap-2">
        <input
          type="text"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              void buscarLugar()
            }
          }}
          placeholder="Buscar zona o parque (ej. Plaza Yanahuara, Arequipa)"
          className="min-w-52 flex-1 rounded-lg border px-3 py-1.5 text-sm outline-none focus:border-emerald-500"
        />
        <button
          type="button"
          onClick={() => void buscarLugar()}
          className="rounded-lg border px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Buscar
        </button>
        <button
          type="button"
          onClick={usarMiUbicacion}
          className="rounded-lg border px-3 py-1.5 text-sm font-medium text-emerald-700 hover:bg-emerald-50"
        >
          📍 Mi ubicación
        </button>
      </div>

      <div
        ref={contenedorRef}
        className="z-0 h-72 w-full flex-1 overflow-hidden rounded-xl border border-gray-200 lg:min-h-[320px]"
      />

      {aviso && <p className="mt-1.5 text-xs text-amber-700">{aviso}</p>}
    </div>
  )
}
