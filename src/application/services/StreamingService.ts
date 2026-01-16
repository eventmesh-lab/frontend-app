import { streamingApi } from '../../adapters/api/streamingApi';
import { streamingTokenStore } from '../../adapters/api/streamingTokenStore';
import type {
  CreateSessionRequest,
  GenerateTokenRequest,
  StreamAccessResponse,
  AccessTokenResponse,
} from '../../domain/entities/streamingTypes';

/**
 * Streaming Service
 * High-level service for managing streaming sessions and access
 */
class StreamingService {
  /**
   * Create a new streaming session
   */
  async createSession(
    eventId: string,
    scheduledStartTime: string,
    maxViewers: number
  ): Promise<string> {
    const request: CreateSessionRequest = {
      eventId,
      scheduledStartTime,
      maxViewers,
    };

    const response = await streamingApi.createSession(request);
    return response.SessionId;
  }

  /**
   * Initialize streaming session for a user
   * Generates access token and stores it
   */
  async initializeSession(
    sessionId: string,
    userId: string,
    reservationId: string
  ): Promise<AccessTokenResponse> {
    const request: GenerateTokenRequest = {
      sessionId,
      userId,
      reservationId,
    };

    const tokenResponse = await streamingApi.generateAccessToken(request);

    // Store tokens for future use
    streamingTokenStore.setTokens(tokenResponse);

    return tokenResponse;
  }

  /**
   * Get stream access with automatic token refresh
   */
  async getStreamAccess(eventId: string): Promise<StreamAccessResponse> {
    // Ensure we have a fresh token
    const accessToken = await this.ensureFreshToken();

    if (!accessToken) {
      throw new Error('No valid access token available');
    }

    return await streamingApi.getStreamAccess(eventId, accessToken);
  }

  /**
   * Get validated stream URL
   */
  async getValidatedStreamUrl(eventId: string): Promise<string> {
    const streamAccess = await this.getStreamAccess(eventId);
    const accessToken = streamingTokenStore.getAccessToken();

    if (!accessToken) {
      throw new Error('No access token available for validation');
    }

    const validation = await streamingApi.validateStream(accessToken);
    return validation.StreamUrl || streamAccess.streamUrl;
  }

  /**
   * Ensure token is fresh, refresh if needed
   * @returns Fresh access token or null if refresh failed
   */
  async ensureFreshToken(): Promise<string | null> {
    const currentToken = streamingTokenStore.getAccessToken();

    // Check if token needs refresh
    if (!streamingTokenStore.isTokenExpired()) {
      return currentToken;
    }

    // Token is expired or about to expire, try to refresh
    const refreshToken = streamingTokenStore.getRefreshToken();

    if (!refreshToken || streamingTokenStore.isRefreshTokenExpired()) {
      // Cannot refresh, clear tokens
      streamingTokenStore.clearTokens();
      return null;
    }

    try {
      const refreshedTokens = await streamingApi.refreshAccessToken({
        expiredToken: currentToken || '',
        refreshToken,
      });

      // Store new tokens
      streamingTokenStore.setTokens(refreshedTokens);

      return refreshedTokens.token;
    } catch (error) {
      console.error('Failed to refresh token:', error);
      streamingTokenStore.clearTokens();
      return null;
    }
  }

  /**
   * Get current session ID from token store
   */
  getCurrentSessionId(): string | null {
    return streamingTokenStore.getSessionId();
  }

  /**
   * Get current user ID from token store
   */
  getCurrentUserId(): string | null {
    return streamingTokenStore.getUserId();
  }

  /**
   * Clear all streaming tokens
   */
  clearSession(): void {
    streamingTokenStore.clearTokens();
  }
}

export const streamingService = new StreamingService();

