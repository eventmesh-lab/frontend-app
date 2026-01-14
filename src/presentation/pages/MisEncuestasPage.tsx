import React, { useEffect, useState } from 'react';
import axios from 'axios';
import useAuth from "../contexts/Auth";
import { useNavigate } from 'react-router-dom';
import {
    ClipboardList,
    CheckCircle2,
    Loader2,
    Clock,
    Calendar,
    ArrowRight,
    FileText,
    AlertCircle
} from 'lucide-react';

// --- Interfaces ---

interface PendingSurveyDto {
    id: string;
    eventoId: string;
    titulo: string;
    fechaCreacion: string;
}

interface CompletedSurveyDto {
    surveyId: string;
    eventId: string;
    surveyTitle: string;
}

const SurveysPage: React.FC = () => {
    // Asumimos que 'username' es el email, tal como se usaba en el componente de Pagos
    const { username, isAuthenticated } = useAuth() as { username: string, isAuthenticated: boolean };
    const navigate = useNavigate();

    // --- Estados ---
    const [activeTab, setActiveTab] = useState<'pending' | 'completed'>('pending');

    // Datos
    const [pendingSurveys, setPendingSurveys] = useState<PendingSurveyDto[]>([]);
    const [completedSurveys, setCompletedSurveys] = useState<CompletedSurveyDto[]>([]);

    // Loaders
    const [loadingSurveys, setLoadingSurveys] = useState<boolean>(false);

    // --- Obtener Encuestas ---
    // Ya NO necesitamos el useEffect para buscar el UserID, usamos 'username' (email) directamente.
    useEffect(() => {
        const fetchSurveys = async () => {
            if (!username) return;

            setLoadingSurveys(true);
            try {
                if (activeTab === 'pending') {
                    // Endpoint actualizado: usa el email directamente
                    const response = await axios.get<PendingSurveyDto[]>(
                        `http://localhost:7186/api/surveys/pendientes/${username}`
                    );
                    setPendingSurveys(response.data);
                } else {
                    // Endpoint actualizado: usa el email directamente
                    // Nota: Aunque tu controller diga "respondidas/{userId}", al recibir un string email
                    // el framework mapeará la ruta si la llamas así:
                    const response = await axios.get<CompletedSurveyDto[]>(
                        `http://localhost:7186/api/surveys/respondidas/${username}`
                    );
                    setCompletedSurveys(response.data);
                }
            } catch (error) {
                console.error(`Error obteniendo encuestas ${activeTab}:`, error);
            } finally {
                setLoadingSurveys(false);
            }
        };

        if (isAuthenticated && username) {
            fetchSurveys();
        }
    }, [activeTab, username, isAuthenticated]);

    // --- Renderizado de Items (Cards) ---

    const renderPendingCard = (survey: PendingSurveyDto) => (
        <div key={survey.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow duration-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-blue-50 rounded-lg text-blue-600">
                    <Clock className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900">{survey.titulo}</h3>
                    <div className="flex items-center gap-2 mt-1 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>Asignada el: {new Date(survey.fechaCreacion).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>
            <button
                onClick={() => navigate(`/encuesta/respuesta/${survey.id}`)}
                className="w-full md:w-auto px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
            >
                Responder Encuesta
                <ArrowRight className="w-4 h-4" />
            </button>
        </div>
    );

    const renderCompletedCard = (survey: CompletedSurveyDto) => (
        <div key={survey.surveyId} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 opacity-90 hover:opacity-100 transition-opacity">
            <div className="flex items-start gap-4">
                <div className="p-3 bg-green-50 rounded-lg text-green-600">
                    <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-lg font-bold text-gray-900">{survey.surveyTitle}</h3>
                    <p className="text-sm text-gray-500 mt-1">Gracias por tu opinión.</p>
                </div>
            </div>
            <button
                onClick={() => navigate(`/encuesta/resultado/${survey.eventId}`)}
                className="w-full md:w-auto px-5 py-2.5 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
            >
                <FileText className="w-4 h-4" />
                Ver Mis Respuestas
            </button>
        </div>
    );

    if (!isAuthenticated) return <div className="p-12 text-center text-gray-500">Inicia sesión para ver tus encuestas.</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Header */}
                <div className="text-center space-y-2">
                    <h2 className="text-3xl font-bold text-gray-900">Mis Encuestas</h2>
                    <p className="text-gray-500">Gestiona tus valoraciones de eventos y consulta tu historial</p>
                </div>

                {/* --- TOGGLE BUTTONS --- */}
                <div className="flex justify-center">
                    <div className="bg-white p-1 rounded-xl shadow-sm border border-gray-200 inline-flex">
                        <button
                            onClick={() => setActiveTab('pending')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'pending'
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <ClipboardList className="w-4 h-4" />
                            Por Responder
                            {!loadingSurveys && activeTab === 'pending' && pendingSurveys.length > 0 && (
                                <span className="ml-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded-full">
                                    {pendingSurveys.length}
                                </span>
                            )}
                        </button>

                        <button
                            onClick={() => setActiveTab('completed')}
                            className={`flex items-center gap-2 px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${activeTab === 'completed'
                                    ? 'bg-green-600 text-white shadow-md'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                                }`}
                        >
                            <CheckCircle2 className="w-4 h-4" />
                            Respondidas
                        </button>
                    </div>
                </div>

                {/* --- CONTENIDO DINÁMICO --- */}
                <div className="min-h-[300px]">
                    {loadingSurveys ? (
                        <div className="flex flex-col items-center justify-center py-12 space-y-3">
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            <p className="text-sm text-gray-500">Cargando encuestas...</p>
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {/* ESTADO VACÍO */}
                            {activeTab === 'pending' && pendingSurveys.length === 0 && (
                                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                                    <div className="bg-blue-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2 className="w-6 h-6 text-blue-500" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900">¡Estás al día!</h3>
                                    <p className="text-gray-500">No tienes encuestas pendientes por responder.</p>
                                </div>
                            )}

                            {activeTab === 'completed' && completedSurveys.length === 0 && (
                                <div className="text-center py-16 bg-white rounded-xl border border-dashed border-gray-300">
                                    <div className="bg-gray-50 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <AlertCircle className="w-6 h-6 text-gray-400" />
                                    </div>
                                    <h3 className="text-lg font-medium text-gray-900">Historial vacío</h3>
                                    <p className="text-gray-500">Aún no has completado ninguna encuesta.</p>
                                </div>
                            )}

                            {/* LISTAS */}
                            {activeTab === 'pending'
                                ? pendingSurveys.map(renderPendingCard)
                                : completedSurveys.map(renderCompletedCard)
                            }
                        </div>
                    )}
                </div>

            </div>
        </div>
    );
};

export default SurveysPage;