import { useState, useCallback } from "react"
import { EventoEntity, type SeccionEvento } from "../../domain/entities/Evento"
import { crearEventoUseCase, type CrearEventoDTO } from "../../application/useCases/eventos/CrearEvento"
import { publicarEventoUseCase } from "../../application/useCases/eventos/PublicarEvento"
import { obtenerEventosUseCase, type FiltrosEvento } from "../../application/useCases/eventos/ObtenerEventos"
import { obtenerDetalleEventoUseCase } from "../../application/useCases/eventos/ObtenerDetalleEvento"
import { obtenerMisEventosUseCase } from "../../application/useCases/eventos/ObtenerMisEventos"
import { obtenerTodosEventosUseCase } from "../../application/useCases/eventos/ObtenerTodosEventos"
import { editarEventoUseCase, type EditarEventoDTO } from "../../application/useCases/eventos/EditarEvento"
import { cancelarEventoUseCase } from "../../application/useCases/eventos/CancelarEvento"
import { eliminarEventoUseCase } from "../../application/useCases/eventos/EliminarEvento"
import { reprogramarEventoUseCase, type ReprogramarEventoDTO } from "../../application/useCases/eventos/ReprogramarEvento"
import { pagarPublicacionEventoUseCase, type PagarPublicacionDTO } from "../../application/useCases/eventos/PagarPublicacionEvento"
import { iniciarEventoUseCase } from "../../application/useCases/eventos/IniciarEvento"
import { finalizarEventoUseCase } from "../../application/useCases/eventos/FinalizarEvento"
import { eventosApi, type CrearEventoApiDTO } from "../../adapters/api/eventosApi"

/**
 * DTO para crear un evento con secciones desde el formulario
 */
export interface CrearEventoConSeccionesDTO {
  nombre: string
  descripcion: string
  fecha: Date
  horasDuracion: number
  minutosDuracion: number
  organizadorId: string
  venueId: string
  categoria: string
  tarifaPublicacion: number
  secciones: SeccionEvento[]
}

interface UseEventosReturn {
  eventos: EventoEntity[]
  eventoDetalle: EventoEntity | null
  isLoading: boolean
  error: string | null
  crearEvento: (data: CrearEventoDTO) => Promise<void>
  crearEventoConSecciones: (data: CrearEventoConSeccionesDTO) => Promise<EventoEntity>
  publicarEvento: (eventoId: string) => Promise<void>
  pagarPublicacion: (eventoId: string, transaccionPagoId: string, monto: number) => Promise<void>
  iniciarEvento: (eventoId: string) => Promise<void>
  finalizarEvento: (eventoId: string) => Promise<void>
  obtenerEventos: (filtros?: FiltrosEvento) => Promise<void>
  obtenerTodosEventos: () => Promise<void>
  obtenerDetalle: (eventoId: string) => Promise<void>
  obtenerMisEventos: (organizadorId: string) => Promise<void>
  editarEvento: (eventoId: string, datos: EditarEventoDTO) => Promise<void>
  cancelarEvento: (eventoId: string, motivo: string, usuario: string) => Promise<void>
  eliminarEvento: (eventoId: string) => Promise<void>
  reprogramarEvento: (data: ReprogramarEventoDTO) => Promise<void>
  subirImagenes: (eventoId: string, archivos: File[]) => Promise<string[]>
  subirImagenPrincipal: (eventoId: string, archivo: File) => Promise<string>
  subirImagenSecundaria: (eventoId: string, archivos: File[]) => Promise<string[]>
  subirFolleto: (eventoId: string, archivo: File) => Promise<string>
  restringirContenido: (eventoId: string, data: RestringirContenidoDTO) => Promise<void>
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

  const crearEventoConSecciones = useCallback(async (data: CrearEventoConSeccionesDTO): Promise<EventoEntity> => {
    setIsLoading(true)
    setError(null)
    try {
      // Validaciones básicas
      if (!data.nombre || data.nombre.trim() === "") {
        throw new Error("El nombre del evento es requerido")
      }
      if (new Date(data.fecha) <= new Date()) {
        throw new Error("La fecha del evento debe ser en el futuro")
      }
      if (!data.secciones || data.secciones.length === 0) {
        throw new Error("El evento debe tener al menos una sección")
      }

      // Convertir fecha a ISO string para la API
      const payload: CrearEventoApiDTO = {
        ...data,
        fecha: data.fecha instanceof Date ? data.fecha.toISOString() : data.fecha,
      }

      const evento = await eventosApi.crearEventoConSecciones(payload)
      return evento
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

  const pagarPublicacion = useCallback(async (eventoId: string, transaccionPagoId: string, monto: number) => {
    setIsLoading(true)
    setError(null)
    try {
      await pagarPublicacionEventoUseCase.ejecutar(eventoId, { transaccionPagoId, monto })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error pagando publicación")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const iniciarEvento = useCallback(async (eventoId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      await iniciarEventoUseCase.ejecutar(eventoId)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error iniciando evento")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const finalizarEvento = useCallback(async (eventoId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      await finalizarEventoUseCase.ejecutar(eventoId)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error finalizando evento")
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

  const obtenerTodosEventos = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const resultado = await obtenerTodosEventosUseCase.ejecutar()
      setEventos(resultado)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error obteniendo todos los eventos")
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

  const cancelarEvento = useCallback(async (eventoId: string, motivo: string, usuario: string) => {
    setIsLoading(true)
    setError(null)
    try {
      await cancelarEventoUseCase.ejecutar(eventoId, motivo, usuario)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error cancelando evento")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const eliminarEvento = useCallback(async (eventoId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      await eliminarEventoUseCase.ejecutar(eventoId)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error eliminando evento")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const reprogramarEvento = useCallback(async (data: ReprogramarEventoDTO) => {
    setIsLoading(true)
    setError(null)
    try {
      await reprogramarEventoUseCase.ejecutar(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error reprogramando evento")
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

  const subirImagenes = useCallback(async (eventoId: string, archivos: File[]): Promise<string[]> => {
    setIsLoading(true)
    setError(null)
    try {
      const urls = await eventosApi.subirImagenes(eventoId, archivos)
      return urls
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error subiendo imágenes")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const subirImagenPrincipal = useCallback(async (eventoId: string, archivo: File): Promise<string> => {
    setIsLoading(true)
    setError(null)
    try {
      const url = await eventosApi.subirImagenPrincipal(eventoId, archivo)
      return url
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error subiendo imagen principal")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const subirImagenSecundaria = useCallback(async (eventoId: string, archivos: File[]): Promise<string[]> => {
    setIsLoading(true)
    setError(null)
    try {
      const urls = await eventosApi.subirImagenSecundaria(eventoId, archivos)
      return urls
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error subiendo imágenes secundarias")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const subirFolleto = useCallback(async (eventoId: string, archivo: File): Promise<string> => {
    setIsLoading(true)
    setError(null)
    try {
      const url = await eventosApi.subirFolleto(eventoId, archivo)
      return url
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error subiendo folleto")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const restringirContenido = useCallback(async (eventoId: string, data: RestringirContenidoDTO) => {
    setIsLoading(true)
    setError(null)
    try {
      await restringirContenidoEventoUseCase.ejecutar(eventoId, data)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error restringiendo contenido")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return {
    eventos,
    eventoDetalle,
    isLoading,
    error,
    crearEvento,
    crearEventoConSecciones,
    publicarEvento,
    pagarPublicacion,
    iniciarEvento,
    finalizarEvento,
    obtenerEventos,
    obtenerTodosEventos,
    obtenerDetalle,
    obtenerMisEventos,
    editarEvento,
    cancelarEvento,
    eliminarEvento,
    reprogramarEvento,
    limpiar,
    subirImagenes,
    subirImagenPrincipal,
    subirImagenSecundaria,
    subirFolleto,
    restringirContenido,
    limpiar,
  }
}
