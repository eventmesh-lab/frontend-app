import { eventosApi } from "../../../adapters/api/eventosApi"
import { reservasApi, type CrearReservaRequest, type CrearReservaResponse } from "../../../adapters/api/reservasApi"
import { isValidGuid, emailToGuid } from "../../../utils/userIdHelper"

/**
 * DTO para crear una reserva temporal
 */
export interface CrearReservaTemporalDTO {
  asistenteId: string
  eventoId: string
  cantidad: number
  seccionId?: string
  tipoTicket?: string
  moneda?: string
}

/**
 * Caso de uso para crear una reserva temporal según la guía de API
 * Crea la reserva y devuelve el reservaId para redirigir a la página de pago
 */
export class CrearReservaTemporalUseCase {
  async ejecutar(data: CrearReservaTemporalDTO): Promise<CrearReservaResponse> {
    // #region agent log
    fetch('http://127.0.0.1:7244/ingest/7377a1e9-06fd-45ce-a99d-9abb93580ad1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CrearReservaTemporal.ts:22',message:'CrearReservaTemporalUseCase.ejecutar llamado',data:{eventoId:data.eventoId,asistenteId:data.asistenteId,cantidad:data.cantidad},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
    // #endregion
    // Generar GUID determinístico a partir del email si no es un GUID válido
    let asistenteId = data.asistenteId
    if (!isValidGuid(data.asistenteId)) {
      // Generar GUID determinístico a partir del email
      asistenteId = emailToGuid(data.asistenteId)
    }

    // Validar disponibilidad
    const evento = await eventosApi.obtenerDetalle(data.eventoId)

    if (!evento) {
      throw new Error("Evento no encontrado")
    }

    if (!evento.puedeReservar()) {
      throw new Error("El evento no está disponible para reservas")
    }

    if (data.cantidad <= 0) {
      throw new Error("La cantidad debe ser mayor a 0")
    }

    if (data.cantidad > evento.aforoDisponible) {
      throw new Error(`Solo hay ${evento.aforoDisponible} lugares disponibles`)
    }

    // Determinar precio y sección
    let precioUnitario = evento.precio
    let seccionId = data.seccionId

    // Si hay secciones, usar la sección seleccionada o la primera
    if (evento.secciones && evento.secciones.length > 0) {
      const seccion = seccionId
        ? evento.secciones.find((s) => s.id === seccionId || s.nombre === seccionId)
        : evento.secciones[0]

      if (seccion) {
        precioUnitario = seccion.precio
        seccionId = seccion.id || seccion.nombre
      }
    }

    // Construir items según el formato de la guía de API
    const items = Array.from({ length: data.cantidad }, () => ({
      seccionId: seccionId || "",
      asientoId: null, // Por ahora no manejamos asientos específicos
      tipoTicket: data.tipoTicket || "General",
      precio: precioUnitario,
      moneda: data.moneda || "USD",
    }))

    // Crear reserva temporal usando el formato de la guía
    const request: CrearReservaRequest = {
      eventoId: data.eventoId,
      asistenteId: asistenteId,
      items,
    }

    try {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/7377a1e9-06fd-45ce-a99d-9abb93580ad1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CrearReservaTemporal.ts:82',message:'Llamando a reservasApi.crearReservaTemporal',data:{reservaId:request.eventoId},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      const result = await reservasApi.crearReservaTemporal(request)
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/7377a1e9-06fd-45ce-a99d-9abb93580ad1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CrearReservaTemporal.ts:85',message:'Reserva creada exitosamente',data:{reservaId:result.reservaId,fechaExpiracion:result.fechaExpiracion},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      return result
    } catch (error) {
      // #region agent log
      fetch('http://127.0.0.1:7244/ingest/7377a1e9-06fd-45ce-a99d-9abb93580ad1',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'CrearReservaTemporal.ts:89',message:'Error al crear reserva',data:{error:error instanceof Error ? error.message : String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'A'})}).catch(()=>{});
      // #endregion
      throw error
    }
  }
}

export const crearReservaTemporalUseCase = new CrearReservaTemporalUseCase()
