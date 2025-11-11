"use client"

import type { ReactNode } from "react"

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  children: ReactNode
  footer?: ReactNode
}

export default function Modal({ isOpen, onClose, title, children, footer }: ModalProps) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div className="fixed inset-0 bg-black bg-opacity-50 z-40" onClick={onClose}></div>

      {/* Modal */}
      <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
          {/* Header */}
          <div className="flex justify-between items-center p-6 border-b border-border-light">
            <h2 className="text-xl font-semibold text-text-primary">{title}</h2>
            <button onClick={onClose} className="text-text-tertiary hover:text-text-secondary">
              ✕
            </button>
          </div>

          {/* Body */}
          <div className="p-6">{children}</div>

          {/* Footer */}
          {footer && <div className="p-6 border-t border-border-light flex gap-3 justify-end">{footer}</div>}
        </div>
      </div>
    </>
  )
}
