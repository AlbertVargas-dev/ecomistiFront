import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'
import Layout from './components/Layout.jsx'
import Login from './pages/auth/Login.jsx'
import Dashboard from './pages/admin/Dashboard.jsx'
import Personal from './pages/admin/Personal.jsx'
import Puntos from './pages/admin/Puntos.jsx'
import Cooperativas from './pages/admin/Cooperativas.jsx'
import Entregas from './pages/usuario/Entregas.jsx'
import Escanear from './pages/recolector/Escanear.jsx'
import Registro from './pages/auth/Registro.jsx'
import PanelRecolector from './pages/recolector/Panel.jsx'
import Ciudadanos from './pages/admin/Ciudadanos.jsx'
import EcoPuntos from './pages/admin/EcoPuntos.jsx'
import Estadisticas from './pages/admin/Estadisticas.jsx'
import Factores from './pages/admin/Factores.jsx'
import Incidencias from './pages/admin/Incidencias.jsx'
import ReportarIncidencia from './pages/usuario/ReportarIncidencia.jsx'
import Reportes from './pages/admin/Reportes.jsx'
import Sincronizar from './pages/recolector/Sincronizar.jsx'
import Recolecciones from './pages/admin/Recolecciones.jsx'
import Rutas from './pages/admin/Rutas.jsx'
import OfertasAdmin from './pages/admin/OfertasAdmin.jsx'
import MiQr from './pages/usuario/MiQr.jsx'
import Movimientos from './pages/usuario/Movimientos.jsx'
import Ofertas from './pages/usuario/Ofertas.jsx'
import Panel from './pages/usuario/Panel.jsx'
import Perfil from './pages/usuario/Perfil.jsx'
import Vouchers from './pages/usuario/Vouchers.jsx'
import Vehiculos from './pages/admin/Vehiculos.jsx'

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/registro-ciudadano" element={<Registro tipo="ciudadano" />} />
          <Route path="/registro-urbanizacion" element={<Registro tipo="urbanizacion" />} />
          <Route
            element={
              <ProtectedRoute roles={['ADMIN']}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="recolecciones" element={<Recolecciones />} />
            <Route path="rutas" element={<Rutas />} />
            <Route path="factores" element={<Factores />} />
            <Route path="puntos" element={<Puntos />} />
            <Route path="reportes" element={<Reportes />} />
            <Route path="ofertas-admin" element={<OfertasAdmin />} />
            <Route path="estadisticas" element={<Estadisticas />} />
            <Route path="ecopuntos" element={<EcoPuntos />} />
            <Route path="ciudadanos" element={<Ciudadanos />} />
            <Route path="vehiculos" element={<Vehiculos />} />
            <Route path="personal" element={<Personal />} />
            <Route path="incidencias" element={<Incidencias />} />
            <Route path="cooperativas" element={<Cooperativas />} />
          </Route>
          <Route
            element={
              <ProtectedRoute roles={['CIUDADANO', 'URBANIZACION']}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="panel" element={<Panel />} />
            <Route path="ofertas" element={<Ofertas />} />
            <Route path="vouchers" element={<Vouchers />} />
            <Route path="mi-qr" element={<MiQr />} />
            <Route path="movimientos" element={<Movimientos />} />
            <Route path="entregas" element={<Entregas />} />
            <Route path="incidencias-nueva" element={<ReportarIncidencia />} />
          </Route>
          <Route
            element={
              <ProtectedRoute roles={['RECOLECTOR']}>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="/recolector" element={<PanelRecolector />} />
            <Route path="/recolector/escanear" element={<Escanear />} />
            <Route path="/recolector/sincronizar" element={<Sincronizar />} />
          </Route>
          <Route
            element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }
          >
            <Route path="perfil" element={<Perfil />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}
