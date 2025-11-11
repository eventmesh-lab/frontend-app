import type { Pago } from "../../../domain/entities/Pago"
import { pagosApi } from "../../../adapters/api/pagosApi"
import { reservasApi } from "../../../adapters/api/reservasApi"

export class ProcesarPagoUseCase {
  async ejecutar(pagoId: string): Promise<Pago> {
    // Obtener pago
    const pago = await pagosApi.obtenerDetalle(pagoId)
    if (!pago) {
      throw new Error("Pago no encontrado")
    }

    // Procesar pago
    const pagoProcesado = await pagosApi.procesarPago(pagoId)
    if (!pagoProcesado) {
      throw new Error("Error procesando pago")
    }

    // Si hay reserva asociada, confirmarla
    if (pago.reservaId) {
      await reservasApi.confirmarReserva(pago.reservaId)
    }

    return pagoProcesado
  }
}

export const procesarPagoUseCase = new ProcesarPagoUseCase()
