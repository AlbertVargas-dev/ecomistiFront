# EcoMisti Frontend

Frontend web de **EcoMisti**, plataforma de reciclaje en la que ciudadanos, urbanizaciones, recolectores y administradores gestionan entregas, puntos, recompensas y recolecciones desde una sola aplicación.

La aplicación adapta sus pantallas según el rol del usuario autenticado: cada rol tiene su propio panel, menú lateral y rutas protegidas.

## Tecnologías

| Tecnología | Uso |
|---|---|
| React 19 | Componentes e interfaz |
| Vite 8 | Servidor de desarrollo y compilación |
| Tailwind CSS v4 | Estilos |
| react-router-dom 7 | Rutas y navegación |
| axios | Peticiones HTTP con token de sesión |
| html5-qrcode | Escaneo de códigos QR con cámara |
| qrcode | Generación del QR del ciudadano |

## Requisitos previos

- Node.js 20 o superior
- pnpm

## Instalación

```bash
git clone git@github-universidad:AlbertVargas-dev/ecomistiFront.git
cd ecomistiFront
git checkout fabriciodev
pnpm install
```

## Configuración

Copiar el archivo de entorno de ejemplo:

```bash
cp .env.example .env
```

| Variable | Descripción |
|---|---|
| `VITE_API_URL` | URL base de la API que consume el front. Por defecto: `http://localhost:3000/api` |

> El archivo `.env` es local y no se versiona (está en `.gitignore`). En producción, la variable debe definirse **antes** de compilar, porque Vite la incrusta en el build.

## Ejecución local

```bash
pnpm run dev      # http://localhost:5173
```

### Scripts disponibles

| Script | Descripción |
|---|---|
| `pnpm run dev` | Servidor de desarrollo con recarga automática |
| `pnpm run build` | Compila la app en la carpeta `dist/` |
| `pnpm run preview` | Sirve el build localmente para probarlo |
| `pnpm run lint` | Revisa el código con ESLint |

## Vistas por rol

### Admin

Panel de administración y gestión completa de la plataforma:

- **Panel General:** resumen de actividad, gráfica de tendencia, mapa de calor y tabla de entregas.
- **Operaciones:** Recolecciones, Rutas, Puntos de EcoReciclaje, Reportes.
- **Recompensas:** EcoPuntos, Recompensas (ofertas), Factores.
- **Gestión:** Ciudadanos, Vehículos, Personal, Incidencias.
- **Cooperativas:** Cooperativas (Copaff).
- **Estadísticas:** indicadores generales de la plataforma.

### Ciudadano / Urbanización

Panel personal del usuario que recicla:

- **Mi Panel:** puntos acumulados, kilogramos entregados y recompensas disponibles.
- **Mi QR:** código QR personal para entregar en el punto de recolección.
- **Recompensas y Vouchers:** ofertas disponibles y vouchers obtenidos.
- **Movimientos y Entregas:** historial de puntos y entregas realizadas.
- **Mi Perfil** y **Reportar Incidencia**.
- Campanita de notificaciones.

### Recolector

Panel de campo para el personal de recolección:

- **Mi Panel:** resumen de su actividad.
- **Escanear:** lectura del QR del ciudadano con la cámara, o ingreso manual por DNI.
- **Sincronizar:** sincronización de registros realizados offline.

### Acceso

- `/login` — inicio de sesión.
- `/registro-ciudadano` y `/registro-urbanizacion` — registro de nuevos usuarios.

Cada grupo de rutas está protegido por rol: sin sesión válida, el usuario es redirigido a `/login`.

## Estructura del proyecto

```
src/
├── App.jsx            # Definición de rutas por rol
├── main.jsx           # Punto de entrada de la app
├── index.css          # Tailwind CSS
├── lib/
│   ├── api.js         # Cliente HTTP (axios) con token y renovación de sesión
│   ├── auth.js        # Manejo de la sesión (localStorage)
│   └── cache.js       # Caché de respuestas del panel
├── context/
│   └── AuthContext.jsx  # Sesión y rol del usuario
├── components/
│   ├── Layout.jsx        # Menú lateral y estructura por rol
│   ├── ProtectedRoute.jsx # Protección de rutas por rol
│   ├── GraficoTendencia.jsx
│   ├── MapaCalor.jsx
│   └── TablaEntregas.jsx
└── pages/
    ├── auth/        # Login y Registro
    ├── usuario/     # Panel, Mi QR, Ofertas, Vouchers, Entregas, Perfil...
    ├── recolector/  # Panel, Escanear, Sincronizar
    └── admin/       # Dashboard y pantallas de gestión
```

## Build y despliegue

La app es una SPA (Single Page Application) que se compila a archivos estáticos en `dist/`:

```bash
pnpm run build
pnpm run preview
```

Para desplegar:

1. Definir `VITE_API_URL` con la URL de la API de producción antes de compilar.
2. Ejecutar `pnpm run build`.
3. Publicar la carpeta `dist/` en cualquier hosting estático (Nginx, Vercel, Netlify, etc.).
4. Configurar el **SPA fallback**: todas las rutas deben servir `index.html`, para que recargar una ruta como `/panel` o `/recolector` no devuelva 404.

## Notas

- `main.jsx` no usa `StrictMode` porque el escáner QR (`html5-qrcode`) no tolera el doble montaje que StrictMode provoca en desarrollo.
- La sesión se guarda en `localStorage` y el token de acceso se envía automáticamente en cada petición; si expira, el cliente renueva la sesión y reintenta la petición una vez.
