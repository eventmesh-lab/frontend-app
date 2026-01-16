import { forumsService } from '../../application/services/ForumsService';
import type { ForumPermissions } from '../../domain/entities/forumTypes';

/**
 * Check if user has confirmed ticket for event
 */
export async function hasConfirmedTicket(
    userId: string,
    eventoId: string
): Promise<boolean> {
    return await forumsService.hasConfirmedTicket(userId, eventoId);
}

/**
 * Check if user is the event organizer
 */
export async function isEventOrganizer(
    userId: string,
    eventoId: string
): Promise<boolean> {
    return await forumsService.isEventOrganizer(userId, eventoId);
}

/**
 * Get complete forum permissions for a user
 */
export async function getForumPermissions(
    userId: string,
    eventoId: string,
    userRole: string | null
): Promise<ForumPermissions> {
    return await forumsService.getPermissions(userId, eventoId, userRole);
}
