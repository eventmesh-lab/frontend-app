import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuth from "../contexts/Auth";
import {
    ArrowLeft,
    Send,
    Loader2,
    HelpCircle,
    CheckCircle2,
    AlertCircle
} from 'lucide-react';

// --- Interfaces ---

// DTOs de Entrada (GET Survey Structure)
interface QuestionDtoResponse {
    id: string;
    question: string;
}

interface SurveyAndQuestionDtoResponse {
    idSurvey: string;
    titulo: string;
    questions: QuestionDtoResponse[];
}

// Opciones del Enum para la UI
const RATING_OPTIONS = [
    { value: 1, label: 'Mediocre', colorClass: 'hover:bg-red-100 hover:border-red-300 text-red-700', activeClass: 'bg-red-600 text-white border-red-600' },
    { value: 2, label: 'Malo', colorClass: 'hover:bg-orange-100 hover:border-orange-300 text-orange-700', activeClass: 'bg-orange-500 text-white border-orange-500' },
    { value: 3, label: 'Regular', colorClass: 'hover:bg-yellow-100 hover:border-yellow-300 text-yellow-700', activeClass: 'bg-yellow-500 text-white border-yellow-500' },
    { value: 4, label: 'Excelente', colorClass: 'hover:bg-blue-100 hover:border-blue-300 text-blue-700', activeClass: 'bg-blue-600 text-white border-blue-600' },
    { value: 5, label: 'Extraordinario', colorClass: 'hover:bg-green-100 hover:border-green-300 text-green-700', activeClass: 'bg-green-600 text-white border-green-600' },
];

