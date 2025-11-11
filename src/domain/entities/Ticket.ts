export enum EstadoTicket {
  DISPONIBLE = "disponible",
  RESERVADO = "reservado",
  UTILIZADO = "utilizado",
  CANCELADO = "cancelado",
}

export interface Ticket {
  id: string
  eventoId: string
  reservaId?: string
  numero: string
  asiento: string
  codigoQR: string
  estado: EstadoTicket
  precio: number
}

export class TicketEntity implements Ticket {
  id: string
  eventoId: string
  reservaId?: string
  numero: string
  asiento: string
  codigoQR: string
  estado: EstadoTicket
  precio: number

  constructor(data: Ticket) {
    this.id = data.id
    this.eventoId = data.eventoId
    this.reservaId = data.reservaId
    this.numero = data.numero
    this.asiento = data.asiento
    this.codigoQR = data.codigoQR
    this.estado = data.estado
    this.precio = data.precio
  }

  estaConfirmado(): boolean {
    return this.estado === EstadoTicket.RESERVADO || this.estado === EstadoTicket.UTILIZADO
  }

  puedeUsarse(): boolean {
    return this.estado === EstadoTicket.RESERVADO
  }
}
