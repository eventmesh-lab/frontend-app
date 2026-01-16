import { useState, useEffect, useCallback } from 'react';
import { systemStatusApi } from '../../adapters/api/systemStatusApi';
import type {
    QueueStatus,
    JobStatus,
    SystemLog,
    LogsFilter,
} from '../../domain/entities/systemTypes';

interface UseSystemStatusOptions {
    autoRefresh?: boolean;
    refreshInterval?: number; // milliseconds
}

interface UseSystemStatusReturn {
    // Queues
    queues: QueueStatus[];
    queuesLoading: boolean;
    queuesError: string | null;

    // Jobs
    jobs: JobStatus[];
    jobsLoading: boolean;
    jobsError: string | null;

    // Logs
    logs: SystemLog[];
    logsLoading: boolean;
    logsError: string | null;
    logsFilter: LogsFilter;
    setLogsFilter: (filter: LogsFilter) => void;

    // Actions
    refresh: () => Promise<void>;
    refreshQueues: () => Promise<void>;
    refreshJobs: () => Promise<void>;
    refreshLogs: () => Promise<void>;
}

/**
 * useSystemStatus Hook
 * Manages system monitoring data (queues, jobs, logs)
 */
export function useSystemStatus(
    options: UseSystemStatusOptions = {}
): UseSystemStatusReturn {
    const { autoRefresh = false, refreshInterval = 30000 } = options;

    // Queues state
    const [queues, setQueues] = useState<QueueStatus[]>([]);
    const [queuesLoading, setQueuesLoading] = useState(false);
    const [queuesError, setQueuesError] = useState<string | null>(null);

    // Jobs state
    const [jobs, setJobs] = useState<JobStatus[]>([]);
    const [jobsLoading, setJobsLoading] = useState(false);
    const [jobsError, setJobsError] = useState<string | null>(null);

    // Logs state
    const [logs, setLogs] = useState<SystemLog[]>([]);
    const [logsLoading, setLogsLoading] = useState(false);
    const [logsError, setLogsError] = useState<string | null>(null);
    const [logsFilter, setLogsFilter] = useState<LogsFilter>({ page: 1, pageSize: 50 });

    /**
     * Refresh queues status
     */
    const refreshQueues = useCallback(async () => {
        try {
            setQueuesLoading(true);
            setQueuesError(null);
            const data = await systemStatusApi.getQueuesStatus();
            setQueues(data);
        } catch (err: any) {
            setQueuesError(err.message || 'Failed to load queues');
        } finally {
            setQueuesLoading(false);
        }
    }, []);

    /**
     * Refresh jobs status
     */
    const refreshJobs = useCallback(async () => {
        try {
            setJobsLoading(true);
            setJobsError(null);
            const data = await systemStatusApi.getJobsStatus();
            setJobs(data);
        } catch (err: any) {
            setJobsError(err.message || 'Failed to load jobs');
        } finally {
            setJobsLoading(false);
        }
    }, []);

    /**
     * Refresh logs
     */
    const refreshLogs = useCallback(async () => {
        try {
            setLogsLoading(true);
            setLogsError(null);
            const data = await systemStatusApi.getLogs(logsFilter);
            setLogs(data);
        } catch (err: any) {
            setLogsError(err.message || 'Failed to load logs');
        } finally {
            setLogsLoading(false);
        }
    }, [logsFilter]);

    /**
     * Refresh all data
     */
    const refresh = useCallback(async () => {
        await Promise.all([refreshQueues(), refreshJobs(), refreshLogs()]);
    }, [refreshQueues, refreshJobs, refreshLogs]);

    // Initial load
    useEffect(() => {
        refresh();
    }, []);

    // Refresh logs when filter changes
    useEffect(() => {
        refreshLogs();
    }, [logsFilter]);

    // Auto-refresh if enabled
    useEffect(() => {
        if (autoRefresh) {
            const interval = setInterval(refresh, refreshInterval);
            return () => clearInterval(interval);
        }
    }, [autoRefresh, refreshInterval, refresh]);

    return {
        queues,
        queuesLoading,
        queuesError,
        jobs,
        jobsLoading,
        jobsError,
        logs,
        logsLoading,
        logsError,
        logsFilter,
        setLogsFilter,
        refresh,
        refreshQueues,
        refreshJobs,
        refreshLogs,
    };
}
