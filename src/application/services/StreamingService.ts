import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_STREAMING_API_URL || 'https://localhost:7001/api/streaming';

export interface StreamAccessResponse {
  streamUrl: string;
  sessionId: string;
  expiresAt: string;
  quality: string;
}

export interface StreamAccessError {
  message: string;
}

export class StreamingService {
  /**
   * Validates user access to a streaming session
   * @param eventId - The event ID
   * @param accessToken - JWT token from Keycloak
   * @returns Stream access details or throws error
   */
  async validateAccess(eventId: string, accessToken: string): Promise<StreamAccessResponse> {
    try {
      const response = await axios.get<StreamAccessResponse>(
        `${API_BASE_URL}/session/${eventId}/access`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
      return response.data;
    } catch (error: any) {
      if (error.response?.data?.message) {
        throw new Error(error.response.data.message);
      }
      throw new Error('Failed to validate stream access');
    }
  }

  /**
   * Sends heartbeat to keep session alive
   * @param sessionId - The session ID
   * @param accessToken - JWT token
   */
  async sendHeartbeat(sessionId: string, accessToken: string): Promise<void> {
    try {
      await axios.post(
        `${API_BASE_URL}/session/${sessionId}/heartbeat`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );
    } catch (error) {
      console.error('Failed to send heartbeat:', error);
    }
  }
}

export const streamingService = new StreamingService();
