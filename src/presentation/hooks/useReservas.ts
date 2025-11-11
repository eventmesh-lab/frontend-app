import { useState, useCallback } from "react"
import { ReservaEntity } from "../../domain/entities/Reserva"
import { crearReservaUseCase, type CrearReservaDTO } from "../../application/useCases/reservas/CrearReserva"
import { obtenerMisReservasUseCase } from "../../application/useCases/reservas/ObtenerMisReservas"
import { cancelarReservaUseCase } from "../../application/useCases/reservas/CancelarReserva"

interface UseReservasReturn {
  reservas: ReservaEntity[]
  isLoading: boolean
  error: string | null
  crearReserva: (data: CrearReservaDTO) => Promise<ReservaEntity>
  obtenerMisReservas: (asistenteId: string) => Promise<void>
  cancelarReserva: (reservaId: string) => Promise<void>
  limpiar: () => void
}

export function useReservas(): UseReservasReturn {
  const [reservas, setReservas] = useState<ReservaEntity[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const crearReserva = useCallback(async (data: CrearReservaDTO) => {
    setIsLoading(true)
    setError(null)
    try {
      const resultado = await crearReservaUseCase.ejecutar(data)
      return resultado
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error creando reserva"
      setError(errorMsg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const obtenerMisReservas = useCallback(async (asistenteId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const resultado = await obtenerMisReservasUseCase.ejecutar(asistenteId)
      setReservas(resultado)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error obteniendo reservas")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const cancelarReserva = useCallback(async (reservaId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      await cancelarReservaUseCase.ejecutar(reservaId)
      setReservas((prev) => prev.filter((r) => r.id !== reservaId))
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cancelando reserva")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const limpiar = useCallback(() => {
    setReservas([])
    setError(null)
  }, [])

  return {
    reservas,
    isLoading,
    error,
    crearReserva,
    obtenerMisReservas,
    cancelarReserva,
    limpiar,
  }
}
