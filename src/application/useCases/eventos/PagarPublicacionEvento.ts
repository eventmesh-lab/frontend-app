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
    // Validaciones básicas
    if (!eventoId || eventoId.trim() === "") {
      throw new Error("ID del evento es requerido")
    }

    if (!data.transaccionPagoId || data.transaccionPagoId.trim() === "") {
      throw new Error("ID de transacción de pago es requerido")
    }

    if (!data.monto || data.monto <= 0) {
      throw new Error("El monto debe ser mayor a 0")
    }

    // Verificar que el evento existe y está en estado borrador
    let evento
    try {
      evento = await eventosApi.obtenerDetalle(eventoId)
    } catch (error: any) {
      console.error("[PagarPublicacionEvento] Error obteniendo detalle:", error)
      throw new Error("No se pudo obtener la información del evento. Verifica que el evento exista.")
    }

    if (!evento) {
      throw new Error("Evento no encontrado")
    }

    if (evento.estado !== EstadoEvento.BORRADOR) {
      throw new Error(
        `No se puede pagar la publicación. El evento está en estado "${evento.estado}". ` +
        `Solo se puede pagar la publicación de eventos en estado "Borrador".`
      )
    }

    // Verificar que el monto coincide con la tarifa de publicación
    if (evento.tarifaPublicacion && data.monto !== evento.tarifaPublicacion) {
      throw new Error(
        `El monto ($${data.monto}) no coincide con la tarifa de publicación ($${evento.tarifaPublicacion}). ` +
        `Debes pagar exactamente $${evento.tarifaPublicacion}.`
      )
    }

    // Verificar que existe tarifa de publicación
    if (!evento.tarifaPublicacion || evento.tarifaPublicacion <= 0) {
      throw new Error("El evento no tiene una tarifa de publicación configurada. Contacta al administrador.")
    }

    // Ejecutar el pago
    try {
      await eventosApi.pagarPublicacion(eventoId, data)
    } catch (error: any) {
      // Re-lanzar el error con el mensaje mejorado del adaptador
      throw error
    }
  }
}

export const pagarPublicacionEventoUseCase = new PagarPublicacionEventoUseCase()

