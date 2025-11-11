import { EventoEntity } from "../../../domain/entities/Evento"
import { eventosApi } from "../../../adapters/api/eventosApi"

export class ObtenerDetalleEventoUseCase {
  async ejecutar(eventoId: string): Promise<EventoEntity | null> {
    if (!eventoId) {
      throw new Error("ID del evento requerido")
    }

    return eventosApi.obtenerDetalle(eventoId)
  }
}

export const obtenerDetalleEventoUseCase = new ObtenerDetalleEventoUseCase()
