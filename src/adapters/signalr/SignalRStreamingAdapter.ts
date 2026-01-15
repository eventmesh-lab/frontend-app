import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';

export interface StreamingHubCallbacks {
    onViewerCountUpdated?: (count: number) => void;
    onChatMessage?: (message: ChatMessage) => void;
    onStreamStatusChanged?: (status: string) => void;
    onError?: (error: string) => void;
    onAccessGranted?: (message: string) => void;
    onSpaceAvailable?: (message: string) => void;
}

export interface ChatMessage {
    username: string;
    text: string;
    timestamp: Date;
}

export class SignalRStreamingAdapter {
    private connection: HubConnection | null = null;
    private callbacks: StreamingHubCallbacks = {};

    constructor(private hubUrl: string, private accessToken: string) { }

    /**
     * Initialize SignalR connection to StreamingHub
     */
    async connect(callbacks: StreamingHubCallbacks): Promise<void> {
        this.callbacks = callbacks;

        this.connection = new HubConnectionBuilder()
            .withUrl(this.hubUrl, {
                accessTokenFactory: () => this.accessToken,
            })
            .withAutomaticReconnect()
            .configureLogging(LogLevel.Information)
            .build();

        // Register event listeners
        this.connection.on('ViewerCountUpdated', (count: number) => {
            this.callbacks.onViewerCountUpdated?.(count);
        });

        this.connection.on('ReceiveChatMessage', (message: ChatMessage) => {
            this.callbacks.onChatMessage?.(message);
        });

        this.connection.on('StreamStatusChanged', (status: string) => {
            this.callbacks.onStreamStatusChanged?.(status);
        });

        this.connection.on('ReceiveError', (error: string) => {
            this.callbacks.onError?.(error);
        });

        this.connection.on('AccessGranted', (message: string) => {
            this.callbacks.onAccessGranted?.(message);
        });

        this.connection.on('SpaceAvailable', (message: string) => {
            this.callbacks.onSpaceAvailable?.(message);
        });

        // Start connection
        try {
            await this.connection.start();
            console.log('SignalR Connected');
        } catch (error) {
            console.error('SignalR Connection Error:', error);
            throw error;
        }
    }

    /**
     * Join a streaming session
     */
    async joinSession(sessionId: string, capacity: number): Promise<void> {
        if (!this.connection) {
            throw new Error('Connection not initialized');
        }
        await this.connection.invoke('JoinSession', sessionId, capacity);
    }

    /**
     * Leave a streaming session
     */
    async leaveSession(sessionId: string): Promise<void> {
        if (!this.connection) return;
        try {
            await this.connection.invoke('LeaveSession', sessionId);
        } catch (error) {
            console.error('Error leaving session:', error);
        }
    }

    /**
     * Send a chat message
     */
    async sendChatMessage(sessionId: string, message: string): Promise<void> {
        if (!this.connection) {
            throw new Error('Connection not initialized');
        }
        await this.connection.invoke('SendChatMessage', sessionId, message);
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
}
