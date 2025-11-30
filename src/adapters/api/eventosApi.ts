import { type Evento, EstadoEvento, EventoEntity, type SeccionEvento } from "../../domain/entities/Evento"
import { httpClient } from "./httpClient"

/**
 * DTO para crear un nuevo evento con secciones
 */
export interface CrearEventoApiDTO {
  nombre: string
  descripcion: string
  fecha: string // ISO string
  horasDuracion: number
  minutosDuracion: number
  organizadorId: string
  venueId: string
  categoria: string
  tarifaPublicacion: number
  secciones: SeccionEvento[]
}

/**
 * DTO para pagar la publicación de un evento
 */
export interface PagarPublicacionDTO {
  transaccionPagoId: string
  monto: number
}

/**
 * Mapea un evento desde la API (con fechas como strings) a EventoEntity
 */
function mapEventoFromApi(data: any): EventoEntity {
  return new EventoEntity({
    id: data.id,
    nombre: data.nombre,
    descripcion: data.descripcion,
    categoria: data.categoria,
    fecha: new Date(data.fecha),
    horasDuracion: data.horasDuracion,
    minutosDuracion: data.minutosDuracion,
    venue: data.venue || data.venueId,
    venueId: data.venueId,
    estado: data.estado as EstadoEvento,
    precio: data.precio,
    aforo: data.aforo,
    aforoDisponible: data.aforoDisponible ?? data.aforo,
    organizadorId: data.organizadorId,
    tarifaPublicacion: data.tarifaPublicacion,
    secciones: data.secciones,
    imagen: data.imagen,
    fechaCreacion: new Date(data.fechaCreacion || new Date()),
    fechaActualizacion: new Date(data.fechaActualizacion || new Date()),
  })
}

/**
 * Mapea un evento para enviarlo a la API (convierte fechas a ISO strings)
 */
function mapEventoToApi(evento: Partial<Evento>): any {
  const mapped: any = { ...evento }
  if (evento.fecha) {
    mapped.fecha = evento.fecha instanceof Date ? evento.fecha.toISOString() : evento.fecha
  }
  if (evento.fechaCreacion) {
    mapped.fechaCreacion = evento.fechaCreacion instanceof Date ? evento.fechaCreacion.toISOString() : evento.fechaCreacion
  }
  if (evento.fechaActualizacion) {
    mapped.fechaActualizacion = evento.fechaActualizacion instanceof Date ? evento.fechaActualizacion.toISOString() : evento.fechaActualizacion
  }
  return mapped
}

class EventosApiAdapter {
  private client = httpClient.getEventsClient()

  async crearEvento(evento: Evento): Promise<EventoEntity> {
    try {
      const payload = mapEventoToApi(evento)
      const response = await this.client.post("/api/eventos", payload)
      console.log("[v0] Evento creado:", response.data.id)
      return mapEventoFromApi(response.data)
    } catch (error: any) {
      console.error("[v0] Error creando evento:", error)
      throw new Error(error.response?.data?.message || "Error al crear el evento")
    }
  }

  async obtenerPublicados(params?: {
    categoria?: string
    fechaDesde?: string
    fechaHasta?: string
    precioMin?: number
    precioMax?: number
  }): Promise<EventoEntity[]> {
    try {
      const response = await this.client.get("/api/eventos/publicados", { params })
      const eventos = Array.isArray(response.data) ? response.data : []
      console.log("[v0] Eventos publicados recuperados:", eventos.length)
      return eventos.map(mapEventoFromApi)
    } catch (error: any) {
      console.error("[v0] Error obteniendo eventos:", error)
      throw new Error(error.response?.data?.message || "Error al obtener eventos")
    }
  }

