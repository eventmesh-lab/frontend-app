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

    if (!isAuthenticated || !username) {
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (requiredRole) {
        const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
        if (!roles.includes(role ?? "")) {
            return <Navigate to="/" replace />
        }
    }

    return <>{children}</>
}