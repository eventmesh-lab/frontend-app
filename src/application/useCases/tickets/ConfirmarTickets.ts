import { ticketsApi, type ConfirmarTicketsRequest } from "../../../adapters/api/ticketsApi"

export interface ConfirmarTicketsDTO {
  pagoId: string
  ticketIds: string[]
}

export class ConfirmarTicketsUseCase {
  /**
   * Confirma tickets después de un pago exitoso
   */
  async ejecutar(data: ConfirmarTicketsDTO): Promise<void> {
    if (!data.pagoId) {
      throw new Error("El ID de pago es requerido")
    }

    if (!data.ticketIds || data.ticketIds.length === 0) {
      throw new Error("Se requiere al menos un ticket para confirmar")
    }

    const request: ConfirmarTicketsRequest = {
      pagoId: data.pagoId,
      ticketIds: data.ticketIds,
    }

    await ticketsApi.confirmarTickets(request)
  }
}

export const confirmarTicketsUseCase = new ConfirmarTicketsUseCase()
