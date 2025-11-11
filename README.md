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

## 📝 Migración de Next.js a Vite

Este proyecto fue originalmente generado con v0.app usando Next.js y ha sido migrado a React puro con Vite para mayor simplicidad y rendimiento.
