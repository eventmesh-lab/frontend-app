# Instalación — Frontend (Vite + React + TypeScript)

Este proyecto es una aplicación frontend que utiliza Vite, React y TypeScript. El backend de la plataforma reside en un repositorio separado (implementado en C#). Este documento explica cómo ejecutar el frontend localmente y cómo alternar entre adaptadores mock y adaptadores reales que llamen al backend.

Requisitos previos
- Node.js (recomendado: versión LTS)
- pnpm (opcional pero recomendado) o npm/yarn

Instalación

```bash
pnpm install
# o
npm install
```

Ejecutar en desarrollo

```bash
pnpm dev
# o
npm run dev
```

Build de producción

```bash
pnpm build
# o
npm run build
```

Mocks y Backend

- Este repositorio contiene adaptadores mock en `src/adapters/` (por ejemplo: `keycloak`, `signalr`, `api`). Estos mocks permiten ejecutar el frontend sin depender de un backend activo.
- La implementación del backend se espera en un repositorio separado en C#. Consulta `API_ENDPOINTS.md` en la raíz para los contratos esperados de la API.
- Para usar el backend real (C#) en lugar de los mocks:
  1. Implementa adaptadores reales usando `fetch` o `axios` que llamen a los endpoints del backend.
  2. Reemplaza las exportaciones de los mocks en `src/adapters/api/*.ts` o crea nuevos adaptadores y actualiza las importaciones.
  3. Configura la URL base del backend (por ejemplo mediante variables de entorno) y actualiza los adaptadores para usarla.

Notas
- El archivo `SETUP_GUIDE.md` en la raíz contiene notas adicionales de desarrollo. Mantén ambos documentos sincronizados cuando actualices instrucciones.
