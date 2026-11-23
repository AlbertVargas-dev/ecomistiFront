import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

export const CENTRO_AREQUIPA = [-16.409047, -71.537451]

export const ICONO_PIN = L.divIcon({
  className: '',
  html: `<div style="width:28px;height:28px;border-radius:9999px 9999px 9999px 0;transform:rotate(-45deg);background:#059669;border:3px solid #fff;box-shadow:0 2px 8px rgba(0,0,0,.35);"></div>`,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
})
