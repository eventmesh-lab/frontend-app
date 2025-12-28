import { type Ticket, EstadoTicket, TicketEntity } from "../../domain/entities/Ticket"
import { httpClient } from "./httpClient"

/**
 * DTO para generar tickets
 */
export interface GenerarTicketsRequest {
  eventoId: string
  reservaId: string
  asistenteId: string
  fechaActualUtc?: string // ISO string, opcional
  items: GenerarTicketItem[]
}

/**
 * Item individual para generar un ticket
 */
export interface GenerarTicketItem {
  tipo: string // "General", "VIP", etc.
  precio: number
  asientoId?: string
  seccionNombre?: string
  codigoQrValor: string
  codigoQrImagen: string // Base64
}

/**
 * Respuesta de generación de tickets
 */
export interface GenerarTicketsResponse {
  ticketIds: string[]
}

/**
 * DTO para confirmar tickets
 */
export interface ConfirmarTicketsRequest {
  pagoId: string
  fechaConfirmacionUtc?: string // ISO string, opcional
  ticketIds: string[]
}

/**
 * DTO para validar un ticket
 */
export interface ValidarTicketRequest {
  codigoQr: string
  ubicacionValidacion: string
  usuarioValidadorId: string
  fechaValidacionUtc?: string // ISO string, opcional
}

/**
 * DTO para cancelar un ticket
 */
export interface CancelarTicketRequest {
  ticketId: string
  razon: string
  fechaCancelacionUtc?: string // ISO string, opcional
}

/**
 * Mapea un ticket desde la API a TicketEntity
 */
function mapTicketFromApi(data: any): TicketEntity {
  return new TicketEntity({
    id: data.id,
    eventoId: data.eventoId,
    reservaId: data.reservaId,
    numero: data.numero || data.numeroTicket,
    asiento: data.asiento || data.asientoId || "",
    codigoQR: data.codigoQR || data.codigoQr,
    estado: data.estado as EstadoTicket,
    precio: data.precio,
  })
}

class TicketsApiAdapter {
  private client = httpClient.getTicketsClient()

  /**
   * Genera tickets para una reserva
   */
  async generarTickets(request: GenerarTicketsRequest): Promise<GenerarTicketsResponse> {
    try {
      const payload = {
        eventoId: request.eventoId,
        reservaId: request.reservaId,
        asistenteId: request.asistenteId,
        fechaActualUtc: request.fechaActualUtc || new Date().toISOString(),
        items: request.items,
      }
      const response = await this.client.post("/api/tickets/generar", payload)
      console.log("[v0] Tickets generados:", response.data.ticketIds?.length || 0)
      return {
        ticketIds: response.data.ticketIds || [],
      }
    } catch (error: any) {
      console.error("[v0] Error generando tickets:", error)
      throw new Error(error.response?.data?.message || "Error al generar los tickets")
    }
  }

  /**
   * Confirma tickets después de un pago exitoso
   */
  async confirmarTickets(request: ConfirmarTicketsRequest): Promise<void> {
    try {
      const payload = {
        pagoId: request.pagoId,
        fechaConfirmacionUtc: request.fechaConfirmacionUtc || new Date().toISOString(),
        ticketIds: request.ticketIds,
      }
      await this.client.post("/api/tickets/confirmar", payload)
      console.log("[v0] Tickets confirmados:", request.ticketIds.length)
    } catch (error: any) {
      console.error("[v0] Error confirmando tickets:", error)
      throw new Error(error.response?.data?.message || "Error al confirmar los tickets")
    }
  }

  /**
   * Valida un ticket mediante su código QR (check-in)
   */
  async validarTicket(request: ValidarTicketRequest): Promise<void> {
    try {
      const payload = {
        codigoQr: request.codigoQr,
        ubicacionValidacion: request.ubicacionValidacion,
        usuarioValidadorId: request.usuarioValidadorId,
        fechaValidacionUtc: request.fechaValidacionUtc || new Date().toISOString(),
      }
      await this.client.post("/api/tickets/validar", payload)
      console.log("[v0] Ticket validado:", request.codigoQr)
    } catch (error: any) {
      console.error("[v0] Error validando ticket:", error)
      throw new Error(error.response?.data?.message || "Error al validar el ticket")
    }
  }

  /**
   * Cancela un ticket
   */
  async cancelarTicket(request: CancelarTicketRequest): Promise<void> {
    try {
      const payload = {
        ticketId: request.ticketId,
        razon: request.razon,
        fechaCancelacionUtc: request.fechaCancelacionUtc || new Date().toISOString(),
      }
      await this.client.post("/api/tickets/cancelar", payload)
      console.log("[v0] Ticket cancelado:", request.ticketId)
    } catch (error: any) {
      console.error("[v0] Error cancelando ticket:", error)
      throw new Error(error.response?.data?.message || "Error al cancelar el ticket")
    }
  }
}

export const ticketsApi = new TicketsApiAdapter()
