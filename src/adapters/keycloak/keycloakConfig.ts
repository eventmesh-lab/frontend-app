import { keycloakConfig as envKeycloakConfig } from '../../config/env'

// Configuración de Keycloak para OAuth/SSO
// Usa la configuración centralizada del módulo env.ts
export const getKeycloakConfig = () => {
  const getOrigin = () => {
    if (typeof window !== 'undefined' && window.location) {
      return window.location.origin
    }
    return 'http://localhost:3000' // Fallback para tests
  }

  return {
    realm: envKeycloakConfig.realm,
    url: envKeycloakConfig.url,
    clientId: envKeycloakConfig.clientId,
    clientSecret: envKeycloakConfig.clientSecret,
    tokenUrl: envKeycloakConfig.tokenUrl,
    redirectUri: import.meta.env.VITE_KEYCLOAK_REDIRECT_URI || getOrigin(),
    logoutRedirectUri: import.meta.env.VITE_KEYCLOAK_LOGOUT_URI || getOrigin(),
  }
}

// Mantener compatibilidad con código existente
export const keycloakConfig = {
  get realm() { return getKeycloakConfig().realm },
  get url() { return getKeycloakConfig().url },
  get clientId() { return getKeycloakConfig().clientId },
  get clientSecret() { return getKeycloakConfig().clientSecret },
  get tokenUrl() { return getKeycloakConfig().tokenUrl },
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
