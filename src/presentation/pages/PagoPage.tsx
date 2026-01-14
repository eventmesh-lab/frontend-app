import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import useAuth from "../contexts/Auth";
import PaymentForm from '../components/PagoStripe/PagoStripe';
import { CreditCard, Check, AlertCircle, Loader2, DollarSign, Wallet, Ticket, Percent } from 'lucide-react';

// --- Interfaces ---
interface MetodoPago {
    idMedioPago: string;
    tipoMedioPago: string;
    ultimosCuatroDigitos: string;
    medioPredeterminado: boolean;
}

interface Coupon {
    id: string;
    email: string;
    discountAmount: number;
    createdAt: string;
    expirationDate: string;
    isValid: boolean;
    amountMin: number;
}

interface RegistrarPagoDTO {
    stripeMedioPagoId: string;
    idEvento: string;
    correo: string;
    moneda: string;
    monto: number;
    IdCoupon: string; // <-- 1. Campo agregado
}

const PaymentPage: React.FC = () => {
    const { idEvento } = useParams<{ idEvento: string }>();
    const { monto } = useParams<{ monto: string }>();
    const { username, isAuthenticated } = useAuth() as { username: string, isAuthenticated: boolean };
    const navigate = useNavigate();

    // --- Estados ---
    const [loadingMethods, setLoadingMethods] = useState<boolean>(true);
    const [processingPayment, setProcessingPayment] = useState<boolean>(false);

    const [metodosPagoAPI, setMetodosPagoAPI] = useState<MetodoPago[]>([]);
    const [selectedMethodId, setSelectedMethodId] = useState<string>('');
    const [moneda, setMoneda] = useState<string>('USD');
    const [paymentMsg, setPaymentMsg] = useState<{ type: 'success' | 'danger', text: string } | null>(null);

    const montoBase = monto ? parseFloat(monto) : 0;
    const [coupons, setCoupons] = useState<Coupon[]>([]);
    const [loadingCoupons, setLoadingCoupons] = useState<boolean>(false);
    const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null);

    // Constante para GUID vacío
    const EMPTY_GUID = "00000000-0000-0000-0000-000000000000";

    // --- Cálculos ---
    const discountValue = selectedCoupon
        ? (montoBase * (selectedCoupon.discountAmount / 100))
        : 0;

    const montoFinal = montoBase - discountValue;

    // --- API Calls ---
    const fetchMetodosPago = async () => {
        if (!username) return;
        setLoadingMethods(true);
        try {
            const response = await axios.get<MetodoPago[]>(
                `http://localhost:7183/api/payments/obtenerMediosDePagoUsuario/${username}`
            );
            setMetodosPagoAPI(response.data);
            const predeterminado = response.data.find(m => m.medioPredeterminado);
            if (predeterminado) setSelectedMethodId(predeterminado.idMedioPago);
        } catch (err) {
            console.error('Error metodos pago:', err);
        } finally {
            setLoadingMethods(false);
        }
    };

    const fetchCoupons = async () => {
        if (!username) return;
        setLoadingCoupons(true);
        try {
            const response = await axios.get<Coupon[]>(
                `http://localhost:7185/api/coupons/getCouponsUser/${username}`
            );
            // Filtramos por validez
            setCoupons(response.data.filter(c => c.isValid));
        } catch (err) {
            console.error('Error cupones:', err);
        } finally {
            setLoadingCoupons(false);
        }
    };

    useEffect(() => {
        if (isAuthenticated && username) {
            fetchMetodosPago();
            fetchCoupons();
        }
    }, [isAuthenticated, username]);

    // --- Handlers ---
    const handleSelectCoupon = (coupon: Coupon) => {
        if (montoBase < coupon.amountMin) return;
        if (selectedCoupon?.id === coupon.id) {
            setSelectedCoupon(null);
        } else {
            setSelectedCoupon(coupon);
        }
    };

    const handleRealizarPago = async () => {
        setPaymentMsg(null);
        if (!idEvento || !selectedMethodId || montoFinal <= 0) {
            setPaymentMsg({ type: 'danger', text: 'Verifica los datos de la reserva o el método de pago.' });
            return;
        }

        setProcessingPayment(true);

        const couponIdToSend = selectedCoupon ? selectedCoupon.id : EMPTY_GUID;

        const payload: RegistrarPagoDTO = {
            stripeMedioPagoId: selectedMethodId,
            idEvento: idEvento,
            correo: username,
            moneda: moneda,
            monto: parseFloat(montoFinal.toFixed(2)),
            IdCoupon: couponIdToSend
        };

        try {
            const response = await axios.post('http://localhost:7183/api/payments/realizarPagoReserva', payload);

            if (response.data.exito) {
                // 1. Mostrar mensaje de éxito
                setPaymentMsg({ type: 'success', text: response.data.mensaje || 'Pago realizado con éxito. Redirigiendo...' });

                fetchCoupons();
                setSelectedCoupon(null);

              
                setTimeout(() => {
                    navigate('/'); 
                }, 2000);

            } else {
                setPaymentMsg({ type: 'danger', text: response.data.mensaje || 'Error en el pago.' });
            }
        } catch (error: any) {
            setPaymentMsg({ type: 'danger', text: error.response?.data?.message || 'Error de conexión.' });
        } finally {
            setProcessingPayment(false);
        }
    };

    if (!isAuthenticated) return <div className="p-8 text-center">Inicia sesión para continuar.</div>;

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <div className="mb-8 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 mb-2">Finalizar Pago de Reserva</h2>
                    <span className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                        
                    </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

                    {/* ---------------------------------------------------------- */}
                    {/* COLUMNA IZQUIERDA: GESTIÓN DE MÉTODOS DE PAGO              */}
                    {/* ---------------------------------------------------------- */}
                    <div className="space-y-6">

                        {/* 1. AGREGAR NUEVA TARJETA */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <CreditCard className="w-5 h-5 text-blue-600" />
                                Nueva Tarjeta
                            </h3>
                            <PaymentForm onMethodAdded={fetchMetodosPago} />
                        </div>

                        {/* 2. LISTA DE MÉTODOS DE PAGO (CON SCROLL) */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h4 className="text-xl font-bold text-gray-900 mb-1">Mis Tarjetas</h4>
                            <p className="text-sm text-gray-500 mb-6">Selecciona una tarjeta para pagar.</p>

                            {loadingMethods ? (
                                <div className="flex justify-center py-8"><Loader2 className="animate-spin text-blue-600" /></div>
                            ) : metodosPagoAPI.length === 0 ? (
                                <div className="bg-yellow-50 text-yellow-800 p-4 rounded-lg flex gap-3 text-sm">
                                    <AlertCircle className="w-5 h-5" />
                                    <div>Agrega una tarjeta arriba para continuar.</div>
                                </div>
                            ) : (
                                // SCROLL AQUI
                                <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {metodosPagoAPI.map((metodo) => (
                                        <label
                                            key={metodo.idMedioPago}
                                            className={`flex items-center p-4 border rounded-lg cursor-pointer transition-all ${selectedMethodId === metodo.idMedioPago
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
                                                className="h-4 w-4 text-blue-600"
                                            />
                                            <div className="ml-4 flex-grow">
                                                <span className="block text-sm font-medium text-gray-900">
                                                    {metodo.tipoMedioPago} •••• {metodo.ultimosCuatroDigitos}
                                                </span>
                                                {metodo.medioPredeterminado && (
                                                    <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Default</span>
                                                )}
                                            </div>
                                            <CreditCard className="w-5 h-5 text-gray-400" />
                                        </label>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>

                    {/* ---------------------------------------------------------- */}
                    {/* COLUMNA DERECHA: CUPONES Y RESUMEN                         */}
                    {/* ---------------------------------------------------------- */}
                    <div className="space-y-6">

                        {/* 1. SECCIÓN DE CUPONES (CON SCROLL) */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h4 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Ticket className="w-5 h-5 text-purple-600" />
                                Cupones Disponibles
                            </h4>

                            {loadingCoupons ? (
                                <div className="text-center py-4 text-gray-500">Cargando promociones...</div>
                            ) : coupons.length === 0 ? (
                                <p className="text-sm text-gray-500 italic">No tienes cupones activos.</p>
                            ) : (
                                // SCROLL AQUI
                                <div className="grid grid-cols-1 gap-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                    {coupons.map((coupon) => {
                                        const isApplicable = montoBase >= coupon.amountMin;
                                        const isSelected = selectedCoupon?.id === coupon.id;

                                        return (
                                            <div
                                                key={coupon.id}
                                                onClick={() => isApplicable && handleSelectCoupon(coupon)}
                                                className={`relative border rounded-lg p-3 flex items-center justify-between transition-all select-none
                                                    ${!isApplicable ? 'opacity-50 bg-gray-50 cursor-not-allowed border-gray-200' : 'cursor-pointer'}
                                                    ${isSelected ? 'border-purple-500 bg-purple-50 ring-1 ring-purple-500' : 'border-gray-200 hover:border-purple-300'}
                                                `}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-full ${isSelected ? 'bg-purple-200' : 'bg-gray-100'}`}>
                                                        <Percent className={`w-5 h-5 ${isSelected ? 'text-purple-700' : 'text-gray-500'}`} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-gray-800">{coupon.discountAmount}% OFF</p>
                                                        <p className="text-xs text-gray-500">Min: ${coupon.amountMin}</p>
                                                    </div>
                                                </div>
                                                {isSelected && <Check className="w-5 h-5 text-purple-600" />}
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>

                        {/* 2. RESUMEN Y BOTÓN DE PAGO */}
                        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                            <h5 className="text-sm font-semibold text-gray-900 uppercase tracking-wide mb-4">Resumen del Pago</h5>

                            {/* Selector de Moneda */}
                            <div className="mb-4">
                                <label className="block text-xs font-medium text-gray-500 mb-1">Moneda</label>
                                <select
                                    value={moneda}
                                    onChange={(e) => setMoneda(e.target.value)}
                                    className="block w-full py-2 pl-3 pr-8 text-sm border border-gray-300 rounded-md"
                                >
                                    <option value="USD">USD - Dólar</option>
                                    <option value="EUR">EUR - Euro</option>
                                    <option value="COP">COP - Peso</option>
                                </select>
                            </div>

                            {/* Cálculos */}
                            <div className="space-y-2 mb-6 text-sm">
                                <div className="flex justify-between text-gray-600">
                                    <span>Subtotal</span>
                                    <span>${montoBase.toFixed(2)}</span>
                                </div>
                                {selectedCoupon && (
                                    <div className="flex justify-between text-green-600 font-medium">
                                        <span>Descuento ({selectedCoupon.discountAmount}%)</span>
                                        <span>- ${discountValue.toFixed(2)}</span>
                                    </div>
                                )}
                                <div className="border-t pt-2 mt-2 flex justify-between items-center">
                                    <span className="text-base font-bold text-gray-900">Total a Pagar</span>
                                    <span className="text-xl font-bold text-blue-600">
                                        <DollarSign className="w-4 h-4 inline-block mb-1" />
                                        {montoFinal.toFixed(2)}
                                    </span>
                                </div>
                            </div>

                            {/* Mensajes */}
                            {paymentMsg && (
                                <div className={`mb-4 p-3 rounded-md flex gap-3 text-sm ${paymentMsg.type === 'success' ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                                    {paymentMsg.type === 'success' ? <Check className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                                    <p>{paymentMsg.text}</p>
                                </div>
                            )}

                            {/* Botón Pagar */}
                            <button
                                type="button"
                                onClick={handleRealizarPago}
                                disabled={processingPayment || metodosPagoAPI.length === 0}
                                className={`w-full flex justify-center items-center py-3 px-4 rounded-lg shadow-sm text-sm font-medium text-white transition-all
                                    ${processingPayment || metodosPagoAPI.length === 0
                                        ? 'bg-blue-400 cursor-not-allowed'
                                        : 'bg-blue-600 hover:bg-blue-700'
                                    }`}
                            >
                                {processingPayment ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Wallet className="w-4 h-4 mr-2" />}
                                {processingPayment ? 'Procesando...' : `Pagar ${moneda} ${montoFinal.toFixed(2)}`}
                            </button>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

export default PaymentPage;