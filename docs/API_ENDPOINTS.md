# EventHub - API Endpoints Documentation

Esta es una guía completa de todos los endpoints que el frontend utiliza y que necesitarán ser implementados en el backend.

## Autenticación (Keycloak)

### OAuth2 Authorization Code Flow
- **Endpoint:** `POST /realms/{realm}/protocol/openid-connect/auth`
- **Descripción:** Inicia el flujo de autorización OAuth2
- **Parámetros:**
  - `client_id`: ID del cliente Keycloak
  - `redirect_uri`: URI de redirección
  - `response_type`: "code"
  - `scope`: "openid profile email"

### Token Exchange
- **Endpoint:** `POST /realms/{realm}/protocol/openid-connect/token`
- **Descripción:** Intercambia authorization code por tokens
- **Body:**
  \`\`\`json
  {
    "grant_type": "authorization_code",
    "code": "string",
    "client_id": "string",
    "redirect_uri": "string"
  }
  \`\`\`
- **Respuesta:**
  \`\`\`json
  {
    "access_token": "string",
    "refresh_token": "string",
    "id_token": "string",
    "expires_in": 3600,
    "token_type": "Bearer"
  }
  \`\`\`

### Direct Grant (Email/Password)
- **Endpoint:** `POST /realms/{realm}/protocol/openid-connect/token`
- **Descripción:** Login directo con email y contraseña
- **Body:**
  \`\`\`json
  {
    "grant_type": "password",
    "username": "usuario@example.com",
    "password": "string",
    "client_id": "string"
  }
  \`\`\`

## Eventos

### Obtener Eventos Publicados
- **Endpoint:** `GET /api/eventos/publicados`
- **Autenticación:** Opcional
- **Parámetros Query:**
  - `categoria`: string (opcional)
  - `fechaDesde`: ISO 8601 (opcional)
  - `fechaHasta`: ISO 8601 (opcional)
  - `precioMin`: number (opcional)
  - `precioMax`: number (opcional)
- **Respuesta:**
  \`\`\`json
  [
    {
      "id": "evt_001",
      "nombre": "Tech Conference 2025",
      "descripcion": "...",
      "categoria": "Tecnología",
      "fecha": "2025-03-15T09:00:00Z",
      "venue": "Centro de Convenciones",
      "precio": 150,
      "aforo": 500,
      "aforoDisponible": 350,
      "estado": "publicado",
      "imagen": "url",
      "organizadorId": "org_001"
    }
  ]
  \`\`\`

### Obtener Detalle de Evento
- **Endpoint:** `GET /api/eventos/{eventoId}`
- **Autenticación:** Opcional
- **Respuesta:** Objeto Evento (igual al listado)

### Crear Evento
- **Endpoint:** `POST /api/eventos`
- **Autenticación:** Bearer Token (Requerido)
- **Rol Requerido:** organizador, admin
- **Body:**
  \`\`\`json
  {
    "nombre": "string",
    "descripcion": "string",
    "categoria": "string",
    "fecha": "ISO 8601",
    "venue": "string",
    "aforo": number,
    "precio": number,
    "imagen": "url (opcional)"
  }
  \`\`\`
- **Respuesta:** Objeto Evento con `id` y `estado: borrador`

### Publicar Evento
- **Endpoint:** `PUT /api/eventos/{eventoId}/publicar`
- **Autenticación:** Bearer Token (Requerido)
- **Rol Requerido:** organizador (propietario del evento), admin
- **Respuesta:** `{ "success": true }`

### Editar Evento
- **Endpoint:** `PUT /api/eventos/{eventoId}`
- **Autenticación:** Bearer Token (Requerido)
- **Rol Requerido:** organizador (propietario), admin
- **Body:** Campos parciales de Evento
- **Respuesta:** Objeto Evento actualizado

### Cancelar Evento
- **Endpoint:** `DELETE /api/eventos/{eventoId}`
- **Autenticación:** Bearer Token (Requerido)
- **Rol Requerido:** organizador (propietario), admin
- **Respuesta:** `{ "success": true }`

### Obtener Eventos por Organizador
- **Endpoint:** `GET /api/eventos/organizador/{organizadorId}`
- **Autenticación:** Bearer Token (Requerido)
- **Rol Requerido:** organizador (propietario), admin
- **Respuesta:** Array de Eventos del organizador

## Reservas

### Crear Reserva
- **Endpoint:** `POST /api/reservas`
- **Autenticación:** Bearer Token (Requerido)
- **Body:**
  \`\`\`json
  {
    "eventoId": "string",
    "cantidad": number
  }
  \`\`\`
- **Respuesta:**
  \`\`\`json
  {
    "id": "res_001",
    "asistenteId": "usr_001",
    "eventoId": "evt_001",
    "cantidad": 2,
    "estado": "pendiente",
    "montoTotal": 300,
    "codigoReserva": "RES1234567890",
    "fechaExpiracion": "ISO 8601"
  }
  \`\`\`

### Obtener Mis Reservas
- **Endpoint:** `GET /api/mis-reservas`
- **Autenticación:** Bearer Token (Requerido)
- **Respuesta:** Array de Reservas del usuario actual

### Obtener Detalle de Reserva
- **Endpoint:** `GET /api/reservas/{reservaId}`
- **Autenticación:** Bearer Token (Requerido)
- **Respuesta:** Objeto Reserva

### Cancelar Reserva
- **Endpoint:** `DELETE /api/reservas/{reservaId}`
- **Autenticación:** Bearer Token (Requerido)
- **Condición:** Reserva debe estar en estado `pendiente` o `confirmada`
- **Respuesta:** `{ "success": true }`

### Confirmar Reserva
- **Endpoint:** `PUT /api/reservas/{reservaId}/confirmar`
- **Autenticación:** Bearer Token (Sistema/API)
- **Descripción:** Llamado automáticamente al procesar pago
- **Respuesta:** `{ "success": true }`

## Pagos

### Crear Pago
- **Endpoint:** `POST /api/pagos`
- **Autenticación:** Bearer Token (Requerido)
- **Body:**
  \`\`\`json
  {
    "reservaId": "string (opcional)",
    "monto": number,
    "concepto": "string",
    "metodo": "tarjeta|transferencia|wallet"
  }
  \`\`\`
- **Respuesta:**
  \`\`\`json
  {
    "id": "pay_001",
    "reservaId": "res_001",
    "monto": 300,
    "concepto": "Entrada para Tech Conference",
    "estado": "pendiente",
    "metodo": "tarjeta"
  }
  \`\`\`

### Procesar Pago
- **Endpoint:** `POST /api/pagos/{pagoId}/procesar`
- **Autenticación:** Bearer Token (Sistema/API)
- **Descripción:** Procesa un pago pendiente
- **Body:**
  \`\`\`json
  {
    "transaccionId": "string (opcional, del proveedor de pagos)"
  }
  \`\`\`
- **Respuesta:**
  \`\`\`json
  {
    "id": "pay_001",
    "estado": "completado",
    "transaccionId": "TRX123456",
    "fechaActualizacion": "ISO 8601"
  }
  \`\`\`

### Obtener Detalle de Pago
- **Endpoint:** `GET /api/pagos/{pagoId}`
- **Autenticación:** Bearer Token (Requerido)
- **Respuesta:** Objeto Pago

### Obtener Pagos del Usuario
- **Endpoint:** `GET /api/mis-pagos`
- **Autenticación:** Bearer Token (Requerido)
- **Respuesta:** Array de Pagos del usuario

## Usuarios

### Obtener Mi Perfil
- **Endpoint:** `GET /api/usuarios/me`
- **Autenticación:** Bearer Token (Requerido)
- **Respuesta:**
  \`\`\`json
  {
    "id": "usr_001",
    "nombre": "Juan Pérez",
    "email": "juan@example.com",
    "role": "usuario|organizador|admin",
    "avatar": "url (opcional)",
    "activo": true
  }
  \`\`\`

### Obtener Usuario por ID
- **Endpoint:** `GET /api/usuarios/{usuarioId}`
- **Autenticación:** Bearer Token (Requerido)
- **Rol Requerido:** admin
- **Respuesta:** Objeto Usuario

### Actualizar Perfil
- **Endpoint:** `PUT /api/usuarios/me`
- **Autenticación:** Bearer Token (Requerido)
- **Body:** Campos parciales de Usuario
- **Respuesta:** Objeto Usuario actualizado

## SignalR Hubs

### Notificaciones Hub
- **URL:** `ws://localhost:3000/hubs/notifications`
- **Métodos disponibles:**
  - `OnReservaConfirmada`: Se dispara al confirmar una reserva
  - `OnPagoCompletado`: Se dispara al completar un pago
  - `OnPagoFallido`: Se dispara al fallar un pago
  - `OnEventoPublicado`: Se dispara al publicar un evento
  - `OnEventoCancelado`: Se dispara al cancelar un evento
  - `OnEventoActualizado`: Se dispara al actualizar un evento

## Códigos de Error

- `400`: Bad Request - Datos inválidos
- `401`: Unauthorized - Token inválido o expirado
- `403`: Forbidden - Sin permisos para esta acción
- `404`: Not Found - Recurso no encontrado
- `409`: Conflict - Violación de restricción (ej: reserva duplicada)
- `422`: Unprocessable Entity - Validación fallida
- `500`: Internal Server Error - Error del servidor

## Autenticación Header

Todos los endpoints protegidos requieren:
\`\`\`
Authorization: Bearer <access_token>
