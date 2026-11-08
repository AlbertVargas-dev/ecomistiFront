import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext.jsx'
import { api, mensajeError } from '../lib/api.js'

const MENU_ADMIN = [
  { to: '/', label: 'Panel General', icon: '▦' },
  { to: '/recolecciones', label: 'Recolecciones', icon: '♻' },
  { to: '/rutas', label: 'Rutas', icon: '⌖' },
  { to: '/puntos', label: 'Puntos de EcoReciclaje', icon: '◉' },
  { to: '/reportes', label: 'Reportes', icon: '▤' },
  { to: '/estadisticas', label: 'Estadísticas', icon: '📊' },
  { to: '/ecopuntos', label: 'EcoPuntos', icon: '◐' },
  { to: '/ofertas-admin', label: 'Recompensas', icon: '🎁' },
  { to: '/factores', label: 'Factores', icon: '⚖' },
  { to: '/ciudadanos', label: 'Ciudadanos', icon: '👥' },
  { to: '/vehiculos', label: 'Vehículos', icon: '🚛' },
  { to: '/personal', label: 'Personal', icon: '👤' },
  { to: '/incidencias', label: 'Reportar Incidencia', icon: '⚠' },
  { to: '/cooperativas', label: 'Cooperativas (Copaff)', icon: '🤝' },
  { to: '/perfil', label: 'Mi Perfil', icon: '✎' },
]

const MENU_CIUDADANO = [
  { to: '/panel', label: 'Mi Panel', icon: '▦' },
  { to: '/perfil', label: 'Mi Perfil', icon: '✎' },
  { to: '/ofertas', label: 'Recompensas', icon: '🎁' },
  { to: '/vouchers', label: 'Mis Vouchers', icon: '🎟' },
  { to: '/mi-qr', label: 'Mi QR', icon: '▣' },
  { to: '/movimientos', label: 'Movimientos', icon: '◐' },
  { to: '/entregas', label: 'Mis Entregas', icon: '♻' },
  { to: '/incidencias-nueva', label: 'Reportar Incidencia', icon: '⚠' },
]

const MENU_RECOLECTOR = [
  { to: '/recolector', label: 'Mi Panel', icon: '▦' },
  { to: '/recolector/escanear', label: 'Escanear QR', icon: '▣' },
  { to: '/recolector/sincronizar', label: 'Sincronizar', icon: '⟳' },
  { to: '/perfil', label: 'Mi Perfil', icon: '✎' },
]

