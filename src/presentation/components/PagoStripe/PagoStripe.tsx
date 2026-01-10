import React, { useState } from 'react';
import { Button, Form, Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import useAuth from "../../contexts/Auth";
import axios from 'axios';

// Tu Public Key
const stripePromise = loadStripe('pk_test_51Sn62pKureabdrqaMcgSFqff5S8Qk1yCiDJI28kKfF6Zocko1DHA2Vji1joa46hF2PKKf7HLmoK3rAVvOiJ8UB0900wox5EIra');

interface PaymentPayload {
    medioPagoStripeID: string;
    tipoPago: string;
    correo: string;
}

// Props para notificar al padre cuando se agrega una tarjeta
interface CardFormProps {
    onMethodAdded?: () => void;
}

const CardForm: React.FC<CardFormProps> = ({ onMethodAdded }) => {
    const stripe = useStripe();
    const elements = useElements();
    const { username } = useAuth() as { username: string };

    const [loading, setLoading] = useState<boolean>(false);
    const [errorMsg, setErrorMsg] = useState<string>('');
    const [successMsg, setSuccessMsg] = useState<string>('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setErrorMsg('');
        setSuccessMsg('');
        setLoading(true);

        if (!stripe || !elements) {
            setErrorMsg('Stripe aún no está listo.');
            setLoading(false);
            return;
        }

        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
            setErrorMsg('Error al cargar el elemento de tarjeta.');
            setLoading(false);
            return;
        }

        try {
            const { error, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
            });

            if (error) {
                setErrorMsg(error.message || 'Error desconocido de Stripe');
                setLoading(false);
                return;
            }

            const payload: PaymentPayload = {
                medioPagoStripeID: paymentMethod.id,
                tipoPago: 'Tarjeta de credito',
                correo: username,
            };

            await axios.post('http://localhost:7183/api/payments/registroMedioDePago', payload);

            setSuccessMsg('Tarjeta registrada exitosamente.');
            // Limpiar el formulario
            cardElement.clear();

            // Notificar al componente padre para que actualice la lista
            if (onMethodAdded) {
                onMethodAdded();
            }

        } catch (error: any) {
            console.error(error);
            const message = error.response?.data?.message || 'Error al registrar la tarjeta.';
            setErrorMsg(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="card shadow-sm border-0 rounded-4 p-4">
            <div className="text-center mb-4">
                <h5 className="text-primary fw-bold">Registrar Nueva Tarjeta</h5>
            </div>

            {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
            {successMsg && <Alert variant="success">{successMsg}</Alert>}

            <Form onSubmit={handleSubmit}>
                <Form.Group className="mb-3" controlId="cardElement">
                    <div className="border p-3 rounded">
                        <CardElement options={{ hidePostalCode: true }} />
                    </div>
                </Form.Group>

                <Button
                    type="submit"
                    className="w-100 btn btn-primary rounded-3 py-2 fw-semibold"
                    disabled={!stripe || loading}
                >
                    {loading ? <Spinner size="sm" animation="border" /> : 'Guardar Tarjeta'}
                </Button>
            </Form>
        </div>
    );
};

// Modificamos el export para aceptar props
interface PaymentFormProps {
    onMethodAdded?: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onMethodAdded }) => (
    <Elements stripe={stripePromise}>
        <CardForm onMethodAdded={onMethodAdded} />
    </Elements>
);

export default PaymentForm;