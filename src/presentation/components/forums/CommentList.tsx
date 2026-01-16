import React, { useState, useEffect } from 'react';
import { forumsService } from '../../../application/services/ForumsService';
import type { Comment } from '../../../domain/entities/forumTypes';
import { CommentItem } from './CommentItem';
import { CreateCommentForm } from './CreateCommentForm';

interface CommentListProps {
    hiloId: string;
    canModerate: boolean;
    canPost: boolean;
    currentUserId: string;
    onUpdate?: () => void;
}

/**
 * CommentList Component
 * Displays comments with nested replies
 */
export const CommentList: React.FC<CommentListProps> = ({
    hiloId,
    canModerate,
    canPost,
    currentUserId,
    onUpdate,
}) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadComments();
    }, [hiloId]);

    const loadComments = async () => {
        try {
            setIsLoading(true);
            setError(null);
            const data = await forumsService.getComments(hiloId);

            // Build nested structure
            const nested = buildNestedComments(data);
            setComments(nested);
        } catch (err: any) {
            setError(err.message || 'Error loading comments');
        } finally {
            setIsLoading(false);
        }
    };

    const buildNestedComments = (flatComments: Comment[]): Comment[] => {
        const commentMap = new Map<string, Comment>();
        const rootComments: Comment[] = [];

        // First pass: create map
        flatComments.forEach((comment) => {
            commentMap.set(comment.id, { ...comment, replies: [] });
        });

        // Second pass: build tree
        flatComments.forEach((comment) => {
            const commentWithReplies = commentMap.get(comment.id)!;

            if (comment.comentarioPadreId) {
                const parent = commentMap.get(comment.comentarioPadreId);
                if (parent) {
                    parent.replies = parent.replies || [];
                    parent.replies.push(commentWithReplies);
                } else {
                    rootComments.push(commentWithReplies);
                }
            } else {
                rootComments.push(commentWithReplies);
            }
        });

        return rootComments;
    };

    if (isLoading) {
        return (
            <div className="text-center py-3">
                <div className="spinner-border spinner-border-sm text-primary" role="status">
                    <span className="visually-hidden">Loading comments...</span>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="alert alert-danger alert-sm" role="alert">
                {error}
            </div>
        );
    }

    return (
        <div className="comment-list">
            {/* Create Comment Form */}
            {canPost && (
                <CreateCommentForm
                    hiloId={hiloId}
                    autorId={currentUserId}
                    onCommentCreated={() => {
                        loadComments();
                        onUpdate?.();
                    }}
                />
            )}

            {/* Comments */}
            {comments.length === 0 ? (
                <p className="text-muted text-center py-3">
                    No hay comentarios todavía. {canPost && '¡Sé el primero en comentar!'}
                </p>
            ) : (
                comments.map((comment) => (
                    <CommentItem
                        key={comment.id}
                        comment={comment}
                        hiloId={hiloId}
                        canModerate={canModerate}
                        canPost={canPost}
                        currentUserId={currentUserId}
                        onUpdate={() => {
                            loadComments();
                            onUpdate?.();
                        }}
                        depth={0}
                    />
                ))
            )}
        </div>
    );
};
