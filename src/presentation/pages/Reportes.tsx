import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams } from 'react-router-dom'; // <--- Importante para leer la URL
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
    Area, AreaChart
} from 'recharts';
import {
    DollarSign, Users, Calendar, Activity,
    CreditCard, FileText, AlertCircle, Loader2, Hash
} from 'lucide-react';

// --- Interfaces (Iguales que antes) ---
interface DetallePagoReporteDto {
    idPago: string;
    idUsuario: string;
    montoPago: number;
    metodoPago: string;
    hora: string;
}

interface ReportePagosPorDiaDto {
    fecha: string;
    totalDelDia: number;
    cantidadTransacciones: number;
    pagos: DetallePagoReporteDto[];
}

interface PromedioQuestionDto {
    questionId: string;
    questionText: string;
    promedioCalculado: number;
    cantidadRespuestas: number;
}

interface PromedioEventSurveyDto {
    eventoId: string;
    surveyId: string;
    surveyTitle: string;
    questionsStats: PromedioQuestionDto[];
}

// --- Componentes de UI ---
const Card = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
    <div className={`bg-white rounded-xl shadow-sm border border-slate-100 p-6 ${className}`}>
        {children}
    </div>
);

const StatCard = ({ title, value, icon: Icon, color }: { title: string; value: string | number; icon: any; color: string }) => (
    <Card className="flex items-center space-x-4 hover:shadow-md transition-shadow duration-300">
        <div className={`p-3 rounded-full ${color} bg-opacity-10`}>
            <Icon className={`w-6 h-6 ${color.replace('bg-', 'text-')}`} />
        </div>
        <div>
            <p className="text-sm font-medium text-slate-500">{title}</p>
            <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        </div>
    </Card>
);

// --- Componente Principal ---

