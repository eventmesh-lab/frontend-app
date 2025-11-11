import type { ReactNode } from "react"
import MainLayout from "./MainLayout"
import { Link, useLocation } from "react-router-dom"

interface OrganizadorLayoutProps {
  children: ReactNode
}

export default function OrganizadorLayout({ children }: OrganizadorLayoutProps) {
  const location = useLocation()

  const isActive = (path: string) => location.pathname.startsWith(path)

  return (
    <MainLayout>
      <div className="flex min-h-screen bg-bg-secondary">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-border-light">
          <nav className="p-6 space-y-2">
            <h2 className="text-sm font-semibold text-text-tertiary uppercase mb-4">Organizador</h2>

            <Link
              to="/organizador"
              className={`block px-4 py-2 rounded-md transition-colors ${
                isActive("/organizador") && location.pathname === "/organizador"
                  ? "bg-primary text-white"
                  : "text-text-secondary hover:bg-bg-secondary"
              }`}
            >
              Dashboard
            </Link>

            <Link
              to="/organizador/mis-eventos"
              className={`block px-4 py-2 rounded-md transition-colors ${
                isActive("/organizador/mis-eventos")
                  ? "bg-primary text-white"
                  : "text-text-secondary hover:bg-bg-secondary"
              }`}
            >
              Mis Eventos
            </Link>

            <Link
              to="/organizador/crear-evento"
              className={`block px-4 py-2 rounded-md transition-colors ${
                isActive("/organizador/crear-evento")
                  ? "bg-primary text-white"
                  : "text-text-secondary hover:bg-bg-secondary"
              }`}
            >
              Crear Evento
            </Link>

            <Link
              to="/organizador/estadisticas"
              className={`block px-4 py-2 rounded-md transition-colors ${
                isActive("/organizador/estadisticas")
                  ? "bg-primary text-white"
                  : "text-text-secondary hover:bg-bg-secondary"
              }`}
            >
              Estadísticas
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
