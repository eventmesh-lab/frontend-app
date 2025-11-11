# eventmesh-lab - React + Vite

Plataforma de gestión de eventos construida con React, Vite y Clean Architecture.

## 🚀 Tecnologías

- **React 19** - Biblioteca de UI
- **Vite 6** - Build tool y dev server
- **TypeScript** - Tipado estático
- **React Router** - Navegación
- **Tailwind CSS** - Estilos
- **Radix UI** - Componentes UI accesibles
- **Vitest** - Testing

## 📁 Arquitectura

El proyecto sigue los principios de **Clean Architecture**:

``` text
src/
├── domain/          # Entidades y lógica de negocio
├── application/     # Casos de uso
├── adapters/        # Adaptadores (APIs, servicios externos)
└── presentation/    # Componentes UI, páginas, hooks
```

## 🛠️ Desarrollo

### Instalación

```bash
pnpm install
```

### Ejecutar en desarrollo

```bash
pnpm dev
```

El servidor se iniciará en `http://localhost:3000`

### Build de producción

```bash
pnpm build
```

### Vista previa de producción

```bash
pnpm preview
```

### Ejecutar tests

```bash
pnpm test
```

## 🔑 Variables de entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
VITE_KEYCLOAK_REALM=eventhub
VITE_KEYCLOAK_URL=https://keycloak.example.com
VITE_KEYCLOAK_CLIENT_ID=eventhub-frontend
```

## 📚 Documentación del proyecto

Se añadió una carpeta `docs/` con documentación de desarrollo (setup, mocks, arquitectura y enlaces a los endpoints API).

Revisa `docs/README.md` para el índice y los archivos individuales:

- `docs/SETUP.md` — cómo ejecutar el frontend y notas sobre el backend en un repo aparte.
- `docs/MOCKS.md` — lista de adaptadores mock y cómo reemplazarlos.
- `docs/ARCHITECTURE.md` — visión general de la arquitectura y puntos de entrada.
- `API_ENDPOINTS.md` — especificación rápida de endpoints (archivo en la raíz).
