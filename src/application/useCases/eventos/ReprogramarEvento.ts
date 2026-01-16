import { eventosApi } from "../../../adapters/api/eventosApi"

export interface ReprogramarEventoDTO {
    eventoId: string
    nuevaFecha: Date
    nuevasHoras: number
    nuevosMinutos: number
    usuario: string
}

export class ReprogramarEventoUseCase {
    async ejecutar(data: ReprogramarEventoDTO): Promise<void> {
        const { eventoId, nuevaFecha, nuevasHoras, nuevosMinutos, usuario } = data

        if (new Date(nuevaFecha) <= new Date()) {
            throw new Error("La nueva fecha debe ser en el futuro")
        }

        await eventosApi.reprogramarEvento(eventoId, {
            nuevaFecha,
            nuevasHoras,
            nuevosMinutos,
            usuario
        })
    }
}

export const reprogramarEventoUseCase = new ReprogramarEventoUseCase()
