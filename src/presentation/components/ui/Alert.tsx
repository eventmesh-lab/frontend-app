"use client"

import type { ReactNode } from "react"

interface AlertProps {
  type: "success" | "error" | "warning" | "info"
  title?: string
  children: ReactNode
  onClose?: () => void
}

export default function Alert({ type, title, children, onClose }: AlertProps) {
  const typeClasses = {
    success: "bg-green-50 border-l-4 border-l-success text-green-800",
    error: "bg-red-50 border-l-4 border-l-danger text-red-800",
    warning: "bg-yellow-50 border-l-4 border-l-warning text-yellow-800",
    info: "bg-blue-50 border-l-4 border-l-primary text-blue-800",
  }

  const iconMap = {
    success: "✓",
    error: "✗",
    warning: "!",
    info: "ⓘ",
  }

  return (
    <div className={`p-4 rounded-md flex gap-3 ${typeClasses[type]}`}>
      <span className="text-lg flex-shrink-0 font-bold">{iconMap[type]}</span>
      <div className="flex-grow">
        {title && <h4 className="font-semibold mb-1">{title}</h4>}
        <p className="text-sm">{children}</p>
      </div>
      {onClose && (
        <button onClick={onClose} className="text-lg font-bold opacity-50 hover:opacity-75">
          ✕
        </button>
      )}
    </div>
  )
}
