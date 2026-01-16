import React, { useState } from 'react';
import { RequestServiceForm } from '../components/complementary/RequestServiceForm';
import { ServiceNotifications } from '../components/complementary/ServiceNotifications';
import { MyServicesList } from '../components/complementary/MyServicesList';
import type { ServiceNotification, ServiceStatusDto } from '../../domain/entities/complementaryTypes';

/**
 * ExampleComplementaryServicesPage Component
 * Demonstrates complete integration of complementary services
 */
export const ExampleComplementaryServicesPage: React.FC = () => {
    // Example IDs - in production, these would come from context/props
    const [reservationId] = useState('00000000-0000-0000-0000-000000000001');
    const [eventId] = useState('00000000-0000-0000-0000-000000000002');
    const [refreshKey, setRefreshKey] = useState(0);

    const handleServiceCreated = (serviceId: string, status: ServiceStatusDto) => {
        console.log('Service created:', serviceId, status);
        // Trigger refresh of services list
        setRefreshKey((prev) => prev + 1);
    };

    const handleNotification = (notification: ServiceNotification) => {
        console.log('Notification received:', notification);
        // Trigger refresh when notification arrives
        setRefreshKey((prev) => prev + 1);

        // Show browser notification if supported
        if ('Notification' in window && Notification.permission === 'granted') {
            new Notification('Service Update', {
                body: notification.Message,
                icon: '/favicon.ico',
            });
        }
    };

    const handleServiceCancelled = (serviceId: string) => {
        console.log('Service cancelled:', serviceId);
        setRefreshKey((prev) => prev + 1);
    };

    return (
        <div className="container-fluid mt-4">
            <div className="row">
                <div className="col-12">
                    <h2 className="mb-4">Complementary Services</h2>
                    <p className="text-muted">
                        Request additional services for your event reservation (transport, catering,
                        merchandising)
                    </p>
                </div>
            </div>

            <div className="row">
                {/* Left Column: Request Form */}
                <div className="col-lg-6">
                    <RequestServiceForm
                        reservationId={reservationId}
                        eventId={eventId}
                        onServiceCreated={handleServiceCreated}
                    />
                </div>

                {/* Right Column: Notifications */}
                <div className="col-lg-6">
                    <div className="card mb-4">
                        <div className="card-header">
                            <h5 className="mb-0">Real-Time Notifications</h5>
                        </div>
                        <div className="card-body" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                            <ServiceNotifications onNotification={handleNotification} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Services List */}
            <div className="row mt-4">
                <div className="col-12">
                    <MyServicesList
                        key={refreshKey}
                        reservationId={reservationId}
                        onServiceCancelled={handleServiceCancelled}
                    />
                </div>
            </div>
        </div>
    );
};
