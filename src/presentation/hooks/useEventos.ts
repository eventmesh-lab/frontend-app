import { useState, useCallback } from "react"
import { EventoEntity } from "../../domain/entities/Evento"
import { crearEventoUseCase, type CrearEventoDTO } from "../../application/useCases/eventos/CrearEvento"
import { publicarEventoUseCase } from "../../application/useCases/eventos/PublicarEvento"
import { obtenerEventosUseCase, type FiltrosEvento } from "../../application/useCases/eventos/ObtenerEventos"
import { obtenerDetalleEventoUseCase } from "../../application/useCases/eventos/ObtenerDetalleEvento"
import { obtenerMisEventosUseCase } from "../../application/useCases/eventos/ObtenerMisEventos"
import { editarEventoUseCase, type EditarEventoDTO } from "../../application/useCases/eventos/EditarEvento"
import { cancelarEventoUseCase } from "../../application/useCases/eventos/CancelarEvento"

interface UseEventosReturn {
  eventos: EventoEntity[]
  eventoDetalle: EventoEntity | null
  isLoading: boolean
  error: string | null
  crearEvento: (data: CrearEventoDTO) => Promise<void>
  publicarEvento: (eventoId: string) => Promise<void>
  obtenerEventos: (filtros?: FiltrosEvento) => Promise<void>
  obtenerDetalle: (eventoId: string) => Promise<void>
  obtenerMisEventos: (organizadorId: string) => Promise<void>
  editarEvento: (eventoId: string, datos: EditarEventoDTO) => Promise<void>
  cancelarEvento: (eventoId: string) => Promise<void>
  limpiar: () => void
}

export function useEventos(): UseEventosReturn {
  const [eventos, setEventos] = useState<EventoEntity[]>([])
  const [eventoDetalle, setEventoDetalle] = useState<EventoEntity | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const crearEvento = useCallback(async (data: CrearEventoDTO) => {
    setIsLoading(true)
    setError(null)
    try {
      await crearEventoUseCase.ejecutar(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error creando evento")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const publicarEvento = useCallback(async (eventoId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      await publicarEventoUseCase.ejecutar(eventoId)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error publicando evento")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const obtenerEventos = useCallback(async (filtros?: FiltrosEvento) => {
    setIsLoading(true)
    setError(null)
    try {
      const resultado = await obtenerEventosUseCase.ejecutar(filtros)
      setEventos(resultado)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error obteniendo eventos")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const obtenerDetalle = useCallback(async (eventoId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const resultado = await obtenerDetalleEventoUseCase.ejecutar(eventoId)
      setEventoDetalle(resultado)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error obteniendo detalle")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const obtenerMisEventos = useCallback(async (organizadorId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      const resultado = await obtenerMisEventosUseCase.ejecutar(organizadorId)
      setEventos(resultado)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error obteniendo tus eventos")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const editarEvento = useCallback(async (eventoId: string, datos: EditarEventoDTO) => {
    setIsLoading(true)
    setError(null)
    try {
      await editarEventoUseCase.ejecutar(eventoId, datos)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error editando evento")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const cancelarEvento = useCallback(async (eventoId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      await cancelarEventoUseCase.ejecutar(eventoId)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cancelando evento")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const limpiar = useCallback(() => {
    setEventos([])
    setEventoDetalle(null)
    setError(null)
  }, [])

  return {
    eventos,
    eventoDetalle,
    isLoading,
    error,
    crearEvento,
    publicarEvento,
    obtenerEventos,
    obtenerDetalle,
    obtenerMisEventos,
    editarEvento,
    cancelarEvento,
    limpiar,
  }
}
