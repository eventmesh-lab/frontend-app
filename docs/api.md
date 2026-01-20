# API - Contrato de Interfaz EventHub

## Visión General

Esta documentación describe todos los endpoints que el frontend EventHub consume de los microservicios backend. Los backends están implementados en C# usando ASP.NET Core y siguen principios de arquitectura limpia y CQRS.

## Base URLs

```
Users API:          http://localhost:7181
Events API:         http://localhost:5000
Tickets API:        http://localhost:5005
Reservations API:   http://localhost:5010
Streaming API:      http://localhost:7001
Forums API:         http://localhost:8082
Keycloak:           http://localhost:8180
SignalR Hub:        ws://localhost:7184/hubs/notifications
```

## Autenticación

Todos los endpoints protegidos requieren header de autenticación:

```http
Authorization: Bearer <access_token>
```

El `access_token` se obtiene via flujo OAuth2 con Keycloak:

1. **Authorization Code Flow** (recomendado para web apps)
2. **Direct Grant / Resource Owner Password** (desarrollo/testing)

### OAuth2 - Authorization Code Flow

**1. Redirigir al usuario a Keycloak:**
```
GET http://localhost:8180/realms/myrealm/protocol/openid-connect/auth
  ?client_id=aspnetcore
  &redirect_uri=http://localhost:3000/oauth/callback
  &response_type=code
  &scope=openid profile email
```

**2. Intercambiar code por tokens:**
```http
POST /realms/myrealm/protocol/openid-connect/token
Content-Type: application/x-www-form-urlencoded

grant_type=authorization_code
&code=xyz123
&client_id=aspnetcore
&redirect_uri=http://localhost:3000/oauth/callback
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "expires_in": 3600,
  "refresh_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "id_token": "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "Bearer"
}
```

### Refresh Token

```http
POST /realms/myrealm/protocol/openid-connect/token
Content-Type: application/x-www-form-urlencoded

grant_type=refresh_token
&refresh_token=<refresh_token>
&client_id=aspnetcore
```

---

## 📅 EVENTOS API

### GET /api/Eventos/publicados
Obtiene lista de eventos en estado "Publicado" disponibles para reserva.

**Auth:** Opcional (pública)

**Query Parameters:**
```
categoria?: string
fechaDesde?: string (ISO 8601)
fechaHasta?: string (ISO 8601)
precioMin?: number
precioMax?: number
```

**Response 200:**
```json
[
  {
    "id": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
    "nombre": "Tech Summit 2025",
    "descripcion": "Conferencia de tecnología más importante del año",
    "categoria": "Tecnología",
    "fecha": "2025-06-15T09:00:00Z",
    "horasDuracion": 8,
    "minutosDuracion": 0,
    "venue": "Centro de Convenciones",
    "venueId": "venue-123",
    "estado": "Publicado",
    "precio": 150.00,
    "aforo": 500,
    "aforoDisponible": 347,
    "organizadorId": "org-456",
    "tarifaPublicacion": 500.00,
    "transaccionPagoId": "pay-789",
    "mainImageUrl": "https://storageaccount.blob.core.windows.net/events/evt123-main.jpg",
    "secondaryImageUrls": [
      "https://storageaccount.blob.core.windows.net/events/evt123-sec1.jpg",
      "https://storageaccount.blob.core.windows.net/events/evt123-sec2.jpg"
    ],
    "brochureUrl": "https://storageaccount.blob.core.windows.net/events/evt123-brochure.pdf",
    "secciones": [
      {
        "id": "sec-1",
        "nombre": "VIP",
        "capacidad": 50,
        "precio": 300.00,
        "tipoAsiento": "Numerado"
      },
      {
        "id": "sec-2",
        "nombre": "General",
        "capacidad": 450,
        "precio": 150.00,
        "tipoAsiento": "General"
      }
    ],
    "inscripcionesCount": 153,
    "canBeDeleted": false,
    "canBeCancelled": true,
    "cancellationDeadline": "2025-06-13T09:00:00Z",
    "imagenRestringida": false,
    "folletoRestringido": false,
    "fechaCreacion": "2025-01-10T14:30:00Z",
    "fechaActualizacion": "2025-01-15T10:20:00Z",
    "contadorReprogramaciones": 0
  }
]
```

### GET /api/Eventos/{id}
Obtiene detalle completo de un evento específico.

**Auth:** Opcional

**Response 200:** Mismo objeto que el listado

**Response 404:**
```json
{
  "message": "Evento no encontrado"
}
```

### POST /api/Eventos
Crea un nuevo evento en estado "Borrador".

**Auth:** Required (Organizador o Admin)

**Request Body:**
```json
{
  "nombre": "Mi Evento 2025",
  "descripcion": "Descripción detallada del evento",
  "fecha": "2025-08-20T18:00:00Z",
  "horasDuracion": 3,
  "minutosDuracion": 30,
  "organizadorId": "org-456",
  "venueId": "venue-789",
  "categoria": "Música",
  "tarifaPublicacion": 500.00,
  "secciones": [
    {
      "nombre": "Platea",
      "capacidad": 200,
      "precio": 100.00,
      "tipoAsiento": "Numerado"
    },
    {
      "nombre": "General",
      "capacidad": 300,
      "precio": 50.00,
      "tipoAsiento": "General"
    }
  ]
}
```

**Response 201:**
```json
{
  "Id": "3fa85f64-5717-4562-b3fc-2c963f66afa6"
}
```

**Response 400:**
```json
{
  "message": "Datos inválidos",
  "errors": [
    "El nombre es requerido",
    "La fecha debe ser futura"
  ]
}
```

### POST /api/Eventos/{id}/publicar
Publica un evento (cambia estado de Borrador a Publicado). Requiere que el pago de publicación esté confirmado.

**Auth:** Required (Organizador propietario o Admin)

**Request Body:**
```json
{
  "pagoConfirmadoId": "pay-12345"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Evento publicado exitosamente"
}
```

**Response 409:**
```json
{
  "message": "El evento no está en estado válido para publicación"
}
```

### PUT /api/Eventos/{id}
Edita un evento existente. Solo se pueden editar eventos en estado Borrador o Publicado (con restricciones).

**Auth:** Required (Organizador propietario o Admin)

**Request Body:** Partial<Evento> (solo campos a actualizar)

**Response 200:** Evento actualizado completo

### DELETE /api/Eventos/{id}
Elimina físicamente un evento. Solo permitido si `canBeDeleted = true` (sin inscripciones).

**Auth:** Required (Organizador propietario o Admin)

**Response 204:** No Content

**Response 409:**
```json
{
  "message": "No se puede eliminar un evento con inscripciones activas"
}
```

### POST /api/Eventos/{id}/cancel
Cancela lógicamente un evento (estado → Cancelado). Dispara proceso de reembolsos.

**Auth:** Required (Organizador propietario o Admin)

**Request Body:**
```json
{
  "motivo": "El venue fue cerrado por mantenimiento",
  "canceladoPor": "org-456"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Evento cancelado. Se iniciará proceso de reembolsos."
}
```

### POST /api/Eventos/{id}/reprogramar
Reprograma la fecha de un evento.

**Auth:** Required (Organizador propietario o Admin)

**Request Body:**
```json
{
  "nuevaFecha": "2025-09-15T18:00:00Z",
  "nuevasHoras": 3,
  "nuevosMinutos": 0,
  "reprogramadoPor": "org-456"
}
```

**Response 200:**
```json
{
  "success": true,
  "message": "Evento reprogramado"
}
```

### POST /api/Eventos/{id}/pagar-publicacion
Registra el pago de la tarifa de publicación de un evento.

**Auth:** Required (Organizador propietario)

**Request Body:**
```json
{
  "transaccionPagoId": "pi_stripe_abc123",
  "monto": 500.00
}
```

**Response 200:**
```json
{
  "success": true
}
```

⚠️ **Nota Importante:** El backend debe validar que `transaccionPagoId` corresponda a un pago real en Stripe. El frontend actualmente tiene un workaround que genera GUIDs falsos en desarrollo.

### POST /api/Eventos/{id}/iniciar
Marca un evento Publicado como EnCurso. Habilita funcionalidades de streaming.

**Auth:** Required (Organizador propietario o Admin)

**Response 200:**
```json
{
  "success": true
}
```

### POST /api/Eventos/{id}/finalizar
Marca un evento EnCurso como Finalizado.

**Auth:** Required (Organizador propietario o Admin)

**Response 200:**
```json
{
  "success": true
}
```

### POST /api/Eventos/{id}/imagen-principal
Sube la imagen principal del evento a blob storage.

**Auth:** Required (Organizador propietario)

**Request:** multipart/form-data
```
file: <binary>
```

**Response 200:**
```json
{
  "url": "https://storageaccount.blob.core.windows.net/events/evt123-main.jpg"
}
```

### POST /api/Eventos/{id}/imagen-secundaria
Sube imágenes secundarias (máximo recomendado: 5).

**Auth:** Required (Organizador propietario)

**Request:** multipart/form-data
```
files: <binary[]>
```

**Response 200:**
```json
{
  "urls": [
    "https://storageaccount.blob.core.windows.net/events/evt123-sec1.jpg",
    "https://storageaccount.blob.core.windows.net/events/evt123-sec2.jpg"
  ]
}
```

### POST /api/Eventos/{id}/folleto
Sube un folleto PDF del evento.

**Auth:** Required (Organizador propietario)

**Request:** multipart/form-data
```
file: <binary PDF>
```

**Response 200:**
```json
{
  "url": "https://storageaccount.blob.core.windows.net/events/evt123-brochure.pdf"
}
```

### POST /api/Eventos/{id}/restringir-contenido
Permite al administrador restringir contenido inapropiado (imagen o folleto).

**Auth:** Required (Admin)

**Request Body:**
```json
{
  "tipoContenido": "imagen",
  "motivo": "Contenido inapropiado detectado"
}
```

**Response 200:**
```json
{
  "success": true
}
```

### GET /api/Eventos/organizador/{organizadorId}
Obtiene todos los eventos de un organizador.

**Auth:** Required (Organizador propietario o Admin)

**Response 200:** Array de Eventos

### GET /api/Eventos
Obtiene TODOS los eventos del sistema (cualquier estado). Solo para Admin.

**Auth:** Required (Admin)

**Response 200:** Array de Eventos

---

## 🎫 RESERVAS API

### POST /api/reservas
Crea una nueva reserva temporal. La reserva expira en 15-30 minutos si no se confirma con pago.

**Auth:** Required

**Request Body:**
```json
{
  "eventoId": "evt-123",
  "cantidad": 2,
  "seccionId": "sec-1"
}
```

**Response 201:**
```json
{
  "id": "res-abc",
  "asistenteId": "user-456",
  "eventoId": "evt-123",
  "cantidad": 2,
  "estado": "pendiente",
  "montoTotal": 300.00,
  "fechaCreacion": "2025-01-20T10:00:00Z",
  "fechaExpiracion": "2025-01-20T10:30:00Z",
  "codigoReserva": "RES20250120ABC"
}
```

**Response 409:**
```json
{
  "message": "Capacidad insuficiente. Solo quedan 1 espacios disponibles."
}
```

### GET /api/mis-reservas
Obtiene todas las reservas del usuario autenticado.

**Auth:** Required

**Response 200:**
```json
[
  {
    "id": "res-abc",
    "asistenteId": "user-456",
    "eventoId": "evt-123",
    "evento": {
      "nombre": "Tech Summit 2025",
      "fecha": "2025-06-15T09:00:00Z"
    },
    "cantidad": 2,
    "estado": "confirmada",
    "montoTotal": 300.00,
    "codigoReserva": "RES20250120ABC",
    "fechaCreacion": "2025-01-20T10:00:00Z",
    "fechaExpiracion": "2025-01-20T10:30:00Z"
  }
]
```

### GET /api/reservas/{id}
Obtiene detalle de una reserva específica.

**Auth:** Required (Propietario o Admin)

**Response 200:** Objeto Reserva completo

### DELETE /api/reservas/{id}
Cancela una reserva. Libera la capacidad reservada.

**Auth:** Required (Propietario o Admin)

**Response 204:** No Content

**Response 409:**
```json
{
  "message": "No se puede cancelar una reserva ya utilizada"
}
```

### PUT /api/reservas/{id}/confirmar
Confirma una reserva después de procesar el pago. Típicamente llamado por backend de pagos.

**Auth:** Required (Sistema)

**Response 200:**
```json
{
  "success": true
}
```

---

## 💳 PAGOS API (Integración con Stripe)

**Nota:** Los pagos se procesan vía Stripe Elements en el frontend. El backend actúa como intermediario.

