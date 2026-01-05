"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import useAuth from "../contexts/Auth"
import { useNotifications } from "../contexts/NotificationContext"
import { NotificationEventType } from "../../adapters/signalr/notificationHub"
import { useEventos, type CrearEventoConSeccionesDTO } from "../hooks/useEventos"
import { getUserIdFromEmail } from "../../utils/userIdHelper"
import { venuesService } from "../../application/services/venuesService"
import OrganizadorLayout from "../layouts/OrganizadorLayout"
import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import FormField from "../components/ui/FormField"
import Alert from "../components/ui/Alert"
import type { SeccionEvento, TipoAsiento } from "../../domain/entities/Evento"
import type { Venue } from "../../domain/entities/Venue"

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
 * Venues (lugares) disponibles para los eventos
 * Lista hardcodeada de lugares con sus GUIDs
 */
const VENUES = [
  {
    id: "550e8400-e29b-41d4-a716-446655440000",
    nombre: "Teatro Nacional",
    direccion: "Av. Principal 123, Ciudad",
  },
  {
    id: "660e8400-e29b-41d4-a716-446655440001",
    nombre: "Estadio Central",
    direccion: "Calle Deportiva 456, Ciudad",
  },
  {
    id: "770e8400-e29b-41d4-a716-446655440002",
    nombre: "Centro de Convenciones",
    direccion: "Boulevard Empresarial 789, Ciudad",
  },
  {
    id: "880e8400-e29b-41d4-a716-446655440003",
    nombre: "Auditorio Municipal",
    direccion: "Plaza Central 321, Ciudad",
  },
  {
    id: "990e8400-e29b-41d4-a716-446655440004",
    nombre: "Arena Deportiva",
    direccion: "Zona Deportiva 654, Ciudad",
  },
  {
    id: "aa0e8400-e29b-41d4-a716-446655440005",
    nombre: "Sala de Conciertos",
    direccion: "Distrito Musical 987, Ciudad",
  },
]

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
  const { username, isAuthenticated } = useAuth() // username = email del usuario
  const { crearEventoConSecciones, isLoading, error } = useEventos()
  const { agregarNotificacion } = useNotifications()

  // Estado de venues
  const [venues, setVenues] = useState<Venue[]>([])

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: "",
    descripcion: "",
    fecha: "",
    horasDuracion: 2,
    minutosDuracion: 0,
    venueId: "",
    categoria: "",
  })

  // Estado de las secciones (al menos una requerida)
  const [secciones, setSecciones] = useState<SeccionEvento[]>([crearSeccionVacia()])

  // Estado de errores de validación
  const [errores, setErrores] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)

  // Cargar venues al montar el componente
  useEffect(() => {
    const cargarVenues = () => {
      try {
        const todosVenues = venuesService.obtenerTodos()
        setVenues(todosVenues)
      } catch (err) {
        console.error("[CrearEvento] Error cargando venues:", err)
      }
    }
    cargarVenues()
  }, [])

  /**
   * Calcula la tarifa de publicación automáticamente
   * Fórmula: $100 (base) + 0.1% de (precio × 60% de capacidad) por cada sección
   */
  const calcularTarifaPublicacion = (): number => {
    const COSTO_BASE = 100
    const PORCENTAJE_ENTRADAS = 0.6 // 60% del total de entradas
    const PORCENTAJE_TARIFA = 0.001 // 0.1%

    // Calcular: Σ(precio_sección × capacidad_sección × 0.6) para cada sección
    const totalEntradasEstimadas = secciones.reduce((sum, seccion) => {
      const entradasEstimadas = seccion.capacidad * PORCENTAJE_ENTRADAS
      return sum + (seccion.precio * entradasEstimadas)
    }, 0)

    // Aplicar 0.1% sobre el total
    const tarifaVariable = totalEntradasEstimadas * PORCENTAJE_TARIFA

    // Sumar costo base
    const tarifaTotal = COSTO_BASE + tarifaVariable

    // Redondear a 2 decimales
    return Math.round(tarifaTotal * 100) / 100
  }
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
    } else {
      // Validar que venueId sea uno de los venues disponibles
      const venueExiste = VENUES.some(v => v.id === formData.venueId.trim())
      if (!venueExiste) {
        nuevosErrores.venueId = "Debes seleccionar un lugar válido"
      }
    }

    if (!formData.categoria) {
      nuevosErrores.categoria = "La categoría es requerida"
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

    if (!username || !isAuthenticated) {
      setSubmitError("Debes estar autenticado para crear un evento")
      return
    }

    try {
      // Convertir el email a GUID determinístico para usar como organizadorId
      const organizadorId = getUserIdFromEmail(username)
      console.log("[CrearEvento] Creando evento para organizador:", organizadorId, "(email:", username, ")")

      // Calcular tarifa de publicación automáticamente
      const tarifaPublicacion = calcularTarifaPublicacion()

      const datos: CrearEventoConSeccionesDTO = {
        nombre: formData.nombre,
        descripcion: formData.descripcion,
        fecha: new Date(formData.fecha),
        horasDuracion: formData.horasDuracion,
        minutosDuracion: formData.minutosDuracion,
        organizadorId: organizadorId, // GUID generado desde el email
        venueId: formData.venueId,
        categoria: formData.categoria,
        tarifaPublicacion: tarifaPublicacion,
        secciones: secciones.map(s => ({
          nombre: s.nombre,
          capacidad: s.capacidad,
          precio: s.precio,
          tipoAsiento: s.tipoAsiento,
        })),
      }

      console.log("[CrearEvento] Payload a enviar:", JSON.stringify({
        ...datos,
        fecha: datos.fecha.toISOString(),
      }, null, 2))

      const eventoCreado = await crearEventoConSecciones(datos)
      console.log("[CrearEvento] Evento creado exitosamente:", eventoCreado)
      
      // Mostrar mensaje de éxito
      setSubmitSuccess(true)
      setSubmitError(null)
      
      // Agregar notificación de éxito
      agregarNotificacion(
        NotificationEventType.SISTEMA,
        "Evento creado exitosamente",
        `El evento "${eventoCreado.nombre}" ha sido creado correctamente. Está en estado Borrador y listo para publicar.`,
        { eventoId: eventoCreado.id, eventoNombre: eventoCreado.nombre }
      )
      
      // Redirigir al dashboard después de 3 segundos (dar tiempo para ver el mensaje)
      setTimeout(() => {
        navigate("/organizador")
      }, 3000)
    } catch (err) {
      console.error("[CrearEvento] Error al crear evento:", err)
      
      // Extraer mensaje de error de forma más robusta
      let errorMessage = "Error al crear el evento"
      if (err instanceof Error) {
        errorMessage = err.message
      } else if (typeof err === 'string') {
        errorMessage = err
      } else if (err && typeof err === 'object' && 'message' in err) {
        errorMessage = String(err.message)
      }
      
      setSubmitError(errorMessage)
      setSubmitSuccess(false)
      
      // Agregar notificación de error
      agregarNotificacion(
        NotificationEventType.SISTEMA,
        "Error al crear evento",
        errorMessage,
        { error: errorMessage }
      )
      
      // No redirigir si hay error, dejar que el usuario vea el mensaje
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
          <Alert 
            type="success" 
            title="¡Éxito!" 
            className="mb-6"
            onClose={() => setSubmitSuccess(false)}
          >
            <div>
              <p className="font-semibold mb-2">¡Evento creado exitosamente!</p>
              <p className="text-sm">El evento ha sido guardado en estado Borrador. Serás redirigido al dashboard en unos segundos...</p>
            </div>
          </Alert>
        )}

        {(submitError || error) && (
          <Alert 
            type="error" 
            title="Error al crear evento" 
            className="mb-6"
            onClose={() => {
              setSubmitError(null)
            }}
          >
            <div>
              <p className="font-semibold mb-1">No se pudo crear el evento:</p>
              <p className="text-sm">{submitError || error}</p>
              <p className="text-xs mt-2 opacity-75">Por favor, revisa la información e intenta nuevamente.</p>
            </div>
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
                <select
                  name="venueId"
                  value={formData.venueId}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border border-border rounded-md text-text-primary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent ${
                    errores.venueId ? "border-danger" : ""
                  }`}
                >
                  <option value="">Selecciona un lugar</option>
                  {venues.map((venue) => (
                    <option key={venue.id} value={venue.id}>
                      {venue.nombre} - {venue.direccion}
                    </option>
                  ))}
                </select>
                {errores.venueId && (
                  <p className="text-xs text-danger mt-1">{errores.venueId}</p>
                )}
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
                <p className="text-2xl font-bold text-warning">${calcularTarifaPublicacion().toFixed(2)}</p>
                <p className="text-text-secondary text-sm">Tarifa Publicación*</p>
                <p className="text-xs text-text-tertiary mt-1">
                  *Calculada automáticamente: $100 base + 0.1% de ingresos estimados
                </p>
              </div>
            </div>
          </Card>

          {/* Botones de acción - Siempre visible al final del formulario */}
          <div className="mt-8 pt-6 border-t-2 border-border-light">
            <div className="flex gap-4 justify-end items-center">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate("/organizador")} 
                disabled={isLoading}
                size="lg"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                variant="primary" 
                size="lg" 
                loading={isLoading} 
                disabled={isLoading}
                className="min-w-[180px] font-bold !bg-[#141414]"
              >
                {isLoading ? "Creando Evento..." : "✨ Crear Evento"}
              </Button>
            </div>
            <p className="text-xs text-text-tertiary text-center mt-4">
              Al crear el evento, estará en estado Borrador hasta que pagues la tarifa de publicación
            </p>
          </div>
        </form>
      </div>
    </OrganizadorLayout>
  )
}

