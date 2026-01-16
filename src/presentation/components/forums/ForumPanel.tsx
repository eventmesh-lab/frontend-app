import React, { useState, useEffect } from 'react';
import { forumsService } from '../../../application/services/ForumsService';
import useAuth from '../../contexts/Auth';
import type { Forum, ForumPermissions } from '../../../domain/entities/forumTypes';
import { ThreadList } from './ThreadList';
import { CreateThreadForm } from './CreateThreadForm';

interface ForumPanelProps {
    eventoId: string;
    onForumCreated?: () => void;
}

/**
 * ForumPanel Component
 * Main forum container - loads forum, displays threads, handles permissions
 */
export const ForumPanel: React.FC<ForumPanelProps> = ({ eventoId, onForumCreated }) => {
    const { username } = useAuth();
    const [forum, setForum] = useState<Forum | null>(null);
    const [permissions, setPermissions] = useState<ForumPermissions>({
        canPost: false,
        canModerate: false,
        canCreateForum: false,
    });
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isCreatingForum, setIsCreatingForum] = useState(false);

    // Load forum and permissions on mount
    useEffect(() => {
        loadForum();
    }, [eventoId]);

    const loadForum = async () => {
        try {
            setIsLoading(true);
            setError(null);

            // Get forum
            const forumData = await forumsService.getForumByEvent(eventoId);
            setForum(forumData);

            // Get permissions (assuming userId from username)
            if (username) {
                const userPermissions = await forumsService.getPermissions(
                    username, // Using username as userId - adjust if needed
                    eventoId,
                    null // Role will be checked internally
                );
                setPermissions(userPermissions);
            }
        } catch (err: any) {
            setError(err.message || 'Error loading forum');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreateForum = async () => {
        if (!username) return;

        try {
            setIsCreatingForum(true);
            setError(null);

            await forumsService.createForum(
                eventoId,
                'Foro del evento',
                'Espacio para preguntas y respuestas sobre el evento'
            );

            await loadForum();
            onForumCreated?.();
        } catch (err: any) {
            setError(err.message || 'Error creating forum');
        } finally {
            setIsCreatingForum(false);
        }
    };

    if (isLoading) {
        return (
            <div className="text-center py-8">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading forum...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger" role="alert">
                <strong>Error:</strong> {error}
            </div>
        );
    }

    // No forum exists yet
    if (!forum) {
        return (
            <div className="text-center py-8">
                <div className="card">
                    <div className="card-body">
                        <h5 className="card-title">No hay foro disponible</h5>
                        <p className="card-text text-muted">
                            Este evento aún no tiene un foro de discusión.
                        </p>
                        {permissions.canCreateForum && (
                            <button
                                className="btn btn-primary"
                                onClick={handleCreateForum}
                                disabled={isCreatingForum}
                            >
                                {isCreatingForum ? 'Creando...' : 'Crear Foro'}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="forum-panel">
            {/* Forum Header */}
            <div className="card mb-4">
                <div className="card-body">
                    <h3 className="card-title">{forum.titulo}</h3>
                    <p className="card-text text-muted">{forum.descripcion}</p>
                    <div className="d-flex gap-2">
                        <span className="badge bg-success">{forum.estado}</span>
                        {permissions.canModerate && (
                            <span className="badge bg-warning">Moderador</span>
                        )}
                    </div>
                </div>
            </div>

            {/* Create Thread Form */}
            {permissions.canPost && (
                <CreateThreadForm
                    foroId={forum.id}
                    autorId={username || ''}
                    onThreadCreated={loadForum}
                />
            )}

            {/* Thread List */}
            <ThreadList
                foroId={forum.id}
                canModerate={permissions.canModerate}
                canPost={permissions.canPost}
                currentUserId={username || ''}
            />
        </div>
    );
};
