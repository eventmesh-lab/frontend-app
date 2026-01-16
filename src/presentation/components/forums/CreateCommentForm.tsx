import React, { useState } from 'react';
import { forumsService } from '../../../application/services/ForumsService';

interface CreateCommentFormProps {
  hiloId: string;
  autorId: string;
  comentarioPadreId?: string | null;
  onCommentCreated?: () => void;
  onCancel?: () => void;
}

/**
 * CreateCommentForm Component
 * Form for creating comments and replies
 */
export const CreateCommentForm: React.FC<CreateCommentFormProps> = ({
  hiloId,
  autorId,
  comentarioPadreId = null,
  onCommentCreated,
  onCancel,
}) => {
  const [contenido, setContenido] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!contenido.trim()) {
      setError('El comentario no puede estar vacío');
      return;
    }

    try {
      setIsSubmitting(true);
      setError(null);

      await forumsService.createComment(hiloId, autorId, contenido, comentarioPadreId);

      // Clear form
      setContenido('');

      // Notify parent
      onCommentCreated?.();
    } catch (err: any) {
      setError(err.message || 'Error creating comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="create-comment-form mb-3">
      {error && (
        <div className="alert alert-danger alert-sm" role="alert">
          {error}
        </div>
      )}

      <div className="mb-2">
        <textarea
          className="form-control form-control-sm"
          rows={3}
          value={contenido}
          onChange={(e) => setContenido(e.target.value)}
          placeholder={comentarioPadreId ? 'Escribe tu respuesta...' : 'Escribe tu comentario...'}
          disabled={isSubmitting}
          maxLength={2000}
        />
        <small className="text-muted">{contenido.length}/2000 caracteres</small>
      </div>

      <div className="d-flex gap-2">
        <button
          type="submit"
          className="btn btn-sm btn-primary"
          disabled={isSubmitting || !contenido.trim()}
        >
          {isSubmitting ? 'Publicando...' : comentarioPadreId ? 'Responder' : 'Comentar'}
        </button>
        {onCancel && (
          <button
            type="button"
            className="btn btn-sm btn-outline-secondary"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancelar
          </button>
        )}
      </div>
    </form>
  );
};
