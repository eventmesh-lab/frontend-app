/**
 * Configuración centralizada de variables de entorno
 * 
 * Este módulo exporta todas las configuraciones necesarias para la aplicación,
 * leyendo las variables de entorno definidas en el archivo .env
 * 
 * Las variables deben tener el prefijo VITE_ para ser accesibles en el cliente (Vite)
 */

/**
 * Configuración de la API de Usuarios
 */
export const apiConfig = {
  /** URL base del servicio de usuarios */
  baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:7181',
  
  /** Endpoints específicos de usuarios */
  users: {
    register: '/api/users/registerUser',
    getAll: '/api/users/getUsers',
    getOne: (username: string) => `/api/users/getUser/${username}`,
    update: (username: string) => `/api/users/updateUser/${username}`,
    changePassword: (email: string) => `/api/users/changePassword/${email}`,
  }
}

/**
 * Configuración de la API de Eventos
 */
export const eventsConfig = {
  /** URL base del servicio de eventos */
  baseUrl: import.meta.env.VITE_EVENTS_API_URL || 'http://localhost:5000',
  
  /** Endpoints específicos de eventos */
  eventos: {
    publicados: '/api/eventos/publicados',
    detalle: (id: string) => `/api/eventos/${id}`,
    crear: '/api/eventos',
    publicar: (id: string) => `/api/eventos/${id}/publicar`,
    editar: (id: string) => `/api/eventos/${id}`,
    cancelar: (id: string) => `/api/eventos/${id}`,
    porOrganizador: (organizadorId: string) => `/api/eventos/organizador/${organizadorId}`,
  }
}

/**
 * Configuración de Keycloak para autenticación OAuth2/OpenID Connect
 */
export const keycloakConfig = {
  /** URL base del servidor Keycloak */
  url: import.meta.env.VITE_KEYCLOAK_URL || 'http://localhost:8180',
  
  /** Realm de Keycloak */
  realm: import.meta.env.VITE_KEYCLOAK_REALM || 'myrealm',
  
  /** Client ID de la aplicación */
  clientId: import.meta.env.VITE_KEYCLOAK_CLIENT_ID || 'aspnetcore',
  
  /** Client Secret de la aplicación */
  clientSecret: import.meta.env.VITE_KEYCLOAK_CLIENT_SECRET || '',
  
  /** URL del endpoint de token */
  get tokenUrl() {
    return `${this.url}/realms/${this.realm}/protocol/openid-connect/token`
  }
}

/**
 * Configuración de SignalR para notificaciones en tiempo real
 */
export const signalRConfig = {
  /** URL del hub de notificaciones */
  hubUrl: import.meta.env.VITE_SIGNALR_URL || 'http://localhost:3000/notifications',
}

/**
 * Objeto de configuración completa para exportación conveniente
 */
export const config = {
  api: apiConfig,
  events: eventsConfig,
  keycloak: keycloakConfig,
  signalR: signalRConfig,
}

export default config

