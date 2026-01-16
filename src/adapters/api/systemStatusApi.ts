import axios, { type AxiosInstance } from 'axios';
import type {
    QueueStatus,
    JobStatus,
    SystemLog,
    LogsFilter,
} from '../../domain/entities/systemTypes';

/**
 * System Status API Client
 * Provides monitoring endpoints for queues, jobs, and logs
 */
class SystemStatusApi {
    private client: AxiosInstance;

    constructor() {
        // Use base API URL from environment
        const baseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000';
        this.client = axios.create({
            baseURL: baseUrl,
            headers: {
                'Content-Type': 'application/json',
            },
        });

        // Add authentication interceptor
        this.client.interceptors.request.use((config) => {
            const token = localStorage.getItem('accessToken');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        });
    }

    /**
     * Get RabbitMQ queues status
     * GET /api/system/queues
     */
    async getQueuesStatus(): Promise<QueueStatus[]> {
        try {
            const response = await this.client.get<QueueStatus[]>('/api/system/queues');
            return response.data;
        } catch (error: any) {
            throw this.parseError(error);
        }
    }

    /**
     * Get background jobs status
     * GET /api/system/jobs
     */
    async getJobsStatus(): Promise<JobStatus[]> {
        try {
            const response = await this.client.get<JobStatus[]>('/api/system/jobs');
            return response.data;
        } catch (error: any) {
            throw this.parseError(error);
        }
    }

    /**
     * Get system logs with filtering
     * GET /api/logs
     */
    async getLogs(filter?: LogsFilter): Promise<SystemLog[]> {
        try {
            const response = await this.client.get<SystemLog[]>('/api/logs', {
                params: {
                    nivel: filter?.nivel,
                    servicioOrigen: filter?.servicioOrigen,
                    tipoAccion: filter?.tipoAccion,
                    fechaDesde: filter?.fechaDesde,
                    fechaHasta: filter?.fechaHasta,
                    page: filter?.page || 1,
                    pageSize: filter?.pageSize || 50,
                },
            });
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

export const systemStatusApi = new SystemStatusApi();
