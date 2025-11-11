import { type Pago, EstadoPago } from "../../../domain/entities/Pago"
import { pagosApi } from "../../../adapters/api/pagosApi"

export interface CrearPagoDTO {
  usuarioId: string
  reservaId?: string
  monto: number
  concepto: string
  metodo: string
}

export class CrearPagoUseCase {
  async ejecutar(data: CrearPagoDTO): Promise<Pago> {
    // Validaciones
    if (data.monto <= 0) {
      throw new Error("El monto debe ser mayor a 0")
    }

    if (!data.concepto || data.concepto.trim() === "") {
      throw new Error("El concepto del pago es requerido")
    }

    if (!data.metodo || data.metodo.trim() === "") {
      throw new Error("El método de pago es requerido")
    }

    // Crear pago
    const pago: Pago = {
      id: `pay_${Date.now()}`,
      usuarioId: data.usuarioId,
      reservaId: data.reservaId,
      monto: data.monto,
      concepto: data.concepto,
      estado: EstadoPago.PENDIENTE,
      metodo: data.metodo,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
    }

    return pagosApi.crearPago(pago)
  }
}

export const crearPagoUseCase = new CrearPagoUseCase()