### POST /api/pagos
Crea una intención de pago (Payment Intent) en Stripe.

**Auth:** Required

**Request Body:**
```json
{
  "reservaId": "res-abc",
  "monto": 300.00,
  "concepto": "Pago de reserva para Tech Summit 2025",
  "metodo": "tarjeta"
}
```

**Response 201:**
```json
{
  "id": "pay-123",
  "clientSecret": "pi_3abc123_secret_xyz",
  "reservaId": "res-abc",
  "monto": 300.00,
  "concepto": "Pago de reserva para Tech Summit 2025",
  "estado": "pendiente",
  "metodo": "tarjeta"
}
```

**Flujo de Pago con Stripe:**
```
1. Frontend llama POST /api/pagos → obtiene clientSecret
2. Frontend usa Stripe Elements con clientSecret
3. Usuario ingresa datos de tarjeta
4. Stripe procesa pago → webhook notifica al backend
5. Backend confirma reserva → notifica vía SignalR
6. Frontend muestra confirmación
```

### GET /api/pagos/{id}
Obtiene detalle de un pago.

**Auth:** Required (Propietario o Admin)

**Response 200:**
```json
{
  "id": "pay-123",
  "reservaId": "res-abc",
  "monto": 300.00,
  "concepto": "Pago de reserva para Tech Summit 2025",
  "estado": "completado",
  "metodo": "tarjeta",
  "transaccionId": "pi_stripe_abc123",
  "fechaCreacion": "2025-01-20T10:05:00Z",
  "fechaActualizacion": "2025-01-20T10:06:00Z"
}
```

### GET /api/mis-pagos
Obtiene historial de pagos del usuario autenticado.

**Auth:** Required

**Response 200:** Array de Pagos

### POST /api/pagos/{id}/reembolsar
Procesa reembolso de un pago (ej: por cancelación de evento).

**Auth:** Required (Admin o Sistema)

**Request Body:**
```json
{
  "motivo": "Evento cancelado por el organizador"
}
```

**Response 200:**
```json
{
  "success": true,
  "refundId": "re_stripe_xyz"
}
```

---

## 👥 USUARIOS API

### GET /api/usuarios/me
Obtiene perfil del usuario autenticado.

**Auth:** Required

**Response 200:**
```json
{
  "id": "user-456",
  "nombre": "Juan Pérez",
  "email": "juan@example.com",
  "avatar": "https://storageaccount.blob.core.windows.net/avatars/user456.jpg",
  "role": "usuario",
  "activo": true,
  "fechaCreacion": "2024-12-01T00:00:00Z",
  "fechaActualizacion": "2025-01-10T15:30:00Z"
}
```

### PUT /api/usuarios/me
Actualiza perfil del usuario autenticado.

**Auth:** Required

**Request Body:**
```json
{
  "nombre": "Juan Carlos Pérez",
  "avatar": "https://new-avatar-url.com/avatar.jpg"
}
```

**Response 200:** Usuario actualizado

### GET /api/usuarios/{id}
Obtiene perfil de cualquier usuario (solo Admin).

**Auth:** Required (Admin)

**Response 200:** Objeto Usuario

### GET /api/usuarios
Lista todos los usuarios del sistema.

**Auth:** Required (Admin)

**Query Parameters:**
```
role?: "usuario" | "organizador" | "admin"
activo?: boolean
page?: number
pageSize?: number
```

**Response 200:**
```json
{
  "data": [...usuarios],
  "total": 150,
  "page": 1,
  "pageSize": 20
}
```

### POST /api/usuarios
Crea un nuevo usuario (registro o admin creando organizador).

**Auth:** Opcional (registro público) o Required (Admin creando organizador)

**Request Body:**
```json
{
  "nombre": "María González",
  "email": "maria@example.com",
  "password": "SecurePassword123!",
  "role": "usuario"
}
```

**Response 201:**
```json
{
  "id": "user-789",
  "nombre": "María González",
  "email": "maria@example.com",
  "role": "usuario",
  "activo": true
}
```

### PUT /api/usuarios/{id}/activar
Activa o desactiva un usuario.

**Auth:** Required (Admin)

**Request Body:**
```json
{
  "activo": false
}
```

**Response 200:**
```json
{
  "success": true
}
```

---

## 📺 STREAMING API

