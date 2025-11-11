import { eventosApi } from "../../../adapters/api/eventosApi"

export class CancelarEventoUseCase {
  async ejecutar(eventoId: string): Promise<void> {
    const evento = await eventosApi.obtenerDetalle(eventoId)

    if (!evento) {
      throw new Error("Evento no encontrado")
    }

    await eventosApi.cancelarEvento(eventoId)
  }
}

export const cancelarEventoUseCase = new CancelarEventoUseCase()
