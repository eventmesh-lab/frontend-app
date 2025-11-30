"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import useAuth from "../contexts/Auth"
import { useEventos, type CrearEventoConSeccionesDTO } from "../hooks/useEventos"
import OrganizadorLayout from "../layouts/OrganizadorLayout"
import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import FormField from "../components/ui/FormField"
import Alert from "../components/ui/Alert"
import type { SeccionEvento, TipoAsiento } from "../../domain/entities/Evento"

/**
 * Categorías disponibles para los eventos
 */
const CATEGORIAS = [
  "Música",
  "Deportes",
  "Teatro",
  "Conferencias",
  "Tecnología",
  "Arte",
  "Gastronomía",
  "Educación",
  "Networking",
  "Otro",
]

/**
 * Tipos de asiento disponibles para las secciones
 */
const TIPOS_ASIENTO: TipoAsiento[] = ["General", "Numerado"]

/**
 * Plantilla para una nueva sección vacía
 */
const crearSeccionVacia = (): SeccionEvento => ({
  nombre: "",
  capacidad: 0,
  precio: 0,
  tipoAsiento: "General",
})

/**
 * Página para crear un nuevo evento con secciones
 * Usa el email del usuario autenticado como organizadorId temporal
 */
export default function CrearEventoPage() {
  const navigate = useNavigate()
  const { username } = useAuth() // username = email del usuario (solución temporal como organizadorId)
  const { crearEventoConSecciones, isLoading, error } = useEventos()

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    fecha: "",
    horasDuracion: 2,
    minutosDuracion: 0,
    venueId: "",
    categoria: "",
    tarifaPublicacion: 50,
  })

  // Estado de las secciones (al menos una requerida)
  const [secciones, setSecciones] = useState<SeccionEvento[]>([crearSeccionVacia()])

  // Estado de errores de validación
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitSuccess, setSubmitSuccess] = useState(false)

  /**
   * Maneja cambios en los campos del formulario principal
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value,
    }))
    // Limpiar error del campo al modificar
    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: "" }))
    }
  }

  /**
   * Maneja cambios en los campos de una sección específica
   */
  const handleSeccionChange = (index: number, field: keyof SeccionEvento, value: string | number) => {
    setSecciones((prev) => {
      const nuevasSecciones = [...prev]
      nuevasSecciones[index] = {
        ...nuevasSecciones[index],
        [field]: field === "capacidad" || field === "precio" ? Number(value) : value,
      }
      return nuevasSecciones
    })
  }

  /**
   * Agrega una nueva sección vacía
   */
  const agregarSeccion = () => {
    setSecciones((prev) => [...prev, crearSeccionVacia()])
  }

  /**
   * Elimina una sección por índice (mínimo debe quedar una)
   */
  const eliminarSeccion = (index: number) => {
    if (secciones.length > 1) {
      setSecciones((prev) => prev.filter((_, i) => i !== index))
    }
  }

  /**
   * Valida el formulario antes de enviar
   */
  const validarFormulario = (): boolean => {
    const nuevosErrores: Record<string, string> = {}

    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = "El nombre es requerido"
    }

    if (!formData.descripcion.trim()) {
      nuevosErrores.descripcion = "La descripción es requerida"
    }

    if (!formData.fecha) {
      nuevosErrores.fecha = "La fecha es requerida"
    } else if (new Date(formData.fecha) <= new Date()) {
      nuevosErrores.fecha = "La fecha debe ser en el futuro"
    }

    if (!formData.venueId.trim()) {
      nuevosErrores.venueId = "El lugar es requerido"
    }

    if (!formData.categoria) {
      nuevosErrores.categoria = "La categoría es requerida"
    }

    if (formData.tarifaPublicacion < 0) {
      nuevosErrores.tarifaPublicacion = "La tarifa no puede ser negativa"
    }

    // Validar secciones
    secciones.forEach((seccion, index) => {
      if (!seccion.nombre.trim()) {
        nuevosErrores[`seccion_${index}_nombre`] = "El nombre de la sección es requerido"
      }
      if (seccion.capacidad <= 0) {
        nuevosErrores[`seccion_${index}_capacidad`] = "La capacidad debe ser mayor a 0"
      }
      if (seccion.precio < 0) {
        nuevosErrores[`seccion_${index}_precio`] = "El precio no puede ser negativo"
      }
    })

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  /**
   * Envía el formulario para crear el evento
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    setSubmitSuccess(false)

    if (!validarFormulario()) {
      return
    }

    if (!username) {
      setSubmitError("Debes estar autenticado para crear un evento")
      return
    }

    try {
      const datos: CrearEventoConSeccionesDTO = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        fecha: new Date(formData.fecha),
        horasDuracion: formData.horasDuracion,
        minutosDuracion: formData.minutosDuracion,
        // TODO: Reemplazar con ID real cuando se implemente
        organizadorId: username, // Usando email como ID temporal
        venueId: formData.venueId,
        categoria: formData.categoria,
        tarifaPublicacion: formData.tarifaPublicacion,
        secciones: secciones,
      }

      await crearEventoConSecciones(datos)
      setSubmitSuccess(true)
      
      // Redirigir al dashboard después de 2 segundos
      setTimeout(() => {
        navigate("/organizador")
      }, 2000)
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Error al crear el evento")
    }
  }

  return (
    <OrganizadorLayout>
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Crear Nuevo Evento</h1>
          <p className="text-text-secondary">
            Completa la información del evento. Una vez creado, estará en estado Borrador hasta que pagues la publicación.
          </p>
        </div>

        {submitSuccess && (
          <Alert type="success" className="mb-6">
            ¡Evento creado exitosamente! Redirigiendo al dashboard...
          </Alert>
        )}

        {(submitError || error) && (
          <Alert type="error" className="mb-6">
            {submitError || error}
          </Alert>
        )}

        <form onSubmit={handleSubmit}>
          {/* Información básica */}
          <Card className="mb-6">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Información Básica</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <FormField label="Nombre del Evento" required error={errores.nombre}>
                  <Input
                    name="nombre"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Ej: Concierto Rock 2025"
                    error={errores.nombre}
                  />
                </FormField>
              </div>

              <div className="md:col-span-2">
                <FormField label="Descripción" required error={errores.descripcion}>
                  <textarea
                    name="descripcion"
                    value={formData.descripcion}
                    onChange={handleChange}
                    placeholder="Describe tu evento..."
                    rows={4}
                    className="w-full px-3 py-2 border border-border rounded-md text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                  />
                </FormField>
              </div>

              <FormField label="Fecha y Hora" required error={errores.fecha}>
                <Input
                  type="datetime-local"
                  name="fecha"
                  value={formData.fecha}
                  onChange={handleChange}
                  error={errores.fecha}
                />
              </FormField>

              <FormField label="Categoría" required error={errores.categoria}>
                <select
                  name="categoria"
                  value={formData.categoria}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                >
                  <option value="">Selecciona una categoría</option>
                  {CATEGORIAS.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </FormField>

              <FormField label="Duración (Horas)">
                <Input
                  type="number"
                  name="horasDuracion"
                  value={formData.horasDuracion}
                  onChange={handleChange}
                  min={0}
                  max={24}
                />
              </FormField>

              <FormField label="Duración (Minutos)">
                <Input
                  type="number"
                  name="minutosDuracion"
                  value={formData.minutosDuracion}
                  onChange={handleChange}
                  min={0}
                  max={59}
                />
              </FormField>

              <FormField label="Lugar (Venue)" required error={errores.venueId}>
                <Input
                  name="venueId"
                  value={formData.venueId}
                  onChange={handleChange}
                  placeholder="Ej: Teatro Principal, Estadio Central..."
                  error={errores.venueId}
                />
              </FormField>

              <FormField label="Tarifa de Publicación ($)" error={errores.tarifaPublicacion}>
                <Input
                  type="number"
                  name="tarifaPublicacion"
                  value={formData.tarifaPublicacion}
                  onChange={handleChange}
                  min={0}
                  error={errores.tarifaPublicacion}
                />
              </FormField>
            </div>
          </Card>

          {/* Secciones */}
          <Card className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-text-primary">Secciones del Evento</h2>
              <Button type="button" variant="outline" size="sm" onClick={agregarSeccion}>
                + Agregar Sección
              </Button>
            </div>

            <p className="text-text-secondary text-sm mb-4">
              Define las secciones con su capacidad y precio. Cada evento debe tener al menos una sección.
            </p>

            {secciones.map((seccion, index) => (
              <div key={index} className="border border-border rounded-lg p-4 mb-4 bg-bg-secondary">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="font-medium text-text-primary">Sección {index + 1}</h3>
                  {secciones.length > 1 && (
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => eliminarSeccion(index)}
                    >
                      Eliminar
                    </Button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                  <FormField label="Nombre" required error={errores[`seccion_${index}_nombre`]}>
                    <Input
                      value={seccion.nombre}
                      onChange={(e) => handleSeccionChange(index, "nombre", e.target.value)}
                      placeholder="Ej: VIP, General"
                      error={errores[`seccion_${index}_nombre`]}
                    />
                  </FormField>

                  <FormField label="Capacidad" required error={errores[`seccion_${index}_capacidad`]}>
                    <Input
                      type="number"
                      value={seccion.capacidad}
                      onChange={(e) => handleSeccionChange(index, "capacidad", e.target.value)}
                      min={1}
                      error={errores[`seccion_${index}_capacidad`]}
                    />
                  </FormField>

                  <FormField label="Precio ($)" required error={errores[`seccion_${index}_precio`]}>
                    <Input
                      type="number"
                      value={seccion.precio}
                      onChange={(e) => handleSeccionChange(index, "precio", e.target.value)}
                      min={0}
                      error={errores[`seccion_${index}_precio`]}
                    />
                  </FormField>

                  <FormField label="Tipo de Asiento">
                    <select
                      value={seccion.tipoAsiento}
                      onChange={(e) => handleSeccionChange(index, "tipoAsiento", e.target.value)}
                      className="w-full px-3 py-2 border border-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                    >
                      {TIPOS_ASIENTO.map((tipo) => (
                        <option key={tipo} value={tipo}>
                          {tipo}
                        </option>
                      ))}
                    </select>
                  </FormField>
                </div>
              </div>
            ))}
          </Card>

          {/* Resumen */}
          <Card className="mb-6 bg-bg-tertiary">
            <h2 className="text-xl font-semibold text-text-primary mb-4">Resumen</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">{secciones.length}</p>
                <p className="text-text-secondary text-sm">Secciones</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">
                  {secciones.reduce((sum, s) => sum + s.capacidad, 0)}
                </p>
                <p className="text-text-secondary text-sm">Capacidad Total</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">
                  ${Math.min(...secciones.map((s) => s.precio))} - ${Math.max(...secciones.map((s) => s.precio))}
                </p>
                <p className="text-text-secondary text-sm">Rango de Precios</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-warning">${formData.tarifaPublicacion}</p>
                <p className="text-text-secondary text-sm">Tarifa Publicación</p>
              </div>
            </div>
          </Card>

          {/* Botones de acción */}
          <div className="flex gap-4 justify-end">
            <Button type="button" variant="outline" onClick={() => navigate("/organizador")}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" loading={isLoading} disabled={isLoading}>
              Crear Evento
            </Button>
          </div>
        </form>
      </div>
    </OrganizadorLayout>
  )
}

