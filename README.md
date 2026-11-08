# EcoMisti Frontend

Frontend de **EcoMisti** (React 19 + Vite + Tailwind CSS v4) que consume el backend `ecomistiBack`.

## Stack

React 19 · Vite 8 · Tailwind v4 · react-router-dom · axios · html5-qrcode · qrcode

## Ejecución

```bash
pnpm install
cp .env.example .env   # VITE_API_URL=http://localhost:3000/api
pnpm run dev           # http://localhost:5173
pnpm run build
```

## Vistas por rol

- **Admin:** Panel General (resumen, tendencia, mapa, tabla), Recolecciones, Rutas, Puntos, Reportes, Estadísticas, EcoPuntos, Recompensas, Factores, Ciudadanos, Vehículos, Personal, Incidencias, Cooperativas (Copaff).
- **Ciudadano/Urbanización:** Mi Panel (puntos, kg, recompensas), Recompensas, Vouchers, Mi QR (real), Movimientos, Entregas, Mi Perfil, Reportar Incidencia, campanita de notificaciones.
- **Recolector:** Mi Panel, Escanear QR (cámara) o ingresar DNI, Sincronizar offline.

## Documentación

Ver [`docs/`](docs/README.md) — índice con overview, setup Tailwind, arquitectura, auth, pantallas por rol, sync y checklist (incl. `08-tareas-backend-diseno.md`).

Backend: `http://localhost:3000/api` · Swagger: `http://localhost:3000/api/docs`
