import axios, { type AxiosInstance } from 'axios';
import { complementaryConfig } from '../../config/complementaryConfig';
import type {
    ServiceRequestDto,
    ServiceRequestResponse,
    ServiceStatusDto,
    ServiceMetricsDto,
} from '../../domain/entities/complementaryTypes';

/**
 * Complementary Services REST API Client
 * Implements all documented endpoints from FrontendReact.md
 */
class ComplementaryApi {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: `${complementaryConfig.apiBaseUrl}${complementaryConfig.apiPrefix}`,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Add authentication interceptor
        this.client.interceptors.request.use((config) => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            } else if (complementaryConfig.devUserId) {
                // Development fallback
                config.headers['X-User-Id'] = complementaryConfig.devUserId;
            }
            return config;
        });
    }

    /**
     * Request a complementary service
     * POST /request
     * Returns 202 Accepted with ServiceId
     */
    async requestService(payload: ServiceRequestDto): Promise<ServiceRequestResponse> {
        try {
            const response = await this.client.post<ServiceRequestResponse>('/request', payload);
            if (response.status !== 202) {
                throw new Error('Request not accepted');
            }
            return response.data;
        } catch (error: any) {
            throw this.parseError(error);
        }
    }

    /**
     * Get service status by ID
     * GET /{serviceId}
     */
    async getServiceStatus(serviceId: string): Promise<ServiceStatusDto> {
        try {
            const response = await this.client.get<ServiceStatusDto>(`/${serviceId}`);
            return response.data;
        } catch (error: any) {
            throw this.parseError(error);
        }
    }

    /**
     * Get user's services (optionally filtered by reservation)
     * GET /my-services?reservationId={reservationId}
     */
    async getMyServices(reservationId?: string): Promise<ServiceStatusDto[]> {
        try {
            const response = await this.client.get<ServiceStatusDto[]>('/my-services', {
                params: reservationId ? { reservationId } : undefined,
            });
            return response.data;
        } catch (error: any) {
            throw this.parseError(error);
        }
    }

    /**
     * Cancel a pending service
     * POST /{serviceId}/cancel
     * Returns 204 No Content
     */
    async cancelService(serviceId: string): Promise<void> {
        try {
            const response = await this.client.post(`/${serviceId}/cancel`);
            if (response.status !== 204) {
                throw new Error('Could not cancel service');
            }
        } catch (error: any) {
            throw this.parseError(error);
        }
    }

    /**
     * Get services by event (admin/organizer only)
     * GET /by-event/{eventId}
     */
    async getByEvent(eventId: string): Promise<ServiceStatusDto[]> {
        try {
            const response = await this.client.get<ServiceStatusDto[]>(`/by-event/${eventId}`);
            return response.data;
        } catch (error: any) {
            throw this.parseError(error);
        }
    }

    /**
     * Get global metrics
     * GET /metrics
     */
    async getMetrics(): Promise<ServiceMetricsDto> {
        try {
            const response = await this.client.get<ServiceMetricsDto>('/metrics');
            return response.data;
        } catch (error: any) {
            throw this.parseError(error);
        }
    }

    /**
     * Parse error response
     */
    private parseError(error: any): Error {
        if (error.response?.data?.message) {
            return new Error(error.response.data.message);
        }
        if (error.response?.data?.title) {
            return new Error(error.response.data.title);
        }
        if (error.message) {
            return new Error(error.message);
        }
        return new Error('An unknown error occurred');
    }
}

export const complementaryApi = new ComplementaryApi();
