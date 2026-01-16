/**
 * Forums Service Configuration
 */

export const forumsConfig = {
    /**
     * Base URL for the forums service API
     * Default: http://localhost:8082
     */
    apiBaseUrl: import.meta.env.VITE_FORUMS_API_URL || 'http://localhost:8082',

    /**
     * Default pagination settings
     */
    pagination: {
        defaultPageSize: 20,
        maxPageSize: 100,
    },

    /**
     * Default forum configuration
     */
    defaultForumConfig: {
        permitirComentariosAnonimos: false,
        requiereAprobacion: false,
        notificarNuevosComentarios: true,
        maximoCaracteresComentario: 2000,
    },

    /**
     * Thread sorting options
     */
    sortOptions: ['recientes', 'populares', 'destacados'] as const,
} as const;
