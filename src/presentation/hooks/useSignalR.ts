"use client"

import { useCallback } from "react"
import { NotificationEventType } from "../../adapters/signalr/notificationHub"
import { useNotifications } from "../contexts/NotificationContext"
import { useAuth } from "../contexts/AuthContext"

/**
 * Hook para usar funcionalidad de SignalR
 * Facilita el envío de notificaciones en tiempo real desde componentes
 */
export function useSignalR() {
  const { usuario } = useAuth()
  const { agregarNotificacion } = useNotifications()

  const notificarReservaConfirmada = useCallback(
    (eventoNombre: string, cantidad: number, monto: number) => {
      if (usuario) {
        agregarNotificacion(
          NotificationEventType.RESERVA_CONFIRMADA,
          "Reserva Confirmada",
          `Tu reserva para ${eventoNombre} ha sido confirmada. ${cantidad} entradas por $${monto}`,
          { eventoNombre, cantidad, monto },
        )
      }
    },
    [usuario, agregarNotificacion],
  )

  const notificarPagoCompletado = useCallback(
    (monto: number, concepto: string) => {
      if (usuario) {
        agregarNotificacion(
          NotificationEventType.PAGO_COMPLETADO,
          "Pago Completado",
          `Tu pago de $${monto} por ${concepto} ha sido procesado exitosamente`,
          { monto, concepto },
        )
      }
    },
    [usuario, agregarNotificacion],
  )

<<<<<<< Updated upstream
  const notificarPagoFallido = useCallback(
    (monto: number, razon: string) => {
      if (usuario) {
        agregarNotificacion(
          NotificationEventType.PAGO_FALLIDO,
          "Pago Fallido",
          `Tu pago de $${monto} no pudo ser procesado. Razón: ${razon}. Por favor, intenta nuevamente.`,
          { monto, razon },
        )
      }
    },
    [usuario, agregarNotificacion],
  )

  const notificarEventoPublicado = useCallback(
    (eventoNombre: string) => {
      if (usuario) {
        agregarNotificacion(
          NotificationEventType.EVENTO_PUBLICADO,
          "Evento Publicado",
          `Tu evento "${eventoNombre}" ha sido publicado exitosamente`,
          { eventoNombre },
        )
      }
    },
    [usuario, agregarNotificacion],
  )

  const notificarEventoCancelado = useCallback(
    (eventoNombre: string) => {
      if (usuario) {
        agregarNotificacion(
          NotificationEventType.EVENTO_CANCELADO,
          "Evento Cancelado",
          `El evento "${eventoNombre}" ha sido cancelado`,
          { eventoNombre },
        )
      }
    },
    [usuario, agregarNotificacion],
  )

  const notificarEventoActualizado = useCallback(
    (eventoNombre: string, cambios: string[]) => {
      if (usuario) {
        agregarNotificacion(
          NotificationEventType.EVENTO_ACTUALIZADO,
          "Evento Actualizado",
          `El evento "${eventoNombre}" ha sido actualizado: ${cambios.join(", ")}`,
          { eventoNombre, cambios },
        )
      }
    },
    [usuario, agregarNotificacion],
  )
=======
        newConnection.on("PagoCompletado", (msg: string) => {
            console.log("Notificación recibida:", msg);
            toast.success(msg, { duration: 5000, position: 'top-right' });
        });
        newConnection.on("ReservaCompletada", (msg: string) => {
            console.log("Notificación recibida:", msg);
            toast.success(msg, { duration: 5000, position: 'top-right' });
        });

        const startConnection = async () => {
            try {
                await newConnection.start();
                console.log(`Invocando RegistrarUsuario para: ${username}`);
                await newConnection.invoke("RegistrarUsuario", username);

            } catch (err) {
                console.error("ERROR FATAL EN SIGNALR:", err);
            }
        };
>>>>>>> Stashed changes

  return {
    notificarReservaConfirmada,
    notificarPagoCompletado,
    notificarPagoFallido,
    notificarEventoPublicado,
    notificarEventoCancelado,
    notificarEventoActualizado,
  }
}
