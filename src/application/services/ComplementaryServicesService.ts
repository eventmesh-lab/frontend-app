import { complementaryApi } from '../../adapters/api/complementaryApi';
import type {
    ServiceRequestDto,
    ServiceRequestResponse,
    ServiceStatusDto,
    ServiceMetricsDto,
} from '../../domain/entities/complementaryTypes';

/**
 * Complementary Services Service
 * High-level service for managing complementary services
 */
class ComplementaryServicesService {
    /**
     * Request a complementary service
     */
    async requestService(
        reservationId: string,
        eventId: string,
        serviceType: 'transport' | 'catering' | 'merchandising',
        details: string
    ): Promise<ServiceRequestResponse> {
        const payload: ServiceRequestDto = {
            reservationId,
            eventId,
            serviceType,
            details,
        };

        return await complementaryApi.requestService(payload);
    }

    /**
     * Get service status
     */
    async getServiceStatus(serviceId: string): Promise<ServiceStatusDto> {
        return await complementaryApi.getServiceStatus(serviceId);
    }

    /**
     * Get user's services (optionally filtered by reservation)
     */
    async getMyServices(reservationId?: string): Promise<ServiceStatusDto[]> {
        return await complementaryApi.getMyServices(reservationId);
    }

    /**
     * Cancel a pending service
     */
    async cancelService(serviceId: string): Promise<void> {
        await complementaryApi.cancelService(serviceId);
    }

    /**
     * Get services by event (admin/organizer only)
     */
    async getEventServices(eventId: string): Promise<ServiceStatusDto[]> {
        return await complementaryApi.getByEvent(eventId);
    }

    /**
     * Get global metrics
     */
    async getMetrics(): Promise<ServiceMetricsDto> {
        return await complementaryApi.getMetrics();
    }

    /**
     * Poll for service status updates
     * @param serviceId Service ID to poll
     * @param callback Callback function called with updated status
     * @param interval Polling interval in milliseconds (default: 5000)
     * @returns Function to stop polling
     */
    pollServiceStatus(
        serviceId: string,
        callback: (status: ServiceStatusDto) => void,
        interval: number = 5000
    ): () => void {
        const intervalId = setInterval(async () => {
            try {
                const status = await this.getServiceStatus(serviceId);
                callback(status);

                // Stop polling if status is final (Confirmed or Rejected)
                if (status.status === 'Confirmed' || status.status === 'Rejected') {
                    clearInterval(intervalId);
                }
            } catch (error) {
                console.error('Error polling service status:', error);
            }
        }, interval);

        // Return function to stop polling
        return () => clearInterval(intervalId);
    }
}

export const complementaryServicesService = new ComplementaryServicesService();
