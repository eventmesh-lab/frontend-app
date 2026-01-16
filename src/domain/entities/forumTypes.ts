/**
 * Forums Service Type Definitions
 * Based on forums-service/docs/uso-api.md
 */

// ============================================
// Forum Configuration
// ============================================

export interface ForumConfig {
    permitirComentariosAnonimos: boolean;
    requiereAprobacion: boolean;
    notificarNuevosComentarios: boolean;
    maximoCaracteresComentario: number;
}

export interface Forum {
    id: string;
    eventoId: string;
    titulo: string;
    descripcion: string;
    estado: 'Activo' | 'Cerrado' | 'Archivado';
    fechaCreacion: string; // ISO-8601
    configuracion: ForumConfig;
}

export interface CreateForumRequest {
    eventoId: string;
    titulo: string;
    descripcion: string;
    configuracion: ForumConfig;
}

export interface CreateForumResponse {
    foroId: string;
}

// ============================================
// Thread Management
// ============================================

export interface Thread {
    id: string;
    autorId: string;
    titulo: string;
    contenido: string;
    fechaPublicacion: string; // ISO-8601
    fechaEdicion: string | null; // ISO-8601
    destacado: boolean;
    bloqueado: boolean;
    comentarios: Comment[];
    reacciones: any[]; // Future enhancement
}

export interface CreateThreadRequest {
    autorId: string;
    titulo: string;
    contenido: string;
}

export interface CreateThreadResponse {
    hiloId: string;
}

export interface GetThreadsParams {
    page?: number;
    pageSize?: number;
    ordenar?: 'recientes' | 'populares' | 'destacados';
}

// ============================================
// Comment Management
// ============================================

export interface Comment {
    id: string;
    autorId: string;
    contenido: string;
    fechaPublicacion: string; // ISO-8601
    fechaEdicion: string | null; // ISO-8601
    comentarioPadreId: string | null;
    eliminado: boolean;
    replies?: Comment[]; // Nested replies (client-side)
}

export interface CreateCommentRequest {
    hiloId: string;
    autorId: string;
    contenido: string;
    comentarioPadreId: string | null;
}

export interface DeleteCommentRequest {
    comentarioId: string;
    usuarioId: string;
    razon: string;
}

export interface GetCommentsParams {
    page?: number;
    pageSize?: number;
}

// ============================================
// Pagination
// ============================================

export interface PaginationParams {
    page?: number;
    pageSize?: number;
}

// ============================================
// Permission Types
// ============================================

export interface ForumPermissions {
    canPost: boolean;
    canModerate: boolean;
    canCreateForum: boolean;
}
