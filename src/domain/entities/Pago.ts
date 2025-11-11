export enum EstadoPago {
  PENDIENTE = "pendiente",
  COMPLETADO = "completado",
  FALLIDO = "fallido",
  REEMBOLSADO = "reembolsado",
}

export interface Pago {
  id: string
  reservaId?: string
  usuarioId: string
  monto: number
  concepto: string
  estado: EstadoPago
  metodo: string
  transaccionId?: string
  fechaCreacion: Date
  fechaActualizacion: Date
}

export class PagoEntity implements Pago {
  id: string
  reservaId?: string
  usuarioId: string
  monto: number
  concepto: string
  estado: EstadoPago
  metodo: string
  transaccionId?: string
  fechaCreacion: Date
  fechaActualizacion: Date

  constructor(data: Pago) {
    this.id = data.id
    this.reservaId = data.reservaId
    this.usuarioId = data.usuarioId
    this.monto = data.monto
    this.concepto = data.concepto
    this.estado = data.estado
    this.metodo = data.metodo
    this.transaccionId = data.transaccionId
    this.fechaCreacion = data.fechaCreacion
    this.fechaActualizacion = data.fechaActualizacion
  }

  completado(): boolean {
    return this.estado === EstadoPago.COMPLETADO
  }

  fallido(): boolean {
    return this.estado === EstadoPago.FALLIDO
  }
}