function reloj() {
  return new Date().toLocaleTimeString('es-PE', {
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function Layout() {
  const { user, perfiles, logout, cambiarPerfil } = useAuth()
  const navigate = useNavigate()

  function irAPerfil(rol) {
    cambiarPerfil(rol)
    navigate(
      rol === 'ADMIN' ? '/' : rol === 'RECOLECTOR' ? '/recolector' : '/panel',
    )
  }
  const MENU =
    user?.rol === 'ADMIN'
      ? MENU_ADMIN
      : user?.rol === 'RECOLECTOR'
        ? MENU_RECOLECTOR
        : MENU_CIUDADANO
  const [q, setQ] = useState('')
  const [resultados, setResultados] = useState(null)
  const [errorBusqueda, setErrorBusqueda] = useState('')

  async function buscar(e) {
    e.preventDefault()
    if (!q.trim()) return
    setErrorBusqueda('')
    try {
      const { data } = await api.get('/admin/buscar', { params: { q } })
      setResultados(data)
    } catch (err) {
      setErrorBusqueda(mensajeError(err))
    }
  }

  function salir() {
    logout()
    navigate('/login')
  }

  const [notificaciones, setNotificaciones] = useState([])
  const [verNotificaciones, setVerNotificaciones] = useState(false)

  useEffect(() => {
    if (user?.rol === 'ADMIN' || user?.rol === 'RECOLECTOR') return
    api
      .get('/usuarios/me/notificaciones')
      .then(({ data }) => setNotificaciones(data))
      .catch(() => {})
  }, [user?.rol])

  const noLeidas = notificaciones.filter((n) => !n.leida).length

  async function marcarLeida(n) {
    try {
      await api.patch(`/usuarios/me/notificaciones/${n.id}/leida`)
      setNotificaciones((lista) =>
        lista.map((x) => (x.id === n.id ? { ...x, leida: true } : x)),
      )
    } catch {
      // se ignora
    }
  }

  const [menuAbierto, setMenuAbierto] = useState(false)

  return (
    <div className="flex min-h-screen bg-gray-100 text-gray-800">
      {menuAbierto && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setMenuAbierto(false)}
        />
      )}
      <aside
        className={`fixed inset-y-0 left-0 z-40 flex h-screen w-64 shrink-0 flex-col overflow-hidden bg-[#111827] text-gray-300 transition-transform lg:static lg:translate-x-0 ${
          menuAbierto ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex items-center gap-2 px-5 py-5">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-lg text-white">
            ♻
          </span>
          <div>
            <p className="text-sm font-bold text-white">EcoMisti</p>
            <p className="text-xs text-gray-400">Panel General</p>
          </div>
        </div>
        <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto px-3 pb-4">
          {MENU.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={() => setMenuAbierto(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition ${
                  isActive
                    ? 'bg-emerald-600 font-semibold text-white'
                    : 'hover:bg-gray-800'
                }`
              }
            >
              <span className="w-5 text-center">{item.icon}</span>
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="shrink-0 border-t border-gray-800 p-4">
          <p className="truncate text-sm text-white">{user?.nombres ?? 'Usuario'}</p>
          <p className="text-xs text-gray-400">{user?.rol ?? ''}</p>
          <button
            onClick={salir}
            className="mt-3 w-full rounded-lg bg-gray-800 px-3 py-2 text-sm hover:bg-gray-700"
          >
            Cerrar sesión
          </button>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex flex-wrap items-center justify-between gap-3 border-b bg-white px-4 py-3 text-sm text-gray-600 sm:px-6">
          <button
            onClick={() => setMenuAbierto(!menuAbierto)}
            className="rounded-lg border px-3 py-1.5 text-lg lg:hidden"
            aria-label="Abrir menú"
          >
            ☰
          </button>
          {user?.rol === 'ADMIN' ? (
          <form onSubmit={buscar} className="relative">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="🔍 Buscar (usuario, voucher, punto…)"
              className="w-64 rounded-lg border px-3 py-1.5 text-sm outline-none focus:border-emerald-500"
            />
            {resultados && (
              <div className="absolute left-0 top-10 z-20 w-80 rounded-xl bg-white p-3 shadow-xl">
                <button
                  type="button"
                  onClick={() => setResultados(null)}
                  className="float-right text-xs text-gray-400"
                >
                  ✕
                </button>
                <p className="text-xs font-semibold text-gray-500">
                  Usuarios ({resultados.usuarios.length})
                </p>
                {resultados.usuarios.map((u) => (
                  <p key={u.id} className="py-1 text-sm">
                    {u.nombres} {u.apellidos} · {u.rol}
                  </p>
                ))}
                <p className="mt-2 text-xs font-semibold text-gray-500">
                  Vouchers ({resultados.vouchers.length})
                </p>
                {resultados.vouchers.map((v) => (
                  <p key={v.id} className="py-1 text-sm">
                    {v.codigoVoucher} · {v.estado}
                  </p>
                ))}
                <p className="mt-2 text-xs font-semibold text-gray-500">
                  Puntos ({resultados.puntos.length})
                </p>
                {resultados.puntos.map((p) => (
                  <p key={p.id} className="py-1 text-sm">
                    {p.nombre} · {p.distrito}
                  </p>
                ))}
              </div>
            )}
            {errorBusqueda && (
              <p className="absolute left-0 top-10 text-xs text-red-500">{errorBusqueda}</p>
            )}
          </form>
          ) : (
            <span className="text-sm font-medium text-gray-700">
              {user?.rol === 'RECOLECTOR' ? '🧑‍💼 Recolector' : '♻ EcoMisti'}
            </span>
          )}
          <div className="flex items-center gap-5">
          {(user?.rol === 'CIUDADANO' || user?.rol === 'URBANIZACION') && (
            <div className="relative">
              <button
                onClick={() => setVerNotificaciones(!verNotificaciones)}
                className="relative rounded-lg px-2 py-1 hover:bg-gray-100"
                title="Notificaciones"
              >
                🔔
                {noLeidas > 0 && (
                  <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
                    {noLeidas}
                  </span>
                )}
              </button>
              {verNotificaciones && (
                <div className="absolute right-0 top-10 z-20 w-80 rounded-xl bg-white p-3 shadow-xl">
                  <p className="text-xs font-semibold text-gray-500">Notificaciones</p>
                  {notificaciones.length === 0 && (
                    <p className="py-2 text-sm text-gray-400">Sin notificaciones.</p>
                  )}
                  {notificaciones.map((n) => (
                    <button
                      key={n.id}
                      onClick={() => marcarLeida(n)}
                      className={`block w-full rounded-lg px-2 py-2 text-left text-sm hover:bg-gray-50 ${
                        n.leida ? 'text-gray-400' : 'text-gray-800'
                      }`}
                    >
                      <b>{n.titulo}</b>
                      <br />
                      {n.mensaje}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          <span>📍 Arequipa, Perú</span>
          <span>{reloj()}</span>
          <span className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
              {user?.nombres?.charAt(0) ?? 'A'}
            </span>
            {user?.nombres ?? 'Administrador'}
            <span className="text-xs text-gray-400">{user?.rol}</span>
          </span>
          {perfiles.length > 1 && (
            <select
              value={user?.rol}
              onChange={(e) => irAPerfil(e.target.value)}
              className="rounded-lg border px-2 py-1.5 text-sm"
              title="Cambiar de sesión (perfiles guardados)"
            >
              {perfiles.map((rol) => (
                <option key={rol} value={rol}>
                  Sesión: {rol}
                </option>
              ))}
            </select>
          )}
          </div>
        </header>
        <main className="flex-1 p-4 sm:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
