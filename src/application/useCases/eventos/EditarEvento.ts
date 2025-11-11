import type { Evento } from "../../../domain/entities/Evento"
import { eventosApi } from "../../../adapters/api/eventosApi"

export interface EditarEventoDTO {
  nombre?: string
  descripcion?: string
  categoria?: string
  fecha?: Date
  venue?: string
  aforo?: number
  precio?: number
}

export class EditarEventoUseCase {
  async ejecutar(eventoId: string, datos: EditarEventoDTO): Promise<Evento> {
    const evento = await eventosApi.obtenerDetalle(eventoId)

    if (!evento) {
      throw new Error("Evento no encontrado")
    }

    // Validar cambios
    if (datos.nombre !== undefined && datos.nombre.trim() === "") {
      throw new Error("El nombre no puede estar vacío")
    }

    if (datos.precio !== undefined && datos.precio < 0) {
      throw new Error("El precio no puede ser negativo")
    }

    if (datos.aforo !== undefined && datos.aforo <= 0) {
      throw new Error("El aforo debe ser mayor a 0")
    }

    const resultado = await eventosApi.editarEvento(eventoId, datos)

    if (!resultado) {
      throw new Error("Error editando evento")
    }

    return resultado
  }
}

export const editarEventoUseCase = new EditarEventoUseCase()
