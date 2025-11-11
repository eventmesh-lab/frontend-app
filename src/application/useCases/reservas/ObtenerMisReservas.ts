import { ReservaEntity } from "../../../domain/entities/Reserva"
import { reservasApi } from "../../../adapters/api/reservasApi"

export class ObtenerMisReservasUseCase {
  async ejecutar(asistenteId: string): Promise<ReservaEntity[]> {
    if (!asistenteId) {
      throw new Error("ID de asistente requerido")
    }

    return reservasApi.obtenerMisReservas(asistenteId)
  }
}

export const obtenerMisReservasUseCase = new ObtenerMisReservasUseCase()
