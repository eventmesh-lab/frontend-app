import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuth from "../contexts/Auth";
import PaymentForm from '../components/PagoStripe/PagoStripe';
// Importamos iconos de lucide-react para un aspecto más profesional
import {
    CreditCard,
    CheckCircle2,
    AlertCircle,
    Loader2,
    Wallet,
    DollarSign,
    Globe,
    ShieldCheck
} from "lucide-react";

// --- Interfaces (SIN CAMBIOS) ---
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
    // --- LÓGICA (SIN CAMBIOS) ---
    const { idReserva } = useParams<{ idReserva: string }>();
    const { monto } = useParams<{ monto: string }>();
    const { username, isAuthenticated } = useAuth() as { username: string, isAuthenticated: boolean };
    const navigate = useNavigate();

    const [metodosPagoAPI, setMetodosPagoAPI] = useState<MetodoPago[]>([]);
    const [loadingMethods, setLoadingMethods] = useState<boolean>(true);
    const [selectedMethodId, setSelectedMethodId] = useState<string>('');
    const montoDecimal = monto ? parseFloat(monto) : 0;
    const [montoDef, setMontoDef] = useState<number>(montoDecimal);

    const [moneda, setMoneda] = useState<string>('USD');
    const [processingPayment, setProcessingPayment] = useState<boolean>(false);
    const [paymentMsg, setPaymentMsg] = useState<{ type: 'success' | 'danger', text: string } | null>(null);

    const fetchMetodosPago = async () => {
        if (!username) return;
        setLoadingMethods(true);
        try {
            const response = await axios.get<MetodoPago[]>(
                `http://localhost:7183/api/payments/obtenerMediosDePagoUsuario/${username}`
            );
            setMetodosPagoAPI(response.data);

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

    useEffect(() => {
        if (isAuthenticated && username) {
            fetchMetodosPago();
        }
    }, [isAuthenticated, username]);

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
                // setTimeout(() => navigate('/mis-reservas'), 2000);
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

    if (!isAuthenticated) {
        return (
            <div className="flex min-h-[60vh] items-center justify-center">
                <div className="text-center text-gray-500 flex flex-col items-center">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600 mb-4" />
                    <p className="text-lg font-medium">Inicia sesión para continuar.</p>
                </div>
            </div>
        );
    }

    // --- RENDERIZADO (NUEVO DISEÑO) ---
    return (
        <div className="min-h-screen bg-gray-100/70 py-12 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-5xl mx-auto">
                {/* Header más elegante */}
                <div className="mb-10 text-center md:text-left md:flex md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">
                            Finalizar Pago
                        </h1>
                        <p className="mt-2 text-gray-600">
                            Completa la información para asegurar tu reserva.
                        </p>
                    </div>
                    <div className="mt-4 md:mt-0 inline-flex items-center px-4 py-2 rounded-full bg-white shadow-sm text-sm font-medium text-blue-700 border border-blue-100">
                        <ShieldCheck className="w-5 h-5 mr-2 text-blue-500" />
                        Reserva ID: <span className="font-bold ml-1">{idReserva}</span>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* COLUMNA IZQUIERDA: AGREGAR TARJETA (Envuelto en tarjeta elegante) */}
                    <div className="lg:col-span-5 space-y-6 order-2 lg:order-1">
                        <div className="bg-white p-6 md:p-8 rounded-2xl shadow-md border border-gray-100">
                            <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                                <div className="p-2 bg-blue-50 rounded-lg">
                                    <CreditCard className="w-6 h-6 text-blue-600" />
                                </div>
                                Agregar Nuevo Método
                            </h3>
                            {/* Asumimos que PaymentForm ya tiene estilos internos o se adapta al contenedor */}
                            <div className="payment-form-container">
                                <PaymentForm onMethodAdded={fetchMetodosPago} />
                            </div>
                        </div>
                        <p className="text-center text-sm text-gray-500 flex items-center justify-center gap-1">
                            <ShieldCheck className="w-4 h-4" /> Pagos seguros encriptados
                        </p>
                    </div>

                    {/* COLUMNA DERECHA: SELECCIONAR Y PAGAR (El componente principal) */}
                    <div className="lg:col-span-7 order-1 lg:order-2">
                        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 overflow-hidden">
                            <div className="p-6 md:p-8">
                                <h2 className="text-2xl font-bold text-gray-900 mb-8 flex items-center gap-3">
                                    <div className="p-2 bg-blue-50 rounded-lg">
                                        <Wallet className="w-7 h-7 text-blue-600" />
                                    </div>
                                    Selecciona tu método de pago
                                </h2>

                                {loadingMethods ? (
                                    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                                        <Loader2 className="w-10 h-10 animate-spin mb-4 text-blue-500" />
                                        <p className="text-base font-medium">Cargando tus tarjetas...</p>
                                    </div>
                                ) : metodosPagoAPI.length === 0 ? (
                                    <div className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded-md flex items-start gap-3">
                                        <AlertCircle className="w-6 h-6 text-amber-600 mt-0.5 flex-shrink-0" />
                                        <div>
                                            <h4 className="font-bold text-amber-800">No hay métodos registrados</h4>
                                            <p className="text-sm text-amber-700 mt-1">
                                                Por favor utiliza el formulario para agregar una tarjeta de crédito o débito.
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-8">
                                        {/* Lista de Tarjetas como Botones Seleccionables */}
                                        <div className="space-y-3">
                                            <label className="block text-sm font-medium text-gray-700 mb-3">Tus tarjetas guardadas</label>
                                            {metodosPagoAPI.map((metodo) => {
                                                const isSelected = selectedMethodId === metodo.idMedioPago;
                                                return (
                                                    <label
                                                        key={metodo.idMedioPago}
                                                        className={`
                                                        relative flex items-center p-5 border-2 rounded-xl cursor-pointer transition-all duration-300 group
                                                        ${isSelected
                                                                ? 'border-blue-600 bg-blue-50/60 shadow-sm'
                                                                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}
                                                    `}
                                                    >
                                                        {/* Radio button oculto */}
                                                        <input
                                                            type="radio"
                                                            name="paymentMethod"
                                                            value={metodo.idMedioPago}
                                                            checked={isSelected}
                                                            onChange={(e) => setSelectedMethodId(e.target.value)}
                                                            className="sr-only" // Ocultar visualmente
                                                        />

                                                        <div className="mr-4">
                                                            <div className={`p-2 rounded-full ${isSelected ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'}`}>
                                                                <CreditCard className="w-6 h-6" />
                                                            </div>
                                                        </div>

                                                        <div className="flex-1">
                                                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
                                                                <div>
                                                                    <span className="font-bold text-gray-900 capitalize text-lg">
                                                                        {metodo.tipoMedioPago}
                                                                    </span>
                                                                    <p className="text-gray-500 text-sm mt-0.5 font-medium">
                                                                        Terminada en •••• {metodo.ultimosCuatroDigitos}
                                                                    </p>
                                                                </div>
                                                                {metodo.medioPredeterminado && (
                                                                    <span className="mt-2 sm:mt-0 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-800 border border-green-200">
                                                                        Predeterminado
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        {/* Icono de check visual */}
                                                        <div className={`ml-4 flex-shrink-0 text-blue-600 transition-opacity duration-200 ${isSelected ? 'opacity-100' : 'opacity-0'}`}>
                                                            <CheckCircle2 className="w-7 h-7 fill-current" />
                                                        </div>
                                                    </label>
                                                )
                                            })}
                                        </div>

                                        <div className="h-px bg-gray-200 border-dashed my-8" />

                                        {/* Detalles del Pago con Inputs Modernos */}
                                        <div>
                                            <h5 className="text-base font-bold text-gray-900 mb-5 flex items-center gap-2">
                                                Detalles de la transacción
                                            </h5>

                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                {/* Input Monto */}
                                                <div className="space-y-2">
                                                    <label className="text-sm font-semibold text-gray-700 block">Monto a Pagar</label>
                                                    <div className="relative rounded-md shadow-sm">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <DollarSign className="h-5 w-5 text-gray-400" />
                                                        </div>
                                                        <input
                                                            type="text"
                                                            readOnly
                                                            value={montoDef}
                                                            className="block w-full pl-10 pr-4 py-3 border-gray-300 rounded-lg bg-gray-50 text-gray-900 font-bold text-lg focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                        />
                                                    </div>
                                                </div>

                                                {/* Select Moneda */}
                                                <div className="space-y-2">
                                                    <label className="text-sm font-semibold text-gray-700 block">Moneda</label>
                                                    <div className="relative rounded-md shadow-sm">
                                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                            <Globe className="h-5 w-5 text-gray-400" />
                                                        </div>
                                                        <select
                                                            value={moneda}
                                                            onChange={(e) => setMoneda(e.target.value)}
                                                            className="block w-full pl-10 pr-10 py-3 text-base border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 rounded-lg bg-white transition-colors appearance-none font-medium"
                                                            style={{ backgroundImage: `url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e")`, backgroundPosition: `right 0.5rem center`, backgroundRepeat: `no-repeat`, backgroundSize: `1.5em 1.5em` }}
                                                        >
                                                            <option value="USD">USD - Dólar Americano</option>
                                                            <option value="EUR">EUR - Euro</option>
                                                            <option value="COP">COP - Peso Colombiano</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Mensajes de Alerta Estilizados */}
                                        {paymentMsg && (
                                            <div className={`rounded-xl p-4 flex items-start gap-3 border ${paymentMsg.type === 'success'
                                                    ? 'bg-green-50 border-green-200 text-green-800'
                                                    : 'bg-red-50 border-red-200 text-red-800'
                                                }`}>
                                                {paymentMsg.type === 'success' ? (
                                                    <CheckCircle2 className="w-6 h-6 flex-shrink-0 text-green-600" />
                                                ) : (
                                                    <AlertCircle className="w-6 h-6 flex-shrink-0 text-red-600" />
                                                )}
                                                <div className="flex-1 pt-0.5 font-medium">
                                                    {paymentMsg.text}
                                                </div>
                                                <button
                                                    onClick={() => setPaymentMsg(null)}
                                                    className="text-current opacity-60 hover:opacity-100 transition-opacity"
                                                >
                                                    <span className="sr-only">Cerrar</span>
                                                    ×
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Footer de la tarjeta con el botón de acción */}
                            <div className="px-6 md:px-8 py-6 bg-gray-50 border-t border-gray-100">
                                <button
                                    onClick={handleRealizarPago}
                                    disabled={processingPayment || metodosPagoAPI.length === 0 || !selectedMethodId}
                                    className={`
                                        w-full flex items-center justify-center py-4 px-6 border border-transparent rounded-xl shadow-md text-lg font-bold text-white transition-all duration-200
                                        ${processingPayment || metodosPagoAPI.length === 0 || !selectedMethodId
                                            ? 'bg-gray-400 cursor-not-allowed opacity-70'
                                            : 'bg-blue-600 hover:bg-blue-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-600 transform active:scale-[0.99]'}
                                    `}
                                >
                                    {processingPayment ? (
                                        <>
                                            <Loader2 className="w-6 h-6 mr-3 animate-spin" />
                                            Procesando tu pago...
                                        </>
                                    ) : (
                                        <>
                                            Pagar <span className="ml-2">{monto} {moneda}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentPage;