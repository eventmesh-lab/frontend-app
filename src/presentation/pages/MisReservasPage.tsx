import { useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useReservas } from "../hooks/useReservas"
import LoadingSpinner from "../components/ui/LoadingSpinner"
import EmptyState from "../components/ui/EmptyState"
import Alert from "../components/ui/Alert"
import Button from "../components/ui/Button"
import Card from "../components/ui/Card"

export default function MisReservasPage() {
  const { usuario } = useAuth()
  const { reservas, isLoading, error, obtenerMisReservas, cancelarReserva } = useReservas()

  useEffect(() => {
    if (usuario) {
      obtenerMisReservas(usuario.id)
    }
  }, [usuario, obtenerMisReservas])

  return (
    <div className="max-w-5xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-2">Mis Reservas</h1>
          <p className="text-text-secondary">Gestiona tus reservas de eventos</p>
        </div>

        {error && (
          <Alert type="error" title="Error">
            {error}
          </Alert>
        )}

        {isLoading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner message="Cargando reservas..." />
          </div>
        ) : reservas.length === 0 ? (
          <EmptyState icon="🎫" title="No tienes reservas" description="Explora eventos y haz tu primera reserva" />
        ) : (
          <div className="space-y-4">
            {reservas.map((reserva) => (
              <Card key={reserva.id}>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-semibold text-text-primary text-lg">Código: {reserva.codigoReserva}</h3>
                    <p className="text-text-secondary text-sm">
                      {new Date(reserva.fechaCreacion).toLocaleDateString()}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      reserva.estado === "confirmada"
                        ? "bg-green-100 text-success"
                        : reserva.estado === "cancelada"
                          ? "bg-red-100 text-danger"
                          : "bg-yellow-100 text-warning"
                    }`}
                  >
                    {reserva.estado}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4 py-4 border-y border-border-light">
                  <div>
                    <p className="text-text-tertiary text-sm">Entradas</p>
                    <p className="font-semibold text-text-primary">{reserva.cantidad}</p>
                  </div>
                  <div>
                    <p className="text-text-tertiary text-sm">Monto</p>
                    <p className="font-semibold text-text-primary">${reserva.montoTotal}</p>
                  </div>
                  <div>
                    <p className="text-text-tertiary text-sm">Vence</p>
                    <p className="font-semibold text-text-primary">
                      {new Date(reserva.fechaExpiracion).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                {reserva.puedeCancelarse() && (
                  <Button onClick={() => cancelarReserva(reserva.id)} variant="danger" size="sm">
                    Cancelar Reserva
                  </Button>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
  )
}
