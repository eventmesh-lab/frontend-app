import { EventEmitter } from "events"

// Tipos de eventos que se pueden emitir
export enum NotificationEventType {
  RESERVA_CONFIRMADA = "ReservaConfirmada",
  PAGO_COMPLETADO = "PagoCompletado",
  PAGO_FALLIDO = "PagoFallido",
  EVENTO_PUBLICADO = "EventoPublicado",
  EVENTO_CANCELADO = "EventoCancelado",
  RESERVA_CANCELADA = "ReservaCancelada",
  EVENTO_ACTUALIZADO = "EventoActualizado",
  ENTRADA_VENDIDA = "EntradaVendida",
  SISTEMA = "SistemaNotificacion",
}

export interface NotificationPayload {
  id: string
  tipo: NotificationEventType
  titulo: string
  mensaje: string
  datos?: Record<string, any>
  timestamp: Date
  leida: boolean
}

export interface SignalRConnection {
  userId: string
  connectionId: string
  conectado: boolean
}

/**
 * Hub de notificaciones mock para SignalR
 * En producción, se conectaría a un servidor SignalR real
 */
class NotificationHubAdapter extends EventEmitter {
  private connections = new Map<string, SignalRConnection>()
  private notificaciones = new Map<string, NotificationPayload[]>()
  private reconnectAttempts = 0
  private maxReconnectAttempts = 5
  private reconnectInterval = 5000
  private isConnected = false

  constructor() {
    super()
    this.setMaxListeners(10)
  }

  /**
   * Conecta al hub de notificaciones
   */
  async connect(userId: string): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        const connectionId = `conn_${Date.now()}_${Math.random().toString(36).substring(7)}`

        const connection: SignalRConnection = {
          userId,
          connectionId,
          conectado: true,
        }

        this.connections.set(userId, connection)
        this.notificaciones.set(userId, [])
        this.isConnected = true
        this.reconnectAttempts = 0

        console.log("[v0] SignalR conectado para usuario:", userId, "ID:", connectionId)

        // Simular pequeño delay de conexión
        setTimeout(() => {
          this.emit("connected", { userId, connectionId })
          resolve()
        }, 200)
      } catch (error) {
        console.error("[v0] Error conectando a SignalR:", error)
        reject(error)
      }
    })
  }

  /**
   * Desconecta del hub
   */
  async disconnect(userId: string): Promise<void> {
    try {
      const connection = this.connections.get(userId)
      if (connection) {
        connection.conectado = false
        console.log("[v0] SignalR desconectado para usuario:", userId)
        this.emit("disconnected", { userId })
      }
    } catch (error) {
      console.error("[v0] Error desconectando de SignalR:", error)
    }
  }

  /**
   * Envía una notificación a un usuario específico
   */
  enviarNotificacion(
    usuarioId: string,
    tipo: NotificationEventType,
    titulo: string,
    mensaje: string,
    datos?: Record<string, any>,
  ): void {
    const notificacion: NotificationPayload = {
      id: `notif_${Date.now()}`,
      tipo,
      titulo,
      mensaje,
      datos,
      timestamp: new Date(),
      leida: false,
    }

    // Guardar notificación
    const notificaciones = this.notificaciones.get(usuarioId) || []
    notificaciones.push(notificacion)
    this.notificaciones.set(usuarioId, notificaciones)

    // Emitir evento
    this.emit("notificacion", { usuarioId, notificacion })

    console.log("[v0] Notificación enviada:", usuarioId, tipo)
  }

  /**
   * Envía notificación a múltiples usuarios
   */
  enviarNotificacionGrupo(
    usuariosIds: string[],
    tipo: NotificationEventType,
    titulo: string,
    mensaje: string,
    datos?: Record<string, any>,
  ): void {
    usuariosIds.forEach((usuarioId) => {
      this.enviarNotificacion(usuarioId, tipo, titulo, mensaje, datos)
    })

    console.log("[v0] Notificación de grupo enviada a", usuariosIds.length, "usuarios")
  }

  /**
   * Obtiene todas las notificaciones de un usuario
   */
  obtenerNotificaciones(usuarioId: string): NotificationPayload[] {
    return this.notificaciones.get(usuarioId) || []
  }

  /**
   * Marca una notificación como leída
   */
  marcarComoLeida(usuarioId: string, notificacionId: string): void {
    const notificaciones = this.notificaciones.get(usuarioId) || []
    const notificacion = notificaciones.find((n) => n.id === notificacionId)

    if (notificacion) {
      notificacion.leida = true
      this.emit("notificacion_leida", { usuarioId, notificacionId })
      console.log("[v0] Notificación marcada como leída:", notificacionId)
    }
  }

  /**
   * Marca todas las notificaciones como leídas
   */
  marcarTodasComoLeidas(usuarioId: string): void {
    const notificaciones = this.notificaciones.get(usuarioId) || []
    notificaciones.forEach((n) => (n.leida = true))
    this.emit("todas_leidas", { usuarioId })
    console.log("[v0] Todas las notificaciones marcadas como leídas para:", usuarioId)
  }

  /**
   * Elimina una notificación
   */
  eliminarNotificacion(usuarioId: string, notificacionId: string): void {
    const notificaciones = this.notificaciones.get(usuarioId) || []
    const filtradas = notificaciones.filter((n) => n.id !== notificacionId)
    this.notificaciones.set(usuarioId, filtradas)
    this.emit("notificacion_eliminada", { usuarioId, notificacionId })
    console.log("[v0] Notificación eliminada:", notificacionId)
  }

  /**
   * Obtiene el contador de notificaciones no leídas
   */
  obtenerContadorNoLeidas(usuarioId: string): number {
    const notificaciones = this.notificaciones.get(usuarioId) || []
    return notificaciones.filter((n) => !n.leida).length
  }

  /**
   * Verifica el estado de la conexión
   */
  estaConectado(): boolean {
    return this.isConnected
  }

  /**
   * Simula intentos de reconexión automática
   */
  async intentarReconectar(userId: string): Promise<void> {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("[v0] Máximo de intentos de reconexión alcanzado")
      return
    }

    this.reconnectAttempts++
    console.log(`[v0] Intentando reconectar (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`)

    await new Promise((resolve) => setTimeout(resolve, this.reconnectInterval))

    try {
      await this.connect(userId)
    } catch (error) {
      console.error("[v0] Fallo en reconexión:", error)
      await this.intentarReconectar(userId)
    }
  }
}

// Singleton
export const notificationHub = new NotificationHubAdapter()
