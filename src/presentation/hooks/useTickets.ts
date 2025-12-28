import { useState, useCallback } from "react"
import { generarTicketsUseCase, type GenerarTicketsDTO } from "../../application/useCases/tickets/GenerarTickets"
import { confirmarTicketsUseCase, type ConfirmarTicketsDTO } from "../../application/useCases/tickets/ConfirmarTickets"
import { validarTicketUseCase, type ValidarTicketDTO } from "../../application/useCases/tickets/ValidarTicket"
import { cancelarTicketUseCase, type CancelarTicketDTO } from "../../application/useCases/tickets/CancelarTicket"
import type { GenerarTicketsResponse } from "../../adapters/api/ticketsApi"

interface UseTicketsReturn {
  isLoading: boolean
  error: string | null
  generarTickets: (data: GenerarTicketsDTO) => Promise<GenerarTicketsResponse>
  confirmarTickets: (data: ConfirmarTicketsDTO) => Promise<void>
  validarTicket: (data: ValidarTicketDTO) => Promise<void>
  cancelarTicket: (data: CancelarTicketDTO) => Promise<void>
  limpiar: () => void
}

export function useTickets(): UseTicketsReturn {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const generarTickets = useCallback(async (data: GenerarTicketsDTO): Promise<GenerarTicketsResponse> => {
    setIsLoading(true)
    setError(null)
    try {
      const resultado = await generarTicketsUseCase.ejecutar(data)
      return resultado
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error generando tickets"
      setError(errorMsg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const confirmarTickets = useCallback(async (data: ConfirmarTicketsDTO): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      await confirmarTicketsUseCase.ejecutar(data)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error confirmando tickets"
      setError(errorMsg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const validarTicket = useCallback(async (data: ValidarTicketDTO): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      await validarTicketUseCase.ejecutar(data)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error validando ticket"
      setError(errorMsg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const cancelarTicket = useCallback(async (data: CancelarTicketDTO): Promise<void> => {
    setIsLoading(true)
    setError(null)
    try {
      await cancelarTicketUseCase.ejecutar(data)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error cancelando ticket"
      setError(errorMsg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const limpiar = useCallback(() => {
    setError(null)
  }, [])

  return {
    isLoading,
    error,
    generarTickets,
    confirmarTickets,
    validarTicket,
    cancelarTicket,
    limpiar,
  }
}
