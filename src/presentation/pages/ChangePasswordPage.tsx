"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Lock, ArrowRight } from "lucide-react"

import { apiConfig } from "../../config/env"


export default function ChangePasswordPage() {
    const [email, setEmail] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const [showSuccess, setShowSuccess] = useState(false);
    const navigate = useNavigate()

    const validateForm = (): boolean => {
        if (!email.trim()) {
            setError("El correo electrónico es requerido")
            return false
        }
        if (!newPassword.trim()) {
            setError("La nueva contraseña es requerida")
            return false
        }
        if (newPassword.length < 6) {
            setError("La contraseña debe tener al menos 6 caracteres")
            return false
        }
        if (newPassword !== confirmPassword) {
            setError("Las contraseñas no coinciden")
            return false
        }
        return true
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!validateForm()) return
        setIsLoading(true)

        try {

            const response = await fetch(`${apiConfig.baseUrl}${apiConfig.users.changePassword(email)}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ newPassword })

            })
            setShowSuccess(true);
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error al cambiar la contraseña")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bg-secondary to-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <h2 className="text-center text-3xl font-bold text-text-primary">Cambiar contraseña</h2>
                <form className="space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-text-primary mb-2">
                                Correo electrónico
                            </label>
                            <div className="relative">
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full pl-4 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary placeholder-text-tertiary"
                                    placeholder="Introduce tu correo"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="newPassword" className="block text-sm font-medium text-text-primary mb-2">
                                Nueva contraseña
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 w-5 h-5 text-text-tertiary" />
                                <input
                                    id="newPassword"
                                    name="newPassword"
                                    type="password"
                                    required
                                    value={newPassword}
                                    onChange={(e) => setNewPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary placeholder-text-tertiary"
                                    placeholder="Introduce la nueva contraseña"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-text-primary mb-2">
                                Confirmar contraseña
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 w-5 h-5 text-text-tertiary" />
                                <input
                                    id="confirmPassword"
                                    name="confirmPassword"
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent text-text-primary placeholder-text-tertiary"
                                    placeholder="Confirma la contraseña"
                                />
                            </div>
                        </div>
                    </div>

                    {error && (
                        <div className="rounded-md bg-red-50 p-4 border border-red-200">
                            <p className="text-sm font-medium text-red-800">{error}</p>
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full inline-flex justify-center items-center gap-2 py-2 px-4 border border-border rounded-lg shadow-sm bg-white text-sm font-medium text-text-primary hover:bg-bg-secondary transition-colors"
                    >
                        {isLoading ? "Cambiando..." : "Cambiar contraseña"}
                        {!isLoading && <ArrowRight className="h-4 w-4" />}
                    </button>
                </form>
                {showSuccess && (
                    <div className="fixed bottom-4 right-4 bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-lg shadow-md z-50">
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-sm">¡Cambio de contraseña exitoso!</span>
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
            </div>
        </div>
    )
}