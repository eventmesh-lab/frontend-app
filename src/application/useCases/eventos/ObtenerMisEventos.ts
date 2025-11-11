import { EventoEntity } from "../../../domain/entities/Evento"
import { eventosApi } from "../../../adapters/api/eventosApi"

export class ObtenerMisEventosUseCase {
  async ejecutar(organizadorId: string): Promise<EventoEntity[]> {
    if (!organizadorId) {
      throw new Error("ID de organizador requerido")
    }

    return eventosApi.obtenerPorOrganizador(organizadorId)
  }
}

export const obtenerMisEventosUseCase = new ObtenerMisEventosUseCase()
