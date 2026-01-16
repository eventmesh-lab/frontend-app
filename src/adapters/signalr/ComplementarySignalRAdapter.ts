import * as signalR from '@microsoft/signalr';
import { complementaryConfig } from '../../config/complementaryConfig';
import type { ServiceNotification } from '../../domain/entities/complementaryTypes';

/**
 * SignalR Adapter for Complementary Services Notifications
 * Connects to /hubs/service-notifications
 */
export class ComplementarySignalRAdapter {
    private connection: signalR.HubConnection | null = null;
    private hubUrl: string;

    constructor(hubUrl?: string) {
        this.hubUrl = hubUrl || complementaryConfig.signalRUrl;
    }

    /**
     * Connect to SignalR hub
     */
    async connect(onNotification: (notification: ServiceNotification) => void): Promise<void> {
        const token = localStorage.getItem('accessToken');

        this.connection = new signalR.HubConnectionBuilder()
            .withUrl(this.hubUrl, {
                accessTokenFactory: token ? () => token : undefined,
                withCredentials: true,
            })
            .withAutomaticReconnect({
                nextRetryDelayInMilliseconds: (retryContext) => {
                    // Exponential backoff: 0s, 2s, 5s, 10s, 30s
                    const delays = [0, 2000, 5000, 10000, 30000];
                    return delays[Math.min(retryContext.previousRetryCount, delays.length - 1)];
                },
            })
            .configureLogging(signalR.LogLevel.Information)
            .build();

        // Register event handler
        this.connection.on('ServiceNotification', onNotification);

        // Handle connection events
        this.connection.onreconnecting((error) => {
            console.warn('SignalR reconnecting:', error);
        });

        this.connection.onreconnected((connectionId) => {
            console.log('SignalR reconnected:', connectionId);
        });

        this.connection.onclose((error) => {
            console.error('SignalR connection closed:', error);
        });

        try {
            await this.connection.start();
            console.log('SignalR connected to complementary services notifications');
        } catch (error) {
            console.error('Failed to connect to SignalR:', error);
            throw error;
        }
    }

    /**
     * Disconnect from SignalR hub
     */
    async disconnect(): Promise<void> {
        if (this.connection) {
            await this.connection.stop();
            this.connection = null;
        }
    }

    /**
     * Check if connected
     */
    isConnected(): boolean {
        return this.connection?.state === signalR.HubConnectionState.Connected;
    }
}
