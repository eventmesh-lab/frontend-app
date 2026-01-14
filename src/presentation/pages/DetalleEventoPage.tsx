import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import useAuth from "../contexts/Auth"
import { useNotifications } from "../contexts/NotificationContext"
import { useSignalR } from "../hooks/useSignalR"
import { useEventos } from "../hooks/useEventos"
import { useReservas } from "../hooks/useReservas"
import { usePagos } from "../hooks/usePagos"
import { useTickets } from "../hooks/useTickets"
import { EstadoEvento } from "../../domain/entities/Evento"
import { crearReservaTemporalUseCase } from "../../application/useCases/reservas/CrearReservaTemporal"
import Button from "../components/ui/Button"
import LoadingSpinner from "../components/ui/LoadingSpinner"
import Alert from "../components/ui/Alert"
import FormField from "../components/ui/FormField"
import Breadcrumb from "../components/common/Breadcrumb"

export default function DetalleEventoPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  // Usar el contexto Auth.tsx que es el sistema real de autenticación
  const { isAuthenticated, username, accessToken } = useAuth()
  const { notificarReservaConfirmada } = useSignalR()
  const { agregarNotificacion } = useNotifications()

  const { eventoDetalle, isLoading: loadingEvento, obtenerDetalle } = useEventos()
  const { reservas, isLoading: loadingReserva, crearReserva } = useReservas()
  const { crearPago, procesarPago, isLoading: loadingPago } = usePagos()
  const { generarTickets, confirmarTickets, isLoading: loadingTickets } = useTickets()

  const [cantidad, setCantidad] = useState(1)
  const [seccionSeleccionada, setSeccionSeleccionada] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  useEffect(() => {
    if (id) {
      obtenerDetalle(id).catch((err) => {
        setError("No se pudo cargar el evento")
      })
    }
  }, [id, obtenerDetalle])

  // Inicializar sección seleccionada cuando se carga el evento
  useEffect(() => {
    if (eventoDetalle?.secciones && eventoDetalle.secciones.length > 0) {
      // Seleccionar la primera sección por defecto
      if (!seccionSeleccionada) {
        setSeccionSeleccionada(eventoDetalle.secciones[0].id || eventoDetalle.secciones[0].nombre)
      }
    }
  }, [eventoDetalle, seccionSeleccionada])

  /**
   * Obtiene el precio actual según la sección seleccionada
   */
  const obtenerPrecioActual = (): number => {
    if (!eventoDetalle) return 0

    // Si hay secciones, usar el precio de la sección seleccionada
    if (eventoDetalle.secciones && eventoDetalle.secciones.length > 0) {
      if (seccionSeleccionada) {
        const seccion = eventoDetalle.secciones.find(
          (s) => s.id === seccionSeleccionada || s.nombre === seccionSeleccionada
        )
        if (seccion) {
          return seccion.precio
        }
      }
      // Si no hay sección seleccionada, usar el precio mínimo
      return Math.min(...eventoDetalle.secciones.map((s) => s.precio))
    }

    // Si no hay secciones, usar el precio del evento
    return eventoDetalle.precio || 0
  }

  /**
   * Obtiene el rango de precios si hay múltiples secciones
   */
  const obtenerRangoPrecios = (): string | null => {
    if (!eventoDetalle?.secciones || eventoDetalle.secciones.length === 0) {
      return null
    }

    const precios = eventoDetalle.secciones.map((s) => s.precio)
    const minPrecio = Math.min(...precios)
    const maxPrecio = Math.max(...precios)

    if (minPrecio === maxPrecio) {
      return null // Todos los precios son iguales, no mostrar rango
    }

    return `$${minPrecio} - $${maxPrecio}`
  }

  if (loadingEvento) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner message="Cargando evento..." />
      </div>
    )
  }

  if (!eventoDetalle) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb />
        <Alert type="error" title="Evento no encontrado" className="mt-4">
          El evento que buscas no existe o ha sido eliminado.
        </Alert>
        <Button onClick={() => navigate("/eventos")} className="mt-4">
          Volver a Eventos
        </Button>
      </div>
    )
  }

  const handleReservar = async () => {
    if (!isAuthenticated || !username) {
      // Redirigir al login con el estado de retorno para volver después del login
      navigate("/login", { state: { from: { pathname: `/eventos/${id}` } } })
      return
    }

    try {
      setError(null)
      setSuccess(null)

      // Paso 1: Crear reserva
      const reserva = await crearReserva({
        asistenteId: usuario.id,
        eventoId: eventoDetalle.id,
        cantidad,
        seccionId: seccionSeleccionada || undefined,
        tipoTicket: "General",
        moneda: "USD",
      })

      // Redirigir a la página de pago con los parámetros necesarios
      navigate(`/pago?reservaId=${reservaTemporal.reservaId}&eventoId=${eventoDetalle.id}&monto=${reservaTemporal.montoTotal}&eventoNombre=${encodeURIComponent(eventoDetalle.nombre)}`)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear la reserva temporal")
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <nav className="flex items-center gap-2 text-sm mb-6">
        <button
          onClick={() => navigate("/eventos")}
          className="text-text-secondary hover:text-primary transition-colors"
        >
          ← Volver a Eventos
        </button>
        <span className="text-text-tertiary">/</span>
        <span className="text-text-primary font-medium">{eventoDetalle.nombre}</span>
      </nav>

      {/* Galería */}
      <div className="mb-8">
        {/* Imagen Principal */}
        <div className="rounded-lg overflow-hidden mb-4">
          <img
            src={eventoDetalle.imagen || "/placeholder.svg?height=400&width=800&query=evento"}
            alt={eventoDetalle.nombre}
            className="w-full h-96 object-cover"
          />
        </div>

        {/* Imágenes Secundarias */}
        {eventoDetalle.imagenesSecundarias && eventoDetalle.imagenesSecundarias.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {eventoDetalle.imagenesSecundarias.map((url, index) => (
              <div key={index} className="rounded-lg overflow-hidden">
                <img
                  src={url}
                  alt={`${eventoDetalle.nombre} - ${index + 1}`}
                  className="w-full h-32 object-cover hover:scale-105 transition-transform duration-300 cursor-pointer"
                />
              </div>
            ))}
          </div>
        )}
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
              {obtenerRangoPrecios() ? (
                <div>
                  <p className="text-2xl font-bold text-primary">{obtenerRangoPrecios()}</p>
                  <p className="text-xs text-text-tertiary mt-1">Según sección seleccionada</p>
                </div>
              ) : (
                <p className="text-3xl font-bold text-primary">${obtenerPrecioActual()}</p>
              )}
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
                {!isAuthenticated && (
                  <Alert type="info" className="mb-4">
                    <p className="text-sm mb-2">Debes iniciar sesión para reservar entradas.</p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => navigate("/login", { state: { from: `/eventos/${id}` } })}
                      className="w-full"
                    >
                      Iniciar Sesión
                    </Button>
                  </Alert>
                )}

                <FormField label="Cantidad de entradas" required>
                  <input
                    type="number"
                    min="1"
                    value={cantidad}
                    onChange={(e) => setCantidad(Math.max(1, Number.parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 border border-border rounded-md"
                    placeholder="Ingresa la cantidad"
                    disabled={!isAuthenticated}
                  />
                  {eventoDetalle.aforoDisponible > 0 && (
                    <p className="text-xs text-text-tertiary mt-1">
                      Disponibles: {eventoDetalle.aforoDisponible} lugares
                    </p>
                  )}
                </FormField>

                <div className="bg-bg-secondary p-3 rounded-md mb-6">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-text-secondary">Precio unitario</span>
                    <span className="font-semibold">${obtenerPrecioActual()}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-text-secondary">Cantidad</span>
                    <span className="font-semibold">{cantidad}</span>
                  </div>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-text-secondary">Subtotal</span>
                    <span className="font-semibold">${obtenerPrecioActual() * cantidad}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-text-secondary">Comisión</span>
                    <span className="font-semibold">$0</span>
                  </div>
                  <div className="border-t border-border mt-2 pt-2 flex justify-between">
                    <span className="font-semibold text-text-primary">Total</span>
                    <span className="font-bold text-lg text-primary">${obtenerPrecioActual() * cantidad}</span>
                  </div>
                </div>

                <Button
                  onClick={handleReservar}
                  disabled={!isAuthenticated || loadingReserva || loadingPago || loadingTickets}
                  loading={loadingReserva || loadingPago || loadingTickets}
                  className="w-full"
                >
                  {!isAuthenticated ? "Inicia sesión para reservar" : "Reservar Ahora"}
                </Button>

                <p className="text-xs text-text-tertiary text-center mt-3">La reserva vence en 15 minutos</p>
              </>
            ) : (
              <Alert type="warning">
                {eventoDetalle.estado !== EstadoEvento.PUBLICADO
                  ? `Este evento no está disponible para reservas. Estado: ${eventoDetalle.estado}`
                  : "Este evento no está disponible para reservas"}
              </Alert>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
