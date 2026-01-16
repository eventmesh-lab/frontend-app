import React from 'react';
import type { ServiceStatus } from '../../../domain/entities/complementaryTypes';

interface ServiceStatusBadgeProps {
    status: ServiceStatus;
    providerId?: string;
    price?: number;
    rejectionReason?: string;
}

/**
 * ServiceStatusBadge Component
 * Displays service status with appropriate styling
 */
export const ServiceStatusBadge: React.FC<ServiceStatusBadgeProps> = ({
    status,
    providerId,
    price,
    rejectionReason,
}) => {
    const getBadgeClass = () => {
        switch (status) {
            case 'Pending':
                return 'bg-warning text-dark';
            case 'Confirmed':
                return 'bg-success';
            case 'Rejected':
                return 'bg-danger';
            default:
                return 'bg-secondary';
        }
    };

    const getIcon = () => {
        switch (status) {
            case 'Pending':
                return '⏳';
            case 'Confirmed':
                return '✅';
            case 'Rejected':
                return '❌';
            default:
                return '📋';
        }
    };

    const getTooltip = () => {
        const parts: string[] = [];

        if (providerId) {
            parts.push(`Provider: ${providerId}`);
        }

        if (price !== undefined) {
            parts.push(`Price: $${price.toFixed(2)}`);
        }

        if (rejectionReason) {
            parts.push(`Reason: ${rejectionReason}`);
        }

        return parts.join(' | ');
    };

    const tooltip = getTooltip();

    return (
        <span
            className={`badge ${getBadgeClass()}`}
            title={tooltip}
            style={{ cursor: tooltip ? 'help' : 'default' }}
        >
            {getIcon()} {status}
        </span>
    );
};
