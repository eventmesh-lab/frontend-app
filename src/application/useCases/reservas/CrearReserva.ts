import { type Reserva, EstadoReserva, ReservaEntity } from "../../../domain/entities/Reserva"
import { eventosApi } from "../../../adapters/api/eventosApi"
import { reservasApi } from "../../../adapters/api/reservasApi"

export interface CrearReservaDTO {
  asistenteId: string
  eventoId: string
  cantidad: number
}

export class CrearReservaUseCase {
  async ejecutar(data: CrearReservaDTO): Promise<ReservaEntity> {
    // Validar disponibilidad
    const evento = await eventosApi.obtenerDetalle(data.eventoId)

    if (!evento) {
      throw new Error("Evento no encontrado")
    }

    if (!evento.puedeReservar()) {
      throw new Error("El evento no está disponible para reservas")
    }

    if (data.cantidad <= 0) {
      throw new Error("La cantidad debe ser mayor a 0")
    }

    if (data.cantidad > evento.aforoDisponible) {
      throw new Error(`Solo hay ${evento.aforoDisponible} lugares disponibles`)
    }

    // Crear reserva temporal
    const ahora = new Date()
    const expiracion = new Date(ahora.getTime() + 15 * 60 * 1000) // 15 minutos

    const reserva: Reserva = {
      id: `res_${Date.now()}`,
      asistenteId: data.asistenteId,
      eventoId: data.eventoId,
      cantidad: data.cantidad,
      estado: EstadoReserva.PENDIENTE,
      montoTotal: evento.precio * data.cantidad,
      fechaCreacion: ahora,
      fechaExpiracion: expiracion,
      codigoReserva: `RES${Date.now()}`,
    }

    return reservasApi.crearReserva(reserva)
  }
}

export const crearReservaUseCase = new CrearReservaUseCase()
