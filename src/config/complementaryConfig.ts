/**
 * Complementary Services Configuration
 */

export const complementaryConfig = {
    /**
     * Base URL for the complementary services API
     * Default: http://localhost:5000
     */
    apiBaseUrl: import.meta.env.VITE_COMPLEMENTARY_API_URL || 'http://localhost:5000',

    /**
     * SignalR Hub URL for real-time notifications
     * Default: http://localhost:5000/hubs/service-notifications
     */
    signalRUrl:
        import.meta.env.VITE_COMPLEMENTARY_SIGNALR_URL ||
        'http://localhost:5000/hubs/service-notifications',

    /**
     * Development user ID (used when no JWT token available)
     */
    devUserId: import.meta.env.VITE_DEV_USER_ID || '00000000-0000-0000-0000-000000000001',

    /**
     * API path prefix
     */
    apiPrefix: '/api/v1/ComplementaryServices',

    /**
     * Service types available
     */
    serviceTypes: ['transport', 'catering', 'merchandising'] as const,

    /**
     * Polling interval for status updates (milliseconds)
     * Default: 5 seconds
     */
    statusPollingInterval: 5000,
} as const;
