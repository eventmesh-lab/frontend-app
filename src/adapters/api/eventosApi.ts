import { type Evento, EstadoEvento, EventoEntity } from "../../domain/entities/Evento"
import { httpClient } from "./httpClient"

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
    venue: data.venue,
    estado: data.estado as EstadoEvento,
    precio: data.precio,
    aforo: data.aforo,
    aforoDisponible: data.aforoDisponible ?? data.aforo,
    organizadorId: data.organizadorId,
    imagen: data.imagen,
    fechaCreacion: new Date(data.fechaCreacion || data.fechaCreacion),
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
}

export const eventosApi = new EventosApiAdapter()
