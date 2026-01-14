import React, { useState } from 'react';
import { Button, Form, Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import  useAuth  from "../../contexts/Auth" // asegúrate que tu hook esté en TS/TSX
import axios from 'axios';

// Carga la clave pública de Stripe
const stripePromise = loadStripe(
    'pk_test_51Sn62pKureabdrqaMcgSFqff5S8Qk1yCiDJI28kKfF6Zocko1DHA2Vji1joa46hF2PKKf7HLmoK3rAVvOiJ8UB0900wox5EIra'
); // Reemplaza con tu Public Key real

// Tipado del payload que envías al backend
interface PaymentPayload {
    medioPagoStripeID: string;
    correo: string;
}

const CardForm: React.FC = () => {
    const stripe = useStripe();
    const elements = useElements();
    const { isAuthenticated, username } = useAuth();

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

        try {
            // Crear PaymentMethod en Stripe
            const { error, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: elements.getElement(CardElement)!,
            });

            if (error) {
                setErrorMsg(error.message ?? 'Error desconocido');
                setLoading(false);
                return;
            }

            if (!paymentMethod) {
                setErrorMsg('No se pudo crear el método de pago.');
                setLoading(false);
                return;
            }

            // Payload final que envías a tu backend
            const payload: PaymentPayload = {
                medioPagoStripeID: paymentMethod.id,
                correo: username || "correo_anonimo@test.com", // Asegúrate que username no sea null/undefined
            };

            console.log('Enviando a backend:', payload);

            await axios.post('http://localhost:7183/api/payments/registroMedioDePago', payload);

            setSuccessMsg('Tarjeta registrada y PaymentMethod enviado al backend.');
            alert('Método de pago registrado');
            window.location.reload();
        } catch (error) {
            console.error(error);
            setErrorMsg('Error al registrar la tarjeta.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container fluid className="bg-light min-vh-100 d-flex align-items-center justify-content-center">
            <Row className="w-100 justify-content-center">
                <Col xs={12} md={8} lg={10}>
                    <div className="card shadow-sm border-0 rounded-4 p-4">
                        <div className="text-center mb-4">
                            <h2 className="text-primary fw-bold">Registrar Tarjeta de Crédito</h2>
                        </div>

                        {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
                        {successMsg && <Alert variant="success">{successMsg}</Alert>}

                        <Form onSubmit={handleSubmit}>
                            <Form.Group className="mb-3" controlId="cardElement">
                                <Form.Label className="text-primary">Datos de la Tarjeta:</Form.Label>
                                <div className="border p-3 rounded">
                                    <CardElement options={{ hidePostalCode: true }} />
                                </div>
                            </Form.Group>

                            <Button
                                type="submit"
                                className="w-100 btn btn-primary rounded-3 py-2 fw-semibold"
                                disabled={!stripe || loading}
                            >
                                {loading ? <Spinner size="sm" animation="border" /> : 'Registrar'}
                            </Button>
                        </Form>
                    </div>
                </Col>
            </Row>
        </Container>
    );
};

const PaymentForm: React.FC = () => (
    <Elements stripe={stripePromise}>
        <CardForm />
    </Elements>
);

export default PaymentForm;