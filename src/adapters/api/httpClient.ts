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
  private ticketsApiClient: AxiosInstance
  private reservationsApiClient: AxiosInstance

  constructor() {
    // URLs por defecto según los puertos de los contenedores Docker
    const eventsApiUrl = import.meta.env.VITE_EVENTS_API_URL || 'http://localhost:5000'
    const usersApiUrl = import.meta.env.VITE_USERS_API_URL || 'http://localhost:7181'
    const ticketsApiUrl = import.meta.env.VITE_TICKETS_API_URL || 'http://localhost:5005'
    const reservationsApiUrl = import.meta.env.VITE_RESERVATIONS_API_URL || 'http://localhost:5010'
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

    // Cliente para Tickets API
    this.ticketsApiClient = axios.create({
      baseURL: ticketsApiUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Cliente para Reservations API (según docs/API-CONSUMPTION-GUIDE.md)
    this.reservationsApiClient = axios.create({
      baseURL: reservationsApiUrl,
      headers: {
        'Content-Type': 'application/json',
      },
    })

    // Interceptores para agregar token de autenticación
    this.setupInterceptors(this.eventsApiClient)
    this.setupInterceptors(this.usersApiClient)
    this.setupInterceptors(this.baseApiClient)
    this.setupInterceptors(this.ticketsApiClient)
    this.setupInterceptors(this.reservationsApiClient)
  }

  private setupInterceptors(client: AxiosInstance): void {
    // Interceptor de request: agrega el token de autenticación
    client.interceptors.request.use(
      (config) => {
        // Usar el token de Auth.tsx (accessToken) que es el sistema real de autenticación
        // en lugar de keycloakService.getToken() que usa una key diferente
        const authToken = localStorage.getItem('accessToken')
        const keycloakToken = keycloakService.getToken()
        const token = authToken || keycloakToken
        
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
            // No se pudo refrescar
            // Solo redirigir a login si NO es el cliente de reservas
            // El cliente de reservas puede tener su propio sistema de autenticación
            const isReservationsClient = (error.config?.baseURL as string)?.includes('5010')
            if (!isReservationsClient) {
              keycloakService.logout()
              window.location.href = '/login'
            }
            // Si es el cliente de reservas, dejar que el error se propague
            // para que la aplicación pueda manejarlo apropiadamente
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

  /**
   * Obtiene el cliente para Tickets API
   */
  getTicketsClient(): AxiosInstance {
    return this.ticketsApiClient
  }

  /**
   * Obtiene el cliente para Reservations API (puerto 5010)
   */
  getReservationsClient(): AxiosInstance {
    return this.reservationsApiClient
  }
}

export const httpClient = new HttpClient()


