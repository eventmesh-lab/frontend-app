# Setup - Guía Detallada de Configuración

## Requisitos del Sistema

### Software Necesario

| Herramienta | Versión Mínima | Versión Recomendada | Propósito |
|-------------|----------------|---------------------|-----------|
| **Node.js** | 18.0.0 | 20.x LTS | Runtime JavaScript |
| **pnpm** | 8.0.0 | 9.x | Gestor de paquetes (más rápido que npm) |
| **Git** | 2.30+ | Latest | Control de versiones |
| **VS Code** | - | Latest | IDE recomendado (opcional) |

### Hardware Recomendado

- **RAM:** 8 GB mínimo, 16 GB recomendado
- **Disco:** 2 GB libre para dependencias
- **CPU:** Procesador multi-core para compilación rápida

---

## Instalación Paso a Paso

### 1. Clonar el Repositorio

```bash
git clone https://github.com/eventmesh-lab/frontend-app.git
cd frontend-app
```

### 2. Instalar pnpm (si no lo tienes)

```bash
# Via npm
npm install -g pnpm

# Via Homebrew (macOS)
brew install pnpm

# Via Chocolatey (Windows)
choco install pnpm

# Verificar instalación
pnpm --version  # Debe mostrar 9.x o superior
```

### 3. Instalar Dependencias

```bash
pnpm install
```

**Tiempo estimado:** 2-5 minutos (dependiendo de tu conexión)

**Salida esperada:**
```
Packages: +237
Progress: resolved 237, reused 237, downloaded 0, added 237, done
```

### 4. Configurar Variables de Entorno

```bash
# Copiar plantilla
cp .env.example .env

# Editar con tu editor favorito
nano .env
# o
code .env
```

### 5. Iniciar Servidor de Desarrollo

```bash
pnpm dev
```

**Salida esperada:**
```
  VITE v6.4.1  ready in 523 ms

  ➜  Local:   http://localhost:3000/
  ➜  Network: use --host to expose
  ➜  press h + enter to show help
```

La aplicación se abrirá automáticamente en tu navegador en `http://localhost:3000`.

---

## Variables de Entorno

### Variables Obligatorias

#### API Backend - Usuarios
```env
# URL del microservicio de usuarios (autenticación, perfiles)
VITE_API_BASE_URL=http://localhost:7181
```
**¿Para qué sirve?** 
- Autenticación de usuarios (login, registro)
- Gestión de perfiles
- Asignación de roles (usuario, organizador, admin)

#### API Backend - Eventos
```env
# URL del microservicio de eventos
VITE_EVENTS_API_URL=http://localhost:5000
```
**¿Para qué sirve?**
- CRUD de eventos
- Publicación y gestión de estado
- Subida de imágenes y folletos a blob storage

#### Keycloak - Autenticación OAuth2
```env
# URL del servidor Keycloak
VITE_KEYCLOAK_URL=http://localhost:8180

# Realm configurado en Keycloak
VITE_KEYCLOAK_REALM=myrealm

# Client ID de la aplicación frontend
VITE_KEYCLOAK_CLIENT_ID=aspnetcore
```
**¿Para qué sirve?**
- Single Sign-On (SSO)
- OAuth2/OpenID Connect flow
- Gestión centralizada de identidad

**⚠️ Importante:** El Client ID debe estar configurado en Keycloak con:
- Valid Redirect URIs: `http://localhost:3000/oauth/callback`
- Web Origins: `http://localhost:3000`
- Access Type: `public`

---

### Variables Opcionales (Con Fallbacks)

#### API Backend - Tickets
```env
VITE_TICKETS_API_URL=http://localhost:5005
```
**Default:** `http://localhost:5005`
**¿Para qué sirve?** Generación y validación de tickets con códigos QR

#### API Backend - Reservas
```env
VITE_RESERVATIONS_API_URL=http://localhost:5010
```
**Default:** `http://localhost:5010`
**¿Para qué sirve?** Sistema de reservas con expiración automática

#### SignalR - Notificaciones en Tiempo Real
```env
VITE_SIGNALR_URL=http://localhost:3000/notifications
```
**Default:** `http://localhost:3000/notifications` (proxy configurado en `vite.config.ts`)
**¿Para qué sirve?** WebSocket para notificaciones push instantáneas

**⚠️ Nota:** El proxy de Vite redirige a `http://localhost:7184/hubs/notifications`

#### Streaming Service
```env
VITE_STREAMING_API_URL=http://localhost:7001
```
**Default:** `http://localhost:7001`
**¿Para qué sirve?** Gestión de sesiones de streaming en vivo (HLS/DASH)

