import axios, { type AxiosInstance } from 'axios';
import { forumsConfig } from '../../config/forumsConfig';
import type {
    CreateForumRequest,
    CreateForumResponse,
    Forum,
    CreateThreadRequest,
    CreateThreadResponse,
    Thread,
    GetThreadsParams,
    CreateCommentRequest,
    Comment,
    GetCommentsParams,
    DeleteCommentRequest,
} from '../../domain/entities/forumTypes';

/**
 * Forums Service REST API Client
 * Implements all documented endpoints from forums-service/docs/uso-api.md
 */
class ForumsApi {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: `${forumsConfig.apiBaseUrl}/api`,
            headers: {
                'Content-Type': 'application/json',
            },
        });
    }

    /**
     * Create a new forum for an event
     * POST /api/foros
     */
    async createForum(request: CreateForumRequest): Promise<CreateForumResponse> {
        try {
            const response = await this.client.post<CreateForumResponse>('/foros', request);
            return response.data;
        } catch (error: any) {
            throw this.parseError(error);
        }
    }

    /**
     * Get forum by event ID
     * GET /api/foros/evento/{eventoId}
     * Returns 404 if forum doesn't exist
     */
    async getForumByEvent(eventoId: string): Promise<Forum | null> {
        try {
            const response = await this.client.get<Forum>(`/foros/evento/${eventoId}`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                return null; // Forum doesn't exist yet
            }
            throw this.parseError(error);
        }
    }

    /**
     * Create a thread in a forum
     * POST /api/foros/{foroId}/hilos
     */
    async createThread(
        foroId: string,
        request: CreateThreadRequest
    ): Promise<CreateThreadResponse> {
        try {
            const response = await this.client.post<CreateThreadResponse>(
                `/foros/${foroId}/hilos`,
                request
            );
            return response.data;
        } catch (error: any) {
            throw this.parseError(error);
        }
    }

    /**
     * Get threads for a forum with pagination and sorting
     * GET /api/hilos/{foroId}
     */
    async getThreads(foroId: string, params?: GetThreadsParams): Promise<Thread[]> {
        try {
            const response = await this.client.get<Thread[]>(`/hilos/${foroId}`, {
                params: {
                    page: params?.page,
                    pageSize: params?.pageSize || forumsConfig.pagination.defaultPageSize,
                    ordenar: params?.ordenar || 'recientes',
                },
            });
            return response.data;
        } catch (error: any) {
            throw this.parseError(error);
        }
    }

    /**
     * Create a comment on a thread
     * POST /api/hilos/{hiloId}/comentarios
     */
    async createComment(hiloId: string, request: CreateCommentRequest): Promise<Comment> {
        try {
            const response = await this.client.post<Comment>(
                `/hilos/${hiloId}/comentarios`,
                request
            );
            return response.data;
        } catch (error: any) {
            throw this.parseError(error);
        }
    }

    /**
     * Get comments for a thread with pagination
     * GET /api/hilos/{hiloId}/comentarios
     */
    async getComments(hiloId: string, params?: GetCommentsParams): Promise<Comment[]> {
        try {
            const response = await this.client.get<Comment[]>(`/hilos/${hiloId}/comentarios`, {
                params: {
                    page: params?.page,
                    pageSize: params?.pageSize || forumsConfig.pagination.defaultPageSize,
                },
            });
            return response.data;
        } catch (error: any) {
            throw this.parseError(error);
        }
    }

    /**
     * Delete a comment (moderator only)
     * DELETE /api/hilos/{hiloId}/comentarios/{comentarioId}
     */
    async deleteComment(
        hiloId: string,
        comentarioId: string,
        request: DeleteCommentRequest
    ): Promise<void> {
        try {
            await this.client.delete(`/hilos/${hiloId}/comentarios/${comentarioId}`, {
                data: request,
            });
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
        if (error.message) {
            return new Error(error.message);
        }
        return new Error('An unknown error occurred');
    }
}

export const forumsApi = new ForumsApi();
