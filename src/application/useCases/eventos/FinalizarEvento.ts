import { eventosApi } from "../../../adapters/api/eventosApi"
import { EstadoEvento } from "../../../domain/entities/Evento"

/**
 * Caso de uso para finalizar un evento que está en curso
 * El evento debe estar en estado 'EnCurso' para poder finalizarse
 */
export class FinalizarEventoUseCase {
  async ejecutar(eventoId: string): Promise<void> {
    // Validaciones
    if (!eventoId) {
      throw new Error("ID del evento es requerido")
    }

    // Verificar que el evento existe y está en curso
    const evento = await eventosApi.obtenerDetalle(eventoId)

    if (!evento) {
      throw new Error("Evento no encontrado")
    }

    if (evento.estado !== EstadoEvento.EN_CURSO) {
      throw new Error("Solo se pueden finalizar eventos en estado EnCurso")
    }

    // Finalizar el evento
    await eventosApi.finalizarEvento(eventoId)
  }
}

export const finalizarEventoUseCase = new FinalizarEventoUseCase()

