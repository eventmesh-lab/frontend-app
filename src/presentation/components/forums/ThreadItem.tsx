import React, { useState } from 'react';
import type { Thread } from '../../../domain/entities/forumTypes';
import { CommentList } from './CommentList';

interface ThreadItemProps {
    thread: Thread;
    canModerate: boolean;
    canPost: boolean;
    currentUserId: string;
    onUpdate?: () => void;
}

/**
 * ThreadItem Component
 * Displays individual thread with expandable comments
 */
export const ThreadItem: React.FC<ThreadItemProps> = ({
    thread,
    canModerate,
    canPost,
    currentUserId,
    onUpdate,
}) => {
    const [isExpanded, setIsExpanded] = useState(false);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    return (
        <div className="card mb-3">
            <div className="card-body">
                {/* Thread Header */}
                <div className="d-flex justify-content-between align-items-start mb-2">
                    <h5 className="card-title mb-0">
                        {thread.titulo}
                        {thread.destacado && (
                            <span className="badge bg-warning ms-2">Destacado</span>
                        )}
                        {thread.bloqueado && (
                            <span className="badge bg-danger ms-2">Bloqueado</span>
                        )}
                    </h5>
                    <small className="text-muted">{formatDate(thread.fechaPublicacion)}</small>
                </div>

                {/* Thread Content */}
                <p className="card-text">{thread.contenido}</p>

                {/* Thread Footer */}
                <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-sm btn-outline-primary"
                            onClick={() => setIsExpanded(!isExpanded)}
                        >
                            {isExpanded ? '▼' : '▶'} {thread.comentarios?.length || 0} comentarios
                        </button>
                    </div>
                    <small className="text-muted">Por: {thread.autorId}</small>
                </div>

                {/* Expanded Comments */}
                {isExpanded && (
                    <div className="mt-3 pt-3 border-top">
                        <CommentList
                            hiloId={thread.id}
                            canModerate={canModerate}
                            canPost={canPost}
                            currentUserId={currentUserId}
                            onUpdate={onUpdate}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};
