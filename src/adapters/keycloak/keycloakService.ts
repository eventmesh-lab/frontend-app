import axios from 'axios'
import { type KeycloakToken, type KeycloakUser } from "./keycloakConfig"

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

    const config = getKeycloakConfig()
    const authorizationUrl = new URL(`/realms/${config.realm}/protocol/openid-connect/auth`, config.url)

    authorizationUrl.searchParams.append("client_id", config.clientId)
    authorizationUrl.searchParams.append("redirect_uri", config.redirectUri)
    authorizationUrl.searchParams.append("response_type", "code")
    authorizationUrl.searchParams.append("scope", "openid profile email")
    authorizationUrl.searchParams.append("state", state)
    authorizationUrl.searchParams.append("nonce", nonce)

    window.location.href = authorizationUrl.toString()
  }

  /**
   * Procesa el callback de OAuth
   */
  async handleOAuthCallback(code: string): Promise<KeycloakToken | null> {
    try {
      const state = localStorage.getItem("oauth_state")
      if (!state) {
        throw new Error("Estado OAuth no válido")
      }

      const config = getKeycloakConfig()
      const tokenUrl = `${config.url}/realms/${config.realm}/protocol/openid-connect/token`

      const response = await axios.post(
        tokenUrl,
        new URLSearchParams({
          grant_type: "authorization_code",
          code: code,
          client_id: config.clientId,
          redirect_uri: config.redirectUri,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      )

      const token: KeycloakToken = {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        idToken: response.data.id_token,
        expiresIn: response.data.expires_in,
        tokenType: response.data.token_type || "Bearer",
      }

      this.storeToken(token)
      await this.loadUserInfo(token.accessToken)

      return token
    } catch (error: any) {
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
      const config = getKeycloakConfig()
      const tokenUrl = `${config.url}/realms/${config.realm}/protocol/openid-connect/token`

      const response = await axios.post(
        tokenUrl,
        new URLSearchParams({
          grant_type: "password",
          username: email,
          password: password,
          client_id: config.clientId,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      )

      const token: KeycloakToken = {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token,
        idToken: response.data.id_token,
        expiresIn: response.data.expires_in,
        tokenType: response.data.token_type || "Bearer",
      }

      this.storeToken(token)
      await this.loadUserInfo(token.accessToken)

      return token
    } catch (error: any) {
      console.error("Error en login:", error)
      if (error.response?.status === 401) {
        throw new Error("Credenciales inválidas")
      }
      throw new Error(error.response?.data?.error_description || "Error al iniciar sesión")
    }
  }

  /**
   * Carga la información del usuario desde Keycloak
   */
  private async loadUserInfo(accessToken: string): Promise<void> {
    try {
      const config = getKeycloakConfig()
      const userInfoUrl = `${config.url}/realms/${config.realm}/protocol/openid-connect/userinfo`

      const response = await axios.get(userInfoUrl, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      })

      const userInfo: KeycloakUser = {
        sub: response.data.sub,
        name: response.data.name || response.data.preferred_username || "",
        email: response.data.email || "",
        given_name: response.data.given_name || "",
        family_name: response.data.family_name || "",
        roles: response.data.realm_access?.roles || [],
      }

      this.storeUser(userInfo)
    } catch (error) {
      console.error("Error cargando información del usuario:", error)
      // Si falla, intentar obtener del token decodificado
      try {
        const decoded = this.decodeToken(accessToken)
        const userInfo: KeycloakUser = {
          sub: decoded.sub || "",
          name: decoded.name || decoded.preferred_username || "",
          email: decoded.email || "",
          given_name: decoded.given_name || "",
          family_name: decoded.family_name || "",
          roles: decoded.realm_access?.roles || [],
        }
        this.storeUser(userInfo)
      } catch (e) {
        console.error("Error decodificando token:", e)
      }
    }
  }

  /**
   * Decodifica un JWT token (sin verificar firma)
   */
  private decodeToken(token: string): any {
    try {
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join('')
      )
      return JSON.parse(jsonPayload)
    } catch (error) {
      throw new Error("Token inválido")
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

    // Llamar a endpoint de logout de Keycloak
    const config = getKeycloakConfig()
    const logoutUrl = new URL(`/realms/${config.realm}/protocol/openid-connect/logout`, config.url)
    logoutUrl.searchParams.append("redirect_uri", config.logoutRedirectUri)

    // Redireccionar a Keycloak para logout completo
    window.location.href = logoutUrl.toString()
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

    try {
      const decoded = this.decodeToken(token)
      const exp = decoded.exp * 1000 // Convertir a milisegundos
      const now = Date.now()
      return exp > now
    } catch (error) {
      return false
    }
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
      const config = getKeycloakConfig()
      const tokenUrl = `${config.url}/realms/${config.realm}/protocol/openid-connect/token`

      const response = await axios.post(
        tokenUrl,
        new URLSearchParams({
          grant_type: "refresh_token",
          refresh_token: refreshToken,
          client_id: config.clientId,
        }),
        {
          headers: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
        }
      )

      const newToken: KeycloakToken = {
        accessToken: response.data.access_token,
        refreshToken: response.data.refresh_token || refreshToken,
        idToken: response.data.id_token,
        expiresIn: response.data.expires_in,
        tokenType: response.data.token_type || "Bearer",
      }

      this.storeToken(newToken)
      return newToken
    } catch (error: any) {
      console.error("Error refrescando token:", error)
      // Si el refresh falla, limpiar tokens y redirigir a login
      this.logout()
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
}

// Función helper para obtener configuración
function getKeycloakConfig() {
  const getOrigin = () => {
    if (typeof window !== 'undefined' && window.location) {
      return window.location.origin
    }
    return 'http://localhost:3000'
  }

  return {
    realm: import.meta.env.VITE_KEYCLOAK_REALM || "myrealm",
    url: import.meta.env.VITE_KEYCLOAK_URL || "http://localhost:8080",
    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || "eventhub-frontend",
    redirectUri: import.meta.env.VITE_KEYCLOAK_REDIRECT_URI || getOrigin(),
    logoutRedirectUri: import.meta.env.VITE_KEYCLOAK_LOGOUT_URI || getOrigin(),
  }
}

export const keycloakService = new KeycloakService()
