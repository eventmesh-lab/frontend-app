import { eventosApi } from "../../../adapters/api/eventosApi"

export class EliminarEventoUseCase {
    async ejecutar(eventoId: string): Promise<void> {
        const evento = await eventosApi.obtenerDetalle(eventoId)

        if (!evento) {
            throw new Error("Evento no encontrado")
        }

        // El backend ya valida las inscripciones, pero podemos añadir una capa extra aquí si es necesario
        // Por ahora confiamos en el backend y en la lógica del botón en el UI

        await eventosApi.eliminarEvento(eventoId)
    }
}

export const eliminarEventoUseCase = new EliminarEventoUseCase()
