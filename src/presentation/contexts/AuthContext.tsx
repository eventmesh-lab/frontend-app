import { createContext, useContext, useState, useEffect, type ReactNode, useCallback } from "react"
import type { RoleType } from "../../domain/entities/Usuario"
import { UsuarioEntity } from "../../domain/entities/Usuario"
import { usuariosApi } from "../../adapters/api/usuariosApi"
import { keycloakService } from "../../adapters/keycloak/keycloakService"

interface AuthContextType {
  usuario: UsuarioEntity | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  hasRole: (role: RoleType) => boolean
  hasAnyRole: (roles: RoleType[]) => boolean
  initiateOAuth: () => void
  handleOAuthCallback: (code: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [usuario, setUsuario] = useState<UsuarioEntity | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Inicializar desde Keycloak al montar
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true)

        // Verificar si hay un token válido
        if (keycloakService.isTokenValid()) {
          const keycloakUser = keycloakService.getUser()
          if (keycloakUser) {
            // Obtener usuario completo desde API
            const usuarioEncontrado = await usuariosApi.obtenerPorEmail(keycloakUser.email)
            if (usuarioEncontrado) {
              setUsuario(usuarioEncontrado)
            }
          }
        }
      } catch (err) {
        console.error("Error inicializando autenticación:", err)
        setError(err instanceof Error ? err.message : "Error desconocido")
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  const login = useCallback(async (email: string, password: string) => {
    try {
      setIsLoading(true)
      setError(null)

      // Autenticar con Keycloak
      const token = await keycloakService.loginWithCredentials(email, password)
      if (!token) {
        throw new Error("Fallo en autenticación de Keycloak")
      }

      // Obtener usuario desde API
      const usuarioEncontrado = await usuariosApi.obtenerPorEmail(email)
      if (!usuarioEncontrado) {
        throw new Error("Usuario no encontrado")
      }

      setUsuario(usuarioEncontrado)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error en login"
      setError(errorMsg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    keycloakService.logout()
    setUsuario(null)
    setError(null)
  }, [])

  const hasRole = useCallback(
    (role: RoleType): boolean => {
      return usuario?.role === role
    },
    [usuario],
  )

  const hasAnyRole = useCallback(
    (roles: RoleType[]): boolean => {
      return usuario ? roles.includes(usuario.role) : false
    },
    [usuario],
  )

  const initiateOAuth = useCallback(() => {
    keycloakService.initiateOAuthFlow()
  }, [])

  const handleOAuthCallback = useCallback(async (code: string) => {
    try {
      setIsLoading(true)
      setError(null)

      const token = await keycloakService.handleOAuthCallback(code)
      if (!token) {
        throw new Error("Fallo en procesamiento de OAuth callback")
      }

      const keycloakUser = keycloakService.getUser()
      if (!keycloakUser) {
        throw new Error("Información de usuario no disponible")
      }

      const usuarioEncontrado = await usuariosApi.obtenerPorEmail(keycloakUser.email)
      if (!usuarioEncontrado) {
        throw new Error("Usuario no encontrado")
      }

      setUsuario(usuarioEncontrado)
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error en OAuth callback"
      setError(errorMsg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  return (
    <AuthContext.Provider
      value={{
        usuario,
        isAuthenticated: !!usuario,
        isLoading,
        error,
        login,
        logout,
        hasRole,
        hasAnyRole,
        initiateOAuth,
        handleOAuthCallback,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider")
  }
  return context
}
