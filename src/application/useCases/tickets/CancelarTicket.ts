import { ticketsApi, type CancelarTicketRequest } from "../../../adapters/api/ticketsApi"

export interface CancelarTicketDTO {
  ticketId: string
  razon: string
}

export class CancelarTicketUseCase {
  /**
   * Cancela un ticket
   */
  async ejecutar(data: CancelarTicketDTO): Promise<void> {
    if (!data.ticketId) {
      throw new Error("El ID del ticket es requerido")
    }

    if (!data.razon || data.razon.trim().length === 0) {
      throw new Error("La razón de cancelación es requerida")
    }

    const request: CancelarTicketRequest = {
      ticketId: data.ticketId,
      razon: data.razon,
    }

    await ticketsApi.cancelarTicket(request)
  }
}

export const cancelarTicketUseCase = new CancelarTicketUseCase()
