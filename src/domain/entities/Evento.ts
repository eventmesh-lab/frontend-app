export enum EstadoEvento {
  BORRADOR = "borrador",
  PUBLICADO = "publicado",
  EN_CURSO = "en_curso",
  FINALIZADO = "finalizado",
  CANCELADO = "cancelado",
}

export interface Evento {
  id: string
  nombre: string
  descripcion: string
  categoria: string
  fecha: Date
  venue: string
  estado: EstadoEvento
  precio: number
  aforo: number
  aforoDisponible: number
  organizadorId: string
  imagen?: string
  fechaCreacion: Date
  fechaActualizacion: Date
}

export class EventoEntity implements Evento {
  id: string
  nombre: string
  descripcion: string
  categoria: string
  fecha: Date
  venue: string
  estado: EstadoEvento
  precio: number
  aforo: number
  aforoDisponible: number
  organizadorId: string
  imagen?: string
  fechaCreacion: Date
  fechaActualizacion: Date

  constructor(data: Evento) {
    this.id = data.id
    this.nombre = data.nombre
    this.descripcion = data.descripcion
    this.categoria = data.categoria
    this.fecha = data.fecha
    this.venue = data.venue
    this.estado = data.estado
    this.precio = data.precio
    this.aforo = data.aforo
    this.aforoDisponible = data.aforoDisponible
    this.organizadorId = data.organizadorId
    this.imagen = data.imagen
    this.fechaCreacion = data.fechaCreacion
    this.fechaActualizacion = data.fechaActualizacion
  }

  estaPublicado(): boolean {
    return this.estado === EstadoEvento.PUBLICADO
  }

  puedeReservar(): boolean {
    return this.estaPublicado() && this.aforoDisponible > 0
  }

  obtenerPorcentajeOcupacion(): number {
    return ((this.aforo - this.aforoDisponible) / this.aforo) * 100
  }
}
