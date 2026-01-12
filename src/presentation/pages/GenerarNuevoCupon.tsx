import React, { useEffect, useState } from 'react';
import axios from 'axios';
import useAuth from "../contexts/Auth";
import { Ticket, Lock, Sparkles, Loader2, Check, AlertCircle, Gift, X, Copy, Calendar, DollarSign } from 'lucide-react';

// --- Interfaces ---
interface GenerateCouponDto {
    email: string;
}

interface CouponData {
    id: string;
    discountAmount: number;
    expirationDate: string;
    amountMin: number; // <--- 1. NUEVO CAMPO AGREGADO
}

interface ResultadoDTO {
    mensaje: string;
    exito: boolean;
    coupon?: CouponData;
}

const GenerateCouponPage: React.FC = () => {
    const { username, isAuthenticated } = useAuth() as { username: string, isAuthenticated: boolean };

    // --- Estados ---
    const [email, setEmail] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [feedback, setFeedback] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [showModal, setShowModal] = useState<boolean>(false);
    const [generatedCoupon, setGeneratedCoupon] = useState<CouponData | null>(null);

    useEffect(() => {
        if (isAuthenticated && username) {
            setEmail(username);
        }
    }, [isAuthenticated, username]);

    // --- Handlers ---
    const handleGenerateCoupon = async (e: React.FormEvent) => {
        e.preventDefault();
        setFeedback(null);
        setShowModal(false);

        if (!email || !email.includes('@')) {
            setFeedback({ type: 'error', text: 'No se ha detectado un usuario válido.' });
            return;
        }

        setLoading(true);

        const payload: GenerateCouponDto = { email: email };

        try {
            const response = await axios.post<ResultadoDTO>(
                'http://localhost:7185/api/coupons/generateCoupon',
                payload
            );

            if (response.data.exito) {
                setFeedback({ type: 'success', text: response.data.mensaje });
                if (response.data.coupon) {
                    setGeneratedCoupon(response.data.coupon);
                    setShowModal(true);
                }
            } else {
                setFeedback({ type: 'error', text: response.data.mensaje });
            }

        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.mensaje || 'Error al conectar con el servidor.';
            setFeedback({ type: 'error', text: msg });
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        if (generatedCoupon?.id) {
            navigator.clipboard.writeText(generatedCoupon.id);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-blue-50 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">

            {/* Decoración de Fondo */}
            <div className="absolute top-0 right-0 -mt-20 -mr-20 w-96 h-96 bg-gradient-to-br from-blue-400 to-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none animate-blob"></div>
            <div className="absolute bottom-0 left-0 -mb-20 -ml-20 w-96 h-96 bg-gradient-to-tr from-cyan-400 to-sky-300 rounded-full mix-blend-multiply filter blur-3xl opacity-20 pointer-events-none animate-blob animation-delay-2000"></div>

            {/* --- MODAL DEL CUPÓN --- */}
            {showModal && generatedCoupon && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                        onClick={() => setShowModal(false)}
                    ></div>

                    <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden transform transition-all scale-100 animate-in fade-in zoom-in duration-300 z-10">
                        {/* Cabecera del Ticket */}
                        <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-center text-white relative">
                            <button
                                onClick={() => setShowModal(false)}
                                className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors"
                            >
                                <X className="w-6 h-6" />
                            </button>
                            <div className="inline-flex p-3 bg-white/20 rounded-full mb-3 backdrop-blur-md">
                                <Gift className="w-8 h-8 text-white animate-bounce" />
                            </div>
                            <h3 className="text-2xl font-bold">¡Felicidades!</h3>
                            <p className="text-purple-100 text-sm">Has desbloqueado un descuento</p>
                        </div>

                        {/* Cuerpo del Ticket */}
                        <div className="p-6">
                            <div className="text-center mb-5">
                                <span className="block text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-blue-600">
                                    {generatedCoupon.discountAmount}% OFF
                                </span>
                                <span className="text-gray-400 text-sm uppercase tracking-wider font-semibold block mb-2">
                                    En tu próxima reserva
                                </span>

                                {/* --- 2. MOSTRAR MONTO MÍNIMO (Badge) --- */}
                                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-50 border border-green-100 rounded-full text-blue-700 text-xs font-bold">
                                    <DollarSign className="w-3 h-3" />
                                    <span>Compra mínima: ${generatedCoupon.amountMin}</span>
                                </div>
                            </div>

                            {/* Separador */}
                            <div className="relative flex items-center justify-center mb-6">
                                <div className="absolute left-0 -ml-8 w-6 h-6 bg-gray-50 rounded-full"></div>
                                <div className="w-full border-b-2 border-dashed border-gray-200"></div>
                                <div className="absolute right-0 -mr-8 w-6 h-6 bg-gray-50 rounded-full"></div>
                            </div>

                            {/* Detalles */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs text-gray-500 font-semibold uppercase">Código del Cupón</label>
                                    <div
                                        onClick={copyToClipboard}
                                        className="mt-1 flex items-center justify-between bg-gray-50 border border-gray-200 p-3 rounded-lg cursor-pointer hover:bg-gray-100 transition-colors group"
                                    >
                                        <code className="text-sm font-mono font-bold text-gray-700 truncate mr-2">
                                            {generatedCoupon.id}
                                        </code>
                                        <Copy className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 text-sm text-gray-500 justify-center">
                                    <Calendar className="w-4 h-4 text-purple-500" />
                                    <span>Expira: {new Date(generatedCoupon.expirationDate).toLocaleDateString()}</span>
                                </div>
                            </div>

                            <button
                                onClick={() => setShowModal(false)}
                                className="mt-6 w-full bg-gray-900 text-white py-3 rounded-xl font-medium hover:bg-gray-800 transition-all shadow-lg hover:shadow-xl"
                            >
                                Entendido, ¡Gracias!
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* --- FORMULARIO PRINCIPAL --- */}
            <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="mx-auto h-20 w-20 bg-gradient-to-tr from-blue-600 to-purple-600 rounded-2xl shadow-lg flex items-center justify-center mb-6 rotate-3 transform hover:rotate-6 transition-all">
                    <Sparkles className="h-10 w-10 text-white" />
                </div>
                <h2 className="text-center text-3xl font-extrabold text-gray-900">
                    Generar Cupón de Regalo
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Obtén un descuento exclusivo para tu cuenta.
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
                <div className="bg-white/80 backdrop-blur-lg py-8 px-4 shadow-2xl border border-white/40 rounded-2xl sm:px-10 relative">

                    <form className="space-y-6" onSubmit={handleGenerateCoupon}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Correo Electrónico (Vinculado)
                            </label>
                            <div className="mt-1 relative rounded-md shadow-sm">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <Lock className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    id="email"
                                    name="email"
                                    type="email"
                                    value={email}
                                    disabled={true}
                                    className="block w-full pl-10 sm:text-sm border-gray-200/60 rounded-lg py-3 bg-gray-50/50 text-gray-500 cursor-not-allowed focus:ring-0 focus:border-gray-300 backdrop-blur-sm"
                                />
                            </div>
                        </div>

                        {feedback && (
                            <div className={`rounded-lg p-4 flex items-start gap-3 backdrop-blur-md ${feedback.type === 'success'
                                ? 'bg-green-50/80 text-green-800 border border-green-200/50'
                                : 'bg-red-50/80 text-red-800 border border-red-200/50'
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

                        <div>
                            <button
                                type="submit"
                                disabled={loading || !email}
                                className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold text-white transition-all transform hover:-translate-y-0.5
                                    ${loading || !email
                                        ? 'bg-gray-400 cursor-not-allowed opacity-70'
                                        : 'bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
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

                    <div className="mt-8">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-200/50" />
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-4 py-1 rounded-full bg-white/60 backdrop-blur-md text-gray-500 shadow-sm border border-white/40">
                                    <Ticket className="w-4 h-4 inline-block mr-1" />
                                    Sistema de Promociones v2.0
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