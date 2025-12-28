"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import AdminLayout from "../layouts/AdminLayout"
import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import Input from "../components/ui/Input"
import FormField from "../components/ui/FormField"
import Alert from "../components/ui/Alert"
import { apiConfig } from "../../config/env"
import { Copy, Check, Mail, User, Phone, MapPin, Calendar, Lock } from "lucide-react"

/**
 * Genera una contraseña segura aleatoria
 */
function generarPasswordSegura(): string {
  const longitud = 12
  const mayusculas = "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
  const minusculas = "abcdefghijklmnopqrstuvwxyz"
  const numeros = "0123456789"
  const simbolos = "!@#$%&*"
  const todos = mayusculas + minusculas + numeros + simbolos

  let password = ""
  // Asegurar al menos un carácter de cada tipo
  password += mayusculas[Math.floor(Math.random() * mayusculas.length)]
  password += minusculas[Math.floor(Math.random() * minusculas.length)]
  password += numeros[Math.floor(Math.random() * numeros.length)]
  password += simbolos[Math.floor(Math.random() * simbolos.length)]

  // Completar el resto de la contraseña
  for (let i = password.length; i < longitud; i++) {
    password += todos[Math.floor(Math.random() * todos.length)]
  }

  // Mezclar los caracteres
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("")
}

interface CredencialesGeneradas {
  email: string
  password: string
  nombre: string
}

/**
 * Página para que el administrador cree un usuario tipo Organizador
 * Genera una contraseña automáticamente y muestra las credenciales
 */