#### Forums Service
```env
VITE_FORUMS_API_URL=http://localhost:8082
```
**Default:** `http://localhost:8082`
**¿Para qué sirve?** Foros de discusión por evento

#### Complementary Services
```env
VITE_COMPLEMENTARY_API_URL=http://localhost:5000
VITE_COMPLEMENTARY_SIGNALR_URL=http://localhost:5000/hubs/service-notifications
```
**¿Para qué sirve?** Servicios adicionales como catering, transporte, merchandising

#### Desarrollo - User ID Temporal (Sin JWT)
```env
VITE_DEV_USER_ID=00000000-0000-0000-0000-000000000001
```
**⚠️ SOLO PARA DESARROLLO** - NO usar en producción
**¿Para qué sirve?** Permite hacer requests sin autenticación durante desarrollo local

---

### Configuración por Ambiente

#### Desarrollo Local (.env.development)
```env
VITE_API_BASE_URL=http://localhost:7181
VITE_EVENTS_API_URL=http://localhost:5000
VITE_KEYCLOAK_URL=http://localhost:8180
VITE_KEYCLOAK_REALM=myrealm
VITE_KEYCLOAK_CLIENT_ID=aspnetcore
```

#### Staging (.env.staging)
```env
VITE_API_BASE_URL=https://api-staging.eventhub.com
VITE_EVENTS_API_URL=https://events-staging.eventhub.com
VITE_KEYCLOAK_URL=https://auth-staging.eventhub.com
VITE_KEYCLOAK_REALM=staging
VITE_KEYCLOAK_CLIENT_ID=eventhub-frontend-staging
```

#### Producción (.env.production)
```env
VITE_API_BASE_URL=https://api.eventhub.com
VITE_EVENTS_API_URL=https://events.eventhub.com
VITE_KEYCLOAK_URL=https://auth.eventhub.com
VITE_KEYCLOAK_REALM=production
VITE_KEYCLOAK_CLIENT_ID=eventhub-frontend
```

---

## Scripts de package.json

### `pnpm dev`
**Descripción:** Inicia servidor de desarrollo con Hot Module Replacement (HMR).

```bash
pnpm dev
```

**Características:**
- Puerto: 3000 (configurable en `vite.config.ts`)
- Auto-reload al guardar archivos
- Error overlay en el navegador
- Proxy para SignalR configurado

**Uso típico:** Desarrollo día a día

---

### `pnpm build`
**Descripción:** Compila la aplicación para producción.

```bash
pnpm build
```

**Proceso:**
1. TypeScript compilation (`tsc`)
2. Vite build (optimización, minificación, tree-shaking)
3. Genera archivos en `/dist`

**Salida esperada:**
```
vite v6.4.1 building for production...
✓ 1234 modules transformed.
dist/index.html                  0.45 kB
dist/assets/index-abc123.js    245.67 kB │ gzip: 78.23 kB
✓ built in 12.34s
```

**Uso típico:** CI/CD pipeline, deployment

---

### `pnpm preview`
**Descripción:** Previsualiza el build de producción localmente.

```bash
pnpm preview
```

**Requisito:** Debe ejecutar `pnpm build` primero.

**Puerto:** 4173 por defecto

**Uso típico:** Verificar build antes de deploy

---

### `pnpm lint`
**Descripción:** Ejecuta ESLint para validar calidad de código.

```bash
pnpm lint
```

**Configuración:** `.eslintrc` (si existe) o defaults de ESLint

**Uso típico:** 
- Pre-commit hook
- CI/CD pipeline
- Antes de hacer PR

---

### `pnpm test`
**Descripción:** Ejecuta suite de tests con Vitest.

```bash
pnpm test
```

**Modo watch (desarrollo):**
```bash
pnpm test -- --watch
```

**Con UI:**
```bash
pnpm test -- --ui
```

**Coverage:**
```bash
pnpm test -- --coverage
```

**Configuración:** `vite.config.ts` (sección `test`)

**Setup:** `src/__tests__/setup.ts`

**Uso típico:** 
- TDD durante desarrollo
- CI/CD pipeline

---

## Docker (Recomendado para Producción)

### Crear Dockerfile

Actualmente el proyecto **no incluye Dockerfile**. Aquí una implementación recomendada:

```dockerfile
# Dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar archivos de dependencias
COPY package.json pnpm-lock.yaml ./

# Instalar pnpm
RUN npm install -g pnpm@9

# Instalar dependencias
RUN pnpm install --frozen-lockfile

# Copiar código fuente
COPY . .

# Copiar variables de entorno (o usar ARG)
ARG VITE_API_BASE_URL
ARG VITE_EVENTS_API_URL
ARG VITE_KEYCLOAK_URL
ARG VITE_KEYCLOAK_REALM
ARG VITE_KEYCLOAK_CLIENT_ID

# Build de producción
RUN pnpm build

# Stage 2: Nginx
FROM nginx:1.27-alpine

# Copiar build desde stage anterior
COPY --from=builder /app/dist /usr/share/nginx/html

# Copiar configuración de nginx (opcional)
# COPY nginx.conf /etc/nginx/conf.d/default.conf

# Exponer puerto
EXPOSE 80

# Healthcheck
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Comando de inicio
CMD ["nginx", "-g", "daemon off;"]
```

### Construir Imagen

```bash
docker build \
  --build-arg VITE_API_BASE_URL=https://api.eventhub.com \
  --build-arg VITE_EVENTS_API_URL=https://events.eventhub.com \
  --build-arg VITE_KEYCLOAK_URL=https://auth.eventhub.com \
  --build-arg VITE_KEYCLOAK_REALM=production \
  --build-arg VITE_KEYCLOAK_CLIENT_ID=eventhub-frontend \
  -t eventhub-frontend:latest .
```

### Ejecutar Contenedor

```bash
docker run -d \
  --name eventhub-frontend \
  -p 80:80 \
  eventhub-frontend:latest
```

### docker-compose.yml (Ejemplo Completo)

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      args:
        VITE_API_BASE_URL: http://users-api:7181
        VITE_EVENTS_API_URL: http://events-api:5000
        VITE_KEYCLOAK_URL: http://keycloak:8180
        VITE_KEYCLOAK_REALM: eventhub
        VITE_KEYCLOAK_CLIENT_ID: eventhub-frontend
    ports:
      - "3000:80"
    depends_on:
      - users-api
      - events-api
      - keycloak
    networks:
      - eventhub-network

  users-api:
    image: eventhub/users-api:latest
    ports:
      - "7181:80"
    environment:
      - ConnectionStrings__DefaultConnection=Server=db;Database=UsersDb
    networks:
      - eventhub-network

  events-api:
    image: eventhub/events-api:latest
    ports:
      - "5000:80"
    environment:
      - ConnectionStrings__DefaultConnection=Server=db;Database=EventsDb
    networks:
      - eventhub-network

  keycloak:
    image: quay.io/keycloak/keycloak:23.0
    environment:
      - KEYCLOAK_ADMIN=admin
      - KEYCLOAK_ADMIN_PASSWORD=admin
    ports:
      - "8180:8080"
    command: start-dev
    networks:
      - eventhub-network

  db:
    image: postgres:16-alpine
    environment:
      - POSTGRES_USER=eventhub
      - POSTGRES_PASSWORD=eventhub123
    volumes:
      - postgres-data:/var/lib/postgresql/data
    networks:
      - eventhub-network

networks:
  eventhub-network:
    driver: bridge

volumes:
  postgres-data:
```

**Iniciar todo el stack:**
```bash
docker-compose up -d
```

**Ver logs:**
```bash
docker-compose logs -f frontend
```

**Detener:**
```bash
docker-compose down
```

---

## Configuración de Keycloak

### 1. Acceder a Keycloak Admin Console
```
URL: http://localhost:8180
Usuario: admin
Password: admin (configurar en docker-compose)
```

### 2. Crear Realm
1. Clic en el dropdown del Realm (arriba izquierda)
2. Create Realm
3. Realm name: `myrealm`
4. Enabled: ON
5. Save

### 3. Crear Cliente para Frontend
1. Ir a Clients → Create Client
2. **General Settings:**
   - Client ID: `aspnetcore`
   - Name: EventHub Frontend
   - Enabled: ON
3. **Capability config:**
   - Client authentication: OFF (public client)
   - Authorization: OFF
   - Standard flow: ON (Authorization Code)
   - Direct access grants: ON (Resource Owner Password - solo dev)
4. **Login settings:**
   - Root URL: `http://localhost:3000`
   - Valid redirect URIs:
     - `http://localhost:3000/*`
     - `http://localhost:3000/oauth/callback`
   - Valid post logout redirect URIs: `http://localhost:3000/*`
   - Web origins: `http://localhost:3000`
5. Save

### 4. Configurar Roles
1. Ir a Realm roles → Create role
2. Crear roles:
   - `usuario` (default role)
   - `organizador`
   - `admin`

### 5. Crear Usuario de Prueba
1. Ir a Users → Add user
2. Username: `test@example.com`
3. Email: `test@example.com`
4. Email verified: ON
5. Save
6. Credentials tab:
   - Set password: `Test123!`
   - Temporary: OFF
7. Role mappings tab:
   - Assign role: `usuario`