const EventReportsDashboard = () => {
    // 1. Obtener el ID de la URL
    const { eventId } = useParams<{ eventId: string }>();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState<'financial' | 'survey'>('financial');
    const [financialData, setFinancialData] = useState<ReportePagosPorDiaDto[] | null>(null);
    const [surveyData, setSurveyData] = useState<PromedioEventSurveyDto | null>(null);

    // 2. Efecto para cargar datos automáticamente al montar o cambiar el ID
    useEffect(() => {
        const fetchReports = async () => {
            if (!eventId) {
                setError("No se especificó un ID de evento en la URL.");
                return;
            }

            setLoading(true);
            setError('');

            try {
                // Llamada 1: Pagos
                const pagosRes = await axios.get<ReportePagosPorDiaDto[]>(`http://localhost:7187/api/reports/pagosPorEvento/${eventId}`);
                setFinancialData(pagosRes.data);

                // Llamada 2: Encuestas (Manejo de error silencioso si no hay encuestas)
                try {
                    const encuestaRes = await axios.get<PromedioEventSurveyDto>(`http://localhost:7187/api/reports/promedioPorEvento/${eventId}`);
                    setSurveyData(encuestaRes.data);
                } catch (err) {
                    console.warn("Sin datos de encuestas para este evento.");
                }

            } catch (err: any) {
                console.error(err);
                setError("No se pudieron cargar los reportes. Verifica que el ID del evento sea correcto.");
            } finally {
                setLoading(false);
            }
        };

        fetchReports();
    }, [eventId]); // Se ejecuta cada vez que cambia el eventId en la URL

    // Cálculos auxiliares
    const totalIngresos = financialData?.reduce((acc, curr) => acc + curr.totalDelDia, 0) || 0;
    const totalTransacciones = financialData?.reduce((acc, curr) => acc + curr.cantidadTransacciones, 0) || 0;
    const allPayments = financialData?.flatMap(day => day.pagos.map(p => ({ ...p, fecha: day.fecha }))) || [];

    return (
        <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800">
            {/* Header Simplificado (Ya no hay input) */}
            <div className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Panel de Resultados</h1>
                    <div className="flex items-center gap-2 mt-2 text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 text-sm w-fit shadow-sm">
                        <Hash className="w-3 h-3" />
                        <span className="font-mono text-xs">ID: {eventId}</span>
                    </div>
                </div>

                {/* Toggle de Pestañas en el Header */}
                {(financialData || surveyData) && !loading && (
                    <div className="flex space-x-1 bg-slate-200 p-1 rounded-lg mt-4 md:mt-0">
                        <button
                            onClick={() => setActiveTab('financial')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'financial' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            Financiero
                        </button>
                        <button
                            onClick={() => setActiveTab('survey')}
                            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'survey' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
                                }`}
                        >
                            Encuestas
                        </button>
                    </div>
                )}
            </div>

            {/* Loading State */}
            {loading && (
                <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                    <Loader2 className="animate-spin w-10 h-10 mb-2 text-blue-600" />
                    <p>Generando métricas del evento...</p>
                </div>
            )}

            {/* Error Message */}
            {error && !loading && (
                <div className="max-w-7xl mx-auto mb-6 p-6 bg-white border border-red-100 rounded-xl shadow-sm flex flex-col items-center justify-center text-center">
                    <div className="bg-red-50 p-3 rounded-full mb-3">
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-800">Error al cargar datos</h3>
                    <p className="text-slate-500 mt-1 max-w-md">{error}</p>
                </div>
            )}

            {/* Main Content */}
            {!loading && !error && (
                <div className="max-w-7xl mx-auto">

                    {/* VISTA FINANCIERA */}
                    {activeTab === 'financial' && financialData && (
                        <div className="space-y-6 animate-fadeIn">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <StatCard title="Ingresos Totales" value={`$${totalIngresos.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} icon={DollarSign} color="bg-emerald-500 text-emerald-600" />
                                <StatCard title="Transacciones" value={totalTransacciones} icon={CreditCard} color="bg-blue-500 text-blue-600" />
                                <StatCard title="Días Activos" value={financialData.length} icon={Calendar} color="bg-purple-500 text-purple-600" />
                            </div>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                                <Card className="lg:col-span-2">
                                    <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
                                        <Activity className="w-5 h-5 text-blue-600" /> Evolución de Ingresos
                                    </h3>
                                    <div className="h-[300px] w-full">
                                        <ResponsiveContainer width="100%" height="100%">
                                            <AreaChart data={financialData}>
                                                <defs>
                                                    <linearGradient id="colorIngresos" x1="0" y1="0" x2="0" y2="1">
                                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                                    </linearGradient>
                                                </defs>
                                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                                <XAxis dataKey="fecha" tickFormatter={(str) => new Date(str).toLocaleDateString()} stroke="#64748b" fontSize={12} />
                                                <YAxis stroke="#64748b" fontSize={12} />
                                                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} formatter={(value: number) => [`$${value.toFixed(2)}`, 'Ingresos']} />
                                                <Area type="monotone" dataKey="totalDelDia" stroke="#2563eb" fillOpacity={1} fill="url(#colorIngresos)" />
                                            </AreaChart>
                                        </ResponsiveContainer>
                                    </div>
                                </Card>

                                <Card>
                                    <h3 className="text-lg font-semibold mb-4">Métodos de Pago</h3>
                                    <div className="space-y-4">
                                        {Array.from(new Set(allPayments.map(p => p.metodoPago))).map(method => {
                                            const total = allPayments.filter(p => p.metodoPago === method).reduce((a, b) => a + b.montoPago, 0);
                                            const percentage = totalIngresos > 0 ? (total / totalIngresos) * 100 : 0;
                                            return (
                                                <div key={method}>
                                                    <div className="flex justify-between text-sm mb-1">
                                                        <span className="font-medium text-slate-700">{method}</span>
                                                        <span className="text-slate-500">${total.toLocaleString()}</span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 rounded-full h-2">
                                                        <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${percentage}%` }}></div>
                                                    </div>
                                                </div>
                                            )
                                        })}
                                    </div>
                                </Card>
                            </div>

                            <Card>
                                <h3 className="text-lg font-semibold mb-4">Detalle de Transacciones</h3>
                                <div className="overflow-x-auto">
                                    <table className="w-full text-left">
                                        <thead>
                                            <tr className="border-b border-slate-200 text-slate-500 text-sm">
                                                <th className="pb-3 pl-2 font-medium">Fecha</th>
                                                <th className="pb-3 font-medium">Usuario</th>
                                                <th className="pb-3 font-medium">Método</th>
                                                <th className="pb-3 pr-2 text-right font-medium">Monto</th>
                                            </tr>
                                        </thead>
                                        <tbody className="text-sm">
                                            {allPayments.map((pago) => (
                                                <tr key={pago.idPago} className="border-b border-slate-100 hover:bg-slate-50">
                                                    <td className="py-3 pl-2 text-slate-600">{new Date(pago.hora).toLocaleDateString()}</td>
                                                    <td className="py-3 text-slate-600 font-mono text-xs">{pago.idUsuario.substring(0, 8)}...</td>
                                                    <td className="py-3"><span className="bg-slate-100 px-2 py-1 rounded text-xs">{pago.metodoPago}</span></td>
                                                    <td className="py-3 pr-2 text-right font-bold text-slate-700">${pago.montoPago.toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </Card>
                        </div>
                    )}

                    {/* VISTA ENCUESTAS */}
                    {activeTab === 'survey' && (
                        <div className="animate-fadeIn">
                            {!surveyData ? (
                                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-500">No hay datos de encuestas disponibles.</p>
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    <div className="bg-gradient-to-r from-indigo-600 to-violet-600 rounded-xl p-8 text-white shadow-lg">
                                        <h2 className="text-2xl font-bold mb-2">{surveyData.surveyTitle}</h2>
                                        <p className="opacity-90">Resultados de satisfacción del evento.</p>
                                    </div>
                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                        <Card>
                                            <h3 className="text-lg font-semibold mb-6 text-slate-700">Promedio por Pregunta</h3>
                                            <div className="h-[400px] w-full">
                                                <ResponsiveContainer width="100%" height="100%">
                                                    <BarChart layout="vertical" data={surveyData.questionsStats} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                                        <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                                                        <XAxis type="number" domain={[0, 5]} hide />
                                                        <YAxis dataKey="questionText" type="category" width={150} tick={{ fontSize: 11, fill: '#64748b' }} />
                                                        <RechartsTooltip cursor={{ fill: '#f1f5f9' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                                        <Bar dataKey="promedioCalculado" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={20} />
                                                    </BarChart>
                                                </ResponsiveContainer>
                                            </div>
                                        </Card>
                                        <div className="grid grid-cols-1 gap-4">
                                            {surveyData.questionsStats.map((q) => (
                                                <Card key={q.questionId} className="flex flex-col justify-center border-l-4 border-l-indigo-500">
                                                    <div className="flex justify-between items-start mb-2">
                                                        <h4 className="text-sm font-medium text-slate-500 w-3/4">{q.questionText}</h4>
                                                        <span className="bg-indigo-50 text-indigo-700 text-xs px-2 py-1 rounded-full flex items-center gap-1">
                                                            <Users className="w-3 h-3" /> {q.cantidadRespuestas}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-end gap-2">
                                                        <span className="text-4xl font-bold text-slate-800">{q.promedioCalculado.toFixed(1)}</span>
                                                        <span className="text-sm text-slate-400 mb-1">/ 5.0</span>
                                                    </div>
                                                    <div className="w-full bg-slate-100 rounded-full h-1.5 mt-3">
                                                        <div className="bg-indigo-500 h-1.5 rounded-full" style={{ width: `${(q.promedioCalculado / 5) * 100}%` }}></div>
                                                    </div>
                                                </Card>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default EventReportsDashboard;