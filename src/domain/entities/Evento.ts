export enum EstadoEvento {
  BORRADOR = "Borrador",
  PENDIENTE_PAGO = "PendientePago",
  PUBLICADO = "Publicado",
  EN_CURSO = "EnCurso",
  FINALIZADO = "Finalizado",
  CANCELADO = "Cancelado",
}

/**
 * Tipos de asiento disponibles para las secciones de un evento
 */
export type TipoAsiento = "Numerado" | "General"

/**
 * Representa una sección dentro de un evento con su capacidad y precio
 */
export interface SeccionEvento {
  id?: string
  nombre: string
  capacidad: number
  precio: number
  tipoAsiento: TipoAsiento
}

export interface Evento {
  id: string
  nombre: string
  descripcion: string
  categoria: string
  fecha: Date
  horasDuracion?: number
  minutosDuracion?: number
  venue: string
  venueId?: string
  estado: EstadoEvento
  precio: number
  aforo: number
  aforoDisponible: number
  organizadorId: string
  tarifaPublicacion?: number
  transaccionPagoId?: string
  secciones?: SeccionEvento[]
  imagen?: string
  imagenesSecundarias?: string[] // URLs completas de imágenes secundarias del blob storage
  folletoUrl?: string // URL completa del folleto PDF en blob storage
  fechaCreacion: Date
  fechaActualizacion: Date
}

export class EventoEntity implements Evento {
  id: string
  nombre: string
  descripcion: string
  categoria: string
  fecha: Date
  horasDuracion?: number
  minutosDuracion?: number
  venue: string
  venueId?: string
  estado: EstadoEvento
  precio: number
  aforo: number
  aforoDisponible: number
  organizadorId: string
  tarifaPublicacion?: number
  transaccionPagoId?: string
  secciones?: SeccionEvento[]
  imagen?: string
  imagenesSecundarias?: string[] // URLs completas de imágenes secundarias del blob storage
  folletoUrl?: string // URL completa del folleto PDF en blob storage
  fechaCreacion: Date
  fechaActualizacion: Date

  constructor(data: Evento) {
    this.id = data.id
    this.nombre = data.nombre
    this.descripcion = data.descripcion
    this.categoria = data.categoria
    this.fecha = data.fecha
    this.horasDuracion = data.horasDuracion
    this.minutosDuracion = data.minutosDuracion
    this.venue = data.venue
    this.venueId = data.venueId
    this.estado = data.estado
    this.precio = data.precio
    this.aforo = data.aforo
    this.aforoDisponible = data.aforoDisponible
    this.organizadorId = data.organizadorId
    this.tarifaPublicacion = data.tarifaPublicacion
    this.transaccionPagoId = data.transaccionPagoId
    this.secciones = data.secciones
    this.imagen = data.imagen
    this.imagenesSecundarias = data.imagenesSecundarias
    this.folletoUrl = data.folletoUrl
    this.fechaCreacion = data.fechaCreacion
    this.fechaActualizacion = data.fechaActualizacion
  }

  estaPublicado(): boolean {
    return this.estado === EstadoEvento.PUBLICADO
  }

  estaBorrador(): boolean {
    return this.estado === EstadoEvento.BORRADOR
  }

  estaPendientePago(): boolean {
    return this.estado === EstadoEvento.PENDIENTE_PAGO
  }

  estaEnCurso(): boolean {
    return this.estado === EstadoEvento.EN_CURSO
  }

  estaFinalizado(): boolean {
    return this.estado === EstadoEvento.FINALIZADO
  }

  puedeReservar(): boolean {
    // Solo verificar que el evento esté publicado
    // La validación de capacidad la maneja el API de tickets
    return this.estaPublicado()
  }

  puedePagarPublicacion(): boolean {
    return this.estaBorrador()
  }

  estaPagado(): boolean {
    return !!this.transaccionPagoId && this.transaccionPagoId !== ""
  }

  puedeIniciar(): boolean {
    return this.estaPublicado()
  }

  puedeFinalizar(): boolean {
    return this.estaEnCurso()
  }

  obtenerPorcentajeOcupacion(): number {
    return ((this.aforo - this.aforoDisponible) / this.aforo) * 100
  }

  /**
   * Calcula la duración total del evento en minutos
   */
  obtenerDuracionEnMinutos(): number {
    return (this.horasDuracion || 0) * 60 + (this.minutosDuracion || 0)
  }
}
