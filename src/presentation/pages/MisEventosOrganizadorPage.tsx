import { useEffect, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import useAuth from "../contexts/Auth"
import { useEventos } from "../hooks/useEventos"
import { getUserIdFromEmail } from "../../utils/userIdHelper"
import OrganizadorLayout from "../layouts/OrganizadorLayout"
import EventoCard from "../components/eventos/EventoCard"
import LoadingSpinner from "../components/ui/LoadingSpinner"
import EmptyState from "../components/ui/EmptyState"
import Alert from "../components/ui/Alert"
import Button from "../components/ui/Button"
import { Link } from "react-router-dom"

/**
 * Página de Mis Eventos del Organizador
 * Muestra todos los eventos creados por el organizador autenticado
 * Usa el email del usuario autenticado convertido a GUID determinístico como organizadorId
 */
export default function MisEventosOrganizadorPage() {
  const navigate = useNavigate()
  const { username, isAuthenticated } = useAuth()
  const { eventos, isLoading, error, obtenerMisEventos, eliminarEvento, cancelarEvento } = useEventos()

  // Cargar eventos del organizador usando el email convertido a GUID determinístico
  const cargarEventos = useCallback(() => {
    if (username && isAuthenticated) {
      const organizadorId = getUserIdFromEmail(username)
      obtenerMisEventos(organizadorId).catch((err) => {
        console.error("[MisEventosOrganizador] Error cargando eventos:", err)
      })
    }
  }, [username, isAuthenticated, obtenerMisEventos])

  useEffect(() => {
    cargarEventos()
  }, [cargarEventos])

  const handleDelete = async (id: string) => {
    try {
      await eliminarEvento(id)
      cargarEventos()
    } catch (err) {
      console.error("Error al eliminar:", err)
    }
  }

  const handleCancel = async (id: string, motivo: string) => {
    try {
      await cancelarEvento(id, motivo, username || "unknown")
      cargarEventos()
    } catch (err) {
      console.error("Error al cancelar:", err)
    }
  }

  return (
    <OrganizadorLayout>
      <div>
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Mis Eventos</h1>
            <p className="text-text-secondary">Gestiona todos tus eventos creados</p>
          </div>
          <Link to="/organizador/crear-evento">
            <Button variant="primary" size="lg">
              + Crear Nuevo Evento
            </Button>
          </Link>
        </div>

        {/* Mensaje de error */}
        {error && (
          <Alert type="error" title="Error" className="mb-6">
            {error}
          </Alert>
        )}

        {/* Eventos */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner message="Cargando tus eventos..." />
          </div>
        ) : eventos.length === 0 ? (
          <EmptyState
            icon="📅"
            title="No tienes eventos registrados"
            description="Aún no has creado ningún evento. Crea tu primer evento para comenzar a organizar y vender entradas."
            action={
              <Link to="/organizador/crear-evento">
                <Button variant="primary">Crear Mi Primer Evento</Button>
              </Link>
            }
          />
        ) : (
          <div>
            <div className="mb-4 flex justify-between items-center">
              <p className="text-text-secondary">
                Mostrando <span className="font-semibold text-text-primary">{eventos.length}</span> evento(s)
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventos.map((evento) => (
                <EventoCard
                  key={evento.id}
                  evento={evento}
                  showActions={true}
                  isLoading={isLoading}
                  onEdit={(evento) => navigate(`/organizador/evento/${evento.id}`)}
                  onPublish={(eventoId) => navigate(`/organizador/evento/${eventoId}`)}
                  onCancel={handleCancel}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </OrganizadorLayout>
  )
}