### 6. Configurar Default Role
1. Ir a Realm settings → User registration
2. Default roles: `usuario`
3. Save

---

## Nginx Configuration (Producción)

Si usas Nginx como reverse proxy, aquí está la configuración recomendada:

```nginx
# /etc/nginx/conf.d/eventhub.conf

upstream frontend {
    server localhost:3000;
}

server {
    listen 80;
    server_name eventhub.com www.eventhub.com;

    # Redirigir a HTTPS (producción)
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name eventhub.com www.eventhub.com;

    ssl_certificate /etc/letsencrypt/live/eventhub.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/eventhub.com/privkey.pem;

    # Security headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    root /usr/share/nginx/html;
    index index.html;

    # Logs
    access_log /var/log/nginx/eventhub-access.log;
    error_log /var/log/nginx/eventhub-error.log warn;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/json;

    # Static files caching
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy WebSocket (SignalR)
    location /notifications {
        proxy_pass http://localhost:7184/hubs/notifications;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

**Aplicar configuración:**
```bash
sudo nginx -t  # Verificar sintaxis
sudo systemctl reload nginx
```

---

## Troubleshooting

### Problema: "Cannot find module 'vite'"

**Solución:**
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

### Problema: Puerto 3000 ya en uso

**Solución 1 - Cambiar puerto:**
Editar `vite.config.ts`:
```typescript
server: {
  port: 3001,  // Cambiar a otro puerto
  open: true
}
```

**Solución 2 - Liberar puerto:**
```bash
# Linux/Mac
lsof -ti:3000 | xargs kill -9

# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

### Problema: Error de CORS

**Causa:** Backend no acepta requests desde `http://localhost:3000`

**Solución Backend (ASP.NET Core):**
```csharp
// Program.cs
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

app.UseCors("AllowFrontend");
```

### Problema: SignalR no conecta

**Verificar:**
1. Proxy configurado en `vite.config.ts`:
```typescript
proxy: {
  '/notifications': {
    target: 'http://localhost:7184',
    ws: true,  // ← Importante para WebSocket
    changeOrigin: true,
    rewrite: (path) => path.replace(/^\/notifications/, '/hubs/notifications')
  }
}
```

2. Backend acepta WebSocket
3. Firewall no bloquea puerto 7184

### Problema: "Module not found: @radix-ui/..."

**Solución:**
```bash
pnpm install @radix-ui/react-dialog  # Instalar módulo faltante
```

### Problema: Build falla con "Type error"

**Verificar:**
```bash
pnpm tsc --noEmit  # Ver errores de TypeScript
```

**Solución temporal (NO recomendado):**
```bash
# Editar package.json
"build": "vite build",  # Remover "tsc &&"
```

---

## Comandos Útiles

### Limpiar Caché

```bash
# Limpiar caché de pnpm
pnpm store prune

# Limpiar caché de Vite
rm -rf node_modules/.vite

# Limpiar build
rm -rf dist
```

### Actualizar Dependencias

```bash
# Ver dependencias desactualizadas
pnpm outdated

# Actualizar todas (cuidado!)
pnpm update

# Actualizar una específica
pnpm update react@latest
```

### Analizar Bundle Size

```bash
# Instalar herramienta
pnpm add -D vite-bundle-visualizer

# Generar reporte
pnpm build && pnpm vite-bundle-visualizer
```

---

## Verificación de Instalación

Ejecuta estos comandos para verificar que todo está configurado correctamente:

```bash
# 1. Node y pnpm
node --version  # ≥ 18.0.0
pnpm --version  # ≥ 8.0.0

# 2. Dependencias instaladas
pnpm list --depth=0

# 3. Variables de entorno
cat .env | grep VITE_

# 4. TypeScript OK
pnpm tsc --noEmit

# 5. Lint OK
pnpm lint

# 6. Tests OK
pnpm test

# 7. Build OK
pnpm build
```

**Todo OK:** Puedes proceder con desarrollo.

---

## Recursos Adicionales

- **Vite Docs:** https://vitejs.dev
- **React Docs:** https://react.dev
- **TypeScript Handbook:** https://www.typescriptlang.org/docs
- **Keycloak Docs:** https://www.keycloak.org/documentation
- **Stripe API:** https://stripe.com/docs/api

---

## Soporte

Si encuentras problemas no cubiertos en esta guía:

1. Revisa logs en consola del navegador (F12)
2. Revisa logs del servidor de desarrollo
3. Consulta issues existentes en GitHub
4. Crea un nuevo issue con:
   - Descripción del problema
   - Pasos para reproducir
   - Logs relevantes
   - Versiones (Node, pnpm, OS)
