import React, { useEffect, useState } from 'react';
import axios from 'axios';
import useAuth from "../contexts/Auth";
import { Ticket, Mail, Sparkles, Loader2, Check, AlertCircle, Gift } from 'lucide-react';

// --- Interfaces ---
// ACTUALIZADO: La propiedad ahora es 'email' (minúscula) para coincidir con tu DTO
interface GenerateCouponDto {
    email: string;
}

interface ResultadoDTO {
    mensaje: string;
    exito: boolean;
}

const GenerateCouponPage: React.FC = () => {
    const { username, isAuthenticated } = useAuth() as { username: string, isAuthenticated: boolean };

    // --- Estados ---
    const [email, setEmail] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Auto-rellenar email si está logueado
    useEffect(() => {
        if (isAuthenticated && username) {
            setEmail(username);
        }
    }, [isAuthenticated, username]);

    // --- Handler ---
    const handleGenerateCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        setFeedback(null);

        // Validación simple
        if (!email || !email.includes('@')) {
            setFeedback({ type: 'error', text: 'Por favor ingresa un correo válido.' });
            return;
        }

        setLoading(true);

        // PAYLOAD: Ahora usamos la clave 'email' en minúscula
        const payload: GenerateCouponDto = { email: email };

        try {
            const response = await axios.post<ResultadoDTO>(
                'http://localhost:7185/api/coupons/generateCoupon',
                payload
            );

            // ÉXITO (200 OK)
            setFeedback({ type: 'success', text: response.data.mensaje });

        } catch (error: any) {
            console.error(error);

            // ERROR (400 BadRequest - Regla de 15 días u otros errores)
            const msg = error.response?.data?.mensaje || 'Error al conectar con el servidor.';
            setFeedback({ type: 'error', text: msg });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">

                {/* Icono Principal (Azul) */}
                <div className="mx-auto h-16 w-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 ring-8 ring-blue-50">
                    <Sparkles className="h-8 w-8 text-blue-600" />
                </div>

                <h2 className="text-center text-3xl font-extrabold text-gray-900">
                    Generar Cupón de Regalo
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Ingresa el correo para asignar un descuento aleatorio.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow-sm border border-gray-200 rounded-xl sm:px-10 relative overflow-hidden">

                    {/* Fondo Decorativo (Azul) */}
                    <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-blue-50 rounded-full blur-2xl opacity-50 pointer-events-none"></div>

                    <form className="space-y-6" onSubmit={handleGenerateCoupon}>

                        {/* Input Email */}
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Correo Electrónico
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Mail className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="usuario@ejemplo.com"
                                    className="focus:ring-blue-500 focus:border-blue-500 block w-full pl-10 sm:text-sm border-gray-300 rounded-lg py-3"
                                />
                            </div>
                        </div>

                        {/* Feedback (Mensajes de Error/Éxito) */}
                        {feedback && (
                            <div className={`rounded-md p-4 flex items-start gap-3 ${feedback.type === 'success'
                                ? 'bg-green-50 text-green-800 border border-green-200'
                                : 'bg-red-50 text-red-800 border border-red-200'
                                }`}>
                                {feedback.type === 'success'
                                    ? <Check className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                    : <AlertCircle className="h-5 w-5 mt-0.5 flex-shrink-0" />
                                }
                                <div className="text-sm font-medium">
                                    {feedback.text}
                                </div>
                            </div>
                        )}

                        {/* Botón (Azul) */}
                        <div>
                            <button
                                type="submit"
                                disabled={loading}
                                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-all
                                    ${loading
                                        ? 'bg-blue-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                    }`}
                            >
                                {loading ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Generando...
                                    </>
                                ) : (
                                    <>
                                        <Gift className="w-5 h-5 mr-2" />
                                        Generar Cupón
                                    </>
                                )}
                            </button>
                        </div>
                    </form>

                    {/* Footer */}
                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">
                                    <Ticket className="w-4 h-4 inline-block mr-1" />
                                    Sistema de Promociones
                                </span>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default GenerateCouponPage;