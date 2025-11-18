"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { ArrowRight, Mail, Lock, User, Calendar } from "lucide-react"

export default function RegistroPage() {
    const [nombre, setNombre] = useState("")
    const [apellido, setApellido] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [passwordConfirm, setPasswordConfirm] = useState("")
    const [telefono, setTelefono] = useState("")
    const [direccion, setDireccion] = useState("")
    const [fechaNacimiento, setFechaNacimiento] = useState("")
    const [rol, setRol] = useState("Organizador")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [acceptTerms, setAcceptTerms] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false);

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
        if (!apellido.trim()) {
            setError("El apellido es requerido")
            return false
        }
        if (apellido.trim().length < 2) {
            setError("El apellido debe tener al menos 2 caracteres")
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
        if (!telefono.trim()) {
            setError("El telefono es requerido")
            return false
        }
        if (!/^\d{11}$/.test(telefono)) {
            setError("El numero de telefono debe tener 11 digitos")
            return false
        }
        if (!direccion.trim()) {
            setError("La direccion es requerida")
            return false
        }
        if (!fechaNacimiento.trim()) {
            setError("La fecha de nacimiento es requerida")
            return false
        }


        const fecha = new Date(fechaNacimiento);
        const hoy = new Date();

        const edad = hoy.getFullYear() - fecha.getFullYear();
        const mes = hoy.getMonth() - fecha.getMonth();
        const dia = hoy.getDate() - fecha.getDate();

        const esMenorDe18 =
            edad < 18 ||
            (edad === 18 && mes < 0) ||
            (edad === 18 && mes === 0 && dia < 0);

        if (esMenorDe18) {
            setError("Debes tener al menos 18 años");
            console.log("Fecha de nacimiento inválida para ser mayor de 18 años:", fechaNacimiento);
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


        console.log("Formulario enviado con los siguientes datos:")
        console.log("Nombre:", nombre)
        console.log("Email:", email)
        console.log("Apellido:", apellido)
        console.log("Teléfono:", telefono)
        console.log("Dirección:", direccion)
        console.log("Fecha de Nacimiento:", fechaNacimiento)
        console.log("Rol:", rol)
        console.log("Aceptó términos:", acceptTerms)

        if (!validateForm()) return

        setIsLoading(true)

        try {
            const response = await fetch("http://localhost:7247/users/registerUser", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    firstName: nombre,
                    lastName: apellido,
                    email: email,
                    phoneNumber: telefono,
                    address: direccion,
                    birthdate: fechaNacimiento,
                    roleUser: rol,
                    password: password,
                })
            })
            if (!response.ok) {
                // Intenta parsear el cuerpo como JSON
                let errorMessage = "Error en el registro";
                try {
                    const errorData = await response.json();
                    errorMessage = errorData.message || JSON.stringify(errorData);
                } catch (jsonError) {
                    // Si no es JSON válido, intenta leer como texto
                    const errorText = await response.text();
                    errorMessage = errorText || errorMessage;
                }

                console.error("Error de registro:", errorMessage);
                setError(errorMessage);
                return; // Evita continuar con el flujo si hubo error
            }
            setShowSuccess(true);

        } catch (err) {
            console.error("Error en la solicitud de registro:", err)
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

                {/* Registration Form */}
                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {/* Nombre */}
                        <div>
                            <label htmlFor="nombre" className="block text-sm font-medium text-text-primary mb-2">
                                Nombre
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
                                    placeholder="Juan"
                                />
                            </div>
                        </div>

                        {/* Apellido */}
                        <div>
                            <label htmlFor="apellido" className="block text-sm font-medium text-text-primary mb-2">
                                Apellido
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 w-5 h-5 text-text-tertiary" />
                                <input
                                    id="apellido"
                                    name="apellido"
                                    type="text"
                                    autoComplete="apellido"
                                    required
                                    value={apellido}
                                    onChange={(e) => setApellido(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary placeholder-text-tertiary"
                                    placeholder="Pérez"
                                />
                            </div>
                        </div>

                        {/* Telefono */}
                        <div>
                            <label htmlFor="apellido" className="block text-sm font-medium text-text-primary mb-2">
                                Teléfono
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 w-5 h-5 text-text-tertiary" />
                                <input
                                    id="telefono"
                                    name="telefono"
                                    type="text"
                                    autoComplete="telefono"
                                    required
                                    value={telefono}
                                    onChange={(e) => setTelefono(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary placeholder-text-tertiary"
                                    placeholder="04121234567"
                                />
                            </div>
                        </div>

                        {/* Direccion */}
                        <div>
                            <label htmlFor="direccion" className="block text-sm font-medium text-text-primary mb-2">
                                Dirección
                            </label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 w-5 h-5 text-text-tertiary" />
                                <input
                                    id="direccion"
                                    name="direccion"
                                    type="text"
                                    autoComplete="direccion"
                                    required
                                    value={direccion}
                                    onChange={(e) => setDireccion(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary placeholder-text-tertiary"
                                    placeholder="Caracas"
                                />
                            </div>
                        </div>

                        {/* Fecha de nacimiento */}
                        <div>
                            <label htmlFor="fechaHora" className="block text-sm font-medium text-text-primary mb-2">
                                Fecha de nacimiento
                            </label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 w-5 h-5 text-text-tertiary" />
                                <input
                                    id="fechaHora"
                                    name="fechaHora"
                                    type="datetime-local"
                                    required
                                    value={fechaNacimiento}
                                    onChange={(e) => setFechaNacimiento(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary placeholder-text-tertiary"
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
                    {/* Error Alert */}
                    {error && (
                        <div className="rounded-md bg-red-50 p-4 border border-red-200">
                            <p className="text-sm font-medium text-red-800">{error}</p>
                        </div>
                    )}

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full inline-flex justify-center items-center gap-2 py-2 px-4 border border-border rounded-lg shadow-sm bg-white text-sm font-medium text-text-primary hover:bg-bg-secondary transition-colors"

                    >
                        {isLoading ? "Registrando..." : "Registrarse"}
                        {!isLoading && <ArrowRight className="h-4 w-4" />}
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
                </form>
                {showSuccess && (
                    <div className="fixed bottom-4 right-4 bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-lg shadow-md z-50">
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-sm">¡Registro exitoso!</span>
                            <button
                                onClick={() => {
                                    setShowSuccess(false);
                                    navigate("/"); // o "/login"
                                }}
                                className="text-sm font-medium text-green-700 hover:underline"
                            >
                                Aceptar
                            </button>
                        </div>
                    </div>
                )}


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
