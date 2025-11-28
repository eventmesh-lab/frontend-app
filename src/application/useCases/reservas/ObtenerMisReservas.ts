import { ReservaEntity } from "../../../domain/entities/Reserva"
import { reservasApi } from "../../../adapters/api/reservasApi"

export class ObtenerMisReservasUseCase {
  async ejecutar(): Promise<ReservaEntity[]> {
    // La API obtiene el usuario del token de autenticación
    return reservasApi.obtenerMisReservas()
  }
}

export const obtenerMisReservasUseCase = new ObtenerMisReservasUseCase()
