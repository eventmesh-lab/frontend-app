import React, { useEffect, useRef, useState } from 'react';
import type Hls from 'hls.js';
import { initializePlayer, destroyPlayer } from '../../adapters/player/playerBootstrap';
import type { ValidateStreamResponse } from '../../domain/entities/streamingTypes';

interface StreamPlayerProps {
    streamUrl: string;
    accessToken: string;
    onError?: (error: string) => void;
    onReady?: (validationData: ValidateStreamResponse) => void;
    className?: string;
    autoPlay?: boolean;
}

/**
 * StreamPlayer Component
 * HLS video player with automatic initialization and error handling
 */
export const StreamPlayer: React.FC<StreamPlayerProps> = ({
    streamUrl,
    accessToken,
    onError,
    onReady,
    className = '',
    autoPlay = true,
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const hlsRef = useRef<Hls | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const videoElement = videoRef.current;
        if (!videoElement || !streamUrl || !accessToken) {
            return;
        }

        let mounted = true;

        const initPlayer = async () => {
            setIsLoading(true);
            setError(null);

            const result = await initializePlayer(videoElement, streamUrl, accessToken);

            if (!mounted) return;

            if (result.success) {
                hlsRef.current = result.hls;
                setIsLoading(false);

                if (result.validationData && onReady) {
                    onReady(result.validationData);
                }

                // Auto-play if enabled
                if (autoPlay) {
                    videoElement.play().catch((err) => {
                        console.warn('Auto-play failed:', err);
                    });
                }
            } else {
                const errorMsg = result.error || 'Failed to initialize player';
                setError(errorMsg);
                setIsLoading(false);

                if (onError) {
                    onError(errorMsg);
                }
            }
        };

        initPlayer();

        // Cleanup on unmount
        return () => {
            mounted = false;
            destroyPlayer(hlsRef.current);
            hlsRef.current = undefined;
        };
    }, [streamUrl, accessToken, autoPlay, onError, onReady]);

    return (
        <div className={`stream-player-container ${className}`}>
            {isLoading && (
                <div className="stream-player-loading">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading stream...</span>
                    </div>
                </div>
            )}

            {error && (
                <div className="alert alert-danger" role="alert">
                    <strong>Stream Error:</strong> {error}
                </div>
            )}

            <video
                ref={videoRef}
                className="stream-player-video"
                controls
                style={{ width: '100%', height: 'auto', display: error ? 'none' : 'block' }}
            />

            <style>{`
        .stream-player-container {
          position: relative;
          background: #000;
          border-radius: 8px;
          overflow: hidden;
        }

        .stream-player-loading {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 10;
        }

        .stream-player-video {
          display: block;
          max-width: 100%;
        }
      `}</style>
        </div>
    );
};