export default function RegisterUserOrganizerPage() {
  const navigate = useNavigate()

  // Estado del formulario
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
    email: "",
    telefono: "",
    direccion: "",
    fechaNacimiento: "",
  })

  // Estado de la aplicación
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [credenciales, setCredenciales] = useState<CredencialesGeneradas | null>(null)
  const [copiado, setCopiado] = useState(false)

  // Estado de errores de validación
  const [errores, setErrores] = useState<Record<string, string>>({})

  /**
   * Maneja cambios en los campos del formulario
   */
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Limpiar error del campo al modificar
    if (errores[name]) {
      setErrores((prev) => ({ ...prev, [name]: "" }))
    }
    setError(null)
  }

  /**
   * Valida el formulario antes de enviar
   */
  const validarFormulario = (): boolean => {
    const nuevosErrores: Record<string, string> = {}

    if (!formData.nombre.trim()) {
      nuevosErrores.nombre = "El nombre es requerido"
    } else if (formData.nombre.trim().length < 2) {
      nuevosErrores.nombre = "El nombre debe tener al menos 2 caracteres"
    }

    if (!formData.apellido.trim()) {
      nuevosErrores.apellido = "El apellido es requerido"
    } else if (formData.apellido.trim().length < 2) {
      nuevosErrores.apellido = "El apellido debe tener al menos 2 caracteres"
    }

    if (!formData.email.trim()) {
      nuevosErrores.email = "El email es requerido"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      nuevosErrores.email = "Por favor ingresa un email válido"
    }

    if (!formData.telefono.trim()) {
      nuevosErrores.telefono = "El teléfono es requerido"
    } else if (!/^\d{11}$/.test(formData.telefono)) {
      nuevosErrores.telefono = "El número de teléfono debe tener 11 dígitos"
    }

    if (!formData.direccion.trim()) {
      nuevosErrores.direccion = "La dirección es requerida"
    }

    if (!formData.fechaNacimiento.trim()) {
      nuevosErrores.fechaNacimiento = "La fecha de nacimiento es requerida"
    } else {
      const fecha = new Date(formData.fechaNacimiento)
      const hoy = new Date()
      const edad = hoy.getFullYear() - fecha.getFullYear()
      const mes = hoy.getMonth() - fecha.getMonth()
      const dia = hoy.getDate() - fecha.getDate()

      const esMenorDe18 =
        edad < 18 || (edad === 18 && mes < 0) || (edad === 18 && mes === 0 && dia < 0)

      if (esMenorDe18) {
        nuevosErrores.fechaNacimiento = "Debe tener al menos 18 años"
      }
    }

    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  /**
   * Envía el formulario para crear el organizador
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setCredenciales(null)
    setCopiado(false)

    if (!validarFormulario()) {
      return
    }

    setIsLoading(true)

    try {
      // Generar contraseña automáticamente
      const passwordGenerada = generarPasswordSegura()

      // Preparar el payload según la API
      const payload = {
        firstName: formData.nombre.trim(),
        lastName: formData.apellido.trim(),
        email: formData.email.trim().toLowerCase(),
        phoneNumber: formData.telefono.trim(),
        address: formData.direccion.trim(),
        birthdate: formData.fechaNacimiento,
        roleUser: "Organizador",
        password: passwordGenerada,
      }

      console.log("[RegisterOrganizer] Creando organizador:", payload.email)

      const response = await fetch(`${apiConfig.baseUrl}${apiConfig.users.register}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: "Error desconocido" }))
        throw new Error(errorData.message || `Error ${response.status}: ${response.statusText}`)
      }

      const data = await response.json()
      console.log("[RegisterOrganizer] Organizador creado exitosamente:", data)

      // Guardar las credenciales para mostrarlas
      setCredenciales({
        email: formData.email.trim().toLowerCase(),
        password: passwordGenerada,
        nombre: `${formData.nombre} ${formData.apellido}`,
      })

      // Limpiar el formulario
      setFormData({
        nombre: "",
        apellido: "",
        email: "",
        telefono: "",
        direccion: "",
        fechaNacimiento: "",
      })
    } catch (err: any) {
      console.error("[RegisterOrganizer] Error creando organizador:", err)
      setError(err.message || "Error al crear el organizador")
    } finally {
      setIsLoading(false)
    }
  }

  /**
   * Copia las credenciales al portapapeles
   */
  const copiarCredenciales = async () => {
    if (!credenciales) return

    const texto = `Credenciales del Organizador

Email: ${credenciales.email}
Contraseña: ${credenciales.password}

Nombre: ${credenciales.nombre}

Por favor, comparte estas credenciales de forma segura con el organizador.`

    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch (err) {
      console.error("Error copiando al portapapeles:", err)
      // Fallback: seleccionar texto manualmente
      const textarea = document.createElement("textarea")
      textarea.value = texto
      document.body.appendChild(textarea)
      textarea.select()
      document.execCommand("copy")
      document.body.removeChild(textarea)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    }
  }

  return (
    <AdminLayout>
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Crear Nuevo Organizador</h1>
          <p className="text-text-secondary">
            Completa la información del organizador. Se generará una contraseña automáticamente.
          </p>
        </div>

        {/* Mensaje de éxito con credenciales */}
        {credenciales && (
          <Card className="mb-6 bg-green-50 border-green-200">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h2 className="text-xl font-semibold text-green-800 mb-2">
                  ✅ Organizador creado exitosamente
                </h2>
                <p className="text-green-700 mb-4">
                  Las credenciales se han generado. Compártelas de forma segura con el organizador.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={copiarCredenciales}
                className="flex items-center gap-2"
              >
                {copiado ? (
                  <>
                    <Check className="w-4 h-4" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="w-4 h-4" />
                    Copiar
                  </>
                )}
              </Button>
            </div>

            <div className="bg-white rounded-lg p-4 border border-green-300 space-y-3">
              <div>
                <label className="text-sm font-medium text-text-secondary">Nombre Completo</label>
                <p className="text-lg font-semibold text-text-primary">{credenciales.nombre}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-text-secondary">Email</label>
                <p className="text-lg font-mono text-text-primary">{credenciales.email}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-text-secondary">Contraseña Generada</label>
                <div className="flex items-center gap-2">
                  <p className="text-lg font-mono text-text-primary font-bold">{credenciales.password}</p>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(credenciales.password)
                      setCopiado(true)
                      setTimeout(() => setCopiado(false), 2000)
                    }}
                    className="p-1"
                  >
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-sm text-yellow-800">
                ⚠️ <strong>Importante:</strong> Guarda estas credenciales de forma segura. La contraseña no se
                mostrará nuevamente.
              </p>
            </div>
          </Card>
        )}

        {/* Mensaje de error */}
        {error && (
          <Alert type="error" className="mb-6">
            {error}
          </Alert>
        )}

        {/* Formulario */}
        <Card>
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Nombre */}
              <FormField label="Nombre" required error={errores.nombre}>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-text-tertiary pointer-events-none" />
                  <input
                    name="nombre"
                    type="text"
                    value={formData.nombre}
                    onChange={handleChange}
                    placeholder="Juan"
                    className={`w-full pl-10 pr-3 py-2 border border-border rounded-md text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                      errores.nombre ? "border-danger focus:ring-danger" : ""
                    }`}
                  />
                </div>
              </FormField>

              {/* Apellido */}
              <FormField label="Apellido" required error={errores.apellido}>
                <div className="relative">
                  <User className="absolute left-3 top-3 w-5 h-5 text-text-tertiary pointer-events-none" />
                  <input
                    name="apellido"
                    type="text"
                    value={formData.apellido}
                    onChange={handleChange}
                    placeholder="Pérez"
                    className={`w-full pl-10 pr-3 py-2 border border-border rounded-md text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                      errores.apellido ? "border-danger focus:ring-danger" : ""
                    }`}
                  />
                </div>
              </FormField>

              {/* Email */}
              <FormField label="Email" required error={errores.email}>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 w-5 h-5 text-text-tertiary pointer-events-none" />
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="organizador@ejemplo.com"
                    className={`w-full pl-10 pr-3 py-2 border border-border rounded-md text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                      errores.email ? "border-danger focus:ring-danger" : ""
                    }`}
                  />
                </div>
              </FormField>

              {/* Teléfono */}
              <FormField label="Teléfono" required error={errores.telefono}>
                <div className="relative">
                  <Phone className="absolute left-3 top-3 w-5 h-5 text-text-tertiary pointer-events-none" />
                  <input
                    name="telefono"
                    type="text"
                    value={formData.telefono}
                    onChange={handleChange}
                    placeholder="04121234567"
                    className={`w-full pl-10 pr-3 py-2 border border-border rounded-md text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                      errores.telefono ? "border-danger focus:ring-danger" : ""
                    }`}
                  />
                </div>
              </FormField>

              {/* Dirección */}
              <div className="md:col-span-2">
                <FormField label="Dirección" required error={errores.direccion}>
                  <div className="relative">
                    <MapPin className="absolute left-3 top-3 w-5 h-5 text-text-tertiary pointer-events-none" />
                    <input
                      name="direccion"
                      type="text"
                      value={formData.direccion}
                      onChange={handleChange}
                      placeholder="Caracas, Venezuela"
                      className={`w-full pl-10 pr-3 py-2 border border-border rounded-md text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                        errores.direccion ? "border-danger focus:ring-danger" : ""
                      }`}
                    />
                  </div>
                </FormField>
              </div>

              {/* Fecha de Nacimiento */}
              <div className="md:col-span-2">
                <FormField label="Fecha de Nacimiento" required error={errores.fechaNacimiento}>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3 w-5 h-5 text-text-tertiary pointer-events-none" />
                    <input
                      type="date"
                      name="fechaNacimiento"
                      value={formData.fechaNacimiento}
                      onChange={handleChange}
                      className={`w-full pl-10 pr-3 py-2 border border-border rounded-md text-text-primary placeholder-text-tertiary focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-colors ${
                        errores.fechaNacimiento ? "border-danger focus:ring-danger" : ""
                      }`}
                    />
                  </div>
                </FormField>
              </div>
            </div>

            {/* Información sobre la contraseña */}
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
              <div className="flex items-start gap-3">
                <Lock className="w-5 h-5 text-blue-600 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-800 mb-1">
                    Contraseña generada automáticamente</p>
                  <p className="text-xs text-blue-700">
                    Se generará una contraseña segura de 12 caracteres que incluye mayúsculas, minúsculas,
                    números y símbolos. Las credenciales se mostrarán después de crear el organizador.
                  </p>
                </div>
              </div>
            </div>

            {/* Botones de acción */}
            <div className="mt-8 flex gap-4 justify-end">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/admin")}
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary" loading={isLoading} disabled={isLoading}>
                {isLoading ? "Creando Organizador..." : "Crear Organizador"}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </AdminLayout>
  )
}
