import React, { useState } from 'react';
import { useSystemStatus } from '../hooks/useSystemStatus';
import type { QueueStatus, JobStatus, SystemLog } from '../../domain/entities/systemTypes';

/**
 * SystemStatusPage Component
 * Admin panel for system supervision (TC-090)
 */
export const SystemStatusPage: React.FC = () => {
    const [autoRefresh, setAutoRefresh] = useState(true);
    const {
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
    } = useSystemStatus({ autoRefresh, refreshInterval: 30000 });

    return (
        <div className="container-fluid mt-4">
            {/* Header */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="d-flex justify-content-between align-items-center">
                        <div>
                            <h2>Supervisión del Sistema</h2>
                            <p className="text-muted">
                                Monitoreo de colas RabbitMQ, trabajos en segundo plano y logs del sistema
                            </p>
                        </div>
                        <div className="d-flex gap-2">
                            <div className="form-check form-switch">
                                <input
                                    className="form-check-input"
                                    type="checkbox"
                                    id="autoRefresh"
                                    checked={autoRefresh}
                                    onChange={(e) => setAutoRefresh(e.target.checked)}
                                />
                                <label className="form-check-label" htmlFor="autoRefresh">
                                    Auto-refresh (30s)
                                </label>
                            </div>
                            <button className="btn btn-primary" onClick={refresh}>
                                🔄 Refresh All
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Queues Status Section */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">📬 RabbitMQ Queues</h5>
                            <button className="btn btn-sm btn-outline-primary" onClick={refreshQueues}>
                                🔄 Refresh
                            </button>
                        </div>
                        <div className="card-body">
                            {queuesLoading && (
                                <div className="text-center py-3">
                                    <div className="spinner-border spinner-border-sm" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            )}
                            {queuesError && (
                                <div className="alert alert-danger">{queuesError}</div>
                            )}
                            {!queuesLoading && !queuesError && queues.length === 0 && (
                                <p className="text-muted text-center">No queues found</p>
                            )}
                            {!queuesLoading && !queuesError && queues.length > 0 && (
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>Queue Name</th>
                                                <th>Messages</th>
                                                <th>Ready</th>
                                                <th>Unacked</th>
                                                <th>Consumers</th>
                                                <th>State</th>
                                                <th>VHost</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {queues.map((queue) => (
                                                <tr key={queue.name}>
                                                    <td>
                                                        <strong>{queue.name}</strong>
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-info">{queue.messages}</span>
                                                    </td>
                                                    <td>{queue.ready}</td>
                                                    <td>{queue.unacked}</td>
                                                    <td>{queue.consumers}</td>
                                                    <td>
                                                        <span
                                                            className={`badge ${queue.state === 'running'
                                                                    ? 'bg-success'
                                                                    : queue.state === 'idle'
                                                                        ? 'bg-secondary'
                                                                        : 'bg-warning'
                                                                }`}
                                                        >
                                                            {queue.state}
                                                        </span>
                                                    </td>
                                                    <td>
                                                        <small className="text-muted">{queue.vhost}</small>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Jobs Status Section */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">⚙️ Background Jobs</h5>
                            <button className="btn btn-sm btn-outline-primary" onClick={refreshJobs}>
                                🔄 Refresh
                            </button>
                        </div>
                        <div className="card-body">
                            {jobsLoading && (
                                <div className="text-center py-3">
                                    <div className="spinner-border spinner-border-sm" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            )}
                            {jobsError && <div className="alert alert-danger">{jobsError}</div>}
                            {!jobsLoading && !jobsError && jobs.length === 0 && (
                                <p className="text-muted text-center">No jobs found</p>
                            )}
                            {!jobsLoading && !jobsError && jobs.length > 0 && (
                                <div className="table-responsive">
                                    <table className="table table-hover">
                                        <thead>
                                            <tr>
                                                <th>Queue</th>
                                                <th>Active</th>
                                                <th>Waiting</th>
                                                <th>Delayed</th>
                                                <th>Failed</th>
                                                <th>Completed</th>
                                                <th>Status</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {jobs.map((job) => (
                                                <tr key={job.queue}>
                                                    <td>
                                                        <strong>{job.queue}</strong>
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-primary">{job.active}</span>
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-secondary">{job.waiting}</span>
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-warning text-dark">{job.delayed}</span>
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-danger">{job.failed}</span>
                                                    </td>
                                                    <td>
                                                        <span className="badge bg-success">{job.completed}</span>
                                                    </td>
                                                    <td>
                                                        <span
                                                            className={`badge ${job.paused ? 'bg-warning' : 'bg-success'
                                                                }`}
                                                        >
                                                            {job.paused ? '⏸️ Paused' : '▶️ Running'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* System Logs Section */}
            <div className="row mb-4">
                <div className="col-12">
                    <div className="card">
                        <div className="card-header d-flex justify-content-between align-items-center">
                            <h5 className="mb-0">📋 System Logs</h5>
                            <button className="btn btn-sm btn-outline-primary" onClick={refreshLogs}>
                                🔄 Refresh
                            </button>
                        </div>
                        <div className="card-body">
                            {/* Filters */}
                            <div className="row mb-3">
                                <div className="col-md-3">
                                    <select
                                        className="form-select form-select-sm"
                                        value={logsFilter.nivel || ''}
                                        onChange={(e) =>
                                            setLogsFilter({ ...logsFilter, nivel: e.target.value as any || undefined })
                                        }
                                    >
                                        <option value="">All Levels</option>
                                        <option value="DEBUG">DEBUG</option>
                                        <option value="INFO">INFO</option>
                                        <option value="WARN">WARN</option>
                                        <option value="ERROR">ERROR</option>
                                    </select>
                                </div>
                                <div className="col-md-3">
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        placeholder="Service Origin"
                                        value={logsFilter.servicioOrigen || ''}
                                        onChange={(e) =>
                                            setLogsFilter({ ...logsFilter, servicioOrigen: e.target.value || undefined })
                                        }
                                    />
                                </div>
                                <div className="col-md-3">
                                    <input
                                        type="text"
                                        className="form-control form-control-sm"
                                        placeholder="Action Type"
                                        value={logsFilter.tipoAccion || ''}
                                        onChange={(e) =>
                                            setLogsFilter({ ...logsFilter, tipoAccion: e.target.value || undefined })
                                        }
                                    />
                                </div>
                                <div className="col-md-3">
                                    <button
                                        className="btn btn-sm btn-outline-secondary w-100"
                                        onClick={() =>
                                            setLogsFilter({ page: 1, pageSize: 50 })
                                        }
                                    >
                                        Clear Filters
                                    </button>
                                </div>
                            </div>

                            {logsLoading && (
                                <div className="text-center py-3">
                                    <div className="spinner-border spinner-border-sm" role="status">
                                        <span className="visually-hidden">Loading...</span>
                                    </div>
                                </div>
                            )}
                            {logsError && <div className="alert alert-danger">{logsError}</div>}
                            {!logsLoading && !logsError && logs.length === 0 && (
                                <p className="text-muted text-center">No logs found</p>
                            )}
                            {!logsLoading && !logsError && logs.length > 0 && (
                                <>
                                    <div className="table-responsive" style={{ maxHeight: '500px', overflowY: 'auto' }}>
                                        <table className="table table-sm table-striped">
                                            <thead className="sticky-top bg-white">
                                                <tr>
                                                    <th>Level</th>
                                                    <th>Service</th>
                                                    <th>Action</th>
                                                    <th>Timestamp</th>
                                                    <th>Data</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {logs.map((log) => (
                                                    <tr key={log.id}>
                                                        <td>
                                                            <span
                                                                className={`badge ${log.nivel === 'ERROR'
                                                                        ? 'bg-danger'
                                                                        : log.nivel === 'WARN'
                                                                            ? 'bg-warning text-dark'
                                                                            : log.nivel === 'INFO'
                                                                                ? 'bg-info'
                                                                                : 'bg-secondary'
                                                                    }`}
                                                            >
                                                                {log.nivel}
                                                            </span>
                                                        </td>
                                                        <td>
                                                            <small>{log.servicioOrigen}</small>
                                                        </td>
                                                        <td>
                                                            <small>{log.tipoAccion}</small>
                                                        </td>
                                                        <td>
                                                            <small className="text-muted">
                                                                {new Date(log.fechaOcurrencia).toLocaleString()}
                                                            </small>
                                                        </td>
                                                        <td>
                                                            {log.datos && (
                                                                <details>
                                                                    <summary className="text-primary" style={{ cursor: 'pointer' }}>
                                                                        View
                                                                    </summary>
                                                                    <pre className="mt-2 p-2 bg-light" style={{ fontSize: '0.75rem' }}>
                                                                        {JSON.stringify(log.datos, null, 2)}
                                                                    </pre>
                                                                </details>
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>

                                    {/* Pagination */}
                                    <div className="d-flex justify-content-center mt-3">
                                        <div className="btn-group" role="group">
                                            <button
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() =>
                                                    setLogsFilter({
                                                        ...logsFilter,
                                                        page: Math.max(1, (logsFilter.page || 1) - 1),
                                                    })
                                                }
                                                disabled={(logsFilter.page || 1) === 1}
                                            >
                                                Previous
                                            </button>
                                            <button className="btn btn-sm btn-outline-primary" disabled>
                                                Page {logsFilter.page || 1}
                                            </button>
                                            <button
                                                className="btn btn-sm btn-outline-primary"
                                                onClick={() =>
                                                    setLogsFilter({
                                                        ...logsFilter,
                                                        page: (logsFilter.page || 1) + 1,
                                                    })
                                                }
                                                disabled={logs.length < (logsFilter.pageSize || 50)}
                                            >
                                                Next
                                            </button>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
