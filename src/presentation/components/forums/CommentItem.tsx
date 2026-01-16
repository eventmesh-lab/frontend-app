import React, { useState } from 'react';
import { forumsService } from '../../../application/services/ForumsService';
import type { Comment } from '../../../domain/entities/forumTypes';
import { CreateCommentForm } from './CreateCommentForm';

interface CommentItemProps {
    comment: Comment;
    hiloId: string;
    canModerate: boolean;
    canPost: boolean;
    currentUserId: string;
    onUpdate?: () => void;
    depth?: number;
}

/**
 * CommentItem Component
 * Displays individual comment with nested replies and moderation controls
 */
export const CommentItem: React.FC<CommentItemProps> = ({
    comment,
    hiloId,
    canModerate,
    canPost,
    currentUserId,
    onUpdate,
    depth = 0,
}) => {
    const [isReplying, setIsReplying] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-ES', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const handleDelete = async () => {
        if (!window.confirm('¿Estás seguro de eliminar este comentario?')) {
            return;
        }

        const razon = prompt('Razón de eliminación:');
        if (!razon) return;

        try {
            setIsDeleting(true);
            await forumsService.deleteComment(hiloId, comment.id, currentUserId, razon);
            onUpdate?.();
        } catch (err: any) {
            alert(`Error: ${err.message}`);
        } finally {
            setIsDeleting(false);
        }
    };

    if (comment.eliminado) {
        return (
            <div
                className="comment-item deleted"
                style={{ marginLeft: `${depth * 20}px`, opacity: 0.5 }}
            >
                <p className="text-muted fst-italic">[Comentario eliminado]</p>
            </div>
        );
    }

    return (
        <div className="comment-item mb-3" style={{ marginLeft: `${depth * 20}px` }}>
            <div className="card">
                <div className="card-body py-2">
                    <div className="d-flex justify-content-between align-items-start mb-2">
                        <small className="text-muted">
                            <strong>{comment.autorId}</strong> · {formatDate(comment.fechaPublicacion)}
                            {comment.fechaEdicion && ' (editado)'}
                        </small>
                        {canModerate && (
                            <button
                                className="btn btn-sm btn-outline-danger"
                                onClick={handleDelete}
                                disabled={isDeleting}
                            >
                                {isDeleting ? 'Eliminando...' : 'Eliminar'}
                            </button>
                        )}
                    </div>

                    <p className="mb-2">{comment.contenido}</p>

                    {canPost && (
                        <button
                            className="btn btn-sm btn-link p-0"
                            onClick={() => setIsReplying(!isReplying)}
                        >
                            Responder
                        </button>
                    )}

                    {/* Reply Form */}
                    {isReplying && (
                        <div className="mt-2">
                            <CreateCommentForm
                                hiloId={hiloId}
                                autorId={currentUserId}
                                comentarioPadreId={comment.id}
                                onCommentCreated={() => {
                                    setIsReplying(false);
                                    onUpdate?.();
                                }}
                                onCancel={() => setIsReplying(false)}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Nested Replies */}
            {comment.replies && comment.replies.length > 0 && (
                <div className="mt-2">
                    {comment.replies.map((reply) => (
                        <CommentItem
                            key={reply.id}
                            comment={reply}
                            hiloId={hiloId}
                            canModerate={canModerate}
                            canPost={canPost}
                            currentUserId={currentUserId}
                            onUpdate={onUpdate}
                            depth={depth + 1}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};
