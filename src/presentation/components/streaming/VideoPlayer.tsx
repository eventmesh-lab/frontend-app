import React, { useRef, useEffect } from 'react';

export interface VideoPlayerProps {
    streamUrl: string;
    isLive: boolean;
    viewerCount: number;
}

export const VideoPlayer: React.FC<VideoPlayerProps> = ({
    streamUrl,
    isLive,
    viewerCount,
}) => {
    const videoRef = useRef<HTMLVideoElement>(null);

    useEffect(() => {
        if (videoRef.current && streamUrl) {
            videoRef.current.src = streamUrl;
            videoRef.current.play().catch((error) => {
                console.error('Error playing video:', error);
            });
        }
    }, [streamUrl]);

    return (
        <div className="relative bg-black rounded-lg overflow-hidden shadow-lg">
            {/* Video Element */}
            <video
                ref={videoRef}
                controls
                autoPlay
                className="w-full aspect-video"
                onPlay={() => console.log('Video started playing')}
                onPause={() => console.log('Video paused')}
            />

            {/* Live Indicator */}
            {isLive && (
                <div className="absolute top-4 left-4 bg-red-600 text-white px-3 py-1 rounded-full flex items-center gap-2 shadow-lg">
                    <span className="w-2 h-2 bg-white rounded-full animate-pulse"></span>
                    <span className="font-semibold text-sm">EN VIVO</span>
                    <span className="text-sm">• {viewerCount} espectadores</span>
                </div>
            )}

            {/* Quality Selector (Simulated) */}
            <div className="absolute bottom-16 right-4">
                <select className="bg-black bg-opacity-70 text-white px-2 py-1 rounded text-sm">
                    <option value="1080p">1080p</option>
                    <option value="720p">720p</option>
                    <option value="480p">480p</option>
                </select>
            </div>
        </div>
    );
};
