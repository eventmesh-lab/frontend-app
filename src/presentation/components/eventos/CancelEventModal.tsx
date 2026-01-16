import { useState } from "react"
import Modal from "../ui/Modal"
import Button from "../ui/Button"
import FormField from "../ui/FormField"

interface CancelEventModalProps {
    isOpen: boolean
    onClose: () => void
    onConfirm: (reason: string) => void
    eventName: string
    registrationsCount: number
    eventDate: Date
    isLoading?: boolean
}

export default function CancelEventModal({
    isOpen,
    onClose,
    onConfirm,
    eventName,
    registrationsCount,
    eventDate,
    isLoading = false,
}: CancelEventModalProps) {
    const [reason, setReason] = useState("")
    const [error, setError] = useState<string | null>(null)

    const handleConfirm = () => {
        if (!reason || reason.trim().length < 10) {
            setError("Debes proporcionar un motivo de cancelación (mínimo 10 caracteres)")
            return
        }
        setError(null)
        onConfirm(reason)
    }

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            title="❌ Cancelar Evento"
            footer={
                <>
                    <Button variant="outline" onClick={onClose} disabled={isLoading}>
                        Volver
                    </Button>
                    <Button variant="danger" onClick={handleConfirm} isLoading={isLoading}>
                        Confirmar Cancelación
                    </Button>
                </>
            }
        >
            <div className="space-y-4">
                <div className="bg-bg-secondary p-4 rounded-md">
                    <p className="text-sm font-semibold text-text-primary">{eventName}</p>
                    <p className="text-sm text-text-secondary">Inscritos: {registrationsCount} personas</p>
                    <p className="text-sm text-text-secondary">Fecha: {new Date(eventDate).toLocaleDateString()}</p>
                </div>

                <FormField
                    label="Motivo de cancelación *"
                    error={error || undefined}
                    description="Explica brevemente a los inscritos por qué se cancela el evento."
                >
                    <textarea
                        className={`w-full p-3 border rounded-md focus:ring-2 focus:ring-primary focus:border-transparent outline-none transition-all h-32 resize-none ${error ? 'border-danger' : 'border-border-light'
                            }`}
                        placeholder="Ej: Problemas logísticos imprevistos..."
                        value={reason}
                        onChange={(e) => {
                            setReason(e.target.value)
                            if (e.target.value.trim().length >= 10) setError(null)
                        }}
                        disabled={isLoading}
                    />
                </FormField>

                <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-md border border-amber-100 italic">
                    <span className="text-amber-600">⚠️</span>
                    <p className="text-xs text-amber-800">
                        Al confirmar, se enviará automáticamente una notificación a todos los inscritos y el evento cambiará su estado a "Cancelado".
                    </p>
                </div>
            </div>
        </Modal>
    )
}
