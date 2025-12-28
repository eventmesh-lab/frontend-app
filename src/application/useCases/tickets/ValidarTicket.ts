import { ticketsApi, type ValidarTicketRequest } from "../../../adapters/api/ticketsApi"

export interface ValidarTicketDTO {
  codigoQr: string
  ubicacionValidacion: string
  usuarioValidadorId: string
}

export class ValidarTicketUseCase {
  /**
   * Valida un ticket mediante su código QR (check-in)
   */
  async ejecutar(data: ValidarTicketDTO): Promise<void> {
    if (!data.codigoQr) {
      throw new Error("El código QR es requerido")
    }

    if (!data.usuarioValidadorId) {
      throw new Error("El ID del validador es requerido")
    }

    if (!data.ubicacionValidacion) {
      throw new Error("La ubicación de validación es requerida")
    }

    const request: ValidarTicketRequest = {
      codigoQr: data.codigoQr,
      ubicacionValidacion: data.ubicacionValidacion,
      usuarioValidadorId: data.usuarioValidadorId,
    }

    await ticketsApi.validarTicket(request)
  }
}

export const validarTicketUseCase = new ValidarTicketUseCase()
