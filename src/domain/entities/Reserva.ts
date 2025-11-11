export enum EstadoReserva {
  PENDIENTE = "pendiente",
  CONFIRMADA = "confirmada",
  CANCELADA = "cancelada",
  EXPIRADA = "expirada",
}

export interface Reserva {
  id: string
  asistenteId: string
  eventoId: string
  cantidad: number
  estado: EstadoReserva
  montoTotal: number
  fechaCreacion: Date
  fechaExpiracion: Date
  codigoReserva: string
}

export class ReservaEntity implements Reserva {
  id: string
  asistenteId: string
  eventoId: string
  cantidad: number
  estado: EstadoReserva
  montoTotal: number
  fechaCreacion: Date
  fechaExpiracion: Date
  codigoReserva: string

  constructor(data: Reserva) {
    this.id = data.id
    this.asistenteId = data.asistenteId
    this.eventoId = data.eventoId
    this.cantidad = data.cantidad
    this.estado = data.estado
    this.montoTotal = data.montoTotal
    this.fechaCreacion = data.fechaCreacion
    this.fechaExpiracion = data.fechaExpiracion
    this.codigoReserva = data.codigoReserva
  }

  estaVigente(): boolean {
    return this.estado === EstadoReserva.CONFIRMADA || this.estado === EstadoReserva.PENDIENTE
  }

  estaExpirada(): boolean {
    return new Date() > this.fechaExpiracion
  }

  puedeCancelarse(): boolean {
    return this.estado === EstadoReserva.CONFIRMADA || this.estado === EstadoReserva.PENDIENTE
  }
}
