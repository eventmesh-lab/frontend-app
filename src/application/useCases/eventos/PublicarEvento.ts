import { eventosApi } from "../../../adapters/api/eventosApi"

export class PublicarEventoUseCase {
  async ejecutar(eventoId: string): Promise<void> {
    const evento = await eventosApi.obtenerDetalle(eventoId)

    if (!evento) {
      throw new Error("Evento no encontrado")
    }

    await eventosApi.publicarEvento(eventoId)
  }
}

export const publicarEventoUseCase = new PublicarEventoUseCase()
