"use client"

import { useEffect, useState } from "react"
import { useParams, Link } from "react-router-dom"
import { Mail, Phone, User, Calendar, Home, ArrowLeft } from "lucide-react"
import { apiConfig } from "../../config/env"

type UserProfile = {
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
    address: string
    birthdate: string
    roleUser: string
}

export default function UserDetailPage() {
    const { email } = useParams()
    const [user, setUser] = useState<UserProfile | null>(null)
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        const fetchUser = async () => {
            setIsLoading(true)
            try {
                const response = await fetch(`${apiConfig.baseUrl}${apiConfig.users.getAll}`)
                if (!response.ok) throw new Error("Error al obtener usuarios")

                const data: UserProfile[] = await response.json()
                const foundUser = data.find(u => u.email === email)

                if (!foundUser) throw new Error("Usuario no encontrado")
                setUser(foundUser)
            } catch (err) {
                console.error("Error de red/conexi�n:", err);
                setError("No se pudo conectar con el servidor. Verifica tu conexi�n.");
            } finally {
                setIsLoading(false)
            }
        }

        fetchUser()
    }, [email])

    return (
        <div className="min-h-screen bg-gradient-to-br from-bg-secondary to-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-xl mx-auto space-y-6">
                <Link to="/admin/usuarios" className="inline-flex items-center gap-2 text-sm text-primary hover:underline">
                    <ArrowLeft className="w-4 h-4" />
                    Volver a la lista
                </Link>

                <h2 className="text-3xl font-bold text-text-primary text-center">Perfil del Usuario</h2>

                {isLoading && <p className="text-center text-text-secondary">Cargando datos...</p>}

                {error && (
                    <div className="rounded-md bg-red-50 p-4 border border-red-200">
                        <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                )}

                {user && (
                    <div className="space-y-4 border border-border rounded-lg p-6 bg-white shadow-sm">
                        <div className="flex items-center gap-3">
                            <User className="text-text-tertiary w-5 h-5" />
                            <p className="text-text-primary font-medium">
                                {user.firstName.trim()} {user.lastName.trim()}
                            </p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Mail className="text-text-tertiary w-5 h-5" />
                            <p className="text-text-secondary">{user.email}</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Phone className="text-text-tertiary w-5 h-5" />
                            <p className="text-text-secondary">{user.phoneNumber}</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Home className="text-text-tertiary w-5 h-5" />
                            <p className="text-text-secondary">{user.address}</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <Calendar className="text-text-tertiary w-5 h-5" />
                            <p className="text-text-secondary">Nacimiento: {user.birthdate}</p>
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-text-primary">Rol:</span>
                            <span className="text-sm text-text-secondary">{user.roleUser}</span>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}