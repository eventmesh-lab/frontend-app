import React, { useState, useEffect } from 'react';
import { forumsService } from '../../../application/services/ForumsService';
import type { Thread } from '../../../domain/entities/forumTypes';
import { ThreadItem } from './ThreadItem';

interface ThreadListProps {
    foroId: string;
    canModerate: boolean;
    canPost: boolean;
    currentUserId: string;
}

/**
 * ThreadList Component
 * Displays list of threads with pagination and sorting
 */
export const ThreadList: React.FC<ThreadListProps> = ({
    foroId,
    canModerate,
    canPost,
    currentUserId,
}) => {
    const [threads, setThreads] = useState<Thread[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [sortBy, setSortBy] = useState<'recientes' | 'populares' | 'destacados'>('recientes');

    useEffect(() => {
        loadThreads();
    }, [foroId, currentPage, sortBy]);

    const loadThreads = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await forumsService.getThreads(foroId, currentPage, sortBy);
            setThreads(data);
        } catch (err: any) {
            setError(err.message || 'Error loading threads');
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="text-center py-4">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading threads...</span>
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

    if (threads.length === 0) {
        return (
            <div className="card">
                <div className="card-body text-center py-5">
                    <h5 className="text-muted">No hay hilos todavía</h5>
                    <p className="text-muted">
                        {canPost
                            ? 'Sé el primero en iniciar una discusión'
                            : 'Necesitas un ticket confirmado para publicar'}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="thread-list">
            {/* Sort Controls */}
            <div className="card mb-3">
                <div className="card-body">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">Hilos de Discusión</h5>
                        <div className="btn-group" role="group">
                            <button
                                className={`btn btn-sm ${sortBy === 'recientes' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setSortBy('recientes')}
                            >
                                Recientes
                            </button>
                            <button
                                className={`btn btn-sm ${sortBy === 'populares' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setSortBy('populares')}
                            >
                                Populares
                            </button>
                            <button
                                className={`btn btn-sm ${sortBy === 'destacados' ? 'btn-primary' : 'btn-outline-primary'}`}
                                onClick={() => setSortBy('destacados')}
                            >
                                Destacados
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Thread Items */}
            {threads.map((thread) => (
                <ThreadItem
                    key={thread.id}
                    thread={thread}
                    canModerate={canModerate}
                    canPost={canPost}
                    currentUserId={currentUserId}
                    onUpdate={loadThreads}
                />
            ))}

            {/* Pagination */}
            <div className="d-flex justify-content-center mt-4">
                <div className="btn-group" role="group">
                    <button
                        className="btn btn-outline-primary"
                        onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                    >
                        Anterior
                    </button>
                    <button className="btn btn-outline-primary" disabled>
                        Página {currentPage}
                    </button>
                    <button
                        className="btn btn-outline-primary"
                        onClick={() => setCurrentPage((p) => p + 1)}
                        disabled={threads.length < 20}
                    >
                        Siguiente
                    </button>
                </div>
            </div>
        </div>
    );
};
