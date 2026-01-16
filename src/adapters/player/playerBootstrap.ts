import Hls from 'hls.js';
import { streamingApi } from '../api/streamingApi';
import type { ValidateStreamResponse } from '../../domain/entities/streamingTypes';

/**
 * HLS Player Bootstrap
 * Validates stream URL and initializes HLS.js player
 */

export interface PlayerInitResult {
    success: boolean;
    error?: string;
    hls?: Hls;
    validationData?: ValidateStreamResponse;
}

/**
 * Initialize HLS player with stream validation
 * @param videoElement - HTML video element to attach player to
 * @param streamUrl - Stream manifest URL
 * @param accessToken - Access token for validation
 * @returns Player initialization result
 */
export async function initializePlayer(
    videoElement: HTMLVideoElement,
    streamUrl: string,
    accessToken: string
): Promise<PlayerInitResult> {
    try {
        // Step 1: Validate stream URL
        const validationData = await streamingApi.validateStream(accessToken);

        if (!validationData.StreamUrl) {
            return {
                success: false,
                error: 'Invalid stream URL from validation',
            };
        }

        // Use validated stream URL (prefer validation response over provided URL)
        const finalStreamUrl = validationData.StreamUrl || streamUrl;

        // Step 2: Check browser HLS support
        if (videoElement.canPlayType('application/vnd.apple.mpegurl')) {
            // Native HLS support (Safari)
            videoElement.src = finalStreamUrl;
            return {
                success: true,
                validationData,
            };
        } else if (Hls.isSupported()) {
            // Use hls.js for browsers without native HLS support
            const hls = new Hls({
                enableWorker: true,
                lowLatencyMode: true,
                backBufferLength: 90,
            });

            hls.loadSource(finalStreamUrl);
            hls.attachMedia(videoElement);

            // Handle errors
            hls.on(Hls.Events.ERROR, (event, data) => {
                if (data.fatal) {
                    switch (data.type) {
                        case Hls.ErrorTypes.NETWORK_ERROR:
                            console.error('Fatal network error, trying to recover...');
                            hls.startLoad();
                            break;
                        case Hls.ErrorTypes.MEDIA_ERROR:
                            console.error('Fatal media error, trying to recover...');
                            hls.recoverMediaError();
                            break;
                        default:
                            console.error('Fatal error, cannot recover:', data);
                            hls.destroy();
                            break;
                    }
                }
            });

            return {
                success: true,
                hls,
                validationData,
            };
        } else {
            return {
                success: false,
                error: 'HLS is not supported in this browser',
            };
        }
    } catch (error: any) {
        return {
            success: false,
            error: error.message || 'Failed to initialize player',
        };
    }
}

/**
 * Cleanup HLS player instance
 */
export function destroyPlayer(hls?: Hls): void {
    if (hls) {
        hls.destroy();
    }
}
