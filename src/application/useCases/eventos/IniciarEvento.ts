import { eventosApi } from "../../../adapters/api/eventosApi"
import { EstadoEvento } from "../../../domain/entities/Evento"

/**
 * Caso de uso para marcar un evento publicado como en curso
 * El evento debe estar en estado 'Publicado' para poder iniciarse
 */
export class IniciarEventoUseCase {
  async ejecutar(eventoId: string): Promise<void> {
    // Validaciones
    if (!eventoId) {
      throw new Error("ID del evento es requerido")
    }

    // Verificar que el evento existe y está en estado publicado
    const evento = await eventosApi.obtenerDetalle(eventoId)

    if (!evento) {
      throw new Error("Evento no encontrado")
    }

    if (evento.estado !== EstadoEvento.PUBLICADO) {
      throw new Error("Solo se pueden iniciar eventos en estado Publicado")
    }

    // Iniciar el evento
    await eventosApi.iniciarEvento(eventoId)
  }
}

export const iniciarEventoUseCase = new IniciarEventoUseCase()

