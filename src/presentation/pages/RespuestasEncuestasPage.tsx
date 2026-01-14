import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuth from "../contexts/Auth";
import {
    ArrowLeft,
    Calendar,
    Star,
    Loader2,
    AlertCircle
} from 'lucide-react';

// --- Interfaces ---
interface QuestionAnswerDetailDto {
    questionId: string;
    questionText: string;
    answerValue: string;
    answerDate?: string;
}

interface SurveyResultByEventDto {
    surveyId: string;
    surveyTitle: string;
    eventId: string;
    details: QuestionAnswerDetailDto[];
}

// --- CONFIGURACIÓN DE COLORES ESTÁTICA ---
// Definimos esto FUERA del componente para que Tailwind lo lea sí o sí.
const RATING_STYLES: Record<number, { text: string; border: string; label: string; fill: string }> = {
    1: {
        label: 'Mediocre',
        text: 'text-red-600',       // Color del texto
        border: 'border-red-200',   // Color del borde
        fill: 'fill-red-600'        // Color de relleno de la estrella
    },
    2: {
        label: 'Malo',
        text: 'text-red-600',
        border: 'border-red-200',
        fill: 'fill-red-600'
    },
    3: {
        label: 'Regular',
        text: 'text-yellow-500',
        border: 'border-yellow-200',
        fill: 'fill-yellow-500'
    },
    4: {
        label: 'Excelente',
        text: 'text-blue-600',
        border: 'border-blue-200',
        fill: 'fill-blue-600'
    },
    5: {
        label: 'Extraordinario',
        text: 'text-green-600',
        border: 'border-green-200',
        fill: 'fill-green-600'
    }
};

const DEFAULT_STYLE = {
    label: '-',
    text: 'text-slate-400',
    border: 'border-slate-300',
    fill: 'fill-slate-300'
};

const SurveyResultPage: React.FC = () => {
    const { eventId } = useParams<{ eventId: string }>();
    const { username, isAuthenticated } = useAuth() as { username: string, isAuthenticated: boolean };
    const navigate = useNavigate();

    const [result, setResult] = useState<SurveyResultByEventDto | null>(null);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchResults = async () => {
            if (!eventId || !username) return;
            setLoading(true);
            try {
                const response = await axios.get<SurveyResultByEventDto>(
                    `http://localhost:7186/api/surveys/respuestasEventoUsuario/${eventId}/${username}`
                );
                setResult(response.data);
            } catch (err: any) {
                if (err.response?.status === 404) {
                    setError("No has respondido la encuesta para este evento todavía.");
                } else {
                    setError("Hubo un problema al cargar tus respuestas.");
                }
            } finally {
                setLoading(false);
            }
        };

        if (isAuthenticated) fetchResults();
    }, [eventId, username, isAuthenticated]);

    if (loading) return <div className="min-h-screen flex items-center justify-center bg-gray-50"><Loader2 className="w-8 h-8 animate-spin text-slate-600" /></div>;

    if (error) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center border border-gray-100">
                <AlertCircle className="w-10 h-10 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-bold text-gray-900 mb-2">Aviso</h3>
                <p className="text-gray-500 mb-6">{error}</p>
                <button onClick={() => navigate(-1)} className="text-blue-600 font-bold hover:underline">Volver atrás</button>
            </div>
        </div>
    );

    if (!result) return null;

    return (
        <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-5xl mx-auto space-y-6">

                {/* Header */}
                <div className="bg-white rounded-2xl p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-start gap-6">
                    <div className="space-y-4">
                        <span className="inline-block px-3 py-1 rounded bg-indigo-50 text-indigo-700 text-xs font-bold tracking-wider uppercase">
                            RESULTADOS
                        </span>
                        <h1 className="text-3xl font-extrabold text-slate-900 leading-tight">
                            {result.surveyTitle}
                        </h1>
                    </div>

                    <div className="bg-slate-50 rounded-xl p-4 flex items-center gap-4 border border-slate-100 min-w-[220px]">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold text-lg">
                            {username.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex flex-col">
                            <span className="text-sm font-bold text-slate-900">Mis Respuestas</span>
                            <span className="text-xs text-slate-500 truncate max-w-[160px]">{username}</span>
                        </div>
                    </div>
                </div>

                {/* Lista de Preguntas */}
                <div className="space-y-4">
                    {result.details.map((detail) => {
                        // Obtenemos el número
                        const num = parseInt(detail.answerValue, 10);
                        // Buscamos los estilos directamente en el objeto constante
                        const styles = !isNaN(num) ? (RATING_STYLES[num] || DEFAULT_STYLE) : DEFAULT_STYLE;
                        // Si viene texto en vez de número, lo usamos como label
                        const label = isNaN(num) ? detail.answerValue : styles.label;

                        return (
                            <div
                                key={detail.questionId}
                                className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-slate-200 flex flex-col md:flex-row justify-between items-center md:items-start gap-6"
                            >
                                {/* Izquierda: Pregunta */}
                                <div className="flex-1 space-y-2 text-center md:text-left w-full">
                                    <h3 className="text-lg font-bold text-slate-800">
                                        {detail.questionText}
                                    </h3>
                                    {detail.answerDate && (
                                        <div className="flex items-center justify-center md:justify-start gap-2 text-sm text-slate-400 font-medium">
                                            <Calendar className="w-4 h-4" />
                                            <span>{new Date(detail.answerDate).toLocaleDateString()}</span>
                                        </div>
                                    )}
                                </div>

                                {/* Derecha: Input Visual con COLORES */}
                                <div className="flex flex-col items-end w-full md:w-auto">

                                    {/* CAJA CON BORDE DE COLOR */}
                                    <div className={`flex items-center justify-between gap-6 px-4 py-3 bg-white border rounded-lg w-full md:min-w-[240px] ${styles.border}`}>

                                        {/* ESTRELLAS */}
                                        <div className="flex gap-1">
                                            {[1, 2, 3, 4, 5].map((star) => (
                                                <Star
                                                    key={star}
                                                    // Usamos las clases EXACTAS definidas en el objeto
                                                    className={`w-5 h-5 transition-colors duration-300 ${star <= num
                                                            ? `${styles.text} ${styles.fill}` // Color activo
                                                            : 'text-slate-200 fill-slate-50'  // Color inactivo
                                                        }`}
                                                />
                                            ))}
                                        </div>

                                        {/* TEXTO DENTRO DE LA CAJA */}
                                        <span className={`text-sm font-bold lowercase first-letter:uppercase ${styles.text}`}>
                                            {label}
                                        </span>
                                    </div>

                                    {/* ETIQUETA DEBAJO (MAYÚSCULAS) */}
                                    <span className={`mt-2 text-xs font-black uppercase tracking-widest ${styles.text}`}>
                                        {label}
                                    </span>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="flex justify-center pt-6 pb-12">
                    <button
                        onClick={() => navigate(-1)}
                        className="text-slate-400 hover:text-slate-600 text-sm font-medium flex items-center gap-2 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Volver al evento
                    </button>
                </div>

            </div>
        </div>
    );
};

export default SurveyResultPage;