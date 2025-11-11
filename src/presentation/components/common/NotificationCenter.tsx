"use client"

import { useState } from "react"
import { useNotifications } from "../../contexts/NotificationContext"

export default function NotificationCenter() {
  const { notificaciones, cantidadNoLeidas, marcarComoLeida, eliminarNotificacion } = useNotifications()
  const [isOpen, setIsOpen] = useState(false)

  const obtenerIcono = (tipo: string) => {
    switch (tipo) {
      case "ReservaConfirmada":
        return "✓"
      case "PagoCompletado":
        return "✓"
      case "PagoFallido":
        return "✗"
      case "EventoPublicado":
        return "📢"
      case "EventoCancelado":
        return "⚠"
      default:
        return "🔔"
    }
  }

  const obtenerColor = (tipo: string) => {
    switch (tipo) {
      case "ReservaConfirmada":
      case "PagoCompletado":
        return "border-l-4 border-l-success bg-green-50"
      case "PagoFallido":
      case "EventoCancelado":
        return "border-l-4 border-l-danger bg-red-50"
      case "EventoPublicado":
        return "border-l-4 border-l-primary bg-blue-50"
      default:
        return "border-l-4 border-l-accent bg-blue-50"
    }
  }

  return (
    <>
      {/* Botón de campana */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 text-text-secondary hover:text-primary transition-colors"
        aria-label="Notificaciones"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {cantidadNoLeidas > 0 && (
          <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-danger rounded-full">
            {cantidadNoLeidas}
          </span>
        )}
      </button>

      {/* Panel de notificaciones */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-border z-50 max-h-96 overflow-y-auto">
          <div className="sticky top-0 bg-white border-b border-border p-4 flex justify-between items-center rounded-t-lg">
            <h3 className="font-semibold text-text-primary">Notificaciones</h3>
            <button onClick={() => setIsOpen(false)} className="text-text-tertiary hover:text-text-secondary">
              ✕
            </button>
          </div>

          {notificaciones.length === 0 ? (
            <div className="p-8 text-center text-text-tertiary">
              <p className="text-sm">No hay notificaciones</p>
            </div>
          ) : (
            <div className="divide-y divide-border">
              {notificaciones.map((notif) => (
                <div
                  key={notif.id}
                  className={`p-4 hover:bg-bg-secondary transition-colors ${obtenerColor(notif.tipo)}`}
                  onClick={() => marcarComoLeida(notif.id)}
                >
                  <div className="flex gap-3">
                    <span className="text-xl flex-shrink-0">{obtenerIcono(notif.tipo)}</span>
                    <div className="flex-grow min-w-0">
                      <p className="font-semibold text-text-primary text-sm">{notif.titulo}</p>
                      <p className="text-text-secondary text-xs mt-1 line-clamp-2">{notif.mensaje}</p>
                      <p className="text-text-tertiary text-xs mt-2">{notif.timestamp.toLocaleTimeString()}</p>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation()
                        eliminarNotificacion(notif.id)
                      }}
                      className="text-text-tertiary hover:text-text-secondary ml-2 flex-shrink-0"
                    >
                      ✕
                    </button>
                  </div>
                  {!notif.leida && <div className="mt-2 h-1 bg-primary rounded-full"></div>}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </>
  )
}
