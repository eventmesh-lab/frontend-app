import { eventosApi } from "../../../adapters/api/eventosApi"

export class CancelarEventoUseCase {
  async ejecutar(eventoId: string, motivo: string, usuario: string): Promise<void> {
    const evento = await eventosApi.obtenerDetalle(eventoId)

    if (!evento) {
      throw new Error("Evento no encontrado")
    }

    if (!motivo || motivo.trim().length < 10) {
      throw new Error("El motivo de cancelación debe tener al menos 10 caracteres")
    }

    await eventosApi.cancelarEvento(eventoId, motivo, usuario)
  }
}

export const cancelarEventoUseCase = new CancelarEventoUseCase()
