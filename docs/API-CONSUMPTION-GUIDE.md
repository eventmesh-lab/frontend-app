# Guía de Consumo de API - Reservations Service

Esta guía explica cómo consumir el microservicio de reservas desde el frontend, incluyendo cómo escuchar eventos en tiempo real cuando las reservas expiran o se liberan recursos.

## Tabla de Contenidos

1. [Información General](#información-general)
2. [Endpoints REST](#endpoints-rest)
3. [Eventos en Tiempo Real (RabbitMQ)](#eventos-en-tiempo-real-rabbitmq)
4. [Escuchar Expiración de Reservas](#escuchar-expiración-de-reservas)
5. [Detectar Liberación de Recursos](#detectar-liberación-de-recursos)
6. [Ejemplos Completos](#ejemplos-completos)
7. [Manejo de Errores](#manejo-de-errores)
8. [Mejores Prácticas](#mejores-prácticas)

---

## Información General

### Base URL
```
http://localhost:5010
```

### Formato de Respuesta
Todas las respuestas están en formato JSON con `camelCase` para las propiedades.

### Headers Requeridos
```http
Content-Type: application/json
Accept: application/json
```

---

## Endpoints REST

### 1. Crear Reserva

Crea una nueva reserva de tickets para un evento.

**Endpoint:** `POST /api/Reservas`

**Request Body:**
```json
{
  "eventoId": "550e8400-e29b-41d4-a716-446655440000",
  "asistenteId": "660e8400-e29b-41d4-a716-446655440001",
  "items": [
    {
      "seccionId": "770e8400-e29b-41d4-a716-446655440002",
      "asientoId": "880e8400-e29b-41d4-a716-446655440003",
      "tipoTicket": "VIP",
      "precio": 150.00,
      "moneda": "USD"
    },
    {
      "seccionId": "770e8400-e29b-41d4-a716-446655440002",
      "asientoId": null,
      "tipoTicket": "General",
      "precio": 50.00,
      "moneda": "USD"
    }
  ]
}
```

**Response (201 Created):**
```json
{
  "reservaId": "990e8400-e29b-41d4-a716-446655440004",
  "fechaExpiracion": "2026-01-09T11:10:00Z",
  "montoTotal": 200.00,
  "exitoso": true,
  "mensaje": "Reserva creada exitosamente"
}
```

**Ejemplo JavaScript:**
```javascript
async function crearReserva(eventoId, asistenteId, items) {
  const response = await fetch('http://localhost:5010/api/Reservas', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      eventoId,
      asistenteId,
      items
    })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al crear reserva');
  }

  return await response.json();
}

// Uso
const reserva = await crearReserva(
  '550e8400-e29b-41d4-a716-446655440000',
  '660e8400-e29b-41d4-a716-446655440001',
  [
    {
      seccionId: '770e8400-e29b-41d4-a716-446655440002',
      asientoId: '880e8400-e29b-41d4-a716-446655440003',
      tipoTicket: 'VIP',
      precio: 150.00,
      moneda: 'USD'
    }
  ]
);

console.log('Reserva creada:', reserva.reservaId);
console.log('Expira en:', reserva.fechaExpiracion);
```

---

### 2. Cancelar Reserva

Cancela una reserva existente antes de que expire.

**Endpoint:** `POST /api/Reservas/{id}/cancelar`

**Request Body:**
```json
{
  "reservaId": "990e8400-e29b-41d4-a716-446655440004",
  "motivo": "Cambio de planes"
}
```

**Response (200 OK):**
```json
{
  "reservaId": "990e8400-e29b-41d4-a716-446655440004",
  "exitoso": true,
  "mensaje": "Reserva cancelada exitosamente"
}
```

**Ejemplo JavaScript:**
```javascript
async function cancelarReserva(reservaId, motivo) {
  const response = await fetch(
    `http://localhost:5010/api/Reservas/${reservaId}/cancelar`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        reservaId,
        motivo
      })
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Error al cancelar reserva');
  }

  return await response.json();
}
```

---

### 3. Confirmar Reserva

Confirma una reserva después de un pago exitoso.

**Endpoint:** `POST /api/Reservas/{id}/confirmar`

**Request Body:**
```json
{
  "reservaId": "990e8400-e29b-41d4-a716-446655440004",
  "pagoId": "aa0e8400-e29b-41d4-a716-446655440005"
}
```

**Response (200 OK):**
```json
{
  "reservaId": "990e8400-e29b-41d4-a716-446655440004",
  "fechaConfirmacion": "2026-01-09T10:05:00Z",
  "exitoso": true,
  "mensaje": "Reserva confirmada exitosamente"
}
```

---

## Eventos en Tiempo Real (RabbitMQ)

El servicio publica eventos de dominio a RabbitMQ cuando ocurren cambios importantes. El frontend puede suscribirse a estos eventos para actualizar la UI en tiempo real.

### Configuración de RabbitMQ

- **Host:** `localhost` (o `rabbitmq` si estás en Docker)
- **Puerto:** `5674` (AMQP)
- **Usuario:** `guest`
- **Contraseña:** `guest`
- **Exchange:** `reservations.domain.events` (tipo: `topic`)

### Eventos Disponibles

| Evento | Routing Key | Descripción |
|--------|-------------|-------------|
| `ReservaCreada` | `reservations.reserva.creada` | Se creó una nueva reserva |
| `ReservaConfirmada` | `reservations.reserva.confirmada` | Se confirmó una reserva |
| `ReservaExpirada` | `reservations.reserva.expirada` | Una reserva expiró por tiempo |
| `ReservaCancelada` | `reservations.reserva.cancelada` | Se canceló una reserva |

### Estructura de Eventos

Todos los eventos incluyen propiedades base:
```json
{
  "eventId": "bb0e8400-e29b-41d4-a716-446655440006",
  "occurredOn": "2026-01-09T10:00:00Z",
  "type": "ReservaExpirada"
}
```

---

## Escuchar Expiración de Reservas

### ¿Cuándo se Expiran las Reservas?

- Las reservas se expiran automáticamente cuando no se confirma el pago dentro del tiempo límite (por defecto 10 minutos).
- Un job de Hangfire ejecuta el proceso de expiración cada minuto (configurable).
- Cuando una reserva expira, se publica el evento `ReservaExpirada` a RabbitMQ.

### Estructura del Evento ReservaExpirada

```json
{
  "eventId": "bb0e8400-e29b-41d4-a716-446655440006",
  "occurredOn": "2026-01-09T10:10:00Z",
  "reservaId": "990e8400-e29b-41d4-a716-446655440004",
  "eventoId": "550e8400-e29b-41d4-a716-446655440000",
  "asientosLiberados": [
    "880e8400-e29b-41d4-a716-446655440003",
    null
  ]
}
```

### Implementación con amqplib (Node.js)

```javascript
const amqp = require('amqplib');

class ReservationsEventSubscriber {
  constructor(connectionUrl) {
    this.connectionUrl = connectionUrl;
    this.connection = null;
    this.channel = null;
    this.exchange = 'reservations.domain.events';
  }

  async connect() {
    try {
      // Conectar a RabbitMQ
      this.connection = await amqp.connect(this.connectionUrl);
      this.channel = await this.connection.createChannel();

      // Declarar el exchange (debe existir, pero es seguro declararlo)
      await this.channel.assertExchange(this.exchange, 'topic', {
        durable: true
      });

      console.log('✅ Conectado a RabbitMQ');
    } catch (error) {
      console.error('❌ Error conectando a RabbitMQ:', error);
      throw error;
    }
  }

  async subscribeToExpiredReservations(callback) {
    // Crear una cola temporal exclusiva (se elimina al desconectar)
    const queueResult = await this.channel.assertQueue('', {
      exclusive: true,
      autoDelete: true
    });
    const queueName = queueResult.queue;

    // Binding: escuchar todos los eventos de expiración
    await this.channel.bindQueue(
      queueName,
      this.exchange,
      'reservations.reserva.expirada'
    );

    console.log(`📡 Escuchando eventos de expiración en cola: ${queueName}`);

    // Consumir mensajes
    await this.channel.consume(queueName, (message) => {
      if (message) {
        try {
          const event = JSON.parse(message.content.toString());
          console.log('⏰ Reserva expirada:', event);
          
          // Ejecutar callback con el evento
          callback(event);
          
          // Confirmar procesamiento
          this.channel.ack(message);
        } catch (error) {
          console.error('Error procesando evento:', error);
          // Rechazar mensaje y no reintentar
          this.channel.nack(message, false, false);
        }
      }
    });
  }

  async subscribeToCancelledReservations(callback) {
    const queueResult = await this.channel.assertQueue('', {
      exclusive: true,
      autoDelete: true
    });
    const queueName = queueResult.queue;

    await this.channel.bindQueue(
      queueName,
      this.exchange,
      'reservations.reserva.cancelada'
    );

    await this.channel.consume(queueName, (message) => {
      if (message) {
        try {
          const event = JSON.parse(message.content.toString());
          console.log('🚫 Reserva cancelada:', event);
          callback(event);
          this.channel.ack(message);
        } catch (error) {
          console.error('Error procesando evento:', error);
          this.channel.nack(message, false, false);
        }
      }
    });
  }

  async close() {
    if (this.channel) await this.channel.close();
    if (this.connection) await this.connection.close();
    console.log('🔌 Desconectado de RabbitMQ');
  }
}

// Uso
const subscriber = new ReservationsEventSubscriber(
  'amqp://guest:guest@localhost:5674'
);

await subscriber.connect();

// Escuchar expiraciones
await subscriber.subscribeToExpiredReservations((event) => {
  console.log(`⚠️ La reserva ${event.reservaId} ha expirado`);
  console.log(`📅 Asientos liberados:`, event.asientosLiberados);
  
  // Actualizar UI: mostrar notificación, actualizar mapa de asientos, etc.
  mostrarNotificacion(`Tu reserva ha expirado. Los asientos han sido liberados.`);
  actualizarMapaAsientos(event.eventoId, event.asientosLiberados);
});

// Escuchar cancelaciones
await subscriber.subscribeToCancelledReservations((event) => {
  console.log(`🚫 La reserva ${event.reservaId} fue cancelada`);
  console.log(`📅 Motivo: ${event.motivo}`);
  console.log(`📅 Asientos liberados:`, event.asientosLiberados);
  
  actualizarMapaAsientos(event.eventoId, event.asientosLiberados);
});
```

---

## Detectar Liberación de Recursos

### ¿Cuándo se Liberan Recursos?

Los recursos (asientos) se liberan cuando:

1. **Una reserva expira** (`ReservaExpirada`): Los asientos vuelven a estar disponibles automáticamente.
2. **Una reserva se cancela** (`ReservaCancelada`): Los asientos se liberan inmediatamente.

### Eventos que Indican Liberación

Ambos eventos (`ReservaExpirada` y `ReservaCancelada`) incluyen la propiedad `asientosLiberados`:

```json
{
  "reservaId": "990e8400-e29b-41d4-a716-446655440004",
  "eventoId": "550e8400-e29b-41d4-a716-446655440000",
  "asientosLiberados": [
    "880e8400-e29b-41d4-a716-446655440003",
    "990e8400-e29b-41d4-a716-446655440004"
  ]
}
```

**Nota:** Si un item de reserva no tiene asiento específico (admisión general), el valor será `null` en el array.

### Implementación: Detectar Liberación de Asientos

```javascript
class SeatAvailabilityManager {
  constructor(eventSubscriber) {
    this.eventSubscriber = eventSubscriber;
    this.availableSeats = new Map(); // eventoId -> Set<asientoId>
    this.listeners = new Set();
  }

  // Registrar callback cuando se libera un asiento
  onSeatReleased(callback) {
    this.listeners.add(callback);
  }

  async initialize(eventoId) {
    // Escuchar eventos de expiración
    await this.eventSubscriber.subscribeToExpiredReservations((event) => {
      if (event.eventoId === eventoId) {
        this.handleSeatsReleased(event.eventoId, event.asientosLiberados);
      }
    });

    // Escuchar eventos de cancelación
    await this.eventSubscriber.subscribeToCancelledReservations((event) => {
      if (event.eventoId === eventoId) {
        this.handleSeatsReleased(event.eventoId, event.asientosLiberados);
      }
    });
  }

  handleSeatsReleased(eventoId, asientosLiberados) {
    // Filtrar valores null (admisión general)
    const seats = asientosLiberados.filter(id => id !== null);
    
    console.log(`🔄 Asientos liberados para evento ${eventoId}:`, seats);

    // Notificar a todos los listeners
    this.listeners.forEach(callback => {
      callback({
        eventoId,
        asientosLiberados: seats
      });
    });

    // Actualizar estado local
    if (!this.availableSeats.has(eventoId)) {
      this.availableSeats.set(eventoId, new Set());
    }
    
    seats.forEach(asientoId => {
      this.availableSeats.get(eventoId).add(asientoId);
    });
  }

  isSeatAvailable(eventoId, asientoId) {
    const available = this.availableSeats.get(eventoId);
    return available ? available.has(asientoId) : false;
  }
}

// Uso
const seatManager = new SeatAvailabilityManager(subscriber);

// Inicializar para un evento específico
await seatManager.initialize('550e8400-e29b-41d4-a716-446655440000');

// Registrar callback cuando se libera un asiento
seatManager.onSeatReleased(({ eventoId, asientosLiberados }) => {
  console.log(`✅ Asientos disponibles nuevamente:`, asientosLiberados);
  
  // Actualizar UI: marcar asientos como disponibles en el mapa
  asientosLiberados.forEach(asientoId => {
    marcarAsientoComoDisponible(eventoId, asientoId);
  });
  
  // Mostrar notificación
  mostrarNotificacion(`${asientosLiberados.length} asiento(s) disponible(s) nuevamente`);
});
```

---

## Ejemplos Completos

### Ejemplo 1: Flujo Completo de Reserva con Escucha de Eventos

```javascript
import { ReservationsEventSubscriber } from './reservations-event-subscriber';
import { SeatAvailabilityManager } from './seat-availability-manager';

class ReservationsApp {
  constructor() {
    this.subscriber = new ReservationsEventSubscriber(
      'amqp://guest:guest@localhost:5674'
    );
    this.seatManager = new SeatAvailabilityManager(this.subscriber);
    this.activeReservations = new Map(); // reservaId -> { eventoId, fechaExpiracion }
  }

  async initialize() {
    // Conectar a RabbitMQ
    await this.subscriber.connect();

    // Escuchar todos los eventos relevantes
    await this.setupEventListeners();
  }

  async setupEventListeners() {
    // Escuchar expiraciones
    await this.subscriber.subscribeToExpiredReservations((event) => {
      this.handleReservationExpired(event);
    });

    // Escuchar cancelaciones
    await this.subscriber.subscribeToCancelledReservations((event) => {
      this.handleReservationCancelled(event);
    });

    // Escuchar confirmaciones
    await this.subscriber.subscribeToConfirmedReservations((event) => {
      this.handleReservationConfirmed(event);
    });
  }

  async crearReserva(eventoId, asistenteId, items) {
    try {
      const response = await fetch('http://localhost:5010/api/Reservas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventoId, asistenteId, items })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error);
      }

      const reserva = await response.json();
      
      // Guardar información de la reserva
      this.activeReservations.set(reserva.reservaId, {
        eventoId,
        fechaExpiracion: new Date(reserva.fechaExpiracion),
        items
      });

      // Iniciar countdown visual
      this.startExpirationCountdown(reserva.reservaId, reserva.fechaExpiracion);

      return reserva;
    } catch (error) {
      console.error('Error creando reserva:', error);
      throw error;
    }
  }

  handleReservationExpired(event) {
    const reserva = this.activeReservations.get(event.reservaId);
    
    if (reserva) {
      console.log(`⏰ Reserva ${event.reservaId} expirada`);
      
      // Eliminar de reservas activas
      this.activeReservations.delete(event.reservaId);
      
      // Actualizar UI
      this.showExpirationNotification(event.reservaId);
      this.updateSeatMap(event.eventoId, event.asientosLiberados);
      
      // Detener countdown
      this.stopExpirationCountdown(event.reservaId);
    }
  }

  handleReservationCancelled(event) {
    const reserva = this.activeReservations.get(event.reservaId);
    
    if (reserva) {
      console.log(`🚫 Reserva ${event.reservaId} cancelada`);
      
      this.activeReservations.delete(event.reservaId);
      this.updateSeatMap(event.eventoId, event.asientosLiberados);
      this.stopExpirationCountdown(event.reservaId);
    }
  }

  handleReservationConfirmed(event) {
    const reserva = this.activeReservations.get(event.reservaId);
    
    if (reserva) {
      console.log(`✅ Reserva ${event.reservaId} confirmada`);
      
      this.activeReservations.delete(event.reservaId);
      this.showConfirmationNotification(event.reservaId);
      this.stopExpirationCountdown(event.reservaId);
    }
  }

  startExpirationCountdown(reservaId, fechaExpiracion) {
    const interval = setInterval(() => {
      const now = new Date();
      const expiration = new Date(fechaExpiracion);
      const remaining = expiration - now;

      if (remaining <= 0) {
        clearInterval(interval);
        return;
      }

      const minutes = Math.floor(remaining / 60000);
      const seconds = Math.floor((remaining % 60000) / 1000);
      
      // Actualizar UI con countdown
      this.updateCountdownUI(reservaId, `${minutes}:${seconds.toString().padStart(2, '0')}`);
    }, 1000);
  }

  stopExpirationCountdown(reservaId) {
    // Implementar lógica para detener countdown
  }

  updateCountdownUI(reservaId, timeRemaining) {
    // Actualizar elemento DOM con countdown
    const element = document.getElementById(`countdown-${reservaId}`);
    if (element) {
      element.textContent = `Tiempo restante: ${timeRemaining}`;
    }
  }

  showExpirationNotification(reservaId) {
    // Mostrar notificación al usuario
    alert(`Tu reserva ${reservaId} ha expirado. Los asientos han sido liberados.`);
  }

  showConfirmationNotification(reservaId) {
    alert(`¡Reserva ${reservaId} confirmada exitosamente!`);
  }

  updateSeatMap(eventoId, asientosLiberados) {
    // Actualizar mapa de asientos en la UI
    asientosLiberados.forEach(asientoId => {
      if (asientoId) {
        const seatElement = document.querySelector(`[data-seat-id="${asientoId}"]`);
        if (seatElement) {
          seatElement.classList.remove('reserved');
          seatElement.classList.add('available');
        }
      }
    });
  }
}

// Uso
const app = new ReservationsApp();
await app.initialize();

// Crear reserva
const reserva = await app.crearReserva(
  '550e8400-e29b-41d4-a716-446655440000',
  '660e8400-e29b-41d4-a716-446655440001',
  [
    {
      seccionId: '770e8400-e29b-41d4-a716-446655440002',
      asientoId: '880e8400-e29b-41d4-a716-446655440003',
      tipoTicket: 'VIP',
      precio: 150.00,
      moneda: 'USD'
    }
  ]
);
```

### Ejemplo 2: React Hook para Escuchar Eventos

```javascript
import { useEffect, useState } from 'react';
import { ReservationsEventSubscriber } from './reservations-event-subscriber';

export function useReservationEvents(reservaId) {
  const [event, setEvent] = useState(null);
  const [subscriber, setSubscriber] = useState(null);

  useEffect(() => {
    const sub = new ReservationsEventSubscriber(
      'amqp://guest:guest@localhost:5674'
    );

    sub.connect().then(() => {
      setSubscriber(sub);

      // Escuchar expiraciones
      sub.subscribeToExpiredReservations((event) => {
        if (event.reservaId === reservaId) {
          setEvent({ type: 'expired', ...event });
        }
      });

      // Escuchar cancelaciones
      sub.subscribeToCancelledReservations((event) => {
        if (event.reservaId === reservaId) {
          setEvent({ type: 'cancelled', ...event });
        }
      });
    });

    return () => {
      if (sub) {
        sub.close();
      }
    };
  }, [reservaId]);

  return event;
}

// Uso en componente
function ReservaComponent({ reservaId }) {
  const event = useReservationEvents(reservaId);

  useEffect(() => {
    if (event) {
      if (event.type === 'expired') {
        alert('Tu reserva ha expirado');
      } else if (event.type === 'cancelled') {
        alert('Tu reserva fue cancelada');
      }
    }
  }, [event]);

  return <div>Reserva: {reservaId}</div>;
}
```

---

## Manejo de Errores

### Errores Comunes de la API

| Código | Descripción | Solución |
|--------|-------------|----------|
| `400 Bad Request` | Datos inválidos | Verificar formato del request |
| `404 Not Found` | Reserva no encontrada | Verificar que el ID existe |
| `503 Service Unavailable` | Bloqueo no adquirido (asiento ocupado) | Reintentar después de un breve delay |

### Ejemplo de Manejo de Errores

```javascript
async function crearReservaConReintento(eventoId, asistenteId, items, maxRetries = 3) {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const response = await fetch('http://localhost:5010/api/Reservas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eventoId, asistenteId, items })
      });

      if (response.ok) {
        return await response.json();
      }

      const error = await response.json();

      // Si es error de bloqueo, reintentar
      if (response.status === 503) {
        if (attempt < maxRetries) {
          const delay = attempt * 1000; // Backoff exponencial
          console.log(`Reintentando en ${delay}ms... (intento ${attempt}/${maxRetries})`);
          await new Promise(resolve => setTimeout(resolve, delay));
          continue;
        }
      }

      throw new Error(error.error || 'Error desconocido');
    } catch (error) {
      if (attempt === maxRetries) {
        throw error;
      }
    }
  }
}
```

### Errores de Conexión RabbitMQ

```javascript
class ReservationsEventSubscriber {
  // ... código anterior ...

  async connect() {
    let retries = 0;
    const maxRetries = 5;
    const retryDelay = 2000;

    while (retries < maxRetries) {
      try {
        this.connection = await amqp.connect(this.connectionUrl);
        this.channel = await this.connection.createChannel();
        
        // Manejar desconexiones inesperadas
        this.connection.on('close', () => {
          console.warn('⚠️ Conexión RabbitMQ cerrada. Reintentando...');
          this.reconnect();
        });

        this.connection.on('error', (error) => {
          console.error('❌ Error en conexión RabbitMQ:', error);
        });

        console.log('✅ Conectado a RabbitMQ');
        return;
      } catch (error) {
        retries++;
        console.error(`❌ Error conectando (intento ${retries}/${maxRetries}):`, error.message);
        
        if (retries < maxRetries) {
          await new Promise(resolve => setTimeout(resolve, retryDelay));
        } else {
          throw new Error('No se pudo conectar a RabbitMQ después de múltiples intentos');
        }
      }
    }
  }

  async reconnect() {
    await this.close();
    await this.connect();
    // Re-suscribirse a los eventos
    await this.setupEventListeners();
  }
}
```

---

## Mejores Prácticas

### 1. Manejo de Reconexión

Siempre implementa lógica de reconexión automática para RabbitMQ:

```javascript
// Implementar heartbeat y reconexión automática
setInterval(async () => {
  if (!this.connection || this.connection.connection.ready) {
    try {
      await this.connection.connection.check();
    } catch (error) {
      console.warn('Conexión perdida, reconectando...');
      await this.reconnect();
    }
  }
}, 30000); // Cada 30 segundos
```

### 2. Idempotencia

Los eventos pueden llegar duplicados. Implementa idempotencia:

```javascript
const processedEvents = new Set();

function processEvent(event) {
  // Verificar si ya procesamos este evento
  if (processedEvents.has(event.eventId)) {
    console.log('Evento ya procesado, ignorando:', event.eventId);
    return;
  }

  // Procesar evento
  handleEvent(event);

  // Marcar como procesado (con TTL para evitar memory leak)
  processedEvents.add(event.eventId);
  setTimeout(() => processedEvents.delete(event.eventId), 3600000); // 1 hora
}
```

### 3. Manejo de Mensajes No Procesados

Implementa un dead letter queue para mensajes que no se pueden procesar:

```javascript
await this.channel.assertQueue('reservations-events-dlq', {
  durable: true
});

// Configurar DLQ en la cola principal
await this.channel.assertQueue('reservations-events', {
  durable: true,
  arguments: {
    'x-dead-letter-exchange': '',
    'x-dead-letter-routing-key': 'reservations-events-dlq'
  }
});
```

### 4. Logging y Monitoreo

Registra todos los eventos recibidos para debugging:

```javascript
function logEvent(event, source) {
  console.log(`[${new Date().toISOString()}] ${source}:`, {
    eventId: event.eventId,
    type: event.type || event.constructor?.name,
    reservaId: event.reservaId,
    eventoId: event.eventoId
  });
}
```

### 5. Validación de Eventos

Siempre valida la estructura de los eventos:

```javascript
function validateEvent(event, expectedType) {
  if (!event.eventId || !event.occurredOn) {
    throw new Error('Evento inválido: faltan propiedades requeridas');
  }

  if (expectedType && event.type !== expectedType) {
    throw new Error(`Tipo de evento incorrecto. Esperado: ${expectedType}, Recibido: ${event.type}`);
  }

  return true;
}
```

### 6. Timeout para Operaciones

Implementa timeouts para evitar que la aplicación se cuelgue:

```javascript
async function crearReservaConTimeout(eventoId, asistenteId, items, timeout = 10000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch('http://localhost:5010/api/Reservas', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ eventoId, asistenteId, items }),
      signal: controller.signal
    });

    clearTimeout(timeoutId);
    return await response.json();
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Timeout: La operación tardó demasiado');
    }
    throw error;
  }
}
```

---

## Recursos Adicionales

- **Swagger UI:** http://localhost:5010 (documentación interactiva de la API)
- **RabbitMQ Management UI:** http://localhost:15674 (usuario: `guest`, contraseña: `guest`)
- **Health Check:** http://localhost:5010/health

---

## Notas Importantes

1. **Jobs de Hangfire**: Los jobs de expiración se ejecutan automáticamente en el backend. No es necesario llamarlos desde el frontend.

2. **Tiempo de Expiración**: Por defecto, las reservas expiran después de 10 minutos si no se confirman. Este tiempo es configurable en el backend.

3. **Asientos Liberados**: Cuando una reserva expira o se cancela, los asientos se liberan automáticamente. El frontend debe escuchar los eventos para actualizar la UI en tiempo real.

4. **Concurrencia**: Si múltiples usuarios intentan reservar el mismo asiento simultáneamente, solo uno tendrá éxito. Los demás recibirán un error 503 que deben manejar con reintentos.

5. **WebSockets vs RabbitMQ**: Para aplicaciones web, considera usar WebSockets con un servicio intermedio que consuma RabbitMQ y reenvíe eventos al frontend, ya que los navegadores no pueden conectarse directamente a RabbitMQ.

---
