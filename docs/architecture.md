# Arquitectura del Sistema EventHub

## Visión General

EventHub implementa **Clean Architecture** (también conocida como Arquitectura Hexagonal o Ports & Adapters) para mantener el código desacoplado, testeable y mantenible. El principio fundamental es que las dependencias apuntan hacia adentro: la UI conoce los casos de uso, los casos de uso conocen el dominio, pero el dominio no conoce nada externo.

```
┌─────────────────────────────────────────────────────────┐
│              PRESENTATION LAYER                         │
│  (Pages, Components, Hooks, Contexts)                   │
│  ↓ Invoca                                                │
├─────────────────────────────────────────────────────────┤
│              APPLICATION LAYER                          │
│  (Use Cases / Casos de Uso)                             │
│  ↓ Utiliza        ↓ Define contratos                    │
├─────────────────────────────────────────────────────────┤
│  DOMAIN LAYER    │    ADAPTERS LAYER                    │
│  (Entities)      │    (API, Keycloak, SignalR)          │
└──────────────────┴──────────────────────────────────────┘
```

## Flujo de Datos - Narrativa Completa

### Ejemplo: Usuario Compra un Ticket

**1. Interacción del Usuario (Presentation Layer)**
```
Usuario hace clic en "Comprar" → DetalleEventoPage.tsx
```

**2. Invocación del Caso de Uso (Application Layer)**
```typescript
// src/application/useCases/reservas/CrearReserva.ts
const reserva = await crearReservaUseCase.execute({
  eventoId: "evt_123",
  cantidad: 2,
  asistenteId: usuario.id
})
```

**3. El Caso de Uso Orquesta Adaptadores**
```typescript
// Internamente, el caso de uso:
// 1. Valida disponibilidad
const evento = await eventosApi.obtenerDetalle(eventoId)
if (evento.aforoDisponible < cantidad) throw new Error("Sin capacidad")

// 2. Crea la reserva
const reserva = await reservasApi.crear({ eventoId, cantidad })

// 3. Redirige al pago
router.navigate(`/pago/${eventoId}/${reserva.montoTotal}`)
```

**4. Adaptadores se Comunican con Backend**
```typescript
// src/adapters/api/reservasApi.ts
async crear(data: CrearReservaDTO): Promise<Reserva> {
  const response = await httpClient.getBaseClient()
    .post('/api/reservas', data)
  return mapReservaFromApi(response.data)
}
```

**5. Autenticación Automática (HTTP Interceptor)**
```typescript
// src/adapters/api/httpClient.ts
// Antes de cada request:
const token = localStorage.getItem('accessToken')
config.headers.Authorization = `Bearer ${token}`
```

**6. Respuesta y Actualización de UI**
```
Backend responde → Adapter mapea → Caso de uso retorna
→ Componente actualiza estado → React re-renderiza
```

### Flujo de Autenticación (Keycloak OAuth2)

**Login Flow:**
```
1. Usuario → LoginPage.tsx
2. Click "Iniciar Sesión"
3. keycloakService.login() → Redirección a Keycloak
4. Usuario ingresa credenciales en Keycloak
5. Keycloak redirige a /oauth/callback?code=xyz
6. OAuthCallbackPage.tsx → keycloakService.handleCallback(code)
7. Intercambia code por tokens (access, refresh, id)
8. Almacena en localStorage
9. Decodifica JWT para extraer roles
10. AuthContext actualiza estado
11. Redirección a página protegida
```

**Token Refresh Automático:**
```typescript
// httpClient.ts - Interceptor de respuesta
if (error.response?.status === 401) {
  const refreshed = await keycloakService.refreshToken()
  if (refreshed) {
    // Reintentar request con nuevo token
    return client.request(originalRequest)
  } else {
    // Logout forzado
    window.location.href = '/login'
  }
}
```

### Notificaciones en Tiempo Real (SignalR)

