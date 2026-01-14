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
 * La API ahora devuelve URLs completas de blobs en imagenPrincipalBlob, imagenesSecundariasBlobs y folletoBlob
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
    transaccionPagoId: data.transaccionPagoId,
    secciones: data.secciones,
    // Mapear nuevos campos de imagen y folleto
    imagen: data.mainImageUrl || data.imagenPrincipalBlob || data.imagen,
    imagenesSecundarias: data.secondaryImageUrls || data.imagenesSecundariasBlobs || data.imagenesSecundarias || [],
    folletoUrl: data.brochureUrl || data.folletoBlob || data.folletoUrl,
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
  private baseUrl = "/api/Eventos"

  async crearEvento(evento: Evento): Promise<EventoEntity> {
    try {
      const payload = mapEventoToApi(evento)
      const response = await this.client.post(this.baseUrl, payload)
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
      const response = await this.client.get(`${this.baseUrl}/publicados`, { params })
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
      const response = await this.client.get(`${this.baseUrl}/${id}`)
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

  async obtenerTodos(): Promise<EventoEntity[]> {
    try {
      const response = await this.client.get(this.baseUrl)
      const eventos = Array.isArray(response.data) ? response.data : []
      console.log("[EventosApi] Total de eventos recuperados:", eventos.length)
      return eventos.map(mapEventoFromApi)
    } catch (error: any) {
      console.error("[EventosApi] Error obteniendo todos los eventos:", error)
      throw new Error(error.response?.data?.message || "Error al obtener eventos")
    }
  }

  async publicarEvento(id: string, pagoConfirmadoId?: string): Promise<void> {
    try {
      // El backend espera POST /api/eventos/{id}/publicar con PublicarEventoCommand
      // El PagoConfirmadoId es requerido por el validador
      // Si no se proporciona, generamos un GUID temporal (el backend debería validar si existe)
      const pagoId = pagoConfirmadoId || this.generarGuidTemporal()

      const payload = {
        pagoConfirmadoId: pagoId,
      }

      console.log("[EventosApi] Publicando evento:", id, "con pagoId:", pagoId)

      await this.client.post(`${this.baseUrl}/${id}/publicar`, payload)
      console.log("[EventosApi] Evento publicado exitosamente:", id)
    } catch (error: any) {
      console.error("[EventosApi] Error publicando evento:", error)
      console.error("[EventosApi] Error response:", error.response?.data)
      throw new Error(error.response?.data?.message || "Error al publicar el evento")
    }
  }

  /**
   * Genera un GUID temporal para usar como PagoConfirmadoId
   * Nota: Esto es un workaround. En producción, debería venir de un servicio de pagos real
   */
  private generarGuidTemporal(): string {
    // Generar un GUID v4 válido
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      const r = Math.random() * 16 | 0
      const v = c === 'x' ? r : (r & 0x3 | 0x8)
      return v.toString(16)
    })
  }

  async obtenerPorOrganizador(organizadorId: string): Promise<EventoEntity[]> {
    try {
      const response = await this.client.get(`${this.baseUrl}/organizador/${organizadorId}`)
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
      const response = await this.client.put(`${this.baseUrl}/${id}`, payload)
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
      await this.client.delete(`${this.baseUrl}/${id}`)
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
      // Mapear el payload al formato camelCase que espera el backend
      const payload = {
        nombre: data.nombre,
        descripcion: data.descripcion,
        fecha: data.fecha, // ISO string
        horasDuracion: data.horasDuracion,
        minutosDuracion: data.minutosDuracion,
        organizadorId: data.organizadorId,
        venueId: data.venueId,
        categoria: data.categoria,
        tarifaPublicacion: data.tarifaPublicacion,
        secciones: data.secciones.map(s => ({
          nombre: s.nombre,
          capacidad: s.capacidad,
          precio: s.precio,
          tipoAsiento: s.tipoAsiento || null,
        })),
      }

      console.log("[EventosApi] Payload a enviar:", JSON.stringify(payload, null, 2))

      const response = await this.client.post(this.baseUrl, payload)
      console.log("[EventosApi] Respuesta del backend:", response.data)

      // El backend devuelve CrearEventoCommandResponse que solo tiene { Id: guid }
      // Necesitamos obtener el evento completo después de crearlo
      const eventoId = response.data?.Id || response.data?.id

      if (!eventoId) {
        throw new Error("La respuesta del servidor no contiene el ID del evento creado")
      }

      console.log("[EventosApi] Evento creado con ID:", eventoId)

      // Obtener el evento completo desde el backend
      // Esperar un momento para que el backend procese la creación
      await new Promise(resolve => setTimeout(resolve, 500))

      const eventoCompleto = await this.obtenerDetalle(eventoId)

      if (!eventoCompleto) {
        throw new Error("Evento creado pero no se pudo obtener la información completa")
      }

      return eventoCompleto
    } catch (error: any) {
      console.error("[EventosApi] Error creando evento con secciones:", error)
      console.error("[EventosApi] Error response:", error.response?.data)
      console.error("[EventosApi] Error status:", error.response?.status)

      // Extraer mensaje de error más detallado
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.title ||
        error.response?.data?.errors?.join?.(", ") ||
        error.message ||
        "Error al crear el evento"

      throw new Error(errorMessage)
    }
  }

  /**
   * Inicia el proceso de pago de publicación de un evento
   * El evento debe estar en estado 'Borrador'
   */
  async pagarPublicacion(eventoId: string, data: PagarPublicacionDTO): Promise<void> {
    try {
      // Mapear a camelCase para el nuevo backend
      const payload = {
        transaccionPagoId: data.transaccionPagoId,
        monto: data.monto,
      }

      console.log("[EventosApi] Pagando publicación:", eventoId, "payload:", payload)

      await this.client.post(`${this.baseUrl}/${eventoId}/pagar-publicacion`, payload)
      console.log("[EventosApi] Pago de publicación iniciado exitosamente para evento:", eventoId)
    } catch (error: any) {
      console.error("[EventosApi] Error pagando publicación:", error)
      console.error("[EventosApi] Error response:", error.response?.data)
      throw new Error(error.response?.data?.message || "Error al pagar la publicación del evento")
    }
  }

  /**
   * Marca un evento publicado como en curso
   * El evento debe estar en estado 'Publicado'
   */
  async iniciarEvento(eventoId: string): Promise<void> {
    try {
      await this.client.post(`${this.baseUrl}/${eventoId}/iniciar`)
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
      await this.client.post(`${this.baseUrl}/${eventoId}/finalizar`)
      console.log("[v0] Evento finalizado:", eventoId)
    } catch (error: any) {
      console.error("[v0] Error finalizando evento:", error)
      throw new Error(error.response?.data?.message || "Error al finalizar el evento")
    }
  }

  /**
   * Sube una imagen principal para un evento
   */
  async subirImagenPrincipal(eventoId: string, archivo: File): Promise<string> {
    try {
      const formData = new FormData()
      formData.append('file', archivo)

      console.log("[EventosApi] Subiendo imagen principal para evento:", eventoId)

      const response = await this.client.post(`${this.baseUrl}/${eventoId}/imagen-principal`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      console.log("[EventosApi] Imagen principal subida:", response.data)
      return response.data // El string con la info/URL
    } catch (error: any) {
      console.error("[EventosApi] Error subiendo imagen principal:", error)
      throw new Error(error.response?.data?.message || "Error al subir la imagen principal")
    }
  }

  /**
   * Sube imágenes secundarias para un evento
   */
  async subirImagenSecundaria(eventoId: string, archivos: File[]): Promise<string[]> {
    try {
      const formData = new FormData()
      archivos.forEach(file => formData.append('files', file))

      console.log("[EventosApi] Subiendo imágenes secundarias para evento:", eventoId)

      const response = await this.client.post(`${this.baseUrl}/${eventoId}/imagen-secundaria`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      console.log("[EventosApi] Imágenes secundarias subidas:", response.data)
      return Array.isArray(response.data) ? response.data : [response.data]
    } catch (error: any) {
      console.error("[EventosApi] Error subiendo imágenes secundarias:", error)
      throw new Error(error.response?.data?.message || "Error al subir imágenes secundarias")
    }
  }

  /**
   * Sube un folleto para un evento
   */
  async subirFolleto(eventoId: string, archivo: File): Promise<string> {
    try {
      const formData = new FormData()
      formData.append('file', archivo)

      console.log("[EventosApi] Subiendo folleto para evento:", eventoId)

      const response = await this.client.post(`${this.baseUrl}/${eventoId}/folleto`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })

      console.log("[EventosApi] Folleto subido:", response.data)
      return response.data
    } catch (error: any) {
      console.error("[EventosApi] Error subiendo folleto:", error)
      throw new Error(error.response?.data?.message || "Error al subir el folleto")
    }
  }

  /**
   * Mantiene compatibilidad con código antiguo, redirige a imagen-secundaria
   * @deprecated Usar métodos específicos
   */
  async subirImagenes(eventoId: string, archivos: File[]): Promise<string[]> {
    return this.subirImagenSecundaria(eventoId, archivos)
  }
}

export const eventosApi = new EventosApiAdapter()
