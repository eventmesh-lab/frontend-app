/**
 * Complementary Services Type Definitions
 * Based on complementary-service/docs/FrontendReact.md
 */

// ============================================
// Service Types
// ============================================

export type ServiceType = 'transport' | 'catering' | 'merchandising';

export type ServiceStatus = 'Pending' | 'Confirmed' | 'Rejected';

// ============================================
// Service Request
// ============================================

export interface ServiceRequestDto {
    reservationId: string; // GUID
    eventId: string; // GUID
    serviceType: ServiceType;
    details: string;
}

export interface ServiceRequestResponse {
    ServiceId: string; // GUID
}

// ============================================
// Service Status
// ============================================

export interface ServiceStatusDto {
    serviceId: string; // GUID
    reservationId: string; // GUID
    serviceType: ServiceType;
    status: ServiceStatus;
    providerId?: string;
    price?: number;
    requestedAt: string; // ISO-8601
    confirmedAt?: string; // ISO-8601
    rejectedAt?: string; // ISO-8601
    rejectionReason?: string;
    details?: string;
}

// ============================================
// Service Metrics
// ============================================

export interface ServiceMetricsDto {
    totalRequests: number;
    confirmed: number;
    rejected: number;
    pending: number;
    averagePrice: number;
    byServiceType: Record<string, number>;
}

// ============================================
// SignalR Notifications
// ============================================

export type ServiceNotificationType =
    | 'ServiceConfirmed'
    | 'ServiceRejected'
    | 'ServiceUpdated';

export interface ServiceNotification {
    Type: ServiceNotificationType;
    ServiceId: string;
    ServiceType?: ServiceType;
    ProviderId?: string;
    Price?: number;
    Reason?: string;
    Status?: ServiceStatus;
    Message: string;
    Timestamp: string; // ISO-8601
}
