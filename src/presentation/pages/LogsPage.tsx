import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
    ClipboardList, Search, Filter, Calendar,
    AlertCircle, Info, ShieldAlert, Clock,
    ChevronDown, ChevronRight, HardDrive, User
} from 'lucide-react';

interface AuditLogDto {
    id: string;
    eventoId: string;
    servicioOrigen: string;
    usuarioId: string;
    tipoAccion: string;
    datos: any;
    fechaOcurrencia: string;
    nivel: string;
}

const AuditLogsPage = () => {
    const [logs, setLogs] = useState<AuditLogDto[]>([]);
    const [filteredLogs, setFilteredLogs] = useState<AuditLogDto[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedLevel, setSelectedLevel] = useState('All');
    const [expandedLogId, setExpandedLogId] = useState<string | null>(null);

    useEffect(() => {
        fetchLogs();
    }, []);

    const fetchLogs = async () => {
        try {
            const response = await axios.get<AuditLogDto[]>('http://localhost:7188/api/logs');
            setLogs(response.data);
            setFilteredLogs(response.data);
        } catch (error) {
            console.error("Error fetching logs:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        const results = logs.filter(log => {
            const matchesSearch = log.tipoAccion.toLowerCase().includes(searchTerm.toLowerCase()) ||
                log.servicioOrigen.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesLevel = selectedLevel === 'All' || log.nivel === selectedLevel;
            return matchesSearch && matchesLevel;
        });
        setFilteredLogs(results);
    }, [searchTerm, selectedLevel, logs]);

    const getNivelBadge = (nivel: string) => {
        const styles: Record<string, string> = {
            'Information': 'bg-blue-100 text-blue-700 border-blue-200',
            'Warning': 'bg-amber-100 text-amber-700 border-amber-200',
            'Error': 'bg-red-100 text-red-700 border-red-200',
            'Critical': 'bg-purple-100 text-purple-700 border-purple-200'
        };
        return styles[nivel] || 'bg-slate-100 text-slate-700 border-slate-200';
    };

    const getNivelIcon = (nivel: string) => {
        switch (nivel) {
            case 'Error': return <AlertCircle className="w-4 h-4" />;
            case 'Information': return <Info className="w-4 h-4" />;
            case 'Critical': return <ShieldAlert className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 p-6 font-sans">
            <div className="max-w-7xl mx-auto">

                {/* Header Section */}
                <div className="mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-3">
                            <ClipboardList className="text-indigo-600 w-8 h-8" />
                            Auditoría del Sistema
                        </h1>
                        <p className="text-slate-500 mt-1">Monitoreo de eventos, trazas y acciones de usuario en tiempo real.</p>
                    </div>
                    <button
                        onClick={fetchLogs}
                        className="px-4 py-2 bg-white border border-slate-200 text-slate-600 rounded-lg hover:bg-slate-50 transition-colors shadow-sm text-sm font-medium"
                    >
                        Refrescar Logs
                    </button>
                </div>

                {/* Filters Bar */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 mb-6 flex flex-col md:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Buscar por acción o servicio..."
                            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:outline-none transition-all text-sm"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                    <div className="flex items-center gap-2">
                        <Filter className="w-4 h-4 text-slate-400" />
                        <select
                            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            value={selectedLevel}
                            onChange={(e) => setSelectedLevel(e.target.value)}
                        >
                            <option value="All">Todos los niveles</option>
                            <option value="Information">Información</option>
                            <option value="Warning">Advertencia</option>
                            <option value="Error">Error</option>
                            <option value="Critical">Crítico</option>
                        </select>
                    </div>
                </div>

                {/* Logs Table Area */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {loading ? (
                        <div className="p-12 text-center text-slate-400">Cargando registros...</div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full border-collapse">
                                <thead className="bg-slate-50 border-b border-slate-200">
                                    <tr className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                        <th className="px-6 py-4">Evento</th>
                                        <th className="px-6 py-4">Nivel</th>
                                        <th className="px-6 py-4">Servicio / Origen</th>
                                        <th className="px-6 py-4">Usuario</th>
                                        <th className="px-6 py-4">Fecha</th>
                                        <th className="px-6 py-4"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {filteredLogs.map((log) => (
                                        <React.Fragment key={log.id}>
                                            <tr
                                                className={`hover:bg-slate-50 transition-colors cursor-pointer ${expandedLogId === log.id ? 'bg-indigo-50/30' : ''}`}
                                                onClick={() => setExpandedLogId(expandedLogId === log.id ? null : log.id)}
                                            >
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center gap-3">
                                                        {expandedLogId === log.id ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                                                        <span className="font-medium text-slate-700">{log.tipoAccion}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border flex items-center gap-1.5 w-fit ${getNivelBadge(log.nivel)}`}>
                                                        {getNivelIcon(log.nivel)}
                                                        {log.nivel}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    <div className="flex items-center gap-2">
                                                        <HardDrive className="w-4 h-4 text-slate-400" />
                                                        {log.servicioOrigen}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    <div className="flex items-center gap-2">
                                                        <User className="w-4 h-4 text-slate-400" />
                                                        <span className="font-mono text-xs">{log.usuarioId?.substring(0, 8)}...</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-slate-500 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <Calendar className="w-4 h-4 text-slate-400" />
                                                        {new Date(log.fechaOcurrencia).toLocaleString()}
                                                    </div>
                                                </td>
                                            </tr>

                                            {/* Expanded Section for JSON Data */}
                                            {expandedLogId === log.id && (
                                                <tr>
                                                    <td colSpan={6} className="px-12 py-4 bg-slate-50 border-b border-slate-200">
                                                        <div className="bg-slate-900 rounded-lg p-4 shadow-inner">
                                                            <div className="flex justify-between items-center mb-2">
                                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Metadatos del Evento</span>
                                                                <span className="text-[10px] text-slate-500 font-mono">ID: {log.id}</span>
                                                            </div>
                                                            <pre className="text-indigo-300 text-xs overflow-x-auto font-mono leading-relaxed">
                                                                {JSON.stringify(log.datos, null, 2)}
                                                            </pre>
                                                        </div>
                                                        <div className="mt-4 grid grid-cols-2 gap-4 text-xs text-slate-500">
                                                            <p><strong>Evento ID:</strong> {log.eventoId}</p>
                                                            <p><strong>Timestamp:</strong> {log.fechaOcurrencia}</p>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    ))}
                                </tbody>
                            </table>

                            {filteredLogs.length === 0 && (
                                <div className="p-12 text-center text-slate-400 italic">No se encontraron logs con los criterios seleccionados.</div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AuditLogsPage;
