import { ticketsApi, type GenerarTicketsRequest, type GenerarTicketsResponse } from "../../../adapters/api/ticketsApi"

export interface GenerarTicketsDTO {
  eventoId: string
  reservaId: string
  asistenteId: string
  cantidad: number
  precioUnitario: number
  tipoTicket?: string
}

export class GenerarTicketsUseCase {
  /**
   * Genera tickets para una reserva
   * Crea los items necesarios y llama al servicio de tickets
   */
  async ejecutar(data: GenerarTicketsDTO): Promise<GenerarTicketsResponse> {
    if (data.cantidad <= 0) {
      throw new Error("La cantidad debe ser mayor a 0")
    }

    if (data.precioUnitario <= 0) {
      throw new Error("El precio debe ser mayor a 0")
    }

    // Generar código QR único para cada ticket
    const items = Array.from({ length: data.cantidad }, (_, index) => {
      const codigoQr = this.generarCodigoQR(data.eventoId, data.reservaId, index + 1)
      return {
        tipo: data.tipoTicket || "General",
        precio: data.precioUnitario,
        codigoQrValor: codigoQr,
        codigoQrImagen: "", // Se generará en el backend
      }
    })

    const request: GenerarTicketsRequest = {
      eventoId: data.eventoId,
      reservaId: data.reservaId,
      asistenteId: data.asistenteId,
      items,
    }

    return ticketsApi.generarTickets(request)
  }

  /**
   * Genera un código QR único para el ticket
   */
  private generarCodigoQR(eventoId: string, reservaId: string, numero: number): string {
    const timestamp = Date.now()
    const random = Math.random().toString(36).substring(2, 9)
    return `${eventoId}-${reservaId}-${numero}-${timestamp}-${random}`.toUpperCase()
  }
}

export const generarTicketsUseCase = new GenerarTicketsUseCase()