### POST /api/streaming/session
Crea una sesión de streaming para un evento.

**Auth:** Required (Organizador del evento)

**Request Body:**
```json
{
  "eventId": "evt-123",
  "scheduledStartTime": "2025-06-15T09:00:00Z",
  "maxViewers": 500
}
```

**Response 201:**
```json
{
  "SessionId": "stream-session-abc"
}
```

### POST /api/streaming/token
Genera token de acceso para que un asistente vea el streaming.

**Auth:** Required

**Request Body:**
```json
{
  "sessionId": "stream-session-abc",
  "userId": "user-456",
  "reservationId": "res-xyz"
}
```

**Response 200:**
```json
{
  "token": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "expiresAt": "2025-06-15T12:00:00Z",
  "refreshTokenExpiresAt": "2025-06-15T18:00:00Z",
  "userId": "user-456",
  "sessionId": "stream-session-abc"
}
```

### POST /api/streaming/refresh-token
Refresca un token de streaming expirado.

**Auth:** Required

**Request Body:**
```json
{
  "expiredToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..."
}
```

**Response 200:** Mismo formato que /token

### GET /api/streaming/session/{eventId}/access
Obtiene URL del stream para reproducción.

**Auth:** Required (Bearer token de streaming)

**Headers:**
```
Authorization: Bearer <streaming_token>
```

**Response 200:**
```json
{
  "streamUrl": "https://streaming-server.com/live/evt-123/playlist.m3u8",
  "sessionId": "stream-session-abc",
  "expiresAt": "2025-06-15T12:00:00Z",
  "quality": "1080p"
}
```

### GET /api/streaming/validate
Valida un token de streaming.

**Auth:** Not Required (token in query)

**Query Parameters:**
```
token=<streaming_token>
```

**Response 200:**
```json
{
  "StreamUrl": "https://streaming-server.com/live/evt-123/playlist.m3u8",
  "IsEncrypted": true
}
```

---

## 💬 FORUMS API

### POST /api/foros
Crea un foro para un evento.

**Auth:** Required (Organizador del evento o Admin)

**Request Body:**
```json
{
  "EventoId": "evt-123",
  "Titulo": "Foro de Tech Summit 2025",
  "Descripcion": "Espacio de discusión para asistentes"
}
```

**Response 201:**
```json
{
  "ForoId": "foro-abc",
  "EventoId": "evt-123"
}
```

### GET /api/foros/evento/{eventoId}
Obtiene el foro de un evento.

**Auth:** Optional

**Response 200:**
```json
{
  "Id": "foro-abc",
  "EventoId": "evt-123",
  "Titulo": "Foro de Tech Summit 2025",
  "Descripcion": "Espacio de discusión para asistentes",
  "FechaCreacion": "2025-01-15T00:00:00Z"
}
```

**Response 404:**
```json
{
  "message": "Foro no encontrado para este evento"
}
```

### POST /api/foros/{foroId}/hilos
Crea un hilo de discusión en el foro.

**Auth:** Required

**Request Body:**
```json
{
  "Titulo": "¿Habrá coffee break?",
  "Contenido": "Hola, quisiera saber si el evento incluye refrigerios",
  "UsuarioId": "user-456"
}
```

**Response 201:**
```json
{
  "HiloId": "hilo-xyz"
}
```

### GET /api/hilos/{foroId}
Lista hilos de un foro con paginación.

**Auth:** Optional

**Query Parameters:**
```
page?: number (default: 1)
pageSize?: number (default: 20, max: 100)
ordenar?: "recientes" | "populares" (default: "recientes")
```

**Response 200:**
```json
{
  "data": [
    {
      "Id": "hilo-xyz",
      "ForoId": "foro-abc",
      "Titulo": "¿Habrá coffee break?",
      "Contenido": "Hola, quisiera saber si el evento incluye refrigerios",
      "UsuarioId": "user-456",
      "UsuarioNombre": "Juan Pérez",
      "FechaCreacion": "2025-01-16T10:00:00Z",
      "NumeroRespuestas": 3
    }
  ],
  "total": 25,
  "page": 1,
  "pageSize": 20
}
```

### POST /api/comentarios
Añade un comentario a un hilo.

**Auth:** Required

**Request Body:**
```json
{
  "HiloId": "hilo-xyz",
  "Contenido": "Sí, habrá coffee break a las 11am",
  "UsuarioId": "user-789"
}
```

