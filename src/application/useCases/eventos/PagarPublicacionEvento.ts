import { eventosApi } from "../../../adapters/api/eventosApi"
import { EstadoEvento } from "../../../domain/entities/Evento"

export interface PagarPublicacionDTO {
  transaccionPagoId: string
  monto: number
}

/**
 * Caso de uso para iniciar el pago de publicación de un evento
 * El evento debe estar en estado 'Borrador' para poder pagar
 */
export class PagarPublicacionEventoUseCase {
  async ejecutar(eventoId: string, data: PagarPublicacionDTO): Promise<void> {
    // Validaciones
    if (!eventoId) {
      throw new Error("ID del evento es requerido")
    }

    if (!data.transaccionPagoId) {
      throw new Error("ID de transacción de pago es requerido")
    }

    if (data.monto <= 0) {
      throw new Error("El monto debe ser mayor a 0")
    }

    // Verificar que el evento existe y está en estado borrador
    const evento = await eventosApi.obtenerDetalle(eventoId)

    if (!evento) {
      throw new Error("Evento no encontrado")
    }

    if (evento.estado !== EstadoEvento.BORRADOR) {
      throw new Error("Solo se puede pagar la publicación de eventos en estado Borrador")
    }

    // Verificar que el monto coincide con la tarifa de publicación
    if (evento.tarifaPublicacion && data.monto !== evento.tarifaPublicacion) {
      throw new Error(`El monto debe coincidir con la tarifa de publicación: ${evento.tarifaPublicacion}`)
    }

    // Ejecutar el pago
    await eventosApi.pagarPublicacion(eventoId, data)
  }
}

export const pagarPublicacionEventoUseCase = new PagarPublicacionEventoUseCase()

