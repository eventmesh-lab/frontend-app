"use client"

import { useEffect, useState } from "react"
import AdminLayout from "../layouts/AdminLayout"
import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import Alert from "../components/ui/Alert"
import Input from "../components/ui/Input"
import FormField from "../components/ui/FormField"
import { venuesService } from "../../application/services/venuesService"
import { Venue } from "../../domain/entities/Venue"
import { Plus, Edit, Trash2, MapPin, X, Save } from "lucide-react"

/**
 * Página para que el administrador gestione los venues (lugares)
 */
export default function AdminVenuesPage() {
  const [venues, setVenues] = useState<Venue[]>([])
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  // Formulario para crear/editar
  const [formData, setFormData] = useState({
    nombre: "",
    direccion: "",
  })

  /**
   * Carga todos los venues
   */
  const cargarVenues = () => {
    try {
      const todosVenues = venuesService.obtenerTodos()
      setVenues(todosVenues)
      console.log("[AdminVenues] Venues cargados:", todosVenues.length)
    } catch (err) {
      console.error("[AdminVenues] Error cargando venues:", err)
      setError(err instanceof Error ? err.message : "Error al cargar los venues")
    }
  }

  useEffect(() => {
    cargarVenues()
  }, [])

  /**
   * Inicia la creación de un nuevo venue
   */
  const iniciarCreacion = () => {
    setIsCreating(true)
    setEditingId(null)
    setFormData({ nombre: "", direccion: "" })
    setError(null)
    setSuccess(null)
  }

  /**
   * Cancela la creación/edición
   */
  const cancelar = () => {
    setIsCreating(false)
    setEditingId(null)
    setFormData({ nombre: "", direccion: "" })
    setError(null)
  }

  /**
   * Inicia la edición de un venue
   */
  const iniciarEdicion = (venue: Venue) => {
    setEditingId(venue.id)
    setIsCreating(false)
    setFormData({
      nombre: venue.nombre,
      direccion: venue.direccion,
    })
    setError(null)
    setSuccess(null)
  }

  /**
   * Valida el formulario
   */
  const validarFormulario = (): boolean => {
    if (!formData.nombre.trim()) {
      setError("El nombre es requerido")
      return false
    }
    if (!formData.direccion.trim()) {
      setError("La dirección es requerida")
      return false
    }
    return true
  }

  /**
   * Guarda un nuevo venue o actualiza uno existente
   */
  const guardar = () => {
    if (!validarFormulario()) {
      return
    }

    try {
      if (editingId) {
        // Actualizar
        const actualizado = venuesService.actualizar(
          editingId,
          formData.nombre,
          formData.direccion
        )
        if (!actualizado) {
          setError("No se pudo actualizar el venue")
          return
        }
        setSuccess("Venue actualizado exitosamente")
      } else {
        // Crear
        venuesService.crear(formData.nombre, formData.direccion)
        setSuccess("Venue creado exitosamente")
      }

      cancelar()
      cargarVenues()
    } catch (err) {
      console.error("[AdminVenues] Error guardando venue:", err)
      setError(err instanceof Error ? err.message : "Error al guardar el venue")
    }
  }

  /**
   * Elimina un venue
   */
  const eliminar = (id: string) => {
    const venue = venues.find((v) => v.id === id)
    if (!venue) return

    if (!confirm(`¿Estás seguro de que deseas eliminar "${venue.nombre}"?`)) {
      return
    }

    try {
      const eliminado = venuesService.eliminar(id)
      if (!eliminado) {
        setError("No se pudo eliminar el venue")
        return
      }

      setSuccess("Venue eliminado exitosamente")
      cargarVenues()
    } catch (err) {
      console.error("[AdminVenues] Error eliminando venue:", err)
      setError(err instanceof Error ? err.message : "Error al eliminar el venue")
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-text-primary mb-2">Gestión de Venues</h1>
            <p className="text-text-secondary">Administra los lugares disponibles para eventos</p>
          </div>
          {!isCreating && !editingId && (
            <Button variant="primary" onClick={iniciarCreacion}>
              <Plus className="w-4 h-4 mr-2" />
              Nuevo Venue
            </Button>
          )}
        </div>

        {/* Mensajes */}
        {error && (
          <Alert type="error" className="mb-6" onClose={() => setError(null)}>
            {error}
          </Alert>
        )}
        {success && (
          <Alert type="success" className="mb-6" onClose={() => setSuccess(null)}>
            {success}
          </Alert>
        )}

        {/* Formulario de creación/edición */}
        {(isCreating || editingId) && (
          <Card className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-text-primary">
                {editingId ? "Editar Venue" : "Nuevo Venue"}
              </h2>
              <Button variant="outline" size="sm" onClick={cancelar}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            <div className="space-y-4">
              <FormField label="Nombre" required error={error && !formData.nombre.trim() ? "Requerido" : undefined}>
                <Input
                  type="text"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  placeholder="Ej: Teatro Nacional"
                  className={error && !formData.nombre.trim() ? "border-danger" : ""}
                />
              </FormField>

              <FormField
                label="Dirección"
                required
                error={error && !formData.direccion.trim() ? "Requerido" : undefined}
              >
                <Input
                  type="text"
                  value={formData.direccion}
                  onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
                  placeholder="Ej: Av. Principal 123, Ciudad"
                  className={error && !formData.direccion.trim() ? "border-danger" : ""}
                />
              </FormField>

              <div className="flex gap-2 pt-4">
                <Button variant="primary" onClick={guardar}>
                  <Save className="w-4 h-4 mr-2" />
                  {editingId ? "Actualizar" : "Crear"}
                </Button>
                <Button variant="outline" onClick={cancelar}>
                  Cancelar
                </Button>
              </div>
            </div>
          </Card>
        )}

        {/* Lista de venues */}
        {venues.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-text-secondary text-lg">No hay venues registrados</p>
            </div>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {venues.map((venue) => (
              <Card key={venue.id} className="hover:shadow-lg transition-shadow">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-text-primary mb-2">{venue.nombre}</h3>
                    <div className="flex items-start gap-2 text-sm text-text-secondary">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span>{venue.direccion}</span>
                    </div>
                    <p className="text-xs text-text-tertiary mt-2 font-mono">
                      ID: {venue.id.substring(0, 8)}...
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 mt-4 pt-4 border-t border-border-light">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => iniciarEdicion(venue)}
                    className="flex-1"
                    disabled={isCreating || editingId !== null}
                  >
                    <Edit className="w-4 h-4 mr-1" />
                    Editar
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => eliminar(venue.id)}
                    className="flex-1"
                    disabled={isCreating || editingId !== null}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Eliminar
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
