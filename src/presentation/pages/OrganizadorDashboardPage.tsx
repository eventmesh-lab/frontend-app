"use client"

import { useEffect } from "react"
import { useNavigate } from "react-router-dom"
import useAuth from "../contexts/Auth"
import { useEventos } from "../hooks/useEventos"
import OrganizadorLayout from "../layouts/OrganizadorLayout"
import EventoCard from "../components/eventos/EventoCard"
import LoadingSpinner from "../components/ui/LoadingSpinner"
import EmptyState from "../components/ui/EmptyState"
import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import Badge from "../components/ui/Badge"
import { Link } from "react-router-dom"
import { EstadoEvento } from "../../domain/entities/Evento"

/**
 * Dashboard del Organizador
 * Muestra estadísticas y lista de eventos del organizador
 * Usa el email (username) como organizadorId temporal
 */
export default function OrganizadorDashboardPage() {
  const navigate = useNavigate()
  const { username } = useAuth()
  const { eventos, isLoading, error, obtenerMisEventos, publicarEvento } = useEventos()

  // Cargar eventos del organizador al montar el componente
  // TODO: Reemplazar username con el ID real cuando se implemente
  useEffect(() => {
    if (username) {
      console.log("[OrganizadorDashboard] Cargando eventos para:", username)
      obtenerMisEventos(username) // Usando email como organizadorId temporal
    }
  }, [username, obtenerMisEventos])

  // Filtrar eventos por estado (usando los nuevos valores del enum)
  const eventosPublicados = eventos.filter((e) => e.estado === EstadoEvento.PUBLICADO)
  const eventosBorrador = eventos.filter((e) => e.estado === EstadoEvento.BORRADOR)
  const eventosEnCurso = eventos.filter((e) => e.estado === EstadoEvento.EN_CURSO)
  const ventaTotalPotencial = eventos.reduce((sum, e) => sum + e.aforo * e.precio, 0)

  /**
   * Navega al detalle del evento
   */
  const handleVerDetalle = (eventoId: string) => {
    navigate(`/organizador/evento/${eventoId}`)
  }

  return (
    <OrganizadorLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Dashboard del Organizador</h1>
          <p className="text-text-secondary">Gestiona tus eventos y visualiza estadísticas</p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{eventos.length}</p>
              <p className="text-text-secondary text-sm">Total de eventos</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-warning">{eventosBorrador.length}</p>
              <p className="text-text-secondary text-sm">Borradores</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-success">{eventosPublicados.length}</p>
              <p className="text-text-secondary text-sm">Publicados</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-info">{eventosEnCurso.length}</p>
              <p className="text-text-secondary text-sm">En Curso</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">${ventaTotalPotencial.toLocaleString()}</p>
              <p className="text-text-secondary text-sm">Venta potencial</p>
            </div>
          </Card>
        </div>

        {/* Crear evento */}
        <div className="mb-8">
          <Link to="/organizador/crear-evento">
            <Button variant="primary" size="lg">
              + Crear Nuevo Evento
            </Button>
          </Link>
        </div>

        {/* Mensaje de error */}
        {error && (
          <div className="bg-danger/10 text-danger p-4 rounded-md mb-6">
            {error}
          </div>
        )}

        {/* Eventos */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner message="Cargando tus eventos..." />
          </div>
        ) : eventos.length === 0 ? (
          <EmptyState
            icon="🎉"
            title="No tienes eventos"
            description="Crea tu primer evento para comenzar a organizar"
          />
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-4">Mis Eventos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventos.map((evento) => (
                <Card key={evento.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <div onClick={() => handleVerDetalle(evento.id)}>
                    {/* Header con estado */}
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-semibold text-text-primary truncate flex-1">
                        {evento.nombre}
                      </h3>
                      <Badge
                        variant={
                          evento.estado === EstadoEvento.PUBLICADO
                            ? "success"
                            : evento.estado === EstadoEvento.BORRADOR
                            ? "warning"
                            : evento.estado === EstadoEvento.EN_CURSO
                            ? "info"
                            : "default"
                        }
                      >
                        {evento.estado}
                      </Badge>
                    </div>

                    {/* Info */}
                    <p className="text-text-secondary text-sm mb-2 line-clamp-2">
                      {evento.descripcion}
                    </p>

                    <div className="flex flex-wrap gap-2 text-sm text-text-tertiary mb-3">
                      <span>📅 {new Date(evento.fecha).toLocaleDateString()}</span>
                      <span>📍 {evento.venue}</span>
                    </div>

                    <div className="flex justify-between items-center pt-3 border-t border-border">
                      <span className="text-primary font-semibold">${evento.precio}</span>
                      <span className="text-text-tertiary text-sm">
                        {evento.aforoDisponible}/{evento.aforo} disponibles
                      </span>
                    </div>
                  </div>

                  {/* Acción rápida para borradores */}
                  {evento.estado === EstadoEvento.BORRADOR && (
                    <div className="mt-3 pt-3 border-t border-border">
                      <Button
                        variant="primary"
                        size="sm"
                        className="w-full"
                        onClick={(e) => {
                          e.stopPropagation()
                          handleVerDetalle(evento.id)
                        }}
                      >
                        Pagar Publicación
                      </Button>
                    </div>
                  )}
                </Card>
              ))}
            </div>
          </div>
        )}
      </div>
    </OrganizadorLayout>
  )
}
