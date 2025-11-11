import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { AuthProvider } from "./presentation/contexts/AuthContext"
import { NotificationProvider } from "./presentation/contexts/NotificationContext"
import PrivateRoute from "./presentation/components/auth/PrivateRoute"
import MainLayout from "./presentation/layouts/MainLayout"
import HomePage from "./presentation/pages/HomePage"
import LoginPage from "./presentation/pages/LoginPage"
import RegistroPage from "./presentation/pages/RegistroPage"
import OAuthCallbackPage from "./presentation/pages/OAuthCallbackPage"
import EventosPage from "./presentation/pages/EventosPage"
import DetalleEventoPage from "./presentation/pages/DetalleEventoPage"
import MisReservasPage from "./presentation/pages/MisReservasPage"
import OrganizadorDashboardPage from "./presentation/pages/OrganizadorDashboardPage"
import AdminDashboardPage from "./presentation/pages/AdminDashboardPage"
import { RoleType } from "./domain/entities/Usuario"

function App() {
  return (
    <Router>
      <AuthProvider>
        <NotificationProvider>
          <Routes>
            {/* Rutas públicas */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/registro" element={<RegistroPage />} />
            <Route path="/oauth/callback" element={<OAuthCallbackPage />} />

            {/* Rutas públicas */}
            <Route
              path="/"
              element={
                <MainLayout>
                  <HomePage />
                </MainLayout>
              }
            />

            <Route
              path="/eventos"
              element={
                <MainLayout>
                  <EventosPage />
                </MainLayout>
              }
            />

            <Route
              path="/eventos/:id"
              element={
                <MainLayout>
                  <DetalleEventoPage />
                </MainLayout>
              }
            />

            {/* Rutas protegidas - usuario */}
            <Route
              path="/mis-reservas"
              element={
                <PrivateRoute>
                  <MainLayout>
                    <MisReservasPage />
                  </MainLayout>
                </PrivateRoute>
              }
            />

            {/* Rutas protegidas - organizador */}
            <Route
              path="/organizador"
              element={
                <PrivateRoute requiredRole={RoleType.ORGANIZADOR}>
                  <OrganizadorDashboardPage />
                </PrivateRoute>
              }
            />

            {/* Rutas protegidas - admin */}
            <Route
              path="/admin"
              element={
                <PrivateRoute requiredRole={RoleType.ADMIN}>
                  <AdminDashboardPage />
                </PrivateRoute>
              }
            />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </NotificationProvider>
      </AuthProvider>
    </Router>
  )
}

export default App
