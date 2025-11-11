"use client"

import type React from "react"

import { Navigate, useLocation } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import type { RoleType } from "../../../domain/entities/Usuario"

interface PrivateRouteProps {
  children: React.ReactNode
  requiredRole?: RoleType | RoleType[]
}

export default function PrivateRoute({ children, requiredRole }: PrivateRouteProps) {
  const { isAuthenticated, usuario, isLoading, hasAnyRole } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-text-secondary">Cargando...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requiredRole) {
    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole]
    if (!hasAnyRole(roles)) {
      return <Navigate to="/" replace />
    }
  }

  return <>{children}</>
}
