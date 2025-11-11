import { type KeycloakToken, type KeycloakUser, keycloakConfig } from "./keycloakConfig"
import { RoleType } from "../../domain/entities/Usuario"
import { usuariosApi } from "../api/usuariosApi"

class KeycloakService {
  private tokenKey = "keycloak_token"
  private userKey = "keycloak_user"
  private refreshTokenKey = "keycloak_refresh_token"

  /**
   * Inicia el flujo OAuth2 de autorización
   */
  initiateOAuthFlow(): void {
    const state = this.generateRandomState()
    const nonce = this.generateRandomState()

    localStorage.setItem("oauth_state", state)
    localStorage.setItem("oauth_nonce", nonce)

    const authorizationUrl = new URL(`/realms/${keycloakConfig.realm}/protocol/openid-connect/auth`, keycloakConfig.url)

    authorizationUrl.searchParams.append("client_id", keycloakConfig.clientId)
    authorizationUrl.searchParams.append("redirect_uri", keycloakConfig.redirectUri)
    authorizationUrl.searchParams.append("response_type", "code")
    authorizationUrl.searchParams.append("scope", "openid profile email")
    authorizationUrl.searchParams.append("state", state)
    authorizationUrl.searchParams.append("nonce", nonce)

    window.location.href = authorizationUrl.toString()
  }

  /**
   * Procesa el callback de OAuth (mock en desarrollo)
   */
  async handleOAuthCallback(code: string): Promise<KeycloakToken | null> {
    try {
      const state = localStorage.getItem("oauth_state")
      if (!state) {
        throw new Error("Estado OAuth no válido")
      }

      // En producción, esto haría una llamada al endpoint de token de Keycloak
      // Para desarrollo, generamos un token mock
      const token = this.generateMockToken(code)
      this.storeToken(token)

      return token
    } catch (error) {
      console.error("Error en OAuth callback:", error)
      return null
    } finally {
      localStorage.removeItem("oauth_state")
      localStorage.removeItem("oauth_nonce")
    }
  }

  /**
   * Realiza login con email y contraseña (Direct Grant Flow)
   */
  async loginWithCredentials(email: string, password: string): Promise<KeycloakToken | null> {
    try {
      // En producción, esto sería una llamada a Keycloak
      // Para desarrollo, simulamos autenticación exitosa
      if (password.length < 3) {
        throw new Error("Contraseña inválida")
      }

      const user = await usuariosApi.obtenerPorEmail(email)
      if (!user) {
        throw new Error("Usuario no encontrado")
      }

      // Generar token mock
      const token = this.generateMockToken(email)
      this.storeToken(token)

      // Decodificar y almacenar información del usuario
      const userInfo = this.decodeMockUser(email, user.role)
      this.storeUser(userInfo)

      return token
    } catch (error) {
      console.error("Error en login:", error)
      throw error
    }
  }

  /**
   * Realiza logout
   */
  logout(): void {
    // Limpiar tokens y usuario
    localStorage.removeItem(this.tokenKey)
    localStorage.removeItem(this.userKey)
    localStorage.removeItem(this.refreshTokenKey)

    // En producción, llamar a endpoint de logout de Keycloak
    const logoutUrl = new URL(`/realms/${keycloakConfig.realm}/protocol/openid-connect/logout`, keycloakConfig.url)
    logoutUrl.searchParams.append("redirect_uri", keycloakConfig.logoutRedirectUri)

    // Descomenta para redireccionar a Keycloak en producción
    // window.location.href = logoutUrl.toString()
  }

  /**
   * Obtiene el token de acceso actual
   */
  getToken(): string | null {
    return localStorage.getItem(this.tokenKey)
  }

  /**
   * Obtiene el token de refresco
   */
  getRefreshToken(): string | null {
    return localStorage.getItem(this.refreshTokenKey)
  }

  /**
   * Obtiene la información del usuario
   */
  getUser(): KeycloakUser | null {
    const userStr = localStorage.getItem(this.userKey)
    return userStr ? JSON.parse(userStr) : null
  }

  /**
   * Verifica si el token es válido
   */
  isTokenValid(): boolean {
    const token = this.getToken()
    if (!token) return false

    // Aquí se verificaría la expiración del token
    // Para desarrollo, asumimos que siempre es válido
    return true
  }

  /**
   * Refresca el token
   */
  async refreshToken(): Promise<KeycloakToken | null> {
    const refreshToken = this.getRefreshToken()
    if (!refreshToken) {
      return null
    }

    try {
      // En producción, llamar a endpoint de refresh de Keycloak
      const newToken = this.generateMockToken(refreshToken)
      this.storeToken(newToken)
      return newToken
    } catch (error) {
      console.error("Error refrescando token:", error)
      return null
    }
  }

  /**
   * Verifica si el usuario tiene un rol específico
   */
  hasRole(role: string): boolean {
    const user = this.getUser()
    return user?.roles?.includes(role) || false
  }

  /**
   * Obtiene todos los roles del usuario
   */
  getUserRoles(): string[] {
    const user = this.getUser()
    return user?.roles || []
  }

  // ============= MÉTODOS PRIVADOS =============

  private storeToken(token: KeycloakToken): void {
    localStorage.setItem(this.tokenKey, token.accessToken)
    localStorage.setItem(this.refreshTokenKey, token.refreshToken)
  }

  private storeUser(user: KeycloakUser): void {
    localStorage.setItem(this.userKey, JSON.stringify(user))
  }

  private generateRandomState(): string {
    return Math.random().toString(36).substring(2, 15)
  }

  private generateMockToken(seed: string): KeycloakToken {
    return {
      accessToken: `mock_access_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      refreshToken: `mock_refresh_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      idToken: `mock_id_${Date.now()}_${Math.random().toString(36).substring(7)}`,
      expiresIn: 3600,
      tokenType: "Bearer",
    }
  }

  private decodeMockUser(email: string, role: RoleType): KeycloakUser {
    const roleMap: Record<RoleType, string> = {
      [RoleType.USUARIO]: "usuario",
      [RoleType.ORGANIZADOR]: "organizador",
      [RoleType.ADMIN]: "admin",
    }

    return {
      sub: `user_${Date.now()}`,
      name: email.split("@")[0],
      email,
      given_name: email.split("@")[0],
      family_name: "Usuario",
      roles: [roleMap[role]],
    }
  }
}

export const keycloakService = new KeycloakService()
