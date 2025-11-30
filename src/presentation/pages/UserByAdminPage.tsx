"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import { User } from "lucide-react"

type UserProfile = {
    firstName: string
    lastName: string
    email: string
    phoneNumber: string
    address: string
    birthdate: string
    roleUser: string
}

export default function ProfileUserByAdminPage() {
    const [users, setUsers] = useState<UserProfile[]>([])
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        const fetchUsers = async () => {
            setIsLoading(true)
            try {
                const response = await fetch("http://localhost:7181/api/users/getUsers")
                if (!response.ok) {
                    const errorText = await response.text()
                    throw new Error(errorText || "Error al obtener usuarios")
                }
                const data = await response.json()
                setUsers(data)
            } catch (err) {
                console.error("Error de red/conexión:", err);
                setError("No se pudo conectar con el servidor. Verifica tu conexión.");
            } finally {
                setIsLoading(false)
            }
        }

        fetchUsers()
    }, [])

    return (
        <div className="min-h-screen bg-gradient-to-br from-bg-secondary to-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto space-y-6">
                <h2 className="text-3xl font-bold text-text-primary text-center">Usuarios registrados</h2>

                {isLoading && <p className="text-center text-text-secondary">Cargando usuarios...</p>}

                {error && (
                    <div className="rounded-md bg-red-50 p-4 border border-red-200">
                        <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                )}

                <ul className="space-y-4">
                    {users.map((user) => (
                        <li key={user.email} className="border border-border rounded-lg p-4 hover:bg-bg-secondary transition-colors">
                            <Link to={`/admin/user/${encodeURIComponent(user.email)}`} className="flex items-center gap-4">
                                <User className="w-6 h-6 text-text-tertiary" />
                                <div>
                                    <p className="text-lg font-semibold text-text-primary">
                                        {user.firstName.trim()} {user.lastName.trim()}
                                    </p>
                                    <p className="text-sm text-text-secondary">{user.email}</p>
                                    <p className="text-sm text-text-secondary">Rol: {user.roleUser}</p>
                                </div>
                            </Link>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    )
}