# Streaming Service Integration — Usage Guide

## Overview

This guide demonstrates how to use the streaming service integration in your React components. The integration provides:

- **Token Management**: Automatic token generation and refresh
- **SignalR Real-Time**: Live viewer counts, chat, and session events
- **HLS Video Playback**: Cross-browser video streaming with hls.js
- **Error Handling**: Comprehensive error states and recovery

## Quick Start

### 1. Basic Streaming Component

```tsx
import React from 'react';
import { useStreaming } from '../hooks/useStreaming';
import { StreamPlayer } from '../components/StreamPlayer';

interface StreamingPageProps {
  eventId: string;
  userId: string;
  reservationId: string;
}

export const StreamingPage: React.FC<StreamingPageProps> = ({
  eventId,
  userId,
  reservationId,
}) => {
  const {
    streamUrl,
    isLoading,
    isConnected,
    error,
    viewerCount,
    chatMessages,
    sendMessage,
  } = useStreaming({
    eventId,
    userId,
    reservationId,
    autoConnect: true,
  });

  if (isLoading) {
    return <div>Loading stream...</div>;
  }

  if (error) {
    return <div className="alert alert-danger">Error: {error}</div>;
  }

  return (
    <div className="streaming-page">
      <h1>Live Event Stream</h1>
      
      {/* Video Player */}
      {streamUrl && (
        <StreamPlayer
          streamUrl={streamUrl}
          accessToken={streamingTokenStore.getAccessToken() || ''}
          autoPlay={true}
        />
      )}

      {/* Viewer Count */}
      <div className="viewer-count">
        👁️ {viewerCount} viewers watching
      </div>

      {/* Chat */}
      <div className="chat-container">
        <div className="chat-messages">
          {chatMessages.map((msg, idx) => (
            <div key={idx} className="chat-message">
              <strong>{msg.username}:</strong> {msg.text}
            </div>
          ))}
        </div>
        
        <input
          type="text"
          placeholder="Type a message..."
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              sendMessage(e.currentTarget.value);
              e.currentTarget.value = '';
            }
          }}
        />
      </div>
    </div>
  );
};
```

### 2. Manual Connection Control

```tsx
const {
  connect,
  disconnect,
  isConnected,
} = useStreaming({
  eventId,
  userId,
  reservationId,
  autoConnect: false, // Don't auto-connect
});

return (
  <div>
    {!isConnected ? (
      <button onClick={connect}>Join Stream</button>
    ) : (
      <button onClick={disconnect}>Leave Stream</button>
    )}
  </div>
);
```

### 3. Organizer: Creating a Session

```tsx
import { streamingService } from '../../application/services/StreamingService';

async function createStreamingSession(eventId: string) {
  const sessionId = await streamingService.createSession(
    eventId,
    new Date().toISOString(), // scheduledStartTime
    1000 // maxViewers
  );
  
  console.log('Session created:', sessionId);
  return sessionId;
}
```

## API Reference

### `useStreaming` Hook

**Options:**
- `eventId` (string): Event ID to stream
- `userId` (string): Current user ID
- `reservationId` (string): User's reservation ID
- `sessionId` (string, optional): Existing session ID
- `autoConnect` (boolean, default: true): Auto-connect on mount

**Returns:**
- `streamUrl` (string | null): HLS manifest URL
- `isLoading` (boolean): Loading state
- `isConnected` (boolean): SignalR connection state
- `error` (string | null): Error message
- `viewerCount` (number): Current viewer count
- `chatMessages` (ChatMessage[]): Chat history
- `connect()`: Manually connect to stream
- `disconnect()`: Manually disconnect
- `sendMessage(message)`: Send chat message
- `sendSignal(user, signal)`: Send WebRTC signal

### `StreamPlayer` Component

**Props:**
- `streamUrl` (string): HLS manifest URL
- `accessToken` (string): Access token for validation
- `onError` (function, optional): Error callback
- `onReady` (function, optional): Ready callback
- `className` (string, optional): CSS class
- `autoPlay` (boolean, default: true): Auto-play on load

### `streamingService` Methods

- `createSession(eventId, scheduledStartTime, maxViewers)`: Create session
- `initializeSession(sessionId, userId, reservationId)`: Generate token
- `getStreamAccess(eventId)`: Get stream URL
- `ensureFreshToken()`: Refresh token if needed
- `clearSession()`: Clear all tokens

## End-to-End Flow

### Viewer Flow

1. **User navigates to event page** with valid reservation
2. **Hook initializes** (`useStreaming`)
   - Generates access token via `initializeSession()`
   - Stores token in `streamingTokenStore`
3. **Fetches stream URL** via `getStreamAccess()`
4. **Connects to SignalR hub** at `/streamingHub?access_token=<JWT>`
5. **Joins session** via `JoinSession` hub method
6. **Receives `AccessGranted` event**
7. **Validates stream URL** via `/api/streaming/validate`
8. **Initializes HLS player** with validated URL
9. **Video starts playing**
10. **Real-time events** update UI (viewer count, chat)

### Token Refresh Flow

1. **Before API call**, check if token expires within 5 minutes
2. **If expiring**, call `/api/streaming/refresh-token`
3. **Store new tokens** in `streamingTokenStore`
4. **Proceed with API call** using fresh token

### Cleanup Flow

1. **Component unmounts** or user leaves
2. **Hook calls `disconnect()`**
3. **Sends `LeaveSession` to SignalR hub**
4. **Stops SignalR connection**
5. **Destroys HLS player** instance

## Error Handling

### Common Errors

**"No valid access token available"**
- Token expired and refresh failed
- Solution: Re-authenticate user

**"HLS is not supported in this browser"**
- Browser doesn't support HLS
- Solution: Show error message, suggest modern browser

**"Failed to validate stream access"**
- Invalid token or session
- Solution: Regenerate token

**SignalR "Connection failed"**
- Network issue or invalid token
- Solution: Automatic reconnection with backoff

## Environment Configuration

Add to `.env`:

```env
VITE_STREAMING_API_URL=http://localhost:7001
```

## Browser Compatibility

- **Chrome/Edge**: hls.js ✅
- **Firefox**: hls.js ✅
- **Safari**: Native HLS ✅
- **IE11**: Not supported ❌

## Performance Tips

1. **Use `autoConnect: false`** if stream isn't immediately needed
2. **Limit chat history** to last 100 messages
3. **Debounce chat input** to prevent spam
4. **Monitor viewer count** for capacity planning
5. **Use production HTTPS** for better performance

## Security Notes

- Tokens stored in `localStorage` (consider `sessionStorage` for sensitive apps)
- Always use HTTPS in production
- Validate `reservationId` on backend
- Implement rate limiting for chat messages
