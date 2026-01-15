import { useEffect, useState, useRef } from 'react'
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr'
import useAuth from '../contexts/Auth'
import toast from 'react-hot-toast'

/**
 * DTO para actualizaciones de reserva desde SignalR
 */
export interface ReservaActualizadaDTO {
  reservaId: string
  estado: string
  montoTotal?: number
  fechaExpiracion?: string
  items?: Array<{
    seccionId: string
    asientoId: string | null
    tipoTicket: string
    precio: number
    moneda: string
  }>
}

/**
 * Hook para suscribirse a actualizaciones en tiempo real de una reserva específica
 * Se conecta al hub SignalR del servicio de reservas (puerto 5010)
 * Solo se suscribe cuando se proporciona un reservaId
 */
export function useReservaSignalR(reservaId: string | null) {
  const { accessToken } = useAuth()
  const [connection, setConnection] = useState<HubConnection | null>(null)
  const [reserva, setReserva] = useState<ReservaActualizadaDTO | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const processedEventIds = useRef<Set<string>>(new Set())

  useEffect(() => {
    // Solo conectar si hay un reservaId
    if (!reservaId) {
      return
    }

    console.log(`🔌 Conectando a SignalR para reserva: ${reservaId}`)

    // URL del hub de reservas en el servicio de reservas (puerto 5010)
    const hubUrl = import.meta.env.VITE_RESERVATIONS_SIGNALR_URL || 'http://localhost:5010/hubs/reservas'

    const newConnection = new HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => accessToken || ''
      })
      .withAutomaticReconnect({
        nextRetryDelayInMilliseconds: (retryContext) => {
          // Backoff exponencial: 1s, 2s, 3s, máximo 10s
          const delay = Math.min(1000 * (retryContext.previousRetryCount + 1), 10000)
          console.log(`🔄 Reintentando conexión SignalR en ${delay}ms...`)
          return delay
        }
      })
      .configureLogging(LogLevel.Information)
      .build()

    // Escuchar evento reservaActualizada
    newConnection.on('reservaActualizada', (dto: ReservaActualizadaDTO) => {
      // Validar estructura mínima del evento
      if (!dto.reservaId || !dto.estado) {
        console.warn('⚠️ Evento reservaActualizada inválido:', dto)
        return
      }

      // Idempotencia: verificar si ya procesamos este evento
      // Usar una clave basada en reservaId + estado + timestamp del evento si está disponible
      // Si no hay timestamp, usar el estado actual para evitar procesar el mismo estado dos veces
      const eventKey = `${dto.reservaId}-${dto.estado}`
      const lastProcessedState = processedEventIds.current.has(eventKey)
      
      // Solo procesar si el estado cambió o es la primera vez
      if (lastProcessedState && reserva?.estado === dto.estado) {
        console.log('⏭️ Evento duplicado ignorado (mismo estado):', eventKey)
        return
      }
      processedEventIds.current.add(eventKey)

      // Limpiar eventos antiguos (mantener solo los últimos 100)
      if (processedEventIds.current.size > 100) {
        const firstKey = Array.from(processedEventIds.current)[0]
        processedEventIds.current.delete(firstKey)
      }

      console.log('📩 Reserva actualizada:', dto)
      setReserva(dto)

      // Mostrar notificaciones según el estado
      if (dto.estado === 'Expirada') {
        toast.error('Tu reserva ha expirado. Los asientos han sido liberados.', {
          duration: 5000,
          position: 'top-right'
        })
      } else if (dto.estado === 'Cancelada') {
        toast.warning('Tu reserva ha sido cancelada.', {
          duration: 5000,
          position: 'top-right'
        })
      } else if (dto.estado === 'Confirmada') {
        toast.success('¡Reserva confirmada exitosamente!', {
          duration: 5000,
          position: 'top-right'
        })
      }
    })

    // Manejar reconexión
    newConnection.onreconnecting(() => {
      console.log('🔄 Reconectando a SignalR...')
      setIsConnected(false)
    })

    newConnection.onreconnected(() => {
      console.log('✅ Reconectado a SignalR')
      setIsConnected(true)
      // Re-suscribirse al grupo al reconectar
      if (reservaId) {
        newConnection.invoke('JoinReserva', reservaId).catch((err) => {
          console.error('Error re-suscribiéndose a reserva:', err)
        })
      }
    })

    newConnection.onclose((error) => {
      console.log('🔌 Conexión SignalR cerrada', error)
      setIsConnected(false)
      if (error) {
        setError('Conexión perdida con el servidor')
      }
    })

    // Iniciar conexión y suscribirse
    const startConnection = async () => {
      try {
        await newConnection.start()
        console.log('🟢 SignalR conectado. ID:', newConnection.connectionId)
        setIsConnected(true)
        setError(null)

        // Suscribirse al grupo de la reserva
        console.log(`📤 Suscribiéndose a reserva: ${reservaId}`)
        await newConnection.invoke('JoinReserva', reservaId)
        console.log('✅ Suscrito a actualizaciones de la reserva')
      } catch (err: any) {
        console.error('❌ Error conectando a SignalR:', err)
        setError(err.message || 'Error al conectar con el servidor')
        setIsConnected(false)
        // No es crítico - la app puede funcionar sin SignalR
      }
    }

    startConnection()
    setConnection(newConnection)

    // Cleanup: dejar el grupo y cerrar conexión
    return () => {
      if (newConnection && newConnection.state !== 'Disconnected') {
        // Dejar el grupo antes de cerrar
        if (reservaId) {
          newConnection.invoke('LeaveReserva', reservaId).catch(() => {
            // Ignorar errores al dejar el grupo
          })
        }
        newConnection.stop().catch(() => {
          // Ignorar errores al detener
        })
      }
    }
  }, [reservaId, accessToken])

  return {
    reserva,
    isConnected,
    error,
    connection
  }
}