**Response 201:**
```json
{
  "ComentarioId": "comment-123"
}
```

### GET /api/comentarios/{hiloId}
Lista comentarios de un hilo.

**Auth:** Optional

**Query Parameters:**
```
page?: number
pageSize?: number
```

**Response 200:**
```json
{
  "data": [
    {
      "Id": "comment-123",
      "HiloId": "hilo-xyz",
      "Contenido": "Sí, habrá coffee break a las 11am",
      "UsuarioId": "user-789",
      "UsuarioNombre": "María González",
      "FechaCreacion": "2025-01-16T11:00:00Z"
    }
  ],
  "total": 3,
  "page": 1,
  "pageSize": 20
}
```

### DELETE /api/comentarios
Elimina un comentario (soft delete).

**Auth:** Required (Autor, Organizador del evento o Admin)

**Request Body:**
```json
{
  "ComentarioId": "comment-123",
  "UsuarioId": "user-789"
}
```

**Response 204:** No Content

---

## 🎁 COMPLEMENTARY SERVICES API

Servicios adicionales que pueden solicitar los asistentes (catering, transporte, merchandising).

### POST /api/complementary/request
Solicita un servicio complementario.

**Auth:** Required

**Request Body:**
```json
{
  "serviceType": "catering",
  "reservationId": "res-xyz",
  "eventId": "evt-123",
  "quantity": 1,
  "details": {
    "mealType": "vegetarian",
    "allergies": "nuts"
  }
}
```

**Response 202:**
```json
{
  "ServiceId": "svc-abc",
  "Status": "Pending"
}
```

### GET /api/complementary/{serviceId}
Obtiene estado de un servicio complementario.

**Auth:** Required

**Response 200:**
```json
{
  "ServiceId": "svc-abc",
  "ServiceType": "catering",
  "Status": "Confirmed",
  "ReservationId": "res-xyz",
  "EventId": "evt-123",
  "Quantity": 1,
  "Details": {
    "mealType": "vegetarian",
    "allergies": "nuts"
  },
  "CreatedAt": "2025-01-18T10:00:00Z",
  "UpdatedAt": "2025-01-18T11:00:00Z"
}
```

### GET /api/complementary/my-services
Lista servicios complementarios del usuario autenticado.

**Auth:** Required

**Query Parameters:**
```
reservationId?: string
```

**Response 200:** Array de ServiceStatusDto

### POST /api/complementary/{serviceId}/cancel
Cancela un servicio complementario pendiente.

**Auth:** Required

**Response 204:** No Content

---

## 🔔 SIGNALR NOTIFICATIONS HUB

**URL:** `ws://localhost:7184/hubs/notifications`

### Eventos del Cliente (envía)
```typescript
connection.invoke("JoinUserGroup", userId)
connection.invoke("LeaveUserGroup", userId)
```

### Eventos del Servidor (recibe)

**OnReservaConfirmada:**
```json
{
  "type": "ReservaConfirmada",
  "reservaId": "res-abc",
  "eventoNombre": "Tech Summit 2025",
  "cantidad": 2,
  "timestamp": "2025-01-20T10:06:00Z"
}
```

**OnPagoCompletado:**
```json
{
  "type": "PagoCompletado",
  "pagoId": "pay-123",
  "monto": 300.00,
  "timestamp": "2025-01-20T10:06:00Z"
}
```

**OnPagoFallido:**
```json
{
  "type": "PagoFallido",
  "pagoId": "pay-123",
  "motivo": "Tarjeta rechazada",
  "timestamp": "2025-01-20T10:06:00Z"
}
```

**OnEventoPublicado:**
```json
{
  "type": "EventoPublicado",
  "eventoId": "evt-123",
  "eventoNombre": "Tech Summit 2025",
  "timestamp": "2025-01-15T14:00:00Z"
}
```

**OnEventoCancelado:**
```json
{
  "type": "EventoCancelado",
  "eventoId": "evt-123",
  "eventoNombre": "Tech Summit 2025",
  "motivo": "Fuerza mayor",
  "timestamp": "2025-02-01T09:00:00Z"
}
```

**OnEventoActualizado:**
```json
{
  "type": "EventoActualizado",
  "eventoId": "evt-123",
  "cambios": ["fecha", "venue"],
  "timestamp": "2025-01-25T16:00:00Z"
}
```