  async obtenerDetalle(id: string): Promise<EventoEntity | null> {
    try {
      const response = await this.client.get(`/api/eventos/${id}`)
      console.log("[v0] Detalle evento:", id, "encontrado")
      return mapEventoFromApi(response.data)
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log("[v0] Evento no encontrado:", id)
        return null
      }
      console.error("[v0] Error obteniendo detalle:", error)
      throw new Error(error.response?.data?.message || "Error al obtener el evento")
    }
  }

  async publicarEvento(id: string): Promise<void> {
    try {
      await this.client.put(`/api/eventos/${id}/publicar`)
      console.log("[v0] Evento publicado:", id)
    } catch (error: any) {
      console.error("[v0] Error publicando evento:", error)
      throw new Error(error.response?.data?.message || "Error al publicar el evento")
    }
  }

  async obtenerPorOrganizador(organizadorId: string): Promise<EventoEntity[]> {
    try {
      const response = await this.client.get(`/api/eventos/organizador/${organizadorId}`)
      const eventos = Array.isArray(response.data) ? response.data : []
      console.log("[v0] Eventos del organizador:", organizadorId, "cantidad:", eventos.length)
      return eventos.map(mapEventoFromApi)
    } catch (error: any) {
      console.error("[v0] Error obteniendo eventos del organizador:", error)
      throw new Error(error.response?.data?.message || "Error al obtener eventos del organizador")
    }
  }

  async editarEvento(id: string, datos: Partial<Evento>): Promise<EventoEntity | null> {
    try {
      const payload = mapEventoToApi(datos)
      const response = await this.client.put(`/api/eventos/${id}`, payload)
      console.log("[v0] Evento editado:", id)
      return mapEventoFromApi(response.data)
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.warn("[v0] Evento no encontrado para editar:", id)
        return null
      }
      console.error("[v0] Error editando evento:", error)
      throw new Error(error.response?.data?.message || "Error al editar el evento")
    }
  }

  async cancelarEvento(id: string): Promise<void> {
    try {
      await this.client.delete(`/api/eventos/${id}`)
      console.log("[v0] Evento cancelado:", id)
    } catch (error: any) {
      console.error("[v0] Error cancelando evento:", error)
      throw new Error(error.response?.data?.message || "Error al cancelar el evento")
    }
  }

  /**
   * Crea un nuevo evento con secciones usando la estructura completa de la API
   */
  async crearEventoConSecciones(data: CrearEventoApiDTO): Promise<EventoEntity> {
    try {
      const response = await this.client.post("/api/eventos", data)
      console.log("[v0] Evento creado con secciones:", response.data.id)
      return mapEventoFromApi(response.data)
    } catch (error: any) {
      console.error("[v0] Error creando evento con secciones:", error)
      throw new Error(error.response?.data?.message || "Error al crear el evento")
    }
  }

  /**
   * Inicia el proceso de pago de publicación de un evento
   * El evento debe estar en estado 'Borrador'
   */
  async pagarPublicacion(eventoId: string, data: PagarPublicacionDTO): Promise<void> {
    try {
      await this.client.post(`/api/eventos/${eventoId}/pagar-publicacion`, data)
      console.log("[v0] Pago de publicación iniciado para evento:", eventoId)
    } catch (error: any) {
      console.error("[v0] Error pagando publicación:", error)
      throw new Error(error.response?.data?.message || "Error al pagar la publicación del evento")
    }
  }

  /**
   * Marca un evento publicado como en curso
   * El evento debe estar en estado 'Publicado'
   */
  async iniciarEvento(eventoId: string): Promise<void> {
    try {
      await this.client.post(`/api/eventos/${eventoId}/iniciar`)
      console.log("[v0] Evento iniciado:", eventoId)
    } catch (error: any) {
      console.error("[v0] Error iniciando evento:", error)
      throw new Error(error.response?.data?.message || "Error al iniciar el evento")
    }
  }

  /**
   * Finaliza un evento que está en curso
   * El evento debe estar en estado 'EnCurso'
   */
  async finalizarEvento(eventoId: string): Promise<void> {
    try {
      await this.client.post(`/api/eventos/${eventoId}/finalizar`)
      console.log("[v0] Evento finalizado:", eventoId)
    } catch (error: any) {
      console.error("[v0] Error finalizando evento:", error)
      throw new Error(error.response?.data?.message || "Error al finalizar el evento")
    }
  }
}

export const eventosApi = new EventosApiAdapter()
