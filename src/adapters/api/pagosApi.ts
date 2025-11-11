import { type Pago, EstadoPago, PagoEntity } from "../../domain/entities/Pago"

class PagosApiAdapter {
  private pagos = new Map<string, PagoEntity>()
  private pagoIdCounter = 1000

  async crearPago(pago: Pago): Promise<PagoEntity> {
    await this.delay(350)

    if (this.pagos.has(pago.id)) {
      throw new Error("El pago ya existe")
    }

    const pagoEntity = new PagoEntity(pago)
    this.pagos.set(pago.id, pagoEntity)
    console.log("[v0] Pago creado:", pago.id, "Monto:", pago.monto)
    return pagoEntity
  }

  async procesarPago(pagoId: string): Promise<PagoEntity | null> {
    await this.delay(800) // Simular procesamiento más lento

    const pago = this.pagos.get(pagoId)
    if (!pago) {
      console.warn("[v0] Pago no encontrado para procesar:", pagoId)
      return null
    }

    // Simular posibilidad de fallo (90% éxito)
    const exito = Math.random() < 0.9
    if (!exito) {
      pago.estado = EstadoPago.FALLIDO
      console.log("[v0] Pago fallido (simulado):", pagoId)
    } else {
      pago.estado = EstadoPago.COMPLETADO
      pago.transaccionId = `TRX${Date.now()}`
      console.log("[v0] Pago procesado exitosamente:", pagoId, "ID:", pago.transaccionId)
    }

    pago.fechaActualizacion = new Date()
    this.pagos.set(pagoId, pago)

    return pago
  }

  async obtenerDetalle(id: string): Promise<PagoEntity | null> {
    await this.delay(150)

    const pago = this.pagos.get(id) || null
    console.log("[v0] Detalle pago:", id, pago ? "encontrado" : "no encontrado")
    return pago
  }

  async obtenerPorUsuario(usuarioId: string): Promise<PagoEntity[]> {
    await this.delay(200)

    const pagos = Array.from(this.pagos.values()).filter((pago) => pago.usuarioId === usuarioId)

    console.log("[v0] Pagos del usuario:", usuarioId, "cantidad:", pagos.length)
    return pagos
  }

  async reembolsarPago(pagoId: string): Promise<void> {
    await this.delay(400)

    const pago = this.pagos.get(pagoId)
    if (!pago) {
      throw new Error("Pago no encontrado")
    }

    if (!pago.completado()) {
      throw new Error("Solo se pueden reembolsar pagos completados")
    }

    pago.estado = EstadoPago.REEMBOLSADO
    pago.fechaActualizacion = new Date()
    this.pagos.set(pagoId, pago)

    console.log("[v0] Pago reembolsado:", pagoId)
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

export const pagosApi = new PagosApiAdapter()
