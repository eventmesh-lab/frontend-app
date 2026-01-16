import { eventosApi } from "../../../adapters/api/eventosApi"

export interface RestringirContenidoDTO {
  tipoContenido: "imagen" | "folleto"
  motivo: string
}

/**
 * Caso de uso para que el administrador restrinja contenido de un evento
 * Cuando se restringe contenido, el organizador debe reemplazarlo antes de poder publicar
 */
export class RestringirContenidoEventoUseCase {
  async ejecutar(eventoId: string, data: RestringirContenidoDTO): Promise<void> {
    if (!eventoId) {
      throw new Error("ID del evento es requerido")
    }

    if (!data.tipoContenido || (data.tipoContenido !== "imagen" && data.tipoContenido !== "folleto")) {
      throw new Error("Tipo de contenido inválido. Debe ser 'imagen' o 'folleto'")
    }

    if (!data.motivo || data.motivo.trim().length < 10) {
      throw new Error("El motivo de restricción debe tener al menos 10 caracteres")
    }

    await eventosApi.restringirContenido(eventoId, data)
  }
}

export const restringirContenidoEventoUseCase = new RestringirContenidoEventoUseCase()
