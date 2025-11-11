import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useNotifications } from "../contexts/NotificationContext"
import { useSignalR } from "../hooks/useSignalR"
import { useEventos } from "../hooks/useEventos"
import { useReservas } from "../hooks/useReservas"
import { usePagos } from "../hooks/usePagos"
import Button from "../components/ui/Button"
import LoadingSpinner from "../components/ui/LoadingSpinner"
import Alert from "../components/ui/Alert"
import FormField from "../components/ui/FormField"

export default function DetalleEventoPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const { notificarReservaConfirmada } = useSignalR()
  const { agregarNotificacion } = useNotifications()

  const { eventoDetalle, isLoading: loadingEvento, obtenerDetalle } = useEventos()
  const { reservas, isLoading: loadingReserva, crearReserva } = useReservas()
  const { crearPago, procesarPago, isLoading: loadingPago } = usePagos()

  const [cantidad, setCantidad] = useState(1)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      obtenerDetalle(id).catch((err) => {
        setError("No se pudo cargar el evento")
      })
    }
  }, [id, obtenerDetalle])

  if (loadingEvento) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner message="Cargando evento..." />
      </div>
    )
  }

  if (!eventoDetalle) {
    return (
      <div className="max-w-7xl mx-auto">
        <Alert type="error" title="Evento no encontrado">
          El evento que buscas no existe o ha sido eliminado.
        </Alert>
        <Button onClick={() => navigate("/eventos")} className="mt-4">
          Volver a Eventos
        </Button>
      </div>
    )
  }

  const handleReservar = async () => {
    if (!usuario) {
      navigate("/login")
      return
    }

    try {
      setError(null)
      setSuccess(null)

      // Crear reserva
      const reserva = await crearReserva({
        asistenteId: usuario.id,
        eventoId: eventoDetalle.id,
        cantidad,
      })

      // Crear pago
      const pago = await crearPago({
        usuarioId: usuario.id,
        reservaId: reserva.id,
        monto: reserva.montoTotal,
        concepto: `Entrada para ${eventoDetalle.nombre}`,
        metodo: "tarjeta",
      })

      // Procesar pago
      await procesarPago(pago.id)

      // Notificar
      notificarReservaConfirmada(eventoDetalle.nombre, cantidad, reserva.montoTotal)
      setSuccess(
        `Reserva confirmada. ${cantidad} entrada(s) por $${reserva.montoTotal}. Código: ${reserva.codigoReserva}`,
      )

      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate("/mis-reservas")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la reserva")
    }
  }

  return (
    <div className="max-w-5xl mx-auto">
        {/* Galería */}
        <div className="mb-8 rounded-lg overflow-hidden">
          <img
            src={eventoDetalle.imagen || "/placeholder.svg?height=400&width=800&query=evento"}
            alt={eventoDetalle.nombre}
            className="w-full h-96 object-cover"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Información Principal */}
          <div className="md:col-span-2">
            <h1 className="text-4xl font-bold text-text-primary mb-4">{eventoDetalle.nombre}</h1>

            <div className="flex gap-4 mb-6">
              <div className="flex items-center gap-2 text-text-secondary">
                <span>📅</span>
                {new Date(eventoDetalle.fecha).toLocaleDateString("es-ES", {
                  weekday: "long",
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </div>
              <div className="flex items-center gap-2 text-text-secondary">
                <span>📍</span>
                {eventoDetalle.venue}
              </div>
            </div>

            <div className="prose prose-sm max-w-none mb-8">
              <h2 className="text-2xl font-semibold text-text-primary mb-3">Descripción</h2>
              <p className="text-text-secondary leading-relaxed">{eventoDetalle.descripcion}</p>
            </div>

            {/* Detalles */}
            <div className="bg-bg-secondary p-6 rounded-lg mb-8">
              <h3 className="font-semibold text-text-primary mb-4">Detalles del Evento</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-text-tertiary">Categoría</p>
                  <p className="font-semibold text-text-primary">{eventoDetalle.categoria}</p>
                </div>
                <div>
                  <p className="text-sm text-text-tertiary">Estado</p>
                  <p className="font-semibold text-text-primary capitalize">{eventoDetalle.estado}</p>
                </div>
                <div>
                  <p className="text-sm text-text-tertiary">Aforo Total</p>
                  <p className="font-semibold text-text-primary">{eventoDetalle.aforo} personas</p>
                </div>
                <div>
                  <p className="text-sm text-text-tertiary">Disponibles</p>
                  <p className="font-semibold text-text-primary text-success">
                    {eventoDetalle.aforoDisponible} lugares
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Reserva */}
          <div className="md:col-span-1">
            <div className="bg-white p-6 rounded-lg border border-border-light sticky top-24">
              <div className="mb-6">
                <p className="text-text-tertiary text-sm">Precio por entrada</p>
                <p className="text-3xl font-bold text-primary">${eventoDetalle.precio}</p>
              </div>

              {error && (
                <Alert type="error" onClose={() => setError(null)}>
                  {error}
                </Alert>
              )}

              {success && (
                <Alert type="success" onClose={() => setSuccess(null)}>
                  {success}
                </Alert>
              )}

              {eventoDetalle.puedeReservar() ? (
                <>
                  <FormField label="Cantidad de entradas" required>
                    <input
                      type="number"
                      min="1"
                      max={eventoDetalle.aforoDisponible}
                      value={cantidad}
                      onChange={(e) => setCantidad(Math.max(1, Number.parseInt(e.target.value) || 1))}
                      className="w-full px-3 py-2 border border-border rounded-md"
                    />
                  </FormField>

                  <div className="bg-bg-secondary p-3 rounded-md mb-6">
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-text-secondary">Subtotal</span>
                      <span className="font-semibold">${eventoDetalle.precio * cantidad}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-text-secondary">Comisión</span>
                      <span className="font-semibold">$0</span>
                    </div>
                    <div className="border-t border-border mt-2 pt-2 flex justify-between">
                      <span className="font-semibold text-text-primary">Total</span>
                      <span className="font-bold text-lg text-primary">${eventoDetalle.precio * cantidad}</span>
                    </div>
                  </div>

                  <Button
                    onClick={handleReservar}
                    disabled={loadingReserva || loadingPago}
                    loading={loadingReserva || loadingPago}
                    className="w-full"
                  >
                    Reservar Ahora
                  </Button>

                  <p className="text-xs text-text-tertiary text-center mt-3">La reserva vence en 15 minutos</p>
                </>
              ) : (
                <Alert type="warning">
                  {eventoDetalle.aforoDisponible === 0
                    ? "Evento agotado"
                    : "Este evento no está disponible para reservas"}
                </Alert>
              )}
            </div>
          </div>
        </div>
      </div>
  )
}
