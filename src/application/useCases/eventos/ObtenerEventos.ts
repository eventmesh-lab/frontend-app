import { EventoEntity } from "../../../domain/entities/Evento"
import { eventosApi } from "../../../adapters/api/eventosApi"

export interface FiltrosEvento {
  categoria?: string
  fechaDesde?: Date
  fechaHasta?: Date
  precioMinimo?: number
  precioMaximo?: number
}

export class ObtenerEventosUseCase {
  async ejecutar(filtros?: FiltrosEvento): Promise<EventoEntity[]> {
    let eventos = await eventosApi.obtenerPublicados()

    if (!filtros) {
      return eventos
    }

    // Aplicar filtros
    if (filtros.categoria) {
      eventos = eventos.filter((evt) => evt.categoria.toLowerCase() === filtros.categoria!.toLowerCase())
    }

    if (filtros.fechaDesde) {
      eventos = eventos.filter((evt) => new Date(evt.fecha) >= new Date(filtros.fechaDesde!))
    }

    if (filtros.fechaHasta) {
      eventos = eventos.filter((evt) => new Date(evt.fecha) <= new Date(filtros.fechaHasta!))
    }

    if (filtros.precioMinimo !== undefined) {
      eventos = eventos.filter((evt) => evt.precio >= filtros.precioMinimo!)
    }

    if (filtros.precioMaximo !== undefined) {
      eventos = eventos.filter((evt) => evt.precio <= filtros.precioMaximo!)
    }

    return eventos
  }
}

export const obtenerEventosUseCase = new ObtenerEventosUseCase()
