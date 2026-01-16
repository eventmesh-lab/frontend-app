import Modal from "../ui/Modal"
import Button from "../ui/Button"

interface ConfirmDeleteModalProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  eventName: string
  isLoading?: boolean
}

export default function ConfirmDeleteModal({
  isOpen,
  onClose,
  onConfirm,
  eventName,
  isLoading = false,
}: ConfirmDeleteModalProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="⚠️ Eliminar Evento"
      footer={
        <>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancelar
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={isLoading}>
            Eliminar Evento
          </Button>
        </>
      }
    >
      <div className="space-y-4">
        <p className="text-text-primary">
          ¿Estás seguro de eliminar el evento <span className="font-bold underline">"{eventName}"</span>?
        </p>
        <div className="bg-red-50 p-4 rounded-md border border-red-100">
          <p className="text-sm text-red-800 font-semibold mb-2">Esta acción:</p>
          <ul className="text-sm text-red-700 list-disc list-inside space-y-1">
            <li>Eliminará permanentemente el evento</li>
            <li>Eliminará todas las imágenes y archivos asociados</li>
            <li>No se puede deshacer</li>
          </ul>
        </div>
      </div>
    </Modal>
  )
}
