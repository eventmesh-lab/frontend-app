import { Link, useLocation } from "react-router-dom"
import { ChevronRight, Home } from "lucide-react"

interface BreadcrumbItem {
  label: string
  path?: string
}

const pathNameMap: Record<string, string> = {
  "": "Inicio",
  eventos: "Eventos",
  "mis-reservas": "Mis Reservas",
  organizador: "Dashboard Organizador",
  admin: "Panel Admin",
  login: "Inicia Sesión",
  registro: "Registro",
  perfil: "Mi Perfil",
}

export default function Breadcrumb() {
  const location = useLocation()
  const pathnames = location.pathname.split("/").filter((x) => x)

  if (pathnames.length === 0) {
    return null
  }

  const breadcrumbs: BreadcrumbItem[] = [
    {
      label: pathNameMap[""] || "Inicio",
      path: "/",
    },
  ]

  let currentPath = ""
  pathnames.forEach((name, index) => {
    currentPath += `/${name}`
    const isLast = index === pathnames.length - 1

    if (name.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      breadcrumbs.push({
        label: "Detalle Evento",
        path: isLast ? undefined : currentPath,
      })
    } else {
      breadcrumbs.push({
        label: pathNameMap[name] || name.charAt(0).toUpperCase() + name.slice(1),
        path: isLast ? undefined : currentPath,
      })
    }
  })

  return (
    <nav className="flex items-center gap-2 px-4 sm:px-6 lg:px-8 py-4 text-sm bg-bg-secondary rounded-lg mb-6">
      <Link
        to="/"
        className="flex items-center gap-1 text-text-secondary hover:text-primary transition-colors"
        aria-label="Home"
      >
        <Home className="w-4 h-4" />
      </Link>

      {breadcrumbs.map((crumb, index) => (
        <div key={index} className="flex items-center gap-2">
          <ChevronRight className="w-4 h-4 text-text-tertiary" />
          {crumb.path ? (
            <Link
              to={crumb.path}
              className="text-text-secondary hover:text-primary transition-colors"
            >
              {crumb.label}
            </Link>
          ) : (
            <span className="text-text-primary font-medium">{crumb.label}</span>
          )}
        </div>
      ))}
    </nav>
  )
}
