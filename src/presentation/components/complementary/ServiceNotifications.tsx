import React, { useEffect, useState } from 'react';
import { ComplementarySignalRAdapter } from '../../../adapters/signalr/ComplementarySignalRAdapter';
import type { ServiceNotification } from '../../../domain/entities/complementaryTypes';

interface ServiceNotificationsProps {
    onNotification?: (notification: ServiceNotification) => void;
}

/**
 * ServiceNotifications Component
 * Displays real-time service notifications via SignalR
 */
export const ServiceNotifications: React.FC<ServiceNotificationsProps> = ({
    onNotification,
}) => {
    const [notifications, setNotifications] = useState<ServiceNotification[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const adapter = new ComplementarySignalRAdapter();

        const handleNotification = (notification: ServiceNotification) => {
            console.log('Received service notification:', notification);
            setNotifications((prev) => [notification, ...prev].slice(0, 50)); // Keep last 50

            // Notify parent component
            if (onNotification) {
                onNotification(notification);
            }
        };

        const connectToHub = async () => {
            try {
                await adapter.connect(handleNotification);
                setIsConnected(true);
                setError(null);
            } catch (err: any) {
                setError(err.message || 'Failed to connect to notifications');
                setIsConnected(false);
            }
        };

        connectToHub();

        // Cleanup on unmount
        return () => {
            adapter.disconnect();
        };
    }, [onNotification]);

    const getNotificationIcon = (type: string) => {
        switch (type) {
            case 'ServiceConfirmed':
                return '✅';
            case 'ServiceRejected':
                return '❌';
            case 'ServiceUpdated':
                return '🔄';
            default:
                return '📬';
        }
    };

    const getNotificationClass = (type: string) => {
        switch (type) {
            case 'ServiceConfirmed':
                return 'alert-success';
            case 'ServiceRejected':
                return 'alert-danger';
            case 'ServiceUpdated':
                return 'alert-info';
            default:
                return 'alert-secondary';
        }
    };

    return (
        <div className="service-notifications">
            {/* Connection Status */}
            <div className="mb-3">
                {isConnected ? (
                    <span className="badge bg-success">🟢 Connected to notifications</span>
                ) : error ? (
                    <span className="badge bg-danger">🔴 Disconnected - {error}</span>
                ) : (
                    <span className="badge bg-warning">🟡 Connecting...</span>
                )}
            </div>

            {/* Notifications List */}
            {notifications.length === 0 ? (
                <p className="text-muted text-center">No notifications yet</p>
            ) : (
                <div className="notifications-list">
                    {notifications.map((notification, index) => (
                        <div
                            key={index}
                            className={`alert ${getNotificationClass(notification.Type)} mb-2`}
                            role="alert"
                        >
                            <div className="d-flex justify-content-between align-items-start">
                                <div>
                                    <strong>
                                        {getNotificationIcon(notification.Type)} {notification.Type}
                                    </strong>
                                    <p className="mb-1">{notification.Message}</p>
                                    <small className="text-muted">
                                        Service: <code>{notification.ServiceId}</code>
                                        {notification.ServiceType && ` | Type: ${notification.ServiceType}`}
                                        {notification.ProviderId && ` | Provider: ${notification.ProviderId}`}
                                        {notification.Price !== undefined && ` | Price: $${notification.Price}`}
                                        {notification.Reason && ` | Reason: ${notification.Reason}`}
                                    </small>
                                </div>
                                <small className="text-muted">
                                    {new Date(notification.Timestamp).toLocaleTimeString()}
                                </small>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
