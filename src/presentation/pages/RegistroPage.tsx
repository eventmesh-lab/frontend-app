"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { ArrowRight, Mail, Lock, User } from "lucide-react"

export default function RegistroPage() {
  const [nombre, setNombre] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [acceptTerms, setAcceptTerms] = useState(false)

  const { login, initiateOAuth } = useAuth()
  const navigate = useNavigate()

  const validateForm = (): boolean => {
    if (!nombre.trim()) {
      setError("El nombre es requerido")
      return false
    }
    if (nombre.trim().length < 2) {
      setError("El nombre debe tener al menos 2 caracteres")
      return false
    }
    if (!email.trim()) {
      setError("El email es requerido")
      return false
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("Por favor ingresa un email válido")
      return false
    }
    if (!password) {
      setError("La contraseña es requerida")
      return false
    }
    if (password.length < 6) {
      setError("La contraseña debe tener al menos 6 caracteres")
      return false
    }
    if (password !== passwordConfirm) {
      setError("Las contraseñas no coinciden")
      return false
    }
    if (!acceptTerms) {
      setError("Debes aceptar los términos y condiciones")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    try {
      await login(email, password)
      navigate("/", { replace: true })
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error en el registro")
    } finally {
      setIsLoading(false)
    }
  }

  const handleOAuth = () => {
    initiateOAuth()
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bg-secondary to-white py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo */}
        <div>
          <div className="flex justify-center mb-6">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">E</span>
              </div>
              <span className="text-xl font-bold text-text-primary hidden sm:inline">EventHub</span>
            </Link>
          </div>
          <h2 className="mt-6 text-center text-3xl font-bold text-text-primary">Crea tu cuenta</h2>
          <p className="mt-2 text-center text-text-secondary">Únete a EventHub en menos de un minuto</p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="rounded-md bg-red-50 p-4 border border-red-200">
            <p className="text-sm font-medium text-red-800">{error}</p>
          </div>
        )}

        {/* Registration Form */}
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {/* Nombre */}
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-text-primary mb-2">
                Nombre Completo
              </label>
              <div className="relative">
                <User className="absolute left-3 top-3 w-5 h-5 text-text-tertiary" />
                <input
                  id="nombre"
                  name="nombre"
                  type="text"
                  autoComplete="name"
                  required
                  value={nombre}
                  onChange={(e) => setNombre(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary placeholder-text-tertiary"
                  placeholder="Juan Pérez"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 w-5 h-5 text-text-tertiary" />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary placeholder-text-tertiary"
                  placeholder="tu@ejemplo.com"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-text-primary mb-2">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-text-tertiary" />
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary placeholder-text-tertiary"
                  placeholder="Mínimo 6 caracteres"
                />
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label htmlFor="passwordConfirm" className="block text-sm font-medium text-text-primary mb-2">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 w-5 h-5 text-text-tertiary" />
                <input
                  id="passwordConfirm"
                  name="passwordConfirm"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={passwordConfirm}
                  onChange={(e) => setPasswordConfirm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary placeholder-text-tertiary"
                  placeholder="Repite tu contraseña"
                />
              </div>
            </div>
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-center">
            <input
              id="terms"
              name="terms"
              type="checkbox"
              checked={acceptTerms}
              onChange={(e) => setAcceptTerms(e.target.checked)}
              className="h-4 w-4 text-primary border-border rounded focus:ring-primary"
            />
            <label htmlFor="terms" className="ml-2 block text-sm text-text-secondary">
              Acepto los{" "}
              <a href="#" className="text-primary hover:text-primary-dark font-medium">
                términos y condiciones
              </a>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex justify-center items-center gap-2 py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-primary hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 transition-colors"
          >
            {isLoading ? "Creando cuenta..." : "Crear Cuenta"}
            {!isLoading && <ArrowRight className="w-4 h-4" />}
          </button>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-text-tertiary">O continúa con</span>
            </div>
          </div>

          {/* OAuth Button */}
          <button
            type="button"
            onClick={handleOAuth}
            className="w-full inline-flex justify-center items-center gap-2 py-2 px-4 border border-border rounded-lg shadow-sm bg-white text-sm font-medium text-text-primary hover:bg-bg-secondary transition-colors"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path d="M15.545 6.558a9.42 9.42 0 01.139 1.626c0 2.449-.356 4.68-1.015 6.467h.049c.02.323.021.645.021.967v.75c0 .73-.074 1.446-.221 2.141H6.92c.166-.678.316-1.268.455-1.77.13-.461.243-.925.243-1.435V8.587c0-.312-.03-.623-.08-.92h8.006z" />
            </svg>
            <span>Keycloak OAuth</span>
          </button>
        </form>

        {/* Login Link */}
        <div className="text-center">
          <p className="text-text-secondary">
            ¿Ya tienes cuenta?{" "}
            <Link to="/login" className="text-primary hover:text-primary-dark font-semibold transition-colors">
              Inicia sesión
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div className="text-center">
          <Link to="/" className="text-sm text-text-tertiary hover:text-text-secondary transition-colors">
            Volver al inicio
          </Link>
        </div>
      </div>
    </div>
  )
}
