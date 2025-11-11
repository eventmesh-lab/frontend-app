import { type Evento, EstadoEvento } from "../../../domain/entities/Evento"
import { eventosApi } from "../../../adapters/api/eventosApi"

export interface CrearEventoDTO {
  nombre: string
  descripcion: string
  categoria: string
  fecha: Date
  venue: string
  aforo: number
  precio: number
  organizadorId: string
}

export class CrearEventoUseCase {
  async ejecutar(data: CrearEventoDTO): Promise<Evento> {
    // Validaciones
    if (!data.nombre || data.nombre.trim() === "") {
      throw new Error("El nombre del evento es requerido")
    }

    if (data.aforo <= 0) {
      throw new Error("El aforo debe ser mayor a 0")
    }

    if (data.precio < 0) {
      throw new Error("El precio no puede ser negativo")
    }

    if (new Date(data.fecha) <= new Date()) {
      throw new Error("La fecha del evento debe ser en el futuro")
    }

    // Crear entidad
    const evento: Evento = {
      id: `evt_${Date.now()}`,
      nombre: data.nombre,
      descripcion: data.descripcion,
      categoria: data.categoria,
      fecha: data.fecha,
      venue: data.venue,
      aforo: data.aforo,
      aforoDisponible: data.aforo,
      precio: data.precio,
      organizadorId: data.organizadorId,
      estado: EstadoEvento.BORRADOR,
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
    }

    // Persistir en API
    return eventosApi.crearEvento(evento)
  }
}

export const crearEventoUseCase = new CrearEventoUseCase()
