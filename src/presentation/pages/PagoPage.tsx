import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuth from "../contexts/Auth";
import PaymentForm from '../components/PagoStripe/PagoStripe';
import Decimal from "decimal.js";
import { CreditCard, Check, AlertCircle, Loader2, DollarSign, Wallet } from 'lucide-react';

// --- Interfaces ---
interface MetodoPago {
    idMedioPago: string;
    tipoMedioPago: string;
    ultimosCuatroDigitos: string;
    medioPredeterminado: boolean;
}

interface RegistrarPagoDTO {
    stripeMedioPagoId: string;
    idReserva: string;
    correo: string;
    moneda: string;
    monto: number;
}

const PaymentPage: React.FC = () => {
    // 1. Obtener idReserva de la URL
    const { idReserva } = useParams<{ idReserva: string }>();
    const { monto } = useParams<{ monto: string }>();
    const { username, isAuthenticated } = useAuth() as { username: string, isAuthenticated: boolean };
    const navigate = useNavigate();

    // Estados
    const [metodosPagoAPI, setMetodosPagoAPI] = useState<MetodoPago[]>([]);
    const [loadingMethods, setLoadingMethods] = useState<boolean>(true);
    const [selectedMethodId, setSelectedMethodId] = useState<string>('');
    const montoDecimal = monto ? parseFloat(monto) : 0;
    const [montoDef, setMontoDef] = useState<number>(montoDecimal);

    // Estado para el formulario de pago
    const [moneda, setMoneda] = useState<string>('USD');
    const [processingPayment, setProcessingPayment] = useState<boolean>(false);
    const [paymentMsg, setPaymentMsg] = useState<{ type: 'success' | 'danger', text: string } | null>(null);

    // Función para cargar los métodos de pago
    const fetchMetodosPago = async () => {
        if (!username) return;
        setLoadingMethods(true);
        try {
            const response = await axios.get<MetodoPago[]>(
                `http://localhost:7183/api/payments/obtenerMediosDePagoUsuario/${username}`
            );
            setMetodosPagoAPI(response.data);

            // Si hay un método predeterminado, seleccionarlo automáticamente
            const predeterminado = response.data.find(m => m.medioPredeterminado);
            if (predeterminado) {
                setSelectedMethodId(predeterminado.idMedioPago);
            }
        } catch (err) {
            console.error('Error al cargar métodos de pago:', err);
        } finally {
            setLoadingMethods(false);
        }
    };

    // Cargar al inicio
    useEffect(() => {
        if (isAuthenticated && username) {
            fetchMetodosPago();
        }
    }, [isAuthenticated, username]);

    // Manejar el proceso de pago
    const handleRealizarPago = async () => {
        setPaymentMsg(null);

        if (!idReserva) {
            setPaymentMsg({ type: 'danger', text: 'Error: No se encontró el ID de la reserva.' });
            return;
        }
        if (!selectedMethodId) {
            setPaymentMsg({ type: 'danger', text: 'Por favor selecciona un método de pago.' });
            return;
        }
        if (monto && (parseFloat(monto) <= 0)) {
            setPaymentMsg({ type: 'danger', text: 'El monto debe ser mayor a 0.' });
            return;
        }

        setProcessingPayment(true);

        const payload: RegistrarPagoDTO = {
            stripeMedioPagoId: selectedMethodId,
            idReserva: idReserva,
            correo: username,
            moneda: moneda,
            monto: montoDef
        };

        try {
            const response = await axios.post('http://localhost:7183/api/payments/realizarPagoReserva', payload);

            if (response.data.exito) {
                setPaymentMsg({ type: 'success', text: response.data.mensaje || 'Pago realizado con éxito.' });
            } else {
                setPaymentMsg({ type: 'danger', text: response.data.mensaje || 'Hubo un problema con el pago.' });
            }

        } catch (error: any) {
            console.error(error);
            const msg = error.response?.data?.message || 'Error de conexión al procesar el pago.';
            setPaymentMsg({ type: 'danger', text: msg });
        } finally {
            setProcessingPayment(false);
        }
    };

    if (!isAuthenticated) return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center p-8 bg-white rounded-lg shadow-sm border border-gray-200">
                <p className="text-gray-600">Inicia sesión para continuar.</p>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-6xl mx-auto">

                {/* Header */}
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Finalizar Pago de Reserva</h2>
                    <p className="text-gray-500 flex items-center justify-center gap-2">
                        <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                            Reserva ID: {idReserva}
                        </span>
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-12 gap-8">

                    {/* COLUMNA IZQUIERDA: AGREGAR TARJETA */}
                    <div className="md:col-span-5">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 h-full">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-blue-600" />
                                Nueva Tarjeta
                            </h3>
                            <PaymentForm onMethodAdded={fetchMetodosPago} />
                        </div>
                    </div>

                    {/* COLUMNA DERECHA: SELECCIONAR Y PAGAR */}
                    <div className="md:col-span-7">
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h4 className="text-xl font-bold text-gray-900 mb-1">Método de Pago</h4>
                            <p className="text-sm text-gray-500 mb-6">Selecciona una tarjeta guardada para procesar el pago.</p>

                            {loadingMethods ? (
                                <div className="flex justify-center items-center py-12">
                                    <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                                </div>
                            ) : metodosPagoAPI.length === 0 ? (
                                <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 rounded-lg p-4 flex items-start gap-3">
                                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                    <div>
                                        <p className="font-medium">No hay métodos registrados</p>
                                        <p className="text-sm mt-1">No tienes métodos de pago registrados. Por favor agrega uno en el panel de la izquierda.</p>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={(e) => e.preventDefault()}>
                                    {/* CAMBIO AQUÍ:
                                        - max-h-[320px]: Limita la altura a 320 pixeles.
                                        - overflow-y-auto: Habilita el scroll vertical si excede la altura.
                                        - pr-2: Agrega un pequeño espacio a la derecha para que el texto no toque la barra de scroll.
                                    */}
                                    <div className="space-y-3 mb-8 max-h-[320px] overflow-y-auto pr-2">
                                        {metodosPagoAPI.map((metodo) => (
                                            <label
                                                key={metodo.idMedioPago}
                                                className={`relative flex items-center p-4 border rounded-lg cursor-pointer transition-all ${selectedMethodId === metodo.idMedioPago
                                                        ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500'
                                                        : 'border-gray-200 hover:border-blue-300 hover:bg-gray-50'
                                                    }`}
                                            >
                                                <input
                                                    type="radio"
                                                    name="paymentMethod"
                                                    value={metodo.idMedioPago}
                                                    checked={selectedMethodId === metodo.idMedioPago}
                                                    onChange={(e) => setSelectedMethodId(e.target.value)}
                                                    className="h-4 w-4 text-blue-600 border-gray-300 focus:ring-blue-500"
                                                />
                                                <div className="ml-4 flex-grow">
                                                    <div className="flex items-center justify-between">
                                                        <span className="block text-sm font-medium text-gray-900">
                                                            {metodo.tipoMedioPago} •••• {metodo.ultimosCuatroDigitos}
                                                        </span>
                                                        {metodo.medioPredeterminado && (
                                                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                                                                Predeterminado
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="ml-2">
                                                    <CreditCard className="w-5 h-5 text-gray-400" />
                                                </div>
                                            </label>
                                        ))}
                                    </div>

                                    <div className="border-t border-gray-100 pt-6">
                                        <h5 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Detalles del Pago</h5>

                                        <div className="grid grid-cols-2 gap-4 mb-6">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Monto a Pagar
                                                </label>
                                                <div className="relative">
                                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                        <DollarSign className="h-4 w-4 text-gray-400" />
                                                    </div>
                                                    <input
                                                        type="text"
                                                        readOnly
                                                        value={montoDef}
                                                        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 sm:text-sm focus:outline-none"
                                                    />
                                                </div>
                                            </div>

                                            <div>
                                                <label htmlFor="moneda" className="block text-sm font-medium text-gray-700 mb-1">
                                                    Moneda
                                                </label>
                                                <select
                                                    id="moneda"
                                                    value={moneda}
                                                    onChange={(e) => setMoneda(e.target.value)}
                                                    className="block w-full pl-3 pr-10 py-2 text-base border border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                                                >
                                                    <option value="USD">USD - Dólar</option>
                                                    <option value="EUR">EUR - Euro</option>
                                                    <option value="COP">COP - Peso</option>
                                                </select>
                                            </div>
                                        </div>

                                        {paymentMsg && (
                                            <div className={`mb-6 p-4 rounded-md flex items-start gap-3 ${paymentMsg.type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' : 'bg-red-50 text-red-800 border border-red-200'
                                                }`}>
                                                {paymentMsg.type === 'success' ? (
                                                    <Check className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                                ) : (
                                                    <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
                                                )}
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium">{paymentMsg.text}</p>
                                                </div>
                                                <button
                                                    onClick={() => setPaymentMsg(null)}
                                                    className={`ml-auto text-sm font-medium hover:underline ${paymentMsg.type === 'success' ? 'text-green-900' : 'text-red-900'
                                                        }`}
                                                >
                                                    Cerrar
                                                </button>
                                            </div>
                                        )}

                                        <button
                                            type="button"
                                            onClick={handleRealizarPago}
                                            disabled={processingPayment || metodosPagoAPI.length === 0}
                                            className={`w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white transition-colors
                                                ${processingPayment || metodosPagoAPI.length === 0
                                                    ? 'bg-blue-400 cursor-not-allowed'
                                                    : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
                                                }`}
                                        >
                                            {processingPayment ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                    Procesando...
                                                </>
                                            ) : (
                                                <>
                                                    <Wallet className="w-4 h-4 mr-2" />
                                                    Pagar {monto} {moneda}
                                                </>
                                            )}
                                        </button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;