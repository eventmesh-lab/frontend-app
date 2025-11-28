import { type Reserva, EstadoReserva, ReservaEntity } from "../../domain/entities/Reserva"
import { httpClient } from "./httpClient"

/**
 * Mapea una reserva desde la API a ReservaEntity
 */
function mapReservaFromApi(data: any): ReservaEntity {
  return new ReservaEntity({
    id: data.id,
    asistenteId: data.asistenteId,
    eventoId: data.eventoId,
    cantidad: data.cantidad,
    estado: data.estado as EstadoReserva,
    montoTotal: data.montoTotal,
    fechaCreacion: new Date(data.fechaCreacion || new Date()),
    fechaExpiracion: new Date(data.fechaExpiracion || new Date()),
    codigoReserva: data.codigoReserva,
  })
}

/**
 * Mapea una reserva para enviarla a la API
 */
function mapReservaToApi(reserva: Partial<Reserva>): any {
  const mapped: any = { ...reserva }
  if (reserva.fechaCreacion) {
    mapped.fechaCreacion = reserva.fechaCreacion instanceof Date ? reserva.fechaCreacion.toISOString() : reserva.fechaCreacion
  }
  if (reserva.fechaExpiracion) {
    mapped.fechaExpiracion = reserva.fechaExpiracion instanceof Date ? reserva.fechaExpiracion.toISOString() : reserva.fechaExpiracion
  }
  return mapped
}

class ReservasApiAdapter {
  private client = httpClient.getBaseClient()

  async crearReserva(reserva: Partial<Reserva>): Promise<ReservaEntity> {
    try {
      // La API espera eventoId y cantidad, no el objeto completo
      const payload = {
        eventoId: reserva.eventoId,
        cantidad: reserva.cantidad,
      }
      const response = await this.client.post("/api/reservas", payload)
      console.log("[v0] Reserva creada:", response.data.id, "Código:", response.data.codigoReserva)
      return mapReservaFromApi(response.data)
    } catch (error: any) {
      console.error("[v0] Error creando reserva:", error)
      throw new Error(error.response?.data?.message || "Error al crear la reserva")
    }
  }

  async obtenerMisReservas(): Promise<ReservaEntity[]> {
    try {
      const response = await this.client.get("/api/mis-reservas")
      const reservas = Array.isArray(response.data) ? response.data : []
      console.log("[v0] Reservas obtenidas:", reservas.length)
      return reservas.map(mapReservaFromApi)
    } catch (error: any) {
      console.error("[v0] Error obteniendo reservas:", error)
      throw new Error(error.response?.data?.message || "Error al obtener las reservas")
    }
  }

  async obtenerDetalle(id: string): Promise<ReservaEntity | null> {
    try {
      const response = await this.client.get(`/api/reservas/${id}`)
      console.log("[v0] Detalle reserva:", id, "encontrado")
      return mapReservaFromApi(response.data)
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log("[v0] Reserva no encontrada:", id)
        return null
      }
      console.error("[v0] Error obteniendo detalle:", error)
      throw new Error(error.response?.data?.message || "Error al obtener la reserva")
    }
  }

  async cancelarReserva(id: string): Promise<void> {
    try {
      await this.client.delete(`/api/reservas/${id}`)
      console.log("[v0] Reserva cancelada:", id)
    } catch (error: any) {
      console.error("[v0] Error cancelando reserva:", error)
      throw new Error(error.response?.data?.message || "Error al cancelar la reserva")
    }
  }

  async confirmarReserva(id: string): Promise<void> {
    try {
      await this.client.put(`/api/reservas/${id}/confirmar`)
      console.log("[v0] Reserva confirmada:", id)
    } catch (error: any) {
      console.error("[v0] Error confirmando reserva:", error)
      throw new Error(error.response?.data?.message || "Error al confirmar la reserva")
    }
  }

  async verificarDisponibilidad(eventoId: string, cantidad: number): Promise<boolean> {
    try {
      // Si la API no tiene endpoint específico, obtenemos el evento y verificamos
      const response = await this.client.get(`/api/eventos/${eventoId}`)
      const evento = response.data
      const disponible = evento.aforoDisponible >= cantidad
      console.log("[v0] Disponibilidad verificada para evento:", eventoId, "disponible:", disponible)
      return disponible
    } catch (error: any) {
      console.error("[v0] Error verificando disponibilidad:", error)
      return false
    }
  }
}

export const reservasApi = new ReservasApiAdapter()
