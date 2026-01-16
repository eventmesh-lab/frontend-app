"use client"

import { useEffect, useState } from "react"
import { useParams, useNavigate } from "react-router-dom"
import useAuth from "../contexts/Auth"
import { useEventos } from "../hooks/useEventos"
import OrganizadorLayout from "../layouts/OrganizadorLayout"
import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import Badge from "../components/ui/Badge"
import LoadingSpinner from "../components/ui/LoadingSpinner"
import Alert from "../components/ui/Alert"
import Modal from "../components/ui/Modal"
import Input from "../components/ui/Input"
import FormField from "../components/ui/FormField"
import ConfirmDeleteModal from "../components/eventos/ConfirmDeleteModal"
import CancelEventModal from "../components/eventos/CancelEventModal"
import { EstadoEvento } from "../../domain/entities/Evento"

/**
 * Mapeo de estados a colores de badge
 */
const estadoColors: Record<EstadoEvento, "default" | "success" | "warning" | "danger" | "info"> = {
  [EstadoEvento.BORRADOR]: "warning",
  [EstadoEvento.PENDIENTE_PAGO]: "info",
  [EstadoEvento.PUBLICADO]: "success",
  [EstadoEvento.EN_CURSO]: "info",
  [EstadoEvento.FINALIZADO]: "default",
  [EstadoEvento.CANCELADO]: "danger",
}

/**
 * Mapeo de estados a nombres legibles
 */
const estadoLabels: Record<EstadoEvento, string> = {
  [EstadoEvento.BORRADOR]: "Borrador",
  [EstadoEvento.PENDIENTE_PAGO]: "Pendiente de Pago",
  [EstadoEvento.PUBLICADO]: "Publicado",
  [EstadoEvento.EN_CURSO]: "En Curso",
  [EstadoEvento.FINALIZADO]: "Finalizado",
  [EstadoEvento.CANCELADO]: "Cancelado",
}

/**
 * Página de detalle de evento para el organizador
 * Muestra información completa y acciones según el estado del evento
 */
export default function DetalleEventoOrganizadorPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { username } = useAuth()
  const {
    eventoDetalle,
    isLoading,
    error,
    obtenerDetalle,
    pagarPublicacion,
    iniciarEvento,
    finalizarEvento,
    subirImagenes,
    subirImagenPrincipal,
    subirImagenSecundaria,
    subirFolleto,
    eliminarEvento,
    cancelarEvento,
  } = useEventos()

  // Estado para modales
  const [showPagarModal, setShowPagarModal] = useState(false)
  const [showConfirmModal, setShowConfirmModal] = useState<"iniciar" | "finalizar" | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showCancelModal, setShowCancelModal] = useState(false)

  // Estado para el formulario de pago
  const [pagoData, setPagoData] = useState({
    transaccionPagoId: "",
    monto: 0,
  })

  // Estado para feedback
  const [actionError, setActionError] = useState<string | null>(null)
  const [actionSuccess, setActionSuccess] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState(false)

  // Estado para carga de imágenes
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [selectedPrincipalFile, setSelectedPrincipalFile] = useState<File | null>(null)
  const [selectedSecondaryFiles, setSelectedSecondaryFiles] = useState<File[]>([])
  const [selectedBrochureFile, setSelectedBrochureFile] = useState<File | null>(null)
  const [uploadingImages, setUploadingImages] = useState(false)

  // Cargar detalle del evento
  useEffect(() => {
    if (id) {
      obtenerDetalle(id)
    }
  }, [id, obtenerDetalle])

  // Actualizar monto cuando cambie la tarifa de publicación
  useEffect(() => {
    if (eventoDetalle?.tarifaPublicacion) {
      setPagoData((prev) => ({ ...prev, monto: eventoDetalle.tarifaPublicacion || 0 }))
    }
  }, [eventoDetalle])

  /**
   * Genera un ID de transacción único
   */
  const generarTransaccionId = () => {
    const uuid = crypto.randomUUID()
    setPagoData((prev) => ({ ...prev, transaccionPagoId: uuid }))
  }

  /**
   * Maneja el pago de publicación
   */
  const handlePagarPublicacion = async () => {
    // Validaciones previas
    if (!id) {
      setActionError("ID del evento no disponible")
      return
    }

    if (!pagoData.transaccionPagoId || pagoData.transaccionPagoId.trim() === "") {
      setActionError("ID de transacción requerido. Haz clic en 'Generar' para crear uno automáticamente.")
      return
    }

    if (!pagoData.monto || pagoData.monto <= 0) {
      setActionError("El monto debe ser mayor a 0")
      return
    }

    if (eventoDetalle && eventoDetalle.tarifaPublicacion && pagoData.monto !== eventoDetalle.tarifaPublicacion) {
      setActionError(
        `El monto debe ser exactamente $${eventoDetalle.tarifaPublicacion}. ` +
        `Monto ingresado: $${pagoData.monto}`
      )
      return
    }

    setActionLoading(true)
    setActionError(null)
    setActionSuccess(null)

    try {
      console.log("[DetalleEventoOrganizador] Iniciando pago de publicación:", {
        eventoId: id,
        transaccionPagoId: pagoData.transaccionPagoId,
        monto: pagoData.monto,
        tarifaPublicacion: eventoDetalle?.tarifaPublicacion,
      })

      await pagarPublicacion(id, pagoData.transaccionPagoId, pagoData.monto)
      
      setActionSuccess("¡Pago de publicación iniciado exitosamente! El evento será publicado automáticamente una vez confirmado el pago.")
      setShowPagarModal(false)
      
      // Limpiar datos del formulario
      setPagoData({
        transaccionPagoId: "",
        monto: eventoDetalle?.tarifaPublicacion || 0,
      })
      
      // Recargar detalle para reflejar el cambio de estado
      await obtenerDetalle(id)
    } catch (err) {
      console.error("[DetalleEventoOrganizador] Error en pago de publicación:", err)
      const errorMessage = err instanceof Error ? err.message : "Error al pagar la publicación del evento"
      setActionError(errorMessage)
    } finally {
      setActionLoading(false)
    }
  }

  /**
   * Maneja el inicio del evento
   */
  const handleIniciarEvento = async () => {
    if (!id) return

    setActionLoading(true)
    setActionError(null)

    try {
      await iniciarEvento(id)
      setActionSuccess("¡Evento iniciado exitosamente!")
      setShowConfirmModal(null)
      await obtenerDetalle(id)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Error al iniciar evento")
    } finally {
      setActionLoading(false)
    }
  }

  /**
   * Maneja la finalización del evento
   */
  const handleFinalizarEvento = async () => {
    if (!id) return

    setActionLoading(true)
    setActionError(null)

    try {
      await finalizarEvento(id)
      setActionSuccess("¡Evento finalizado exitosamente!")
      setShowConfirmModal(null)
      await obtenerDetalle(id)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Error al finalizar evento")
    } finally {
      setActionLoading(false)
    }
  }

  /**
   * Maneja la eliminación del evento
   */
  const handleEliminarEvento = async () => {
    if (!id) return

    setActionLoading(true)
    setActionError(null)

    try {
      await eliminarEvento(id)
      setActionSuccess("¡Evento eliminado exitosamente!")
      setShowDeleteModal(false)
      navigate("/organizador") // Redirigir al dashboard después de eliminar
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Error al eliminar evento")
    } finally {
      setActionLoading(false)
    }
  }

  /**
   * Maneja la cancelación del evento
   */
  const handleCancelarEvento = async (motivo: string) => {
    if (!id) return

    setActionLoading(true)
    setActionError(null)

    try {
      await cancelarEvento(id, motivo, username || "unknown")
      setActionSuccess("¡Evento cancelado exitosamente!")
      setShowCancelModal(false)
      await obtenerDetalle(id) // Recargar detalle para reflejar el estado cancelado
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Error al cancelar evento")
    } finally {
      setActionLoading(false)
    }
  }

  /**
   * Formatea una fecha para mostrar
   */
  const formatearFecha = (fecha: Date) => {
    return new Date(fecha).toLocaleDateString("es-ES", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  /**
   * Maneja la selección de archivos
   */
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      setSelectedFiles(Array.from(files))
    }
  }

  /**
   * Maneja la selección de imagen principal
   */
  const handlePrincipalFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedPrincipalFile(file)
    }
  }

  /**
   * Maneja la selección de imágenes secundarias
   */
  const handleSecondaryFilesSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files) {
      setSelectedSecondaryFiles(Array.from(files))
    }
  }

  /**
   * Maneja la selección de folleto
   */
  const handleBrochureFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedBrochureFile(file)
    }
  }

  /**
   * Maneja la subida de imágenes
   */
  const handleUploadImages = async () => {
    if (!id || selectedFiles.length === 0) return

    setUploadingImages(true)
    setActionError(null)

    try {
      await subirImagenes(id, selectedFiles)
      setActionSuccess(`¡${selectedFiles.length} imagen(es) subida(s) exitosamente!`)
      setSelectedFiles([])
      // Recargar detalle para obtener las nuevas imágenes
      await obtenerDetalle(id)
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Error al subir imágenes")
    } finally {
      setUploadingImages(false)
    }
  }

  if (isLoading) {
    return (
      <OrganizadorLayout>
        <div className="flex justify-center py-20">
          <LoadingSpinner message="Cargando evento..." />
        </div>
      </OrganizadorLayout>
    )
  }

  if (error || !eventoDetalle) {
    return (
      <OrganizadorLayout>
        <Alert type="error">
          {error || "Evento no encontrado"}
        </Alert>
        <Button className="mt-4" onClick={() => navigate("/organizador")}>
          Volver al Dashboard
        </Button>
      </OrganizadorLayout>
    )
  }

  return (
    <OrganizadorLayout>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-start mb-6">
          <div>
            <Button variant="outline" size="sm" onClick={() => navigate("/organizador")} className="mb-4">
              ← Volver al Dashboard
            </Button>
            <h1 className="text-3xl font-bold text-text-primary">{eventoDetalle.nombre}</h1>
            <div className="flex items-center gap-3 mt-2">
              <Badge variant={estadoColors[eventoDetalle.estado]}>
                {estadoLabels[eventoDetalle.estado]}
              </Badge>
              <span className="text-text-secondary">{eventoDetalle.categoria}</span>
            </div>
          </div>
        </div>

        {/* Alertas de feedback */}
        {actionSuccess && (
          <Alert type="success" className="mb-6" onClose={() => setActionSuccess(null)}>
            {actionSuccess}
          </Alert>
        )}
        {actionError && (
          <Alert type="error" className="mb-6" onClose={() => setActionError(null)}>
            {actionError}
          </Alert>
        )}

        {/* Acciones según estado */}
        <Card className="mb-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Acciones</h2>

          {eventoDetalle.estado === EstadoEvento.BORRADOR && (
            <div className="flex flex-col gap-3">
              <p className="text-text-secondary mb-2">
                Tu evento está en borrador. Para publicarlo, debes pagar la tarifa de publicación.
              </p>
              <Button
                variant="primary"
                onClick={() => {
                  // Generar transaccionPagoId automáticamente al abrir el modal
                  const uuid = crypto.randomUUID()
                  setPagoData({
                    transaccionPagoId: uuid,
                    monto: eventoDetalle.tarifaPublicacion || 0,
                  })
                  setShowPagarModal(true)
                }}
              >
                💳 Pagar Publicación (${eventoDetalle.tarifaPublicacion || 0})
              </Button>
            </div>
          )}

          {eventoDetalle.estado === EstadoEvento.PENDIENTE_PAGO && (
            <div className="flex flex-col gap-3">
              <p className="text-text-secondary">
                El pago de publicación está siendo procesado. Una vez confirmado, tu evento será publicado automáticamente.
              </p>
              <div className="bg-info/10 text-info p-4 rounded-md">
                ⏳ Esperando confirmación del pago...
              </div>
            </div>
          )}

          {eventoDetalle.estado === EstadoEvento.PUBLICADO && (
            <div className="flex flex-col gap-3">
              <p className="text-text-secondary mb-2">
                Tu evento está publicado y visible para los asistentes. Cuando llegue el momento, puedes marcarlo como iniciado.
              </p>
              <Button
                variant="primary"
                onClick={() => setShowConfirmModal("iniciar")}
              >
                ▶️ Iniciar Evento
              </Button>
            </div>
          )}


          {eventoDetalle.estado === EstadoEvento.EN_CURSO && (
            <div className="flex flex-col gap-3">
              <p className="text-text-secondary mb-2">
                Tu evento está en curso. Cuando termine, márcalo como finalizado.
              </p>
              <Button variant="danger" onClick={() => setShowConfirmModal("finalizar")}>
                ⏹️ Finalizar Evento
              </Button>
            </div>
          )}

          {eventoDetalle.estado === EstadoEvento.FINALIZADO && (
            <div className="bg-success/10 text-success p-4 rounded-md">
              ✅ Este evento ha finalizado. Gracias por usar nuestra plataforma.
            </div>
          )}

          {eventoDetalle.estado === EstadoEvento.CANCELADO && (
            <div className="bg-danger/10 text-danger p-4 rounded-md">
              ❌ Este evento ha sido cancelado.
            </div>
          )}

          <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-border-light">
            {eventoDetalle.canBeCancelled && (
              <Button
                variant="outline"
                onClick={() => setShowCancelModal(true)}
                className="border-amber-500 text-amber-600 hover:bg-amber-50"
              >
                ❌ Cancelar Evento
              </Button>
            )}
            {eventoDetalle.canBeDeleted && (
              <Button
                variant="outline"
                onClick={() => setShowDeleteModal(true)}
                className="border-danger text-danger hover:bg-red-50"
              >
                🗑️ Eliminar Evento
              </Button>
            )}
          </div>
        </Card>

        {/* Gestión de Imágenes */}
        <Card className="mb-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">🖼️ Imágenes del Evento</h2>

          {/* Imágenes existentes */}
          {eventoDetalle.imagen && (
            <div className="mb-6">
              <h3 className="font-medium text-text-tertiary text-sm mb-2">Imagen Principal</h3>
              <img
                src={eventoDetalle.imagen}
                alt={eventoDetalle.nombre}
                className="w-full max-w-md h-48 object-cover rounded-lg border border-border"
              />
            </div>
          )}

          {eventoDetalle.imagenesSecundarias && eventoDetalle.imagenesSecundarias.length > 0 && (
            <div className="mb-6">
              <h3 className="font-medium text-text-tertiary text-sm mb-2">Imágenes Secundarias</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {eventoDetalle.imagenesSecundarias.map((url, index) => (
                  <img
                    key={index}
                    src={url}
                    alt={`${eventoDetalle.nombre} - ${index + 1}`}
                    className="w-full h-32 object-cover rounded-lg border border-border"
                  />
                ))}
              </div>
            </div>
          )}

          {/* Subir nuevas imágenes - Tres secciones separadas */}
          <div className="border-t border-gray-200 pt-6">
            <h3 className="font-semibold text-gray-900 mb-4">Gestionar Imágenes del Evento</h3>
            <p className="text-sm text-gray-600 mb-6">Sube imágenes para tu evento en las categorías correspondientes</p>

            {/* Nota: Por ahora, el backend maneja todas las imágenes de la misma forma */}
            <div className="space-y-6">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h4 className="font-semibold text-gray-900 mb-2">🇺 Imagen Principal</h4>
                <p className="text-sm text-gray-600 mb-3">La imagen principal se mostrará como portada del evento</p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePrincipalFileSelect}
                  className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer"
                />
                {selectedPrincipalFile && (
                  <div className="mt-3 flex gap-3 items-start">
                    <img src={URL.createObjectURL(selectedPrincipalFile)} alt="Preview" className="w-24 h-24 object-cover rounded-md border-2 border-blue-300" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{selectedPrincipalFile.name}</p>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" onClick={async () => {
                          if (!id) return
                          setUploadingImages(true)
                          try {
                            await subirImagenPrincipal(id, selectedPrincipalFile)
                            setActionSuccess("¡Imagen principal subida!")
                            setSelectedPrincipalFile(null)
                            await obtenerDetalle(id)
                          } catch (err) {
                            setActionError(err instanceof Error ? err.message : "Error")
                          } finally {
                            setUploadingImages(false)
                          }
                        }} loading={uploadingImages}>💾 Subir</Button>
                        <Button size="sm" variant="outline" onClick={() => setSelectedPrincipalFile(null)}>Cancelar</Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                <h4 className="font-semibold text-gray-900 mb-2">🖼️ Imágenes Secundarias</h4>
                <p className="text-sm text-gray-600 mb-3">Sube múltiples imágenes adicionales para la galería</p>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleSecondaryFilesSelect}
                  className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-green-600 file:text-white hover:file:bg-green-700 file:cursor-pointer"
                />
                {selectedSecondaryFiles.length > 0 && (
                  <div className="mt-3">
                    <p className="text-sm mb-2">{selectedSecondaryFiles.length} imagen(es)</p>
                    <div className="grid grid-cols-4 gap-2 mb-3">
                      {selectedSecondaryFiles.map((file, i) => (
                        <img key={i} src={URL.createObjectURL(file)} alt={file.name} className="w-full h-20 object-cover rounded-md" />
                      ))}
                    </div>
                    <div className="flex gap-2">
                      <Button size="sm" onClick={async () => {
                        if (!id) return
                        setUploadingImages(true)
                        try {
                          await subirImagenSecundaria(id, selectedSecondaryFiles)
                          setActionSuccess(`¡${selectedSecondaryFiles.length} imagen(es) subidas!`)
                          setSelectedSecondaryFiles([])
                          await obtenerDetalle(id)
                        } catch (err) {
                          setActionError(err instanceof Error ? err.message : "Error")
                        } finally {
                          setUploadingImages(false)
                        }
                      }} loading={uploadingImages}>💾 Subir</Button>
                      <Button size="sm" variant="outline" onClick={() => setSelectedSecondaryFiles([])}>Cancelar</Button>
                    </div>
                  </div>
                )}
              </div>

              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <h4 className="font-semibold text-gray-900 mb-2">📄 Folleto del Evento</h4>
                <p className="text-sm text-gray-600 mb-3">Sube un documento PDF o imagen del folleto</p>
                <input
                  type="file"
                  accept="application/pdf,image/*"
                  onChange={handleBrochureFileSelect}
                  className="block w-full text-sm file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-purple-600 file:text-white hover:file:bg-purple-700 file:cursor-pointer"
                />
                {selectedBrochureFile && (
                  <div className="mt-3 flex gap-3 items-center p-3 bg-white rounded-md">
                    <div className="text-3xl">📄</div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">{selectedBrochureFile.name}</p>
                      <div className="flex gap-2 mt-2">
                        <Button size="sm" onClick={async () => {
                          if (!id) return
                          setUploadingImages(true)
                          try {
                            await subirFolleto(id, selectedBrochureFile)
                            setActionSuccess("¡Folleto subido!")
                            setSelectedBrochureFile(null)
                            await obtenerDetalle(id)
                          } catch (err) {
                            setActionError(err instanceof Error ? err.message : "Error")
                          } finally {
                            setUploadingImages(false)
                          }
                        }} loading={uploadingImages}>💾 Subir</Button>
                        <Button size="sm" variant="outline" onClick={() => setSelectedBrochureFile(null)}>Cancelar</Button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* Información del evento */}
        <Card className="mb-6">
          <h2 className="text-xl font-semibold text-text-primary mb-4">Información del Evento</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-text-tertiary text-sm mb-1">Descripción</h3>
              <p className="text-text-primary">{eventoDetalle.descripcion}</p>
            </div>

            <div>
              <h3 className="font-medium text-text-tertiary text-sm mb-1">Fecha y Hora</h3>
              <p className="text-text-primary">{formatearFecha(eventoDetalle.fecha)}</p>
            </div>

            <div>
              <h3 className="font-medium text-text-tertiary text-sm mb-1">Duración</h3>
              <p className="text-text-primary">
                {eventoDetalle.horasDuracion || 0}h {eventoDetalle.minutosDuracion || 0}min
              </p>
            </div>

            <div>
              <h3 className="font-medium text-text-tertiary text-sm mb-1">Lugar</h3>
              <p className="text-text-primary">{eventoDetalle.venue || eventoDetalle.venueId}</p>
            </div>

            <div>
              <h3 className="font-medium text-text-tertiary text-sm mb-1">Aforo Total</h3>
              <p className="text-text-primary">{eventoDetalle.aforo} personas</p>
            </div>

            <div>
              <h3 className="font-medium text-text-tertiary text-sm mb-1">Disponibles</h3>
              <p className="text-text-primary">{eventoDetalle.aforoDisponible} lugares</p>
            </div>
          </div>
        </Card>

        {/* Secciones */}
        {
          eventoDetalle.secciones && eventoDetalle.secciones.length > 0 && (
            <Card className="mb-6">
              <h2 className="text-xl font-semibold text-text-primary mb-4">Secciones</h2>

              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 text-text-tertiary font-medium">Nombre</th>
                      <th className="text-left py-3 px-4 text-text-tertiary font-medium">Capacidad</th>
                      <th className="text-left py-3 px-4 text-text-tertiary font-medium">Precio</th>
                      <th className="text-left py-3 px-4 text-text-tertiary font-medium">Tipo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventoDetalle.secciones.map((seccion, index) => (
                      <tr key={index} className="border-b border-border last:border-0">
                        <td className="py-3 px-4 text-text-primary font-medium">{seccion.nombre}</td>
                        <td className="py-3 px-4 text-text-primary">{seccion.capacidad}</td>
                        <td className="py-3 px-4 text-text-primary">${seccion.precio}</td>
                        <td className="py-3 px-4">
                          <Badge variant={seccion.tipoAsiento === "VIP" ? "warning" : "default"}>
                            {seccion.tipoAsiento}
                          </Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )
        }

        {/* Modal de Pago */}
        <Modal
          isOpen={showPagarModal}
          onClose={() => setShowPagarModal(false)}
          title="Pagar Publicación"
        >
          <div className="space-y-4">
            <p className="text-text-secondary">
              Para publicar tu evento, debes pagar la tarifa de publicación de{" "}
              <strong>${eventoDetalle.tarifaPublicacion || 0}</strong>.
            </p>

            <FormField label="ID de Transacción" required>
              <div className="flex gap-2">
                <Input
                  value={pagoData.transaccionPagoId}
                  onChange={(e) => setPagoData({ ...pagoData, transaccionPagoId: e.target.value })}
                  placeholder="UUID de la transacción"
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={generarTransaccionId}>
                  Generar
                </Button>
              </div>
            </FormField>

            <FormField label="Monto">
              <Input
                type="number"
                value={pagoData.monto}
                onChange={(e) => setPagoData({ ...pagoData, monto: Number(e.target.value) })}
                min={0}
              />
            </FormField>

            <div className="flex gap-3 justify-end pt-4">
              <Button variant="outline" onClick={() => setShowPagarModal(false)}>
                Cancelar
              </Button>
              <Button
                variant="primary"
                onClick={handlePagarPublicacion}
                loading={actionLoading}
                disabled={!pagoData.transaccionPagoId || actionLoading}
              >
                Confirmar Pago
              </Button>
            </div>
          </div>
        </Modal>

        {/* Modal de Confirmación */}
        <Modal
          isOpen={showConfirmModal !== null}
          onClose={() => setShowConfirmModal(null)}
          title={showConfirmModal === "iniciar" ? "Iniciar Evento" : "Finalizar Evento"}
        >
          <div className="space-y-4">
            <p className="text-text-secondary">
              {showConfirmModal === "iniciar"
                ? "¿Estás seguro de que deseas iniciar este evento? Una vez iniciado, no podrás modificarlo."
                : "¿Estás seguro de que deseas finalizar este evento? Esta acción no se puede deshacer."}
            </p>

            <div className="flex gap-3 justify-end pt-4">
              <Button
                variant="outline"
                onClick={() => setShowConfirmModal(null)}
              >
                Cancelar
              </Button>
              <Button
                variant={showConfirmModal === "finalizar" ? "danger" : "primary"}
                onClick={showConfirmModal === "iniciar" ? handleIniciarEvento : handleFinalizarEvento}
                loading={actionLoading}
              >
                {showConfirmModal === "iniciar" ? "Sí, Iniciar" : "Sí, Finalizar"}
              </Button>
            </div>
          </div>
        </Modal>

        <ConfirmDeleteModal
          isOpen={showDeleteModal}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleEliminarEvento}
          eventName={eventoDetalle.nombre}
          isLoading={actionLoading}
        />

        <CancelEventModal
          isOpen={showCancelModal}
          onClose={() => setShowCancelModal(false)}
          onConfirm={handleCancelarEvento}
          eventName={eventoDetalle.nombre}
          registrationsCount={eventoDetalle.inscripcionesCount}
          eventDate={eventoDetalle.fecha}
          isLoading={actionLoading}
        />
      </div >
    </OrganizadorLayout >
  )
}
