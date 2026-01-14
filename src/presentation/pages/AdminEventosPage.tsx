"use client"

import { useEffect, useState } from "react"
import AdminLayout from "../layouts/AdminLayout"
import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import Alert from "../components/ui/Alert"
import LoadingSpinner from "../components/ui/LoadingSpinner"
import Badge from "../components/ui/Badge"
import { eventosApi } from "../../adapters/api/eventosApi"
import { EventoEntity, EstadoEvento } from "../../domain/entities/Evento"
import { Eye, Calendar, MapPin, Users, DollarSign, CheckCircle, XCircle, CreditCard, AlertCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"

/**
 * Página para que el administrador vea todos los eventos y pueda publicarlos
 */
export default function AdminEventosPage() {
  const navigate = useNavigate()
  const [eventos, setEventos] = useState<EventoEntity[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [publicandoId, setPublicandoId] = useState<string | null>(null)

  /**
   * Carga todos los eventos
   */
  const cargarEventos = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const todosEventos = await eventosApi.obtenerTodos()
      setEventos(todosEventos)
      console.log("[AdminEventos] Eventos cargados:", todosEventos.length)
    } catch (err) {
      console.error("[AdminEventos] Error cargando eventos:", err)
      setError(err instanceof Error ? err.message : "Error al cargar los eventos")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    cargarEventos()
  }, [])

  /**
   * Publica un evento que está pagado (tiene transaccionPagoId)
   * Permite publicar eventos en estado Borrador o PendientePago si están pagados
   */
  const handlePublicar = async (eventoId: string) => {
    const evento = eventos.find((e) => e.id === eventoId)
    
    if (!evento) {
      setError("Evento no encontrado")
      return
    }

    if (!evento.transaccionPagoId) {
      setError("El evento debe estar pagado antes de publicarse")
      return
    }

    // Verificar que el evento no esté ya publicado
    if (evento.estado === EstadoEvento.PUBLICADO) {
      setError("El evento ya está publicado")
      return
    }

    if (!confirm("¿Estás seguro de que deseas publicar este evento?")) {
      return
    }

    setPublicandoId(eventoId)
    setError(null)

    try {
      // Usar el transaccionPagoId del evento como PagoConfirmadoId
      await eventosApi.publicarEvento(eventoId, evento.transaccionPagoId)
      console.log("[AdminEventos] Evento publicado:", eventoId, "con pago:", evento.transaccionPagoId)
      
      // Recargar eventos para actualizar el estado
      await cargarEventos()
    } catch (err) {
      console.error("[AdminEventos] Error publicando evento:", err)
      setError(err instanceof Error ? err.message : "Error al publicar el evento")
    } finally {
      setPublicandoId(null)
    }
  }

  /**
   * Obtiene el color del badge según el estado
   */
  const getEstadoColor = (estado: EstadoEvento): "success" | "warning" | "info" | "danger" | "default" => {
    switch (estado) {
      case EstadoEvento.PUBLICADO:
        return "success"
      case EstadoEvento.BORRADOR:
        return "warning"
      case EstadoEvento.EN_CURSO:
        return "info"
      case EstadoEvento.CANCELADO:
        return "danger"
      default:
        return "default"
    }
  }

  // Filtrar eventos por estado
  const eventosBorrador = eventos.filter((e) => e.estado === EstadoEvento.BORRADOR)
  const eventosPublicados = eventos.filter((e) => e.estado === EstadoEvento.PUBLICADO)
  const eventosEnCurso = eventos.filter((e) => e.estado === EstadoEvento.EN_CURSO)
  const eventosFinalizados = eventos.filter((e) => e.estado === EstadoEvento.FINALIZADO)
  const eventosCancelados = eventos.filter((e) => e.estado === EstadoEvento.CANCELADO)

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Gestión de Eventos</h1>
          <p className="text-text-secondary">Visualiza y gestiona todos los eventos del sistema</p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-text-primary">{eventos.length}</p>
              <p className="text-text-secondary text-sm">Total</p>
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
              <p className="text-3xl font-bold text-text-tertiary">{eventosFinalizados.length}</p>
              <p className="text-text-secondary text-sm">Finalizados</p>
            </div>
          </Card>
        </div>

        {/* Mensaje de error */}
        {error && (
          <Alert type="error" className="mb-6">
            {error}
          </Alert>
        )}

        {/* Lista de eventos */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner message="Cargando eventos..." />
          </div>
        ) : eventos.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-text-secondary text-lg">No hay eventos registrados</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {eventos.map((evento) => (
              <Card key={evento.id} className="hover:shadow-lg transition-shadow">
                <div className="flex flex-col md:flex-row gap-4">
                  {/* Información principal */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-semibold text-text-primary mb-1">{evento.nombre}</h3>
                        <p className="text-text-secondary text-sm line-clamp-2">{evento.descripcion}</p>
                      </div>
                      <Badge variant={getEstadoColor(evento.estado)}>{evento.estado}</Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(evento.fecha).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{evento.venue || evento.venueId || "N/A"}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <Users className="w-4 h-4" />
                        <span>
                          {evento.aforoDisponible}/{evento.aforo}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-text-secondary">
                        <DollarSign className="w-4 h-4" />
                        <span>${evento.precio}</span>
                      </div>
                    </div>

                    {evento.secciones && evento.secciones.length > 0 && (
                      <div className="mt-3">
                        <p className="text-xs text-text-tertiary mb-1">Secciones:</p>
                        <div className="flex flex-wrap gap-2">
                          {evento.secciones.map((seccion, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-1 bg-bg-secondary rounded text-xs text-text-secondary"
                            >
                              {seccion.nombre} ({seccion.capacidad} - ${seccion.precio})
                            </span>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Acciones */}
                  <div className="flex flex-col gap-2 md:w-48">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate(`/eventos/${evento.id}`)}
                      className="w-full"
                    >
                      <Eye className="w-4 h-4 mr-2" />
                      Ver Detalle
                    </Button>

                    {/* Estado de pago */}
                    <div className="mb-2">
                      {evento.transaccionPagoId ? (
                        <div className="flex items-center gap-2 text-xs text-success bg-success/10 px-2 py-1 rounded">
                          <CreditCard className="w-3 h-3" />
                          <span>Pagado</span>
                        </div>
                      ) : (
                        <div className="flex items-center gap-2 text-xs text-warning bg-warning/10 px-2 py-1 rounded">
                          <AlertCircle className="w-3 h-3" />
                          <span>Sin pago</span>
                        </div>
                      )}
                      {evento.transaccionPagoId && (
                        <p className="text-xs text-text-tertiary mt-1 truncate" title={evento.transaccionPagoId}>
                          ID: {evento.transaccionPagoId.substring(0, 8)}...
                        </p>
                      )}
                    </div>

                    {/* Botón de publicar - si está pagado y no está ya publicado */}
                    {evento.transaccionPagoId && evento.estado !== EstadoEvento.PUBLICADO ? (
                      <Button
                        variant="primary"
                        size="sm"
                        onClick={() => handlePublicar(evento.id)}
                        disabled={publicandoId === evento.id}
                        loading={publicandoId === evento.id}
                        className="w-full bg-primary hover:bg-primary-dark text-white font-semibold shadow-md"
                      >
                        <CheckCircle className="w-4 h-4 mr-2" />
                        {publicandoId === evento.id ? "Publicando..." : "Publicar Evento"}
                      </Button>
                    ) : !evento.transaccionPagoId && (evento.estado === EstadoEvento.BORRADOR || evento.estado === EstadoEvento.PENDIENTE_PAGO) ? (
                      <div className="text-xs text-text-tertiary bg-bg-secondary px-3 py-2 rounded text-center">
                        <AlertCircle className="w-4 h-4 mx-auto mb-1 text-warning" />
                        <p>Requiere pago</p>
                      </div>
                    ) : null}

                    {evento.estado === EstadoEvento.PUBLICADO && (
                      <div className="flex items-center gap-2 text-sm text-success bg-success/10 px-3 py-2 rounded">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-medium">Ya publicado</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
