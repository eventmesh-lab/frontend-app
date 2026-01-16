import { EstadoEvento, EventoEntity } from "../../../domain/entities/Evento"
import { Link } from "react-router-dom"
import Badge from "../ui/Badge"
import Card from "../ui/Card"
import React from "react"
import ConfirmDeleteModal from "./ConfirmDeleteModal"
import CancelEventModal from "./CancelEventModal"

interface EventoCardProps {
  evento: EventoEntity
  showOrganizer?: boolean
  showActions?: boolean
  onEdit?: (evento: EventoEntity) => void
  onPublish?: (eventoId: string) => void
  onCancel?: (eventoId: string, motivo: string) => void
  onDelete?: (eventoId: string) => void
  isLoading?: boolean
}

export default function EventoCard({
  evento,
  showOrganizer = false,
  showActions = false,
  onEdit,
  onPublish,
  onCancel,
  onDelete,
  isLoading = false,
}: EventoCardProps) {
  const [showDeleteModal, setShowDeleteModal] = React.useState(false)
  const [showCancelModal, setShowCancelModal] = React.useState(false)

  const porcentajeOcupacion = evento.obtenerPorcentajeOcupacion()
  const estadoBadgeVariant = {
    [EstadoEvento.PUBLICADO]: "success",
    [EstadoEvento.BORRADOR]: "warning",
    [EstadoEvento.PENDIENTE_PAGO]: "warning",
    [EstadoEvento.CANCELADO]: "danger",
    [EstadoEvento.EN_CURSO]: "info",
    [EstadoEvento.FINALIZADO]: "info",
  } as const

  return (
    <Card hover className="overflow-hidden flex flex-col h-full">
      {/* Imagen clickeable */}
      <Link to={`/eventos/${evento.id}`} className="mb-4 -mx-6 -mt-6 block">
        <img
          src={evento.imagen || "/placeholder.svg?height=200&width=400&query=evento"}
          alt={evento.nombre}
          className="w-full h-48 object-cover cursor-pointer hover:opacity-90 transition-opacity"
        />
      </Link>

      {/* Contenido clickeable */}
      <Link to={`/eventos/${evento.id}`} className="flex-grow block hover:opacity-90 transition-opacity">
        <div className="flex justify-between items-start gap-2 mb-2">
          <h3 className="font-bold text-lg text-text-primary line-clamp-2">{evento.nombre}</h3>
          <Badge variant={estadoBadgeVariant[evento.estado] || "primary"}>{evento.estado}</Badge>
        </div>

        <p className="text-sm text-text-secondary mb-3 line-clamp-2">{evento.descripcion}</p>

        {/* Detalles */}
        <div className="space-y-2 text-sm mb-4">
          <p className="text-text-secondary">📅 {new Date(evento.fecha).toLocaleDateString()}</p>
          <p className="text-text-secondary">📍 {evento.venue}</p>
          <p className="font-semibold text-primary">${evento.precio}</p>
        </div>

        {/* Aforo */}
        <div className="mb-4">
          <div className="flex justify-between text-xs mb-1">
            <span className="text-text-secondary">Ocupación</span>
            <span className="font-semibold">{Math.round(porcentajeOcupacion)}%</span>
          </div>
          <div className="w-full bg-border-light rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all"
              style={{ width: `${porcentajeOcupacion}%` }}
            ></div>
          </div>
          <p className="text-xs text-text-tertiary mt-1">
            {evento.aforoDisponible} de {evento.aforo} lugares
          </p>
        </div>
      </Link>

      {/* Acciones */}
      <div className="flex gap-2 pt-4 border-t border-border-light">
        <Link
          to={`/eventos/${evento.id}`}
          className="flex-1 px-3 py-2 bg-primary text-white rounded-md text-sm font-medium hover:bg-primary-dark transition-colors text-center"
        >
          Ver Detalle
        </Link>

        {showActions && (
          <>
            {evento.estado === EstadoEvento.BORRADOR && onPublish && (
              <button
                onClick={() => onPublish(evento.id)}
                className="flex-1 px-3 py-2 border border-primary text-primary rounded-md text-sm font-medium hover:bg-primary hover:text-white transition-colors"
              >
                Publicar
              </button>
            )}
            {onEdit && (
              <button
                onClick={() => onEdit(evento)}
                className="px-3 py-2 border border-border-light text-text-secondary rounded-md text-sm hover:bg-bg-secondary transition-colors"
                title="Editar"
                disabled={isLoading}
              >
                ✏️
              </button>
            )}
            {evento.canBeCancelled && onCancel && (
              <button
                onClick={() => setShowCancelModal(true)}
                className="px-3 py-2 border border-amber-500 text-amber-600 rounded-md text-sm hover:bg-amber-50 transition-colors"
                title="Cancelar Evento"
                disabled={isLoading}
              >
                ❌
              </button>
            )}
            {evento.canBeDeleted && onDelete && (
              <button
                onClick={() => setShowDeleteModal(true)}
                className="px-3 py-2 border border-danger text-danger rounded-md text-sm hover:bg-red-50 transition-colors"
                title="Eliminar Evento"
                disabled={isLoading}
              >
                🗑️
              </button>
            )}
          </>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      {onDelete && (
        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={async () => {
            if (onDelete) {
              await onDelete(evento.id)
              setShowDeleteModal(false)
            }
          }}
          eventName={evento.nombre}
          isLoading={isLoading}
        />
      )}

      {/* Modal de confirmación de cancelación */}
      {onCancel && (
        <CancelEventModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onConfirm={async (motivo) => {
            if (onCancel) {
              await onCancel(evento.id, motivo)
              setShowCancelModal(false)
            }
          }}
          eventName={evento.nombre}
          registrationsCount={evento.inscripcionesCount}
          eventDate={evento.fecha}
          isLoading={isLoading}
        />
      )}
    </Card>
  )
}