---

## 📊 Códigos de Estado HTTP

| Código | Significado | Uso Común |
|--------|-------------|-----------|
| 200 | OK | Operación exitosa GET/PUT/POST |
| 201 | Created | Recurso creado exitosamente |
| 204 | No Content | DELETE exitoso |
| 400 | Bad Request | Datos inválidos en request |
| 401 | Unauthorized | Token ausente o inválido |
| 403 | Forbidden | Sin permisos para esta acción |
| 404 | Not Found | Recurso no existe |
| 409 | Conflict | Conflicto de estado (ej: capacidad agotada) |
| 422 | Unprocessable Entity | Validación de negocio falló |
| 500 | Internal Server Error | Error del servidor |

---

## 🔐 Roles y Permisos

| Endpoint | Usuario | Organizador | Admin |
|----------|---------|-------------|-------|
| GET /api/Eventos/publicados | ✅ | ✅ | ✅ |
| POST /api/Eventos | ❌ | ✅ | ✅ |
| PUT /api/Eventos/{id} | ❌ | ✅ (propio) | ✅ (todos) |
| DELETE /api/Eventos/{id} | ❌ | ✅ (propio) | ✅ (todos) |
| POST /api/reservas | ✅ | ✅ | ✅ |
| GET /api/usuarios | ❌ | ❌ | ✅ |
| POST /api/usuarios/{id}/activar | ❌ | ❌ | ✅ |

---

## 📝 Notas de Implementación

### Validación de Datos
- Todos los endpoints validan datos con FluentValidation en el backend
- El frontend usa Zod (disponible pero no implementado actualmente) y React Hook Form

### Manejo de Errores
- Errores 4xx: Devuelven JSON con `{ "message": "...", "errors": [...] }`
- Errores 5xx: Devuelven JSON con `{ "message": "Error interno del servidor" }`

### Paginación
- Endpoints que devuelven listas usan paginación cursor-based o offset-based
- Parámetros estándar: `page`, `pageSize`
- Response incluye: `data`, `total`, `page`, `pageSize`

### Caché
- El frontend cachea eventos publicados por 5 minutos
- Headers de caché HTTP: `Cache-Control`, `ETag`

### Rate Limiting
- Endpoints públicos: 100 requests/minuto por IP
- Endpoints autenticados: 1000 requests/minuto por usuario

---

## 🧪 Ejemplo Completo: Flujo de Compra de Ticket

**1. Usuario busca eventos:**
```http
GET /api/Eventos/publicados?categoria=Tecnología
```

**2. Usuario ve detalle:**
```http
GET /api/Eventos/3fa85f64-5717-4562-b3fc-2c963f66afa6
```

**3. Usuario crea reserva:**
```http
POST /api/reservas
Content-Type: application/json
Authorization: Bearer <token>

{
  "eventoId": "3fa85f64-5717-4562-b3fc-2c963f66afa6",
  "cantidad": 2
}

Response 201:
{
  "id": "res-abc",
  "montoTotal": 300.00,
  "fechaExpiracion": "2025-01-20T10:30:00Z"
}
```

**4. Usuario inicia pago:**
```http
POST /api/pagos
Content-Type: application/json
Authorization: Bearer <token>

{
  "reservaId": "res-abc",
  "monto": 300.00,
  "concepto": "Pago de reserva",
  "metodo": "tarjeta"
}

Response 201:
{
  "id": "pay-123",
  "clientSecret": "pi_3abc123_secret_xyz"
}
```

**5. Frontend procesa pago con Stripe:**
```javascript
const { error, paymentIntent } = await stripe.confirmCardPayment(
  clientSecret,
  {
    payment_method: {
      card: elements.getElement(CardElement),
      billing_details: { name: 'Juan Pérez' }
    }
  }
)
```

**6. Webhook de Stripe notifica al backend → Backend confirma reserva**

**7. SignalR notifica al frontend:**
```json
{
  "type": "ReservaConfirmada",
  "reservaId": "res-abc"
}
```

**8. Usuario ve confirmación y recibe tickets por email**

---

Esta documentación cubre el 95% de los endpoints utilizados por el frontend EventHub. Para detalles de implementación específicos, consulta el código en `src/adapters/api/`.
