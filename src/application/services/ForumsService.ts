import { forumsApi } from '../../adapters/api/forumsApi';
import { ticketsApi } from '../../adapters/api/ticketsApi';
import { eventosApi } from '../../adapters/api/eventosApi';
import { forumsConfig } from '../../config/forumsConfig';
import type {
    CreateForumRequest,
    Forum,
    CreateThreadRequest,
    CreateCommentRequest,
    Thread,
    Comment,
    ForumPermissions,
} from '../../domain/entities/forumTypes';

/**
 * Forums Service
 * High-level service for forum management with business logic
 */
class ForumsService {
    /**
     * Get forum for an event, or return null if it doesn't exist
     */
    async getForumByEvent(eventoId: string): Promise<Forum | null> {
        return await forumsApi.getForumByEvent(eventoId);
    }

    /**
     * Create a new forum for an event
     */
    async createForum(
        eventoId: string,
        titulo: string,
        descripcion: string
    ): Promise<string> {
        const request: CreateForumRequest = {
            eventoId,
            titulo,
            descripcion,
            configuracion: forumsConfig.defaultForumConfig,
        };

        const response = await forumsApi.createForum(request);
        return response.foroId;
    }

    /**
     * Create a thread in a forum
     */
    async createThread(
        foroId: string,
        autorId: string,
        titulo: string,
        contenido: string
    ): Promise<string> {
        const request: CreateThreadRequest = {
            autorId,
            titulo,
            contenido,
        };

        const response = await forumsApi.createThread(foroId, request);
        return response.hiloId;
    }

    /**
     * Get threads for a forum
     */
    async getThreads(
        foroId: string,
        page?: number,
        ordenar?: 'recientes' | 'populares' | 'destacados'
    ): Promise<Thread[]> {
        return await forumsApi.getThreads(foroId, {
            page,
            pageSize: forumsConfig.pagination.defaultPageSize,
            ordenar,
        });
    }

    /**
     * Create a comment on a thread
     */
    async createComment(
        hiloId: string,
        autorId: string,
        contenido: string,
        comentarioPadreId: string | null = null
    ): Promise<Comment> {
        const request: CreateCommentRequest = {
            hiloId,
            autorId,
            contenido,
            comentarioPadreId,
        };

        return await forumsApi.createComment(hiloId, request);
    }

    /**
     * Get comments for a thread
     */
    async getComments(hiloId: string, page?: number): Promise<Comment[]> {
        return await forumsApi.getComments(hiloId, {
            page,
            pageSize: forumsConfig.pagination.defaultPageSize,
        });
    }

    /**
     * Delete a comment (moderator only)
     */
    async deleteComment(
        hiloId: string,
        comentarioId: string,
        usuarioId: string,
        razon: string
    ): Promise<void> {
        await forumsApi.deleteComment(hiloId, comentarioId, {
            comentarioId,
            usuarioId,
            razon,
        });
    }

    /**
     * Check if user has confirmed ticket for event
     */
    async hasConfirmedTicket(userId: string, eventoId: string): Promise<boolean> {
        try {
            // Query tickets API to check for confirmed tickets
            // This is a simplified check - you may need to adjust based on your tickets API
            const tickets = await ticketsApi.obtenerTicketsPorUsuario(userId);

            // Check if user has any confirmed ticket for this event
            const hasTicket = tickets.some(
                (ticket) => ticket.eventoId === eventoId && ticket.estado === 'Confirmado'
            );

            return hasTicket;
        } catch (error) {
            console.error('Error checking ticket status:', error);
            return false;
        }
    }

    /**
     * Check if user is the event organizer
     */
    async isEventOrganizer(userId: string, eventoId: string): Promise<boolean> {
        try {
            const evento = await eventosApi.obtenerPorId(eventoId);
            return evento?.organizadorId === userId;
        } catch (error) {
            console.error('Error checking organizer status:', error);
            return false;
        }
    }

    /**
     * Get forum permissions for a user
     */
    async getPermissions(
        userId: string,
        eventoId: string,
        userRole: string | null
    ): Promise<ForumPermissions> {
        const [hasTicket, isOrganizer] = await Promise.all([
            this.hasConfirmedTicket(userId, eventoId),
            this.isEventOrganizer(userId, eventoId),
        ]);

        return {
            canPost: hasTicket,
            canModerate: isOrganizer && userRole === 'Organizador',
            canCreateForum: isOrganizer && userRole === 'Organizador',
        };
    }
}

export const forumsService = new ForumsService();
