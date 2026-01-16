import { EventoEntity } from "../../../domain/entities/Evento"
import { eventosApi } from "../../../adapters/api/eventosApi"

/**
 * Caso de uso para obtener TODOS los eventos del sistema
 * Usado principalmente por administradores para gestionar todos los eventos
 * independientemente de su estado
 */
export class ObtenerTodosEventosUseCase {
  async ejecutar(): Promise<EventoEntity[]> {
    try {
      const eventos = await eventosApi.obtenerTodos()
      console.log("[ObtenerTodosEventos] Total de eventos obtenidos:", eventos.length)
      return eventos
    } catch (error: any) {
      console.error("[ObtenerTodosEventos] Error obteniendo todos los eventos:", error)
      throw new Error(error.message || "Error al obtener todos los eventos")
    }
  }
}

export const obtenerTodosEventosUseCase = new ObtenerTodosEventosUseCase()