**Conexión Persistente:**
```
1. App inicia → useSignalR hook se ejecuta
2. Establece conexión WebSocket a /hubs/notifications
3. Se suscribe a eventos:
   - OnReservaConfirmada
   - OnPagoCompletado
   - OnEventoActualizado
4. Cuando llega evento → react-hot-toast muestra notificación
```

**Flujo de Notificación:**
```
Backend procesa pago → Publica evento a SignalR Hub
→ Hub envía a todos los clientes conectados del usuario
→ useSignalR recibe mensaje
→ Muestra toast notification
→ Actualiza contexto si es necesario
```

## Dependencias Externas

### Microservicios Backend (C# / .NET)

| Servicio | Puerto | Propósito | Variables de Entorno |
|----------|--------|-----------|----------------------|
| **Users API** | 7181 | Autenticación, perfiles, roles | `VITE_USERS_API_URL` |
| **Events API** | 5000 | CRUD de eventos, publicación | `VITE_EVENTS_API_URL` |
| **Tickets API** | 5005 | Generación y validación de tickets | `VITE_TICKETS_API_URL` |
| **Reservations API** | 5010 | Sistema de reservas con expiración | `VITE_RESERVATIONS_API_URL` |
| **Streaming API** | 7001 | Gestión de sesiones de streaming en vivo | `VITE_STREAMING_API_URL` |
| **Forums API** | 8082 | Foros de discusión por evento | `VITE_FORUMS_API_URL` |
| **Complementary Services** | 5000 | Servicios adicionales (catering, etc.) | `VITE_COMPLEMENTARY_API_URL` |

### Servicios de Terceros

| Servicio | Propósito | Integración |
|----------|-----------|-------------|
| **Keycloak** (puerto 8180) | Identity Provider OAuth2/OIDC | `src/adapters/keycloak/` |
| **Stripe** | Procesamiento de pagos | `@stripe/react-stripe-js` |
| **SignalR Hub** (puerto 7184) | Notificaciones push en tiempo real | `src/adapters/signalr/` |
| **Azure Blob Storage** | Almacenamiento de imágenes y folletos | URLs devueltas por Events API |

### Detección de Dependencias (Análisis de Código)

```typescript
// src/adapters/api/httpClient.ts
const eventsApiUrl = import.meta.env.VITE_EVENTS_API_URL || 'http://localhost:5000'
const usersApiUrl = import.meta.env.VITE_USERS_API_URL || 'http://localhost:7181'
const ticketsApiUrl = import.meta.env.VITE_TICKETS_API_URL || 'http://localhost:5005'
const reservationsApiUrl = import.meta.env.VITE_RESERVATIONS_API_URL || 'http://localhost:5010'
const streamingApiUrl = import.meta.env.VITE_STREAMING_API_URL || 'http://localhost:7001'
const forumsApiUrl = import.meta.env.VITE_FORUMS_API_URL || 'http://localhost:8082'
```

## Modelo de Datos (Entidades de Dominio)

### Evento (`src/domain/entities/Evento.ts`)
**Entidad principal del sistema**
```typescript
interface Evento {
  id: string
  nombre: string
  descripcion: string
  categoria: string
  fecha: Date
  venue: string // Lugar físico
  venueId: string // Referencia a Venue
  estado: EstadoEvento // Borrador, PendientePago, Publicado, EnCurso, Finalizado, Cancelado
  precio: number
  aforo: number // Capacidad total
  aforoDisponible: number // Capacidad restante
  organizadorId: string
  secciones?: SeccionEvento[] // Múltiples zonas con precios diferentes
  imagen?: string // URL del blob storage
  imagenesSecundarias?: string[]
  folletoUrl?: string // PDF promocional
  tarifaPublicacion: number // Costo que paga el organizador por publicar
  transaccionPagoId?: string // ID del pago de publicación
  // Moderación de contenido
  imagenRestringida?: boolean
  folletoRestringido?: boolean
  motivoRestriccionImagen?: string
  motivoRestriccionFolleto?: string
  // Auditoría
  fechaCreacion: Date
  fechaActualizacion: Date
  contadorReprogramaciones: number
}
```

**Estados del Evento:**
- `Borrador`: Creado pero no pagado
- `PendientePago`: Esperando pago de tarifa de publicación
- `Publicado`: Visible para asistentes, aceptando reservas
- `EnCurso`: Evento activo (permite streaming)
- `Finalizado`: Completado
- `Cancelado`: Cancelado con reembolsos

**Métodos de Negocio:**
```typescript
evento.puedeReservar() // true si está Publicado y tiene capacidad
evento.obtenerPorcentajeOcupacion() // (aforo - aforoDisponible) / aforo * 100
evento.obtenerDuracionEnMinutos() // horasDuracion * 60 + minutosDuracion
```

### Usuario (`src/domain/entities/Usuario.ts`)
```typescript
interface Usuario {
  id: string
  nombre: string
  email: string
  avatar?: string
  role: RoleType // usuario, organizador, admin
  activo: boolean
  fechaCreacion: Date
  fechaActualizacion: Date
}
```

### Reserva (`src/domain/entities/Reserva.ts`)
```typescript
interface Reserva {
  id: string
  asistenteId: string
  eventoId: string
  cantidad: number
  estado: EstadoReserva // pendiente, confirmada, cancelada, expirada
  montoTotal: number
  fechaExpiracion: Date // Típicamente 15-30 minutos
  codigoReserva: string // Código alfanumérico único
}
```

**Lógica de Expiración:**
```typescript
reserva.estaExpirada() // new Date() > fechaExpiracion
// Si expira, el backend libera automáticamente la capacidad
```

### Ticket (`src/domain/entities/Ticket.ts`)
```typescript
interface Ticket {
  id: string
  reservaId: string
  eventoId: string
  asistenteId: string
  codigoQR: string // Generado por Tickets API
  seccionId?: string
  asiento?: string // Solo si es asiento numerado
  estado: EstadoTicket // valido, usado, cancelado
  fechaEmision: Date
  fechaUso?: Date
}
```

### SeccionEvento (Sub-entidad de Evento)
```typescript
interface SeccionEvento {
  id?: string
  nombre: string // "Platea", "VIP", "General"
  capacidad: number
  precio: number
  tipoAsiento: "Numerado" | "General"
}
```

**Ejemplo de Evento con Secciones:**
```json
{
  "nombre": "Concierto Rock 2025",
  "aforo": 1000,
  "secciones": [
    { "nombre": "VIP", "capacidad": 100, "precio": 200, "tipoAsiento": "Numerado" },
    { "nombre": "Platea", "capacidad": 400, "precio": 100, "tipoAsiento": "Numerado" },
    { "nombre": "General", "capacidad": 500, "precio": 50, "tipoAsiento": "General" }
  ]
}
```

## Deuda Técnica Detectada

### 🔴 CRÍTICO: Generación de GUID Temporal para Publicación
**Ubicación:** `src/adapters/api/eventosApi.ts:213-220`

```typescript
private generarGuidTemporal(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}
```

**Problema:** 
- El método `publicarEvento()` genera un GUID aleatorio como `pagoConfirmadoId` cuando no se proporciona uno.
- **Riesgo:** Permite publicar eventos sin pago real, violando lógica de negocio.
- **Comentario del código:** "Esto es un workaround. En producción, debería venir de un servicio de pagos real".

**Impacto:** 
- Organizadores podrían evadir el pago de la tarifa de publicación.
- Inconsistencia entre estado de evento y pagos reales.

**Solución Recomendada:**
1. **Backend:** Validar que `pagoConfirmadoId` exista en la base de datos de pagos.
2. **Frontend:** Eliminar generación de GUID temporal. Siempre requerir pago válido antes de publicar.
3. **Alternativa temporal:** Añadir flag de configuración para modo demo (`VITE_DEMO_MODE=true`).

### 🟡 MEDIO: Manejo de Errores 500 como Éxitos
**Ubicación:** `src/adapters/api/eventosApi.ts:380-390`

