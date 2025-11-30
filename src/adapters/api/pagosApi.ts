import { type Pago, EstadoPago, PagoEntity } from "../../domain/entities/Pago"
import { httpClient } from "./httpClient"

/**
 * Mapea un pago desde la API a PagoEntity
 */
function mapPagoFromApi(data: any): PagoEntity {
  return new PagoEntity({
    id: data.id,
    reservaId: data.reservaId,
    usuarioId: data.usuarioId,
    monto: data.monto,
    concepto: data.concepto,
    estado: data.estado as EstadoPago,
    metodo: data.metodo,
    transaccionId: data.transaccionId,
    fechaCreacion: new Date(data.fechaCreacion || new Date()),
    fechaActualizacion: new Date(data.fechaActualizacion || new Date()),
  })
}

/**
 * Mapea un pago para enviarlo a la API
 */
function mapPagoToApi(pago: Partial<Pago>): any {
  const mapped: any = { ...pago }
  if (pago.fechaCreacion) {
    mapped.fechaCreacion = pago.fechaCreacion instanceof Date ? pago.fechaCreacion.toISOString() : pago.fechaCreacion
  }
  if (pago.fechaActualizacion) {
    mapped.fechaActualizacion = pago.fechaActualizacion instanceof Date ? pago.fechaActualizacion.toISOString() : pago.fechaActualizacion
  }
  return mapped
}

class PagosApiAdapter {
  private client = httpClient.getBaseClient()

  async crearPago(pago: Partial<Pago>): Promise<PagoEntity> {
    try {
      // La API espera reservaId, monto, concepto y metodo
      const payload = {
        reservaId: pago.reservaId,
        monto: pago.monto,
        concepto: pago.concepto,
        metodo: pago.metodo,
      }
      const response = await this.client.post("/api/pagos", payload)
      console.log("[v0] Pago creado:", response.data.id, "Monto:", response.data.monto)
      return mapPagoFromApi(response.data)
    } catch (error: any) {
      console.error("[v0] Error creando pago:", error)
      throw new Error(error.response?.data?.message || "Error al crear el pago")
    }
  }

  async procesarPago(pagoId: string, transaccionId?: string): Promise<PagoEntity | null> {
    try {
      const payload = transaccionId ? { transaccionId } : {}
      const response = await this.client.post(`/api/pagos/${pagoId}/procesar`, payload)
      console.log("[v0] Pago procesado:", pagoId, "Estado:", response.data.estado)
      return mapPagoFromApi(response.data)
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.warn("[v0] Pago no encontrado para procesar:", pagoId)
        return null
      }
      console.error("[v0] Error procesando pago:", error)
      throw new Error(error.response?.data?.message || "Error al procesar el pago")
    }
  }

  async obtenerDetalle(id: string): Promise<PagoEntity | null> {
    try {
      const response = await this.client.get(`/api/pagos/${id}`)
      console.log("[v0] Detalle pago:", id, "encontrado")
      return mapPagoFromApi(response.data)
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log("[v0] Pago no encontrado:", id)
        return null
      }
      console.error("[v0] Error obteniendo detalle:", error)
      throw new Error(error.response?.data?.message || "Error al obtener el pago")
    }
  }

  async obtenerMisPagos(): Promise<PagoEntity[]> {
    try {
      const response = await this.client.get("/api/mis-pagos")
      const pagos = Array.isArray(response.data) ? response.data : []
      console.log("[v0] Pagos obtenidos:", pagos.length)
      return pagos.map(mapPagoFromApi)
    } catch (error: any) {
      console.error("[v0] Error obteniendo pagos:", error)
      throw new Error(error.response?.data?.message || "Error al obtener los pagos")
    }
  }

  async obtenerPorUsuario(usuarioId: string): Promise<PagoEntity[]> {
    try {
      // Si la API no tiene endpoint específico, usar mis-pagos o filtrar
      const response = await this.client.get("/api/mis-pagos")
      const pagos = Array.isArray(response.data) ? response.data : []
      const filtered = pagos.filter((p: any) => p.usuarioId === usuarioId)
      console.log("[v0] Pagos del usuario:", usuarioId, "cantidad:", filtered.length)
      return filtered.map(mapPagoFromApi)
    } catch (error: any) {
      console.error("[v0] Error obteniendo pagos del usuario:", error)
      throw new Error(error.response?.data?.message || "Error al obtener los pagos")
    }
  }

  async reembolsarPago(pagoId: string): Promise<void> {
    try {
      await this.client.post(`/api/pagos/${pagoId}/reembolsar`)
      console.log("[v0] Pago reembolsado:", pagoId)
    } catch (error: any) {
      console.error("[v0] Error reembolsando pago:", error)
      throw new Error(error.response?.data?.message || "Error al reembolsar el pago")
    }
  }
}

export const pagosApi = new PagosApiAdapter()
