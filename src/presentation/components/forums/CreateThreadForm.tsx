import React, { useState } from 'react';
import { forumsService } from '../../../application/services/ForumsService';

interface CreateThreadFormProps {
    foroId: string;
    autorId: string;
    onThreadCreated?: () => void;
}

/**
 * CreateThreadForm Component
 * Form for creating new threads (only visible to users with tickets)
 */
export const CreateThreadForm: React.FC<CreateThreadFormProps> = ({
    foroId,
    autorId,
    onThreadCreated,
}) => {
    const [titulo, setTitulo] = useState('');
    const [contenido, setContenido] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isExpanded, setIsExpanded] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!titulo.trim() || !contenido.trim()) {
            setError('Título y contenido son requeridos');
            return;
        }

        try {
            setIsSubmitting(true);
            setError(null);

            await forumsService.createThread(foroId, autorId, titulo, contenido);

            // Clear form
            setTitulo('');
            setContenido('');
            setIsExpanded(false);

            // Notify parent
            onThreadCreated?.();
        } catch (err: any) {
            setError(err.message || 'Error creating thread');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isExpanded) {
        return (
            <div className="card mb-4">
                <div className="card-body">
                    <button
                        className="btn btn-primary w-100"
                        onClick={() => setIsExpanded(true)}
                    >
                        + Crear Nuevo Hilo
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="card mb-4">
            <div className="card-header">
                <h5 className="mb-0">Crear Nuevo Hilo</h5>
            </div>
            <div className="card-body">
                <form onSubmit={handleSubmit}>
                    {error && (
                        <div className="alert alert-danger" role="alert">
                            {error}
                        </div>
                    )}

                    <div className="mb-3">
                        <label htmlFor="thread-title" className="form-label">
                            Título
                        </label>
                        <input
                            type="text"
                            className="form-control"
                            id="thread-title"
                            value={titulo}
                            onChange={(e) => setTitulo(e.target.value)}
                            placeholder="¿Cuál es tu pregunta?"
                            disabled={isSubmitting}
                            maxLength={200}
                        />
                    </div>

                    <div className="mb-3">
                        <label htmlFor="thread-content" className="form-label">
                            Contenido
                        </label>
                        <textarea
                            className="form-control"
                            id="thread-content"
                            rows={4}
                            value={contenido}
                            onChange={(e) => setContenido(e.target.value)}
                            placeholder="Describe tu pregunta o tema de discusión..."
                            disabled={isSubmitting}
                            maxLength={2000}
                        />
                        <small className="text-muted">
                            {contenido.length}/2000 caracteres
                        </small>
                    </div>

                    <div className="d-flex gap-2">
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={isSubmitting || !titulo.trim() || !contenido.trim()}
                        >
                            {isSubmitting ? 'Publicando...' : 'Publicar Hilo'}
                        </button>
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={() => {
                                setIsExpanded(false);
                                setTitulo('');
                                setContenido('');
                                setError(null);
                            }}
                            disabled={isSubmitting}
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