const AnswerSurveyPage: React.FC = () => {
    const { idSurvey } = useParams<{ idSurvey: string }>(); // ID de la encuesta desde la URL
    // Asumimos que 'username' es el email según tu indicación
    const { username, isAuthenticated } = useAuth() as { username: string, isAuthenticated: boolean };
    const navigate = useNavigate();

    // Estados de Datos
    const [surveyData, setSurveyData] = useState<SurveyAndQuestionDtoResponse | null>(null);

    // Estado del Formulario: Mapa de { preguntaId: valor (1-5) }
    const [answers, setAnswers] = useState<Record<string, number>>({});

    // Estados de UI
    const [loading, setLoading] = useState<boolean>(true);
    const [submitting, setSubmitting] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<boolean>(false);

    // --- 1. Obtener Estructura de Encuesta ---
    useEffect(() => {
        const fetchSurvey = async () => {
            if (!idSurvey) return;
            setLoading(true);
            try {
                // Solo obtenemos las preguntas, ya no necesitamos buscar el ID del usuario
                const surveyRes = await axios.get<SurveyAndQuestionDtoResponse>(
                    `http://localhost:7186/api/surveys/detailSurveyQuestion/${idSurvey}`
                );
                setSurveyData(surveyRes.data);

            } catch (err) {
                console.error(err);
                setError("No se pudo cargar la encuesta. Intenta nuevamente.");
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated) fetchSurvey();
    }, [isAuthenticated, idSurvey]);

    // --- Handlers ---

    const handleSelectOption = (questionId: string, value: number) => {
        setAnswers(prev => ({
            ...prev,
            [questionId]: value
        }));
    };

    const handleSubmit = async () => {
        // Validamos username (email) en lugar de userId
        if (!username || !surveyData) {
            setError("No se ha identificado el usuario o la encuesta.");
            return;
        }

        setSubmitting(true);
        setError(null);

        try {
            // Creamos un array de promesas para enviar cada respuesta individualmente
            const promises = surveyData.questions.map(question => {
                const payload = {
                    EncuestaId: surveyData.idSurvey,
                    PreguntaId: question.id,
                    email: username, // <--- CAMBIO AQUÍ: Usamos el email (username) directamente
                    Valor: answers[question.id]
                };
                return axios.post('http://localhost:7186/api/surveys/registerRespuesta', payload);
            });

            // Esperamos a que todas se envíen
            await Promise.all(promises);

            setSuccess(true);

            setTimeout(() => {
                navigate('/misEncuestas');
            }, 2000);

        } catch (err: any) {
            console.error(err);
            // Manejo de errores más robusto basado en tu controlador
            const errorMsg = err.response?.data || "Error al enviar las respuestas.";
            setError(typeof errorMsg === 'string' ? errorMsg : "Error desconocido al procesar la solicitud.");
            setSubmitting(false);
        }
    };

    // --- Validaciones ---
    const allAnswered = surveyData?.questions.every(q => answers[q.id] !== undefined);
    const progress = surveyData ? (Object.keys(answers).length / surveyData.questions.length) * 100 : 0;

    // --- Render ---

    if (loading) return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin text-blue-600" /></div>;
    if (error && !surveyData) return <div className="p-8 text-center text-red-600">{error}</div>;
    if (!surveyData) return null;

    if (success) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
                <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center animate-in fade-in zoom-in duration-300">
                    <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="w-8 h-8 text-green-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">¡Gracias por tu opinión!</h2>
                    <p className="text-gray-500">Tus respuestas han sido registradas correctamente.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto">

                {/* Botón Volver */}
                <button
                    onClick={() => navigate(-1)}
                    className="flex items-center text-gray-500 hover:text-gray-700 mb-6 transition-colors"
                >
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Volver a mis encuestas
                </button>

                {/* Header de la Encuesta */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8 mb-6 relative overflow-hidden">
                    <div className="absolute top-0 left-0 h-1 bg-blue-600 transition-all duration-500" style={{ width: `${progress}%` }}></div>
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">{surveyData.titulo}</h1>
                    <p className="text-gray-500 flex items-center gap-2">
                        <HelpCircle className="w-4 h-4" />
                        Por favor, califica cada aspecto del 1 al 5.
                    </p>
                </div>

                {/* Lista de Preguntas */}
                <div className="space-y-6">
                    {surveyData.questions.map((q, index) => (
                        <div key={q.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 transition-all hover:shadow-md">
                            <div className="mb-4">
                                <span className="text-xs font-semibold text-blue-600 bg-blue-50 px-2 py-1 rounded mb-2 inline-block">
                                    Pregunta {index + 1}
                                </span>
                                <h3 className="text-lg font-medium text-gray-900">{q.question}</h3>
                            </div>

                            {/* Opciones de Respuesta (Chips/Botones) */}
                            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                                {RATING_OPTIONS.map((option) => {
                                    const isSelected = answers[q.id] === option.value;
                                    return (
                                        <button
                                            key={option.value}
                                            onClick={() => handleSelectOption(q.id, option.value)}
                                            className={`
                                                flex flex-col items-center justify-center p-3 rounded-lg border text-sm font-medium transition-all duration-200
                                                ${isSelected
                                                    ? option.activeClass + ' ring-2 ring-offset-2 ring-opacity-50 shadow-md transform scale-105'
                                                    : 'bg-white border-gray-200 text-gray-600 ' + option.colorClass
                                                }
                                            `}
                                        >
                                            <span className="text-lg font-bold mb-1">{option.value}</span>
                                            <span className="text-xs">{option.label}</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer / Submit */}
                <div className="mt-8 flex flex-col items-end gap-4">
                    {error && (
                        <div className="flex items-center text-red-600 bg-red-50 px-4 py-2 rounded-lg">
                            <AlertCircle className="w-5 h-5 mr-2" />
                            {error}
                        </div>
                    )}

                    <button
                        onClick={handleSubmit}
                        disabled={!allAnswered || submitting}
                        className={`
                            flex items-center justify-center px-8 py-3 rounded-lg font-bold text-white shadow-sm transition-all
                            ${!allAnswered || submitting
                                ? 'bg-gray-300 cursor-not-allowed'
                                : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg transform hover:-translate-y-0.5'
                            }
                        `}
                    >
                        {submitting ? (
                            <>
                                <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                Enviando...
                            </>
                        ) : (
                            <>
                                Enviar Encuesta
                                <Send className="w-5 h-5 ml-2" />
                            </>
                        )}
                    </button>
                    {!allAnswered && (
                        <p className="text-sm text-gray-400">Responde todas las preguntas para continuar.</p>
                    )}
                </div>

            </div>
        </div>
    );
};

export default AnswerSurveyPage;