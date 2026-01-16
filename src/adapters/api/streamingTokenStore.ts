import type { StreamingTokenState, AccessTokenResponse } from '../../domain/entities/streamingTypes';
import { streamingConfig } from '../../config/streamingConfig';

/**
 * Streaming Token Store
 * Manages streaming access tokens and refresh tokens with automatic expiry checking
 */
class StreamingTokenStore {
    private static readonly STORAGE_KEY = 'streaming_token_state';
    private tokenState: StreamingTokenState = {
        accessToken: null,
        refreshToken: null,
        expiresAt: null,
        refreshTokenExpiresAt: null,
        userId: null,
        sessionId: null,
    };

    constructor() {
        this.loadFromStorage();
    }

    /**
     * Store tokens from AccessTokenResponse
     */
    setTokens(tokenResponse: AccessTokenResponse): void {
        this.tokenState = {
            accessToken: tokenResponse.token,
            refreshToken: tokenResponse.refreshToken,
            expiresAt: tokenResponse.expiresAt,
            refreshTokenExpiresAt: tokenResponse.refreshTokenExpiresAt,
            userId: tokenResponse.userId,
            sessionId: tokenResponse.sessionId,
        };
        this.saveToStorage();
    }

    /**
     * Get current access token
     */
    getAccessToken(): string | null {
        return this.tokenState.accessToken;
    }

    /**
     * Get current refresh token
     */
    getRefreshToken(): string | null {
        return this.tokenState.refreshToken;
    }

    /**
     * Get current session ID
     */
    getSessionId(): string | null {
        return this.tokenState.sessionId;
    }

    /**
     * Get current user ID
     */
    getUserId(): string | null {
        return this.tokenState.userId;
    }

    /**
     * Check if access token is expired or about to expire
     * @returns true if token needs refresh
     */
    isTokenExpired(): boolean {
        if (!this.tokenState.expiresAt) {
            return true;
        }

        const expiryTime = new Date(this.tokenState.expiresAt).getTime();
        const now = Date.now();
        const threshold = streamingConfig.tokenRefreshThreshold;

        // Return true if token expires within the threshold
        return expiryTime - now <= threshold;
    }

    /**
     * Check if refresh token is expired
     */
    isRefreshTokenExpired(): boolean {
        if (!this.tokenState.refreshTokenExpiresAt) {
            return true;
        }

        const expiryTime = new Date(this.tokenState.refreshTokenExpiresAt).getTime();
        const now = Date.now();

        return now >= expiryTime;
    }

    /**
     * Clear all tokens
     */
    clearTokens(): void {
        this.tokenState = {
            accessToken: null,
            refreshToken: null,
            expiresAt: null,
            refreshTokenExpiresAt: null,
            userId: null,
            sessionId: null,
        };
        this.saveToStorage();
    }

    /**
     * Get full token state
     */
    getTokenState(): StreamingTokenState {
        return { ...this.tokenState };
    }

    /**
     * Load tokens from localStorage
     */
    private loadFromStorage(): void {
        try {
            const stored = localStorage.getItem(StreamingTokenStore.STORAGE_KEY);
            if (stored) {
                this.tokenState = JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load streaming tokens from storage:', error);
        }
    }

    /**
     * Save tokens to localStorage
     */
    private saveToStorage(): void {
        try {
            localStorage.setItem(
                StreamingTokenStore.STORAGE_KEY,
                JSON.stringify(this.tokenState)
            );
        } catch (error) {
            console.error('Failed to save streaming tokens to storage:', error);
        }
    }
}

export const streamingTokenStore = new StreamingTokenStore();