```typescript
if (error.response?.data && esOperacionExitosa(error.response.data)) {
  console.log("Pago procesado exitosamente (backend devolvió error pero operación fue exitosa)")
  return // Operación exitosa a pesar del código de error
}
```

**Problema:**
- El frontend trata algunos errores HTTP 500 como éxitos basándose en el contenido de la respuesta.
- Esto enmascara problemas reales del backend.

**Solución Recomendada:**
1. **Backend:** Corregir endpoints para devolver códigos HTTP correctos (200/201 para éxito, no 500).
2. **Frontend:** Remover lógica de "falso positivo" una vez corregido el backend.

### 🟡 MEDIO: Logging Excesivo en Producción
**Ubicación:** Múltiples archivos en `src/adapters/api/`

```typescript
console.log("[EventosApi] Evento creado:", response.data.id)
console.log("[v0] Detalle evento:", id, "encontrado")
console.error("[EventosApi] Error creando evento:", error)
```

**Problema:**
- Muchos `console.log` y `console.error` en código de producción.
- Puede exponer información sensible en DevTools del navegador.

**Solución Recomendada:**
1. Implementar logger configurable (ej: loglevel, winston).
2. Desactivar logs en modo producción: `if (import.meta.env.DEV) logger.debug(...)`.

### 🟡 MEDIO: Dual Sistema de Autenticación
**Ubicación:** `src/adapters/api/httpClient.ts:76-81`

```typescript
const authToken = localStorage.getItem('accessToken')
const keycloakToken = keycloakService.getToken()
const token = authToken || keycloakToken
```

**Problema:**
- Hay dos fuentes de tokens: `localStorage.accessToken` y `keycloakService`.
- Esto crea confusión sobre cuál es el sistema de autenticación "real".
- **Comentario del código:** "Usar el token de Auth.tsx que es el sistema real de autenticación".

**Solución Recomendada:**
1. Unificar en un solo sistema de autenticación (probablemente Keycloak).
2. Eliminar fallback dual.
3. Documentar claramente el flujo de autenticación elegido.

### 🟢 BAJO: Falta de Validación de Schemas con Zod
**Ubicación:** General

**Problema:**
- Zod está instalado (`package.json:80`) pero no se usa para validar responses de API.
- Esto puede causar errores de runtime si el backend cambia contratos.

**Solución Recomendada:**
```typescript
import { z } from 'zod'

const EventoSchema = z.object({
  id: z.string().uuid(),
  nombre: z.string().min(1),
  fecha: z.string().datetime(),
  // ...
})

function mapEventoFromApi(data: unknown): EventoEntity {
  const parsed = EventoSchema.parse(data) // Lanza error si inválido
  return new EventoEntity(parsed)
}
```

### 🟢 BAJO: Sin Dockerfile
**Problema:**
- No hay Dockerfile para containerizar la aplicación.
- Dificulta deployment consistente y CI/CD.

**Solución Recomendada:**
```dockerfile
# Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json pnpm-lock.yaml ./
RUN npm install -g pnpm && pnpm install
COPY . .
RUN pnpm build

FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### �� CÓDIGO MUERTO: Comentarios de Versiones Antiguas
**Ubicación:** `src/adapters/api/eventosApi.ts`

```typescript
console.log("[v0] Evento creado:", response.data.id) // ¿Qué es v0?
```

**Problema:**
- Referencias a "[v0]" sugieren una versión antigua de la API.
- Puede confundir sobre qué versión se está usando.

**Solución:**
- Remover prefijo "[v0]" o reemplazar por "[EventosApi]" consistente.

## Mejores Prácticas Observadas

✅ **Clean Architecture:** Separación clara de capas y responsabilidades.
✅ **TypeScript:** Tipado estático reduce errores de runtime.
✅ **HTTP Interceptors:** Autenticación y refresh token automáticos.
✅ **Error Boundaries:** Manejo de errores consistente en adaptadores.
✅ **Loading States:** Feedback visual al usuario durante operaciones async.
✅ **Optimistic UI:** (En algunos casos) Actualiza UI inmediatamente, revierte si falla.
