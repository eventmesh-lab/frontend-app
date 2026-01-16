import React, { useState } from 'react';
import { complementaryServicesService } from '../../../application/services/ComplementaryServicesService';
import type { ServiceType, ServiceStatusDto } from '../../../domain/entities/complementaryTypes';

interface RequestServiceFormProps {
    reservationId: string;
    eventId: string;
    onServiceCreated?: (serviceId: string, status: ServiceStatusDto) => void;
}

/**
 * RequestServiceForm Component
 * Form for requesting complementary services
 */
export const RequestServiceForm: React.FC<RequestServiceFormProps> = ({
    reservationId,
    eventId,
    onServiceCreated,
}) => {
    const [serviceType, setServiceType] = useState<ServiceType>('transport');
    const [details, setDetails] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [serviceId, setServiceId] = useState<string | null>(null);
    const [status, setStatus] = useState<ServiceStatusDto | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!details.trim()) {
            setError('Please provide service details');
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            // Step 1: Request service (202 Accepted)
            const response = await complementaryServicesService.requestService(
                reservationId,
                eventId,
                serviceType,
                details
            );

            setServiceId(response.ServiceId);

            // Step 2: Get initial status
            const initialStatus = await complementaryServicesService.getServiceStatus(
                response.ServiceId
            );
            setStatus(initialStatus);

            // Clear form
            setDetails('');

            // Notify parent
            if (onServiceCreated) {
                onServiceCreated(response.ServiceId, initialStatus);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to request service');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="card mb-4">
            <div className="card-header">
                <h5 className="mb-0">Request Complementary Service</h5>
            </div>
            <div className="card-body">
                <form onSubmit={handleSubmit}>
                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    )}

                    {serviceId && status && (
                        <div className="alert alert-success" role="alert">
                            <strong>Service Requested!</strong>
                            <br />
                            Service ID: <code>{serviceId}</code>
                            <br />
                            Status: <strong>{status.status}</strong>
                        </div>
                    )}

                    <div className="mb-3">
                        <label htmlFor="service-type" className="form-label">
                            Service Type
                        </label>
                        <select
                            id="service-type"
                            className="form-select"
                            value={serviceType}
                            onChange={(e) => setServiceType(e.target.value as ServiceType)}
                            disabled={isSubmitting}
                        >
                            <option value="transport">🚗 Transport</option>
                            <option value="catering">🍽️ Catering</option>
                            <option value="merchandising">🎁 Merchandising</option>
                        </select>
                    </div>

                    <div className="mb-3">
                        <label htmlFor="service-details" className="form-label">
                            Details
                        </label>
                        <textarea
                            id="service-details"
                            className="form-control"
                            rows={4}
                            value={details}
                            onChange={(e) => setDetails(e.target.value)}
                            placeholder="Describe your service requirements..."
                            disabled={isSubmitting}
                        />
                        <small className="text-muted">
                            Example: "Need airport shuttle for 5 people" or "Vegetarian menu for 20 guests"
                        </small>
                    </div>

                    <div className="mb-3">
                        <small className="text-muted">
                            <strong>Reservation ID:</strong> {reservationId}
                            <br />
                            <strong>Event ID:</strong> {eventId}
                        </small>
                    </div>

                    <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isSubmitting || !details.trim()}
                    >
                        {isSubmitting ? 'Requesting...' : 'Request Service'}
                    </button>
                </form>
            </div>
        </div>
    );
};
