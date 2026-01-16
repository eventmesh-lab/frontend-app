import React from 'react';
import { useStreaming } from '../hooks/useStreaming';
import { StreamPlayer } from '../components/StreamPlayer';
import { streamingTokenStore } from '../../adapters/api/streamingTokenStore';

/**
 * Example Streaming Page Component
 * Demonstrates complete integration of streaming service
 */

interface ExampleStreamingPageProps {
    eventId: string;
    userId: string;
    reservationId: string;
}

export const ExampleStreamingPage: React.FC<ExampleStreamingPageProps> = ({
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
        connect,
        disconnect,
    } = useStreaming({
        eventId,
        userId,
        reservationId,
        autoConnect: true,
    });

    const [chatInput, setChatInput] = React.useState('');

    const handleSendMessage = () => {
        if (chatInput.trim()) {
            sendMessage(chatInput);
            setChatInput('');
        }
    };

    if (isLoading) {
        return (
            <div className="container mt-5">
                <div className="text-center">
                    <div className="spinner-border text-primary" role="status">
                        <span className="visually-hidden">Loading stream...</span>
                    </div>
                    <p className="mt-3">Connecting to stream...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="container mt-5">
                <div className="alert alert-danger" role="alert">
                    <h4 className="alert-heading">Stream Error</h4>
                    <p>{error}</p>
                    <hr />
                    <button className="btn btn-primary" onClick={connect}>
                        Retry Connection
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="container-fluid mt-4">
            <div className="row">
                {/* Video Player Column */}
                <div className="col-lg-9">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">Live Event Stream</h5>
                            <div className="d-flex align-items-center gap-3">
                                <span className="badge bg-success">
                                    {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
                                </span>
                                <span className="badge bg-info">
                                    👁️ {viewerCount} viewers
                                </span>
                            </div>
                        </div>
                        <div className="card-body p-0">
                            {streamUrl && (
                                <StreamPlayer
                                    streamUrl={streamUrl}
                                    accessToken={streamingTokenStore.getAccessToken() || ''}
                                    autoPlay={true}
                                    onError={(err) => console.error('Player error:', err)}
                                    onReady={(data) => console.log('Stream ready:', data)}
                                />
                            )}
                        </div>
                    </div>

                    {/* Stream Controls */}
                    <div className="card mt-3">
                        <div className="card-body">
                            <h6>Stream Controls</h6>
                            <div className="btn-group" role="group">
                                {!isConnected ? (
                                    <button className="btn btn-success" onClick={connect}>
                                        Connect to Stream
                                    </button>
                                ) : (
                                    <button className="btn btn-danger" onClick={disconnect}>
                                        Leave Stream
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Chat Column */}
                <div className="col-lg-3">
                    <div className="card" style={{ height: '600px', display: 'flex', flexDirection: 'column' }}>
                        <div className="card-header">
                            <h6 className="mb-0">Live Chat</h6>
                        </div>
                        <div
                            className="card-body overflow-auto flex-grow-1"
                            style={{ maxHeight: '500px' }}
                        >
                            {chatMessages.length === 0 ? (
                                <p className="text-muted text-center">No messages yet</p>
                            ) : (
                                chatMessages.map((msg, idx) => (
                                    <div key={idx} className="mb-2">
                                        <small className="text-muted">
                                            {new Date(msg.timestamp).toLocaleTimeString()}
                                        </small>
                                        <div>
                                            <strong>{msg.username}:</strong> {msg.text}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                        <div className="card-footer">
                            <div className="input-group">
                                <input
                                    type="text"
                                    className="form-control"
                                    placeholder="Type a message..."
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter') {
                                            handleSendMessage();
                                        }
                                    }}
                                    disabled={!isConnected}
                                />
                                <button
                                    className="btn btn-primary"
                                    onClick={handleSendMessage}
                                    disabled={!isConnected || !chatInput.trim()}
                                >
                                    Send
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
