/**
 * Streaming Service Type Definitions
 * Based on guia-consumo-frontend.md
 */

// ============================================
// Session Management
// ============================================

export interface CreateSessionRequest {
  eventId: string;
  scheduledStartTime: string; // ISO-8601 UTC
  maxViewers: number;
}

export interface CreateSessionResponse {
  SessionId: string;
}

// ============================================
// Token Management
// ============================================

export interface GenerateTokenRequest {
  sessionId: string;
  userId: string;
  reservationId: string;
}

export interface AccessTokenResponse {
  token: string;
  refreshToken: string;
  expiresAt: string; // ISO-8601 UTC
  refreshTokenExpiresAt: string; // ISO-8601 UTC
  userId: string;
  sessionId: string;
}

export interface RefreshTokenRequest {
  expiredToken: string;
  refreshToken: string;
}

// ============================================
// Stream Access
// ============================================

export interface StreamAccessResponse {
  streamUrl: string;
  sessionId: string;
  expiresAt: string; // ISO-8601 UTC
  quality: string;
}

export interface ValidateStreamResponse {
  StreamUrl: string;
  IsEncrypted: boolean;
}

export interface MockStreamResponse {
  Type: string;
  ManifestUrl: string;
  LicenseUrl: string;
  Metadata: {
    Title: string;
    Resolution: string;
    Framerate: number;
    IsLive: boolean;
  };
}

// ============================================
// Error Handling
// ============================================

export interface StreamingError {
  message: string;
}

// ============================================
// SignalR Events
// ============================================

export interface ChatMessage {
  username: string;
  text: string;
  timestamp: Date;
}

export interface StreamingHubCallbacks {
  onViewerCountUpdated?: (count: number) => void;
  onChatMessage?: (message: ChatMessage) => void;
  onStreamStatusChanged?: (status: string) => void;
  onError?: (error: string) => void;
  onAccessGranted?: (message: string) => void;
  onSpaceAvailable?: (message: string) => void;
  onReceiveSignal?: (user: string, signal: string) => void;
}

// ============================================
// Token Store State
// ============================================

export interface StreamingTokenState {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: string | null;
  refreshTokenExpiresAt: string | null;
  userId: string | null;
  sessionId: string | null;
}
