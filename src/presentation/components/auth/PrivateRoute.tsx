import React from "react"
import { Navigate, useLocation } from "react-router-dom"
import  useAuth  from "../../contexts/Auth"

interface PrivateRouteProps {
    children: React.ReactNode
    requiredRole?: string | string[]
}

export default function PrivateRoute({ children, requiredRole }: PrivateRouteProps) {
    const { isAuthenticated, role, username } = useAuth()
    const location = useLocation()

    console.log(`[PrivateRoute] Verificando acceso. Autenticado: ${isAuthenticated}, Username: ${username}, Rol: ${role}, Rol requerido: ${requiredRole}`)

    if (!isAuthenticated || !username) {
        console.log("[PrivateRoute] No autenticado, redirigiendo a login")
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (requiredRole) {
        const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
        // Normalizar roles para comparación (case-insensitive)
        const normalizedUserRole = role?.toLowerCase() ?? ""
        const normalizedRequiredRoles = roles.map(r => r.toLowerCase())
        console.log(`[PrivateRoute] Comparando roles. Rol usuario (normalizado): "${normalizedUserRole}", Roles requeridos (normalizados): [${normalizedRequiredRoles.join(", ")}]`)
        
        if (!normalizedRequiredRoles.includes(normalizedUserRole)) {
            console.warn(`[PrivateRoute] Acceso denegado. Rol requerido: ${roles.join(", ")}, Rol del usuario: ${role}`)
            return <Navigate to="/" replace />
        }
        console.log("[PrivateRoute] Acceso permitido")
    }

    return <>{children}</>
}