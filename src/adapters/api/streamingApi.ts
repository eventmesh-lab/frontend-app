import axios, { type AxiosInstance } from 'axios';
import { streamingConfig } from '../../config/streamingConfig';
import type {
    CreateSessionRequest,
    CreateSessionResponse,
    GenerateTokenRequest,
    AccessTokenResponse,
    RefreshTokenRequest,
    StreamAccessResponse,
    ValidateStreamResponse,
    MockStreamResponse,
    StreamingError,
} from '../../domain/entities/streamingTypes';

/**
 * Streaming Service REST API Client
 * Implements all documented endpoints from guia-consumo-frontend.md
 */
class StreamingApi {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: `${streamingConfig.apiBaseUrl}/api/streaming`,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    /**
     * Create a streaming session
     * POST /api/streaming/session
     */
    async createSession(request: CreateSessionRequest): Promise<CreateSessionResponse> {
        try {
            const response = await this.client.post<CreateSessionResponse>('/session', request);
            return response.data;
        } catch (error: any) {
            throw this.parseError(error);
        }
    }

    /**
     * Generate access token for a session
     * POST /api/streaming/token
     */
    async generateAccessToken(request: GenerateTokenRequest): Promise<AccessTokenResponse> {
        try {
            const response = await this.client.post<AccessTokenResponse>('/token', request);
            return response.data;
        } catch (error: any) {
            throw this.parseError(error);
        }
    }

    /**
     * Refresh an expired access token
     * POST /api/streaming/refresh-token
     */
    async refreshAccessToken(request: RefreshTokenRequest): Promise<AccessTokenResponse> {
        try {
            const response = await this.client.post<AccessTokenResponse>('/refresh-token', request);
            return response.data;
        } catch (error: any) {
            throw this.parseError(error);
        }
    }

    /**
     * Get stream access for an event
     * GET /api/streaming/session/{eventId}/access
     * Requires Authorization: Bearer <token> header
     */
    async getStreamAccess(eventId: string, bearerToken: string): Promise<StreamAccessResponse> {
        try {
            const response = await this.client.get<StreamAccessResponse>(
                `/session/${eventId}/access`,
                {
                    headers: {
                        Authorization: `Bearer ${bearerToken}`,
                    },
                }
            );
            return response.data;
        } catch (error: any) {
            throw this.parseError(error);
        }
    }

    /**
     * Validate stream access token
     * GET /api/streaming/validate?token=<token>
     */
    async validateStream(token: string): Promise<ValidateStreamResponse> {
        try {
            const response = await this.client.get<ValidateStreamResponse>('/validate', {
                params: { token },
            });
            return response.data;
        } catch (error: any) {
            throw this.parseError(error);
        }
    }

    /**
     * Get mock stream data (for testing/development)
     * GET /api/streaming/stream/{eventId}/{token}
     */
    async getMockStream(eventId: string, token: string): Promise<MockStreamResponse> {
        try {
            const response = await this.client.get<MockStreamResponse>(`/stream/${eventId}/${token}`);
            return response.data;
        } catch (error: any) {
            throw this.parseError(error);
        }
    }

    /**
     * Parse error response according to API contract: { "message": "..." }
     */
    private parseError(error: any): Error {
        if (error.response?.data?.message) {
            return new Error(error.response.data.message);
        }
        if (error.message) {
            return new Error(error.message);
        }
        return new Error('An unknown error occurred');
    }
}

export const streamingApi = new StreamingApi();
