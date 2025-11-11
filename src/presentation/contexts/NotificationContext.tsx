"use client"

import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import {
  notificationHub,
  type NotificationEventType,
  type NotificationPayload,
} from "../../adapters/signalr/notificationHub"
import { useAuth } from "./AuthContext"

interface NotificationContextType {
  notificaciones: NotificationPayload[]
  cantidadNoLeidas: number
  agregarNotificacion: (
    tipo: NotificationEventType,
    titulo: string,
    mensaje: string,
    datos?: Record<string, any>,
  ) => void
  marcarComoLeida: (notificacionId: string) => void
  marcarTodasComoLeidas: () => void
  eliminarNotificacion: (notificacionId: string) => void
  limpiar: () => void
  isConected: boolean
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export function NotificationProvider({ children }: { children: ReactNode }) {
  const { usuario, isAuthenticated } = useAuth()
  const [notificaciones, setNotificaciones] = useState<NotificationPayload[]>([])
  const [cantidadNoLeidas, setCantidadNoLeidas] = useState(0)
  const [isConnected, setIsConnected] = useState(false)

  // Conectar a SignalR cuando usuario inicia sesión
  useEffect(() => {
    if (isAuthenticated && usuario) {
      const connectToHub = async () => {
        try {
          await notificationHub.connect(usuario.id)
          setIsConnected(true)

          // Cargar notificaciones existentes
          const notifs = notificationHub.obtenerNotificaciones(usuario.id)
          setNotificaciones(notifs)
          actualizarContador()

          console.log("[v0] Conectado al hub de notificaciones para:", usuario.id)
        } catch (error) {
          console.error("[v0] Error conectando al hub:", error)
          setIsConnected(false)
        }
      }

      connectToHub()

      // Escuchar eventos de nuevas notificaciones
      const handleNewNotification = (data: any) => {
        if (data.usuarioId === usuario.id) {
          setNotificaciones((prev) => [...prev, data.notificacion])
          actualizarContador()
        }
      }

      const handleNotificationRead = (data: any) => {
        if (data.usuarioId === usuario.id) {
          actualizarContador()
        }
      }

      notificationHub.on("notificacion", handleNewNotification)
      notificationHub.on("notificacion_leida", handleNotificationRead)
      notificationHub.on("todas_leidas", handleNotificationRead)

      // Cleanup
      return () => {
        notificationHub.off("notificacion", handleNewNotification)
        notificationHub.off("notificacion_leida", handleNotificationRead)
        notificationHub.off("todas_leidas", handleNotificationRead)
        notificationHub.disconnect(usuario.id)
      }
    }
  }, [isAuthenticated, usuario])

  const actualizarContador = useCallback(() => {
    if (usuario) {
      const contador = notificationHub.obtenerContadorNoLeidas(usuario.id)
      setCantidadNoLeidas(contador)
    }
  }, [usuario])

  const agregarNotificacion = useCallback(
    (tipo: NotificationEventType, titulo: string, mensaje: string, datos?: Record<string, any>) => {
      if (usuario) {
        notificationHub.enviarNotificacion(usuario.id, tipo, titulo, mensaje, datos)
      }
    },
    [usuario],
  )

  const marcarComoLeida = useCallback(
    (notificacionId: string) => {
      if (usuario) {
        notificationHub.marcarComoLeida(usuario.id, notificacionId)
      }
    },
    [usuario],
  )

  const marcarTodasComoLeidas = useCallback(() => {
    if (usuario) {
      notificationHub.marcarTodasComoLeidas(usuario.id)
    }
  }, [usuario])

  const eliminarNotificacion = useCallback(
    (notificacionId: string) => {
      if (usuario) {
        notificationHub.eliminarNotificacion(usuario.id, notificacionId)
        setNotificaciones((prev) => prev.filter((n) => n.id !== notificacionId))
      }
    },
    [usuario],
  )

  const limpiar = useCallback(() => {
    setNotificaciones([])
    setCantidadNoLeidas(0)
  }, [])

  return (
    <NotificationContext.Provider
      value={{
        notificaciones,
        cantidadNoLeidas,
        agregarNotificacion,
        marcarComoLeida,
        marcarTodasComoLeidas,
        eliminarNotificacion,
        limpiar,
        isConected: isConnected,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error("useNotifications debe usarse dentro de NotificationProvider")
  }
  return context
}
