# EventHub - Guía de Setup

## Requisitos Previos

- Node.js v18+
- npm o yarn
- Git

## Instalación Local

### 1. Clonar el repositorio
\`\`\`bash
git clone <repository-url>
cd event-platform
\`\`\`

### 2. Instalar dependencias
\`\`\`bash
npm install
\`\`\`

### 3. Configurar variables de entorno
\`\`\`bash
cp .env.example .env
\`\`\`

Edita `.env` con tus valores:
\`\`\`
VITE_API_BASE_URL=http://localhost:3000/api
VITE_KEYCLOAK_URL=https://keycloak.ejemplo.com
VITE_KEYCLOAK_REALM=eventhub
VITE_KEYCLOAK_CLIENT_ID=eventhub-frontend
VITE_SIGNALR_URL=http://localhost:3000/notifications
\`\`\`

### 4. Ejecutar la aplicación
\`\`\`bash
npm run dev
\`\`\`

La aplicación estará disponible en `http://localhost:5173`

## Credenciales de Prueba

Para acceder con datos mock:

**Usuario Regular:**
- Email: `juan@example.com`
- Contraseña: `pass`

**Organizador:**
- Email: `carlos@example.com`
- Contraseña: `pass`

**Administrador:**
- Email: `admin@example.com`
- Contraseña: `pass`

## Estructura del Proyecto

\`\`\`
src/
├── domain/              # Entidades y lógica de negocio
│   └── entities/        # Clases de dominio
├── application/         # Casos de uso
│   └── useCases/        # Lógica de aplicación
├── adapters/            # Integraciones externas
│   ├── api/             # Adaptadores de API
│   ├── keycloak/        # Autenticación OAuth
│   └── signalr/         # Notificaciones en tiempo real
└── presentation/        # Interfaz de usuario
    ├── components/      # Componentes reutilizables
    ├── pages/           # Páginas de la aplicación
    ├── layouts/         # Layouts especializados
    ├── hooks/           # Custom hooks
    └── contexts/        # Context API
\`\`\`

## Arquitectura Hexagonal

La aplicación sigue el patrón de arquitectura hexagonal:

- **Domain Layer:** Entidades y reglas de negocio
- **Application Layer:** Casos de uso y orquestación
- **Adapter Layer:** Integraciones con servicios externos
- **Presentation Layer:** UI y componentes React

## Desarrollo

### Build para producción
\`\`\`bash
npm run build
\`\`\`

### Deploy a Vercel
\`\`\`bash
vercel deploy
\`\`\`

## Debugging

La aplicación incluye logs con prefijo `[v0]` para rastrear ejecución:

\`\`\`typescript
console.log('[v0] Evento creado:', evento.id)
console.log('[v0] Error procesando pago:', error.message)
\`\`\`

## Integración con Backend

Cuando esté listo el backend:

1. Actualiza `VITE_API_BASE_URL` en `.env` a tu servidor backend
2. Actualiza `VITE_KEYCLOAK_URL` a tu servidor Keycloak
3. Reemplaza los adaptadores mock con adaptadores reales usando Axios

## Testing

\`\`\`bash
# Tests unitarios
npm run test

# Tests E2E
npm run test:e2e

# Cobertura
npm run test:coverage
