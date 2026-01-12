import React, { useState } from 'react';
import { Button, Form, Container, Row, Col, Alert, Spinner } from 'react-bootstrap';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
// Asegúrate de que tu archivo Auth también sea .tsx o tenga tipos definidos.
// Si no, TypeScript podría quejarse de la importación.
import  useAuth  from "../../contexts/Auth";
import axios from 'axios';

// Reemplaza con tu Public Key real
const stripePromise = loadStripe('pk_test_51Sn62pKureabdrqaMcgSFqff5S8Qk1yCiDJI28kKfF6Zocko1DHA2Vji1joa46hF2PKKf7HLmoK3rAVvOiJ8UB0900wox5EIra');

// Interfaz para el payload que se envía al backend
interface PaymentPayload {
    medioPagoStripeID: string;
    tipoPago: string;
    correo: string;
}

const CardForm: React.FC = () => {
    const stripe = useStripe();
    const elements = useElements();
    // Asumimos que useAuth devuelve un objeto con username tipo string.
    // Si username puede ser null, deberás manejar ese caso.
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

        // TypeScript necesita asegurarse de que el elemento no es nulo
        const cardElement = elements.getElement(CardElement);
        if (!cardElement) {
            setErrorMsg('Error al cargar el elemento de tarjeta.');
            setLoading(false);
            return;
        }

        try {
            // Crear PaymentMethod en Stripe
            const { error, paymentMethod } = await stripe.createPaymentMethod({
                type: 'card',
                card: cardElement,
            });

            if (error) {
                setErrorMsg(error.message || 'Error desconocido de Stripe');
                setLoading(false);
                return;
            }

            // Payload final que envías a tu backend
            const payload: PaymentPayload = {
                medioPagoStripeID: paymentMethod.id,
                tipoPago: 'Tarjeta de credito', // Valor constante
                correo: username,    // Valor constante
            };

            console.log('Enviando a backend:', payload);

            await axios.post('http://localhost:7183/api/payments/registroMedioDePago', payload);

            setSuccessMsg('Tarjeta registrada y PaymentMethod enviado al backend.');
            alert("Metodo de pago registrado");
            window.location.reload();

        } catch (error: any) {
            console.error(error);
            // Manejo básico de error, puedes mejorarlo verificando si es error de Axios
            const message = error.response?.data?.message || 'Error al registrar la tarjeta.';
            setErrorMsg(message);
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