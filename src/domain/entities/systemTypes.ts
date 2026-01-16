/**
 * System Monitoring Type Definitions
 * For TC-090 System Supervision Panel
 */

// ============================================
// Queue Status (RabbitMQ via backend proxy)
// ============================================

export interface QueueStatus {
    name: string;
    messages: number;
    consumers: number;
    state: 'running' | 'idle' | 'flow' | string;
    vhost: string;
    ready: number;
    unacked: number;
}

// ============================================
// Job Status (Background jobs - BullMQ/Hangfire/etc)
// ============================================

export interface JobStatus {
    queue: string;
    active: number;
    delayed: number;
    failed: number;
    waiting: number;
    completed: number;
    paused: boolean;
}

// ============================================
// System Logs
// ============================================

export interface SystemLog {
    id: string;
    tipoAccion: string;
    servicioOrigen: string;
    nivel: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
    fechaOcurrencia: string; // ISO-8601
    datos?: Record<string, any>;
}

export interface LogsFilter {
    nivel?: 'INFO' | 'WARN' | 'ERROR' | 'DEBUG';
    servicioOrigen?: string;
    tipoAccion?: string;
    fechaDesde?: string;
    fechaHasta?: string;
    page?: number;
    pageSize?: number;
}
