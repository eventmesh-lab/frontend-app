// Configuración de Keycloak para OAuth/SSO mock
// Se evalúa de forma lazy para evitar acceso a window en tiempo de carga del módulo
export const getKeycloakConfig = () => {
  const getOrigin = () => {
    if (typeof window !== 'undefined' && window.location) {
      return window.location.origin
    }
    return 'http://localhost:3000' // Fallback para tests
  }

  return {
    realm: import.meta.env.VITE_KEYCLOAK_REALM || "eventhub",
    url: import.meta.env.VITE_KEYCLOAK_URL || "https://keycloak.example.com",
    clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || "eventhub-frontend",
    redirectUri: import.meta.env.VITE_KEYCLOAK_REDIRECT_URI || getOrigin(),
    logoutRedirectUri: import.meta.env.VITE_KEYCLOAK_LOGOUT_URI || getOrigin(),
  }
}

// Mantener compatibilidad con código existente (aunque se depreca)
export const keycloakConfig = {
  get realm() { return getKeycloakConfig().realm },
  get url() { return getKeycloakConfig().url },
  get clientId() { return getKeycloakConfig().clientId },
  get redirectUri() { return getKeycloakConfig().redirectUri },
  get logoutRedirectUri() { return getKeycloakConfig().logoutRedirectUri },
}

// Respuesta mock de Keycloak
export interface KeycloakToken {
  accessToken: string
  refreshToken: string
  idToken: string
  expiresIn: number
  tokenType: string
}

// Información del usuario decodificada del token
export interface KeycloakUser {
  sub: string
  name: string
  email: string
  given_name: string
  family_name: string
  roles: string[]
}
