import axios, { type AxiosInstance, type AxiosRequestConfig, type AxiosError } from 'axios'
import { keycloakService } from '../keycloak/keycloakService'

/**
 * Cliente HTTP común para todas las llamadas a las APIs
 * Maneja automáticamente la autenticación con tokens Bearer
 */
class HttpClient {
  private eventsApiClient: AxiosInstance
  private usersApiClient: AxiosInstance
  private baseApiClient: AxiosInstance

  constructor() {
    const eventsApiUrl = import.meta.env.VITE_EVENTS_API_URL || 'http://localhost:3000'
    const usersApiUrl = import.meta.env.VITE_USERS_API_URL || 'http://localhost:3000'
    const baseApiUrl = import.meta.env.VITE_API_BASE_URL || eventsApiUrl

    // Cliente para Events API
    this.eventsApiClient = axios.create({
      baseURL: eventsApiUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Cliente para Users API
    this.usersApiClient = axios.create({
      baseURL: usersApiUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Cliente base (para reservas, pagos, etc.)
    this.baseApiClient = axios.create({
      baseURL: baseApiUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Interceptores para agregar token de autenticación
    this.setupInterceptors(this.eventsApiClient)
    this.setupInterceptors(this.usersApiClient)
    this.setupInterceptors(this.baseApiClient)
  }

  private setupInterceptors(client: AxiosInstance): void {
    // Interceptor de request: agrega el token de autenticación
    client.interceptors.request.use(
      (config) => {
        const token = keycloakService.getToken()
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => {
        return Promise.reject(error)
      }
    )

    // Interceptor de response: maneja errores comunes
    client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError) => {
        if (error.response?.status === 401) {
          // Token expirado o inválido
          const refreshed = await keycloakService.refreshToken()
          if (refreshed && error.config) {
            // Reintentar la petición con el nuevo token
            error.config.headers.Authorization = `Bearer ${refreshed.accessToken}`
            return client.request(error.config)
          } else {
            // No se pudo refrescar, redirigir a login
            keycloakService.logout()
            window.location.href = '/login'
          }
        }
        return Promise.reject(error)
      }
    )
  }

  /**
   * Obtiene el cliente para Events API
   */
  getEventsClient(): AxiosInstance {
    return this.eventsApiClient
  }

  /**
   * Obtiene el cliente para Users API
   */
  getUsersClient(): AxiosInstance {
    return this.usersApiClient
  }

  /**
   * Obtiene el cliente base (para reservas, pagos, etc.)
   */
  getBaseClient(): AxiosInstance {
    return this.baseApiClient
  }
}

export const httpClient = new HttpClient()


