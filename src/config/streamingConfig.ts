/**
 * Streaming Service Configuration
 */

export const streamingConfig = {
    /**
     * Base URL for the streaming service API
     * Default: http://localhost:7001
     */
    apiBaseUrl: import.meta.env.VITE_STREAMING_API_URL || 'http://localhost:7001',

    /**
     * SignalR Hub path
     */
    hubPath: '/streamingHub',

    /**
     * Token refresh threshold (milliseconds before expiry)
     * Default: 5 minutes
     */
    tokenRefreshThreshold: 5 * 60 * 1000,

    /**
     * SignalR reconnection delays (milliseconds)
     */
    reconnectDelays: [0, 2000, 5000, 10000, 30000],

    /**
     * Heartbeat interval (milliseconds)
     * Default: 30 seconds
     */
    heartbeatInterval: 30 * 1000,
} as const;
