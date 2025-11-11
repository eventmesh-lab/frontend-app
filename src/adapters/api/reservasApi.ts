import { type Reserva, EstadoReserva, ReservaEntity } from "../../domain/entities/Reserva"

class ReservasApiAdapter {
  private reservas = new Map<string, ReservaEntity>()
  private reservaIdCounter = 1000

  async crearReserva(reserva: Reserva): Promise<ReservaEntity> {
    await this.delay(350)

    if (this.reservas.has(reserva.id)) {
      throw new Error("La reserva ya existe")
    }

    const reservaEntity = new ReservaEntity(reserva)
    this.reservas.set(reserva.id, reservaEntity)
    console.log("[v0] Reserva creada:", reserva.id, "Código:", reserva.codigoReserva)
    return reservaEntity
  }

  async obtenerMisReservas(asistenteId: string): Promise<ReservaEntity[]> {
    await this.delay(200)

    const reservas = Array.from(this.reservas.values()).filter((res) => res.asistenteId === asistenteId)

    console.log("[v0] Reservas del asistente:", asistenteId, "cantidad:", reservas.length)
    return reservas
  }

  async obtenerDetalle(id: string): Promise<ReservaEntity | null> {
    await this.delay(150)

    const reserva = this.reservas.get(id) || null
    console.log("[v0] Detalle reserva:", id, reserva ? "encontrado" : "no encontrado")
    return reserva
  }

  async cancelarReserva(id: string): Promise<void> {
    await this.delay(300)

    const reserva = this.reservas.get(id)
    if (!reserva) {
      throw new Error("Reserva no encontrada")
    }

    if (!reserva.puedeCancelarse()) {
      throw new Error("La reserva no puede ser cancelada en su estado actual")
    }

    reserva.estado = EstadoReserva.CANCELADA
    this.reservas.set(id, reserva)

    console.log("[v0] Reserva cancelada:", id)
  }

  async confirmarReserva(id: string): Promise<void> {
    await this.delay(250)

    const reserva = this.reservas.get(id)
    if (!reserva) {
      throw new Error("Reserva no encontrada")
    }

    reserva.estado = EstadoReserva.CONFIRMADA
    this.reservas.set(id, reserva)

    console.log("[v0] Reserva confirmada:", id)
  }

  async verificarDisponibilidad(eventoId: string, cantidad: number): Promise<boolean> {
    await this.delay(150)

    const reservasDelEvento = Array.from(this.reservas.values()).filter(
      (res) => res.eventoId === eventoId && res.estaVigente(),
    )

    const totalReservado = reservasDelEvento.reduce((acc, res) => acc + res.cantidad, 0)
    const disponible = cantidad <= 500 - totalReservado

    console.log("[v0] Disponibilidad verificada para evento:", eventoId, "disponible:", disponible)
    return disponible
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

export const reservasApi = new ReservasApiAdapter()
