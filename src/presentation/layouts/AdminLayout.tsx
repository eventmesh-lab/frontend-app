import type { ReactNode } from "react"
import MainLayout from "./MainLayout"
import { Link, useLocation } from "react-router-dom"

interface AdminLayoutProps {
  children: ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const location = useLocation()

  const isActive = (path: string) => location.pathname.startsWith(path)

  return (
    <MainLayout>
      <div className="flex min-h-screen bg-bg-secondary">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-border-light">
          <nav className="p-6 space-y-2">
            <h2 className="text-sm font-semibold text-text-tertiary uppercase mb-4">Administración</h2>

            <Link
              to="/admin"
              className={`block px-4 py-2 rounded-md transition-colors ${
                isActive("/admin") && location.pathname === "/admin"
                  ? "bg-primary text-white"
                  : "text-text-secondary hover:bg-bg-secondary"
              }`}
            >
              Dashboard
            </Link>

            <Link
              to="/admin/eventos"
              className={`block px-4 py-2 rounded-md transition-colors ${
                isActive("/admin/eventos") ? "bg-primary text-white" : "text-text-secondary hover:bg-bg-secondary"
              }`}
            >
              Eventos
            </Link>

            <Link
              to="/admin/usuarios"
              className={`block px-4 py-2 rounded-md transition-colors ${
                isActive("/admin/usuarios") ? "bg-primary text-white" : "text-text-secondary hover:bg-bg-secondary"
              }`}
            >
              Usuarios
            </Link>
             <Link
              to="/admin/registerOrganizer"
              className={`block px-4 py-2 rounded-md transition-colors ${
                isActive("/admin/usuarios") ? "bg-primary text-white" : "text-text-secondary hover:bg-bg-secondary"
              }`}
            >
              Crear Organizador
            </Link>

            <Link
              to="/admin/reportes"
              className={`block px-4 py-2 rounded-md transition-colors ${
                isActive("/admin/reportes") ? "bg-primary text-white" : "text-text-secondary hover:bg-bg-secondary"
              }`}
            >
              Reportes
            </Link>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1">
          <div className="p-8">{children}</div>
        </main>
      </div>
    </MainLayout>
  )
}
