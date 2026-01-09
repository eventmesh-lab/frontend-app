import { useEffect, useState } from "react"
import { useSearchParams, useNavigate } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { useNotifications } from "../contexts/NotificationContext"
import { useSignalR } from "../hooks/useSignalR"
import { usePagos } from "../hooks/usePagos"
import { useTickets } from "../hooks/useTickets"
import { useEventos } from "../hooks/useEventos"
import Button from "../components/ui/Button"
import LoadingSpinner from "../components/ui/LoadingSpinner"
import Alert from "../components/ui/Alert"
import Card from "../components/ui/Card"
import Breadcrumb from "../components/common/Breadcrumb"

/**
 * Página de pago para procesar el pago de una reserva temporal
 * Recibe reservaId, eventoId, monto y eventoNombre como parámetros de query
 */
export default function PagoPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { usuario } = useAuth()
  const { agregarNotificacion } = useNotifications()
  const { notificarReservaConfirmada } = useSignalR()
  const { crearPago, procesarPago, isLoading: loadingPago } = usePagos()
  const { generarTickets, confirmarTickets, isLoading: loadingTickets } = useTickets()
  const { obtenerDetalle } = useEventos()

  const reservaId = searchParams.get("reservaId")
  const eventoId = searchParams.get("eventoId")
  const montoParam = searchParams.get("monto")
  const eventoNombre = searchParams.get("eventoNombre") || "Evento"

  const [monto, setMonto] = useState<number>(0)
  const [cantidad, setCantidad] = useState<number>(1)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [fechaExpiracion, setFechaExpiracion] = useState<Date | null>(null)
  const [tiempoRestante, setTiempoRestante] = useState<string>("")

  // Validar parámetros requeridos
  useEffect(() => {
    if (!reservaId || !eventoId || !montoParam) {
      setError("Parámetros de pago inválidos. Por favor, intenta reservar nuevamente.")
      return
    }

    const montoNum = Number.parseFloat(montoParam)
    if (isNaN(montoNum) || montoNum <= 0) {
      setError("Monto inválido. Por favor, intenta reservar nuevamente.")
      return
    }

    setMonto(montoNum)

    // Obtener información del evento para calcular cantidad
    if (eventoId) {
      obtenerDetalle(eventoId)
        .then((evento) => {
          if (evento) {
            // Estimar cantidad basándose en el monto total y precio unitario
            const precioUnitario = evento.precio || 1
            const cantidadEstimada = Math.floor(montoNum / precioUnitario)
            setCantidad(cantidadEstimada > 0 ? cantidadEstimada : 1)
          }
        })
        .catch(() => {
          // Si no se puede obtener el evento, usar cantidad por defecto
          setCantidad(1)
        })
    }

    // Establecer fecha de expiración (10 minutos desde ahora según la guía)
    const expiracion = new Date(Date.now() + 10 * 60 * 1000)
    setFechaExpiracion(expiracion)
  }, [reservaId, eventoId, montoParam, obtenerDetalle])

  // Actualizar countdown cada segundo
  useEffect(() => {
    if (!fechaExpiracion) return

    const interval = setInterval(() => {
      const ahora = new Date()
      const diferencia = fechaExpiracion.getTime() - ahora.getTime()

      if (diferencia <= 0) {
        setTiempoRestante("00:00")
        setError("La reserva ha expirado. Por favor, intenta reservar nuevamente.")
        clearInterval(interval)
        return
      }

      const minutos = Math.floor(diferencia / 60000)
      const segundos = Math.floor((diferencia % 60000) / 1000)
      setTiempoRestante(`${minutos}:${segundos.toString().padStart(2, "0")}`)
    }, 1000)

    return () => clearInterval(interval)
  }, [fechaExpiracion])

  const handleProcesarPago = async () => {
    if (!usuario || !reservaId || !eventoId) {
      setError("Información de usuario o reserva no disponible")
      return
    }

    try {
      setError(null)
      setSuccess(null)

      // Paso 1: Crear pago
      const pago = await crearPago({
        usuarioId: usuario.id,
        reservaId: reservaId,
        monto: monto,
        concepto: `Entrada para ${eventoNombre}`,
        metodo: "tarjeta",
      })

      // Paso 2: Procesar pago (esto también confirma la reserva según ProcesarPagoUseCase)
      await procesarPago(pago.id)

      // Paso 3: Obtener información del evento para generar tickets
      const evento = await obtenerDetalle(eventoId)
      if (evento) {
        const precioUnitario = evento.precio || monto / cantidad

        // Paso 4: Generar tickets para la reserva
        const ticketsResult = await generarTickets({
          eventoId: eventoId,
          reservaId: reservaId,
          asistenteId: usuario.id,
          cantidad: cantidad,
          precioUnitario: precioUnitario,
        })

        // Paso 5: Confirmar tickets después del pago exitoso
        if (ticketsResult.ticketIds && ticketsResult.ticketIds.length > 0) {
          await confirmarTickets({
            pagoId: pago.id,
            ticketIds: ticketsResult.ticketIds,
          })
        }
      }

      // Notificar
      notificarReservaConfirmada(eventoNombre, cantidad, monto)
      agregarNotificacion({
        tipo: "success",
        titulo: "Pago procesado exitosamente",
        mensaje: `${cantidad} ticket(s) generado(s) y confirmado(s) para ${eventoNombre}`,
      })
      setSuccess(`Pago procesado exitosamente. ${cantidad} entrada(s) por $${monto.toFixed(2)}`)

      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate("/mis-reservas")
      }, 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al procesar el pago")
    }
  }

  if (!reservaId || !eventoId || !montoParam) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Breadcrumb />
        <Alert type="error" title="Error" className="mt-4">
          {error || "Parámetros de pago inválidos. Por favor, intenta reservar nuevamente."}
        </Alert>
        <Button onClick={() => navigate("/eventos")} className="mt-4">
          Volver a Eventos
        </Button>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Breadcrumb />
      <h1 className="text-3xl font-bold text-text-primary mb-6">Procesar Pago</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Información de la reserva */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Detalles de la Reserva</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-text-tertiary">Evento</p>
              <p className="font-semibold text-text-primary">{eventoNombre}</p>
            </div>
            <div>
              <p className="text-sm text-text-tertiary">Cantidad de entradas</p>
              <p className="font-semibold text-text-primary">{cantidad}</p>
            </div>
            <div>
              <p className="text-sm text-text-tertiary">Monto total</p>
              <p className="text-2xl font-bold text-primary">${monto.toFixed(2)}</p>
            </div>
            {fechaExpiracion && tiempoRestante && (
              <div>
                <p className="text-sm text-text-tertiary">Tiempo restante</p>
                <p className="font-semibold text-text-primary">
                  {tiempoRestante === "00:00" ? (
                    <span className="text-red-600">Expirado</span>
                  ) : (
                    <span className="text-primary">{tiempoRestante}</span>
                  )}
                </p>
                <p className="text-xs text-text-tertiary mt-1">
                  La reserva expira en {fechaExpiracion.toLocaleTimeString("es-ES")}
                </p>
              </div>
            )}
          </div>
        </Card>

        {/* Formulario de pago */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Información de Pago</h2>

          {error && (
            <Alert type="error" onClose={() => setError(null)} className="mb-4">
              {error}
            </Alert>
          )}

          {success && (
            <Alert type="success" onClose={() => setSuccess(null)} className="mb-4">
              {success}
            </Alert>
          )}

          <div className="space-y-4">
            <div className="bg-bg-secondary p-4 rounded-lg">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-secondary">Subtotal</span>
                <span className="font-semibold">${monto.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-text-secondary">Comisión</span>
                <span className="font-semibold">$0.00</span>
              </div>
              <div className="border-t border-border mt-2 pt-2 flex justify-between">
                <span className="font-semibold text-text-primary">Total</span>
                <span className="font-bold text-lg text-primary">${monto.toFixed(2)}</span>
              </div>
            </div>

            <div className="text-sm text-text-tertiary">
              <p className="mb-2">Método de pago: Tarjeta de crédito/débito</p>
              <p className="text-xs">
                Al procesar el pago, se confirmará automáticamente tu reserva y se generarán tus tickets.
              </p>
            </div>

            <Button
              onClick={handleProcesarPago}
              disabled={loadingPago || loadingTickets || tiempoRestante === "00:00"}
              loading={loadingPago || loadingTickets}
              className="w-full"
            >
              {tiempoRestante === "00:00" ? "Reserva Expirada" : "Procesar Pago"}
            </Button>

            <Button
              variant="outline"
              onClick={() => navigate(-1)}
              disabled={loadingPago || loadingTickets}
              className="w-full"
            >
              Cancelar
            </Button>
          </div>
        </Card>
      </div>
    </div>
  )
}
