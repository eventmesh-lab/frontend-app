# EventHub - Plataforma de Gestión de Eventos

> Sistema empresarial de gestión integral de eventos con streaming en vivo, pagos, foros y servicios complementarios

## 🎯 ¿Qué Problema de Negocio Resuelve?

EventHub es una plataforma completa que digitaliza el ciclo de vida completo de eventos presenciales y virtuales. Permite a organizadores:

- **Crear y publicar eventos** con gestión de secciones y capacidad
- **Vender tickets** con sistema de reservas y pagos integrados (Stripe)
- **Transmitir eventos en vivo** con control de acceso y chat en tiempo real
- **Gestionar foros de discusión** para la comunidad del evento
- **Ofrecer servicios complementarios** (catering, transporte, merchandising)
- **Monitorear en tiempo real** con notificaciones push vía SignalR

Para asistentes, ofrece un portal unificado para descubrir eventos, comprar tickets, participar en transmisiones en vivo y conectar con otros asistentes.

## 📚 Tabla de Contenidos

1. [**Arquitectura**](docs/architecture.md) - Flujo de datos, dependencias externas y modelo de dominio
2. [**API**](docs/api.md) - Endpoints, ejemplos de Request/Response
3. [**Setup**](docs/setup.md) - Variables de entorno, Docker y scripts disponibles

## 🚀 Stack Tecnológico

### Frontend
- **React 19** + **TypeScript 5** - UI moderna con tipado estático
- **Vite 6** - Build ultrarrápido y HMR
- **Tailwind CSS 4** - Estilos utility-first
- **Radix UI** - Componentes accesibles (WAI-ARIA)
- **React Router 7** - Navegación SPA

### Integraciones
- **Keycloak** - Autenticación OAuth2/OpenID Connect
- **SignalR** - Notificaciones en tiempo real
- **Stripe** - Procesamiento de pagos
- **Axios** - Cliente HTTP con interceptores

### Testing & QA
- **Vitest** - Framework de testing
- **Playwright** - Tests E2E del navegador

## ⚡ Quick Start

```bash
# 1. Instalar dependencias
pnpm install

# 2. Configurar variables de entorno
cp .env.example .env
# Editar .env con tus URLs de backend

# 3. Iniciar servidor de desarrollo
pnpm dev
```

La aplicación estará disponible en `http://localhost:3000`

## 🏗️ Estructura del Proyecto (Clean Architecture)

```
src/
├── domain/          # Entidades puras (Usuario, Evento, Reserva)
├── application/     # Casos de uso (CrearEvento, ProcesarPago)
├── adapters/        # Integración con servicios externos
│   ├── api/         # Clientes HTTP (eventos, usuarios, pagos)
│   ├── keycloak/    # Autenticación OAuth
│   └── signalr/     # WebSockets tiempo real
└── presentation/    # UI (páginas, componentes, hooks)
```

**Principio clave**: Las dependencias fluyen hacia dentro. El dominio no conoce la infraestructura.

## 📖 Documentación Completa

- **[docs/architecture.md](docs/architecture.md)** - Arquitectura interna, flujo de datos, dependencias
- **[docs/api.md](docs/api.md)** - Contratos de API con ejemplos JSON
- **[docs/setup.md](docs/setup.md)** - Guía detallada de configuración y deployment

## 👥 Roles de Usuario

1. **Usuario** - Navega eventos, compra tickets, participa en foros
2. **Organizador** - Crea eventos, gestiona ventas, accede a reportes
3. **Admin** - Modera contenido, gestiona usuarios y venues

## 📄 Licencia

Este proyecto es privado y confidencial.
