import React, { useEffect, useRef, useState } from 'react';
import { streamingService, StreamAccessResponse } from '@/application/services/StreamingService';
import { SignalRStreamingAdapter, ChatMessage } from '@/adapters/signalr/SignalRStreamingAdapter';
import { VideoPlayer } from './VideoPlayer';
import { StreamingChat } from './StreamingChat';

export interface StreamingViewerProps {
    eventId: string;
    accessToken: string;
    onError?: (error: string) => void;
    showChat?: boolean;
}

export const StreamingViewer: React.FC<StreamingViewerProps> = ({
    eventId,
    accessToken,
    onError,
    showChat = true,
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [streamData, setStreamData] = useState<StreamAccessResponse | null>(null);
    const [viewerCount, setViewerCount] = useState(0);
    const [isLive, setIsLive] = useState(false);
    const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const signalRRef = useRef<SignalRStreamingAdapter | null>(null);
    const heartbeatIntervalRef = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        initializeStream();

        return () => {
            cleanup();
        };
    }, [eventId, accessToken]);

    const initializeStream = async () => {
        try {
            setIsLoading(true);
            setErrorMessage(null);

            // 1. Validate access and get stream URL
            const accessData = await streamingService.validateAccess(eventId, accessToken);
            setStreamData(accessData);
            setIsLive(true);

            // 2. Initialize SignalR connection
            await initializeSignalR(accessData.sessionId);

            // 3. Start heartbeat to keep session alive
            startHeartbeat(accessData.sessionId);

            setIsLoading(false);
        } catch (error: any) {
            const message = error.message || 'Failed to load stream';
            setErrorMessage(message);
            onError?.(message);
            setIsLoading(false);
        }
    };

    const initializeSignalR = async (sessionId: string) => {
        const hubUrl = import.meta.env.VITE_SIGNALR_HUB_URL || 'https://localhost:7001/streaming-hub';

        signalRRef.current = new SignalRStreamingAdapter(hubUrl, accessToken);

        await signalRRef.current.connect({
            onViewerCountUpdated: (count) => setViewerCount(count),
            onChatMessage: (message) => setChatMessages((prev) => [...prev, message]),
            onStreamStatusChanged: (status) => setIsLive(status === 'Live'),
            onError: (error) => {
                setErrorMessage(error);
                onError?.(error);
            },
            onAccessGranted: (message) => console.log('Access granted:', message),
            onSpaceAvailable: (message) => console.log('Space available:', message),
        });

        // Join the session
        await signalRRef.current.joinSession(sessionId, 1000); // Capacity from session data
    };

    const startHeartbeat = (sessionId: string) => {
        // Send heartbeat every 30 seconds
        heartbeatIntervalRef.current = setInterval(() => {
            streamingService.sendHeartbeat(sessionId, accessToken);
        }, 30000);
    };

    const cleanup = () => {
        if (heartbeatIntervalRef.current) {
            clearInterval(heartbeatIntervalRef.current);
        }
        if (signalRRef.current) {
            signalRRef.current.disconnect();
        }
    };

    const handleSendMessage = async (message: string) => {
        if (signalRRef.current && streamData) {
            await signalRRef.current.sendChatMessage(streamData.sessionId, message);
        }
    };

    if (isLoading) {
        return (
            <div className="flex items-center justify-center h-96">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading stream...</p>
                </div>
            </div>
        );
    }

    if (errorMessage) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-red-800 font-semibold mb-2">Stream Access Error</h3>
                <p className="text-red-600">{errorMessage}</p>
            </div>
        );
    }

    if (!streamData) {
        return null;
    }

    return (
        <div className="streaming-viewer-container">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Video Player Section */}
                <div className="lg:col-span-2">
                    <VideoPlayer
                        streamUrl={streamData.streamUrl}
                        isLive={isLive}
                        viewerCount={viewerCount}
                    />
                </div>

                {/* Chat Section */}
                {showChat && (
                    <div className="lg:col-span-1">
                        <StreamingChat
                            messages={chatMessages}
                            onSendMessage={handleSendMessage}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
