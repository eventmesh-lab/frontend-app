import { reservasApi } from "../../../adapters/api/reservasApi"

export class CancelarReservaUseCase {
  async ejecutar(reservaId: string): Promise<void> {
    const reserva = await reservasApi.obtenerDetalle(reservaId)

    if (!reserva) {
      throw new Error("Reserva no encontrada")
    }

    if (!reserva.puedeCancelarse()) {
      throw new Error("La reserva no puede ser cancelada en su estado actual")
    }

    await reservasApi.cancelarReserva(reservaId)
  }
}

export const cancelarReservaUseCase = new CancelarReservaUseCase()
