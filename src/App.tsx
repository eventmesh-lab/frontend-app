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
import CrearEventoPage from "./presentation/pages/CrearEventoPage"
import DetalleEventoOrganizadorPage from "./presentation/pages/DetalleEventoOrganizadorPage"
import AdminDashboardPage from "./presentation/pages/AdminDashboardPage"
import ProfileUserPage from "./presentation/pages/ProfileUserPage"
import ChangePasswordPage from "./presentation/pages/ChangePasswordPage"
import UserDetailPage from "./presentation/pages/UserDetailPage"
import UserByAdminPage from "./presentation/pages/UserByAdminPage"
import RegisterUserOrganizerPage from "./presentation/pages/RegisterUserOrganizerPage"
import UpdateUserPage from "./presentation/pages/UpdateUserPage"

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
                                <PrivateRoute requiredRole="Organizador">
                                    <OrganizadorDashboardPage />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/organizador/crear-evento"
                            element={
                                <PrivateRoute requiredRole="Organizador">
                                    <CrearEventoPage />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/organizador/evento/:id"
                            element={
                                <PrivateRoute requiredRole="Organizador">
                                    <DetalleEventoOrganizadorPage />
                                </PrivateRoute>
                            }
                        />

                        {/* Rutas protegidas - admin */}
                        <Route
                            path="/admin"
                            element={
                                <PrivateRoute requiredRole="admin">
                                    <AdminDashboardPage />
                                </PrivateRoute>
                            }
                        />
                        {/* Rutas protegidas  */}
                        <Route
                            path="/perfil"
                            element={
                                <PrivateRoute>
                                    <MainLayout>
                                        <ProfileUserPage />
                                    </MainLayout>
                                </PrivateRoute>
                            }
                        />
                        {/* Rutas protegidas  */}
                        <Route
                            path="/actualizarPerfil"
                            element={
                                <PrivateRoute>
                                    <MainLayout>
                                        <UpdateUserPage />
                                    </MainLayout>
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/changePassword" 
                            element={
                                    <ChangePasswordPage />
                            }
                        />
                        <Route
                            path="/admin/usuarios"
                            element={
                                <PrivateRoute requiredRole="admin">
                                    <UserByAdminPage />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/admin/user/:email"
                            element={
                                <PrivateRoute requiredRole="admin">
                                     <UserDetailPage />
                                </PrivateRoute>
                            }
                        />
                        <Route path="/admin/registerOrganizer"
                            element={
                                <PrivateRoute requiredRole="admin">
                                    <RegisterUserOrganizerPage />
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
