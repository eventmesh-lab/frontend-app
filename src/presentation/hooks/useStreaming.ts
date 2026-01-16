import { useState, useEffect, useCallback, useRef } from 'react';
import { streamingService } from '../../application/services/StreamingService';
import { SignalRStreamingAdapter } from '../../adapters/signalr/SignalRStreamingAdapter';
import { streamingConfig } from '../../config/streamingConfig';
import type { ChatMessage } from '../../domain/entities/streamingTypes';

interface UseStreamingOptions {
    eventId: string;
    userId: string;
    reservationId: string;
    sessionId?: string; // Optional: if session already exists
    autoConnect?: boolean;
}

interface UseStreamingReturn {
    // State
    streamUrl: string | null;
    isLoading: boolean;
    isConnected: boolean;
    error: string | null;
    viewerCount: number;
    chatMessages: ChatMessage[];

    // Actions
    connect: () => Promise<void>;
    disconnect: () => Promise<void>;
    sendMessage: (message: string) => Promise<void>;
    sendSignal: (user: string, signal: string) => Promise<void>;
}

/**
 * useStreaming Hook
 * Comprehensive hook for streaming session management
 * Handles token generation, SignalR connection, and stream URL retrieval
 */
export function useStreaming(options: UseStreamingOptions): UseStreamingReturn {
    const {
        eventId,
        userId,
        reservationId,
        sessionId: providedSessionId,
        autoConnect = true,
    } = options;

    const [streamUrl, setStreamUrl] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [viewerCount, setViewerCount] = useState(0);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);

    const signalRRef = useRef<SignalRStreamingAdapter | null>(null);
    const sessionIdRef = useRef<string | null>(providedSessionId || null);

    /**
     * Initialize streaming session
     */
    const initializeSession = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Step 1: Generate access token (or use existing session)
            let currentSessionId = sessionIdRef.current;

            if (!currentSessionId) {
                // Need to create session first - this would typically be done by organizer
                // For viewer, we assume session exists and we just need token
                const tokenResponse = await streamingService.initializeSession(
                    providedSessionId || eventId, // Use provided sessionId or eventId as fallback
                    userId,
                    reservationId
                );
                currentSessionId = tokenResponse.sessionId;
                sessionIdRef.current = currentSessionId;
            }

            // Step 2: Get stream access
            const streamAccess = await streamingService.getStreamAccess(eventId);
            setStreamUrl(streamAccess.streamUrl);

            return currentSessionId;
        } catch (err: any) {
            const errorMsg = err.message || 'Failed to initialize streaming session';
            setError(errorMsg);
            throw new Error(errorMsg);
        } finally {
            setIsLoading(false);
        }
    }, [eventId, userId, reservationId, providedSessionId]);

    /**
     * Connect to SignalR hub
     */
    const connect = useCallback(async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Initialize session and get token
            const currentSessionId = await initializeSession();

            if (!currentSessionId) {
                throw new Error('No session ID available');
            }

            // Get fresh access token
            const accessToken = await streamingService.ensureFreshToken();

            if (!accessToken) {
                throw new Error('Failed to get access token');
            }

            // Create SignalR connection
            const hubUrl = `${streamingConfig.apiBaseUrl}${streamingConfig.hubPath}`;
            const signalR = new SignalRStreamingAdapter(hubUrl, accessToken);

            await signalR.connect({
                onViewerCountUpdated: (count) => setViewerCount(count),
                onChatMessage: (message) => {
                    setChatMessages((prev) => [...prev, message]);
                },
                onAccessGranted: (message) => {
                    console.log('Access granted:', message);
                    setIsConnected(true);
                },
                onError: (err) => {
                    console.error('SignalR error:', err);
                    setError(err);
                },
                onSpaceAvailable: (message) => {
                    console.log('Space available:', message);
                },
                onReceiveSignal: (user, signal) => {
                    console.log('Signal received from', user, ':', signal);
                },
            });

            // Join the session
            await signalR.joinSession(currentSessionId, 1000); // Max viewers from config

            signalRRef.current = signalR;
            setIsConnected(true);
        } catch (err: any) {
            const errorMsg = err.message || 'Failed to connect to streaming hub';
            setError(errorMsg);
            setIsConnected(false);
        } finally {
            setIsLoading(false);
        }
    }, [initializeSession]);

    /**
     * Disconnect from SignalR hub
     */
    const disconnect = useCallback(async () => {
        if (signalRRef.current && sessionIdRef.current) {
            await signalRRef.current.leaveSession(sessionIdRef.current);
            await signalRRef.current.disconnect();
            signalRRef.current = null;
            setIsConnected(false);
        }
    }, []);

    /**
     * Send chat message
     */
    const sendMessage = useCallback(
        async (message: string) => {
            if (!signalRRef.current || !sessionIdRef.current) {
                throw new Error('Not connected to streaming hub');
            }
            await signalRRef.current.sendChatMessage(sessionIdRef.current, message);
        },
        []
    );

    /**
     * Send signal to user
     */
    const sendSignal = useCallback(async (user: string, signal: string) => {
        if (!signalRRef.current) {
            throw new Error('Not connected to streaming hub');
        }
        await signalRRef.current.sendSignal(user, signal);
    }, []);

    // Auto-connect on mount if enabled
    useEffect(() => {
        if (autoConnect) {
            connect();
        }

        // Cleanup on unmount
        return () => {
            disconnect();
        };
    }, [autoConnect]); // Only run on mount/unmount

    return {
        streamUrl,
        isLoading,
        isConnected,
        error,
        viewerCount,
        chatMessages,
        connect,
        disconnect,
        sendMessage,
        sendSignal,
    };
}
