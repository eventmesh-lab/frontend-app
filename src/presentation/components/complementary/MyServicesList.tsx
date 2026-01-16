import React, { useState, useEffect } from 'react';
import { complementaryServicesService } from '../../../application/services/ComplementaryServicesService';
import type { ServiceStatusDto } from '../../../domain/entities/complementaryTypes';
import { ServiceStatusBadge } from './ServiceStatusBadge';

interface MyServicesListProps {
    reservationId?: string;
    onServiceCancelled?: (serviceId: string) => void;
    autoRefresh?: boolean;
}

/**
 * MyServicesList Component
 * Displays user's complementary services
 */
export const MyServicesList: React.FC<MyServicesListProps> = ({
    reservationId,
    onServiceCancelled,
    autoRefresh = false,
}) => {
    const [services, setServices] = useState<ServiceStatusDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [cancellingId, setCancellingId] = useState<string | null>(null);

    useEffect(() => {
        loadServices();

        // Auto-refresh if enabled
        if (autoRefresh) {
            const interval = setInterval(loadServices, 10000); // Every 10 seconds
            return () => clearInterval(interval);
        }
    }, [reservationId, autoRefresh]);

    const loadServices = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await complementaryServicesService.getMyServices(reservationId);
            setServices(data);
        } catch (err: any) {
            setError(err.message || 'Failed to load services');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = async (serviceId: string) => {
        if (!window.confirm('Are you sure you want to cancel this service request?')) {
            return;
        }

        try {
            setCancellingId(serviceId);
            await complementaryServicesService.cancelService(serviceId);
            await loadServices(); // Reload list
            if (onServiceCancelled) {
                onServiceCancelled(serviceId);
            }
        } catch (err: any) {
            alert(`Failed to cancel: ${err.message}`);
        } finally {
            setCancellingId(null);
        }
    };

    const getServiceIcon = (type: string) => {
        switch (type) {
            case 'transport':
                return '🚗';
            case 'catering':
                return '🍽️';
            case 'merchandising':
                return '🎁';
            default:
                return '📦';
        }
    };

    if (isLoading) {
        return (
            <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading services...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger" role="alert">
                {error}
            </div>
        );
    }

    if (services.length === 0) {
        return (
            <div className="card">
                <div className="card-body text-center py-5">
                    <h5 className="text-muted">No services requested yet</h5>
                    <p className="text-muted">Request complementary services to enhance your event experience</p>
                </div>
            </div>
        );
    }

    return (
        <div className="my-services-list">
            <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0">My Services ({services.length})</h5>
                <button className="btn btn-sm btn-outline-primary" onClick={loadServices}>
                    🔄 Refresh
                </button>
            </div>

            <div className="row">
                {services.map((service) => (
                    <div key={service.serviceId} className="col-md-6 col-lg-4 mb-3">
                        <div className="card h-100">
                            <div className="card-body">
                                <div className="d-flex justify-content-between align-items-start mb-2">
                                    <h6 className="card-title mb-0">
                                        {getServiceIcon(service.serviceType)} {service.serviceType}
                                    </h6>
                                    <ServiceStatusBadge
                                        status={service.status}
                                        providerId={service.providerId}
                                        price={service.price}
                                        rejectionReason={service.rejectionReason}
                                    />
                                </div>

                                <p className="card-text text-muted small">{service.details}</p>

                                <div className="mt-3">
                                    <small className="text-muted d-block">
                                        Requested: {new Date(service.requestedAt).toLocaleString()}
                                    </small>

                                    {service.confirmedAt && (
                                        <small className="text-success d-block">
                                            ✓ Confirmed: {new Date(service.confirmedAt).toLocaleString()}
                                            {service.providerId && (
                                                <>
                                                    <br />
                                                    Provider: {service.providerId}
                                                </>
                                            )}
                                            {service.price !== undefined && (
                                                <>
                                                    <br />
                                                    Price: ${service.price.toFixed(2)}
                                                </>
                                            )}
                                        </small>
                                    )}

                                    {service.rejectedAt && (
                                        <small className="text-danger d-block">
                                            ✗ Rejected: {new Date(service.rejectedAt).toLocaleString()}
                                            {service.rejectionReason && (
                                                <>
                                                    <br />
                                                    Reason: {service.rejectionReason}
                                                </>
                                            )}
                                        </small>
                                    )}
                                </div>

                                {service.status === 'Pending' && (
                                    <button
                                        className="btn btn-sm btn-outline-danger mt-3 w-100"
                                        onClick={() => handleCancel(service.serviceId)}
                                        disabled={cancellingId === service.serviceId}
                                    >
                                        {cancellingId === service.serviceId ? 'Cancelling...' : 'Cancel Request'}
                                    </button>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
