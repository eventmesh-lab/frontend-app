# Mocks y adaptadores

Este proyecto usa adaptadores mock para simular servicios de backend durante el desarrollo local.

Dónde encontrar los mocks

- `src/adapters/keycloak/` — `keycloakConfig.ts` y `keycloakService.ts` incluyen respuestas mock y generación de tokens para desarrollo.
- `src/adapters/signalr/` — `notificationHub.ts` contiene una implementación mock del hub de SignalR usada por el hook `useSignalR`.
- `src/adapters/api/` — puede incluir implementaciones mock para `eventosApi.ts`, `pagosApi.ts`, `reservasApi.ts` y `usuariosApi.ts`.

Cómo se usan los mocks

- La base de código está organizada para permitir intercambiar adaptadores: el frontend importa adaptadores desde `src/adapters/*`. Durante el desarrollo, se usan las implementaciones mock para no necesitar un backend en ejecución.

Cómo reemplazar los mocks por adaptadores reales

1. Implementa las funciones del adaptador usando `fetch` o `axios` que llamen a los endpoints reales del backend (consulta `API_ENDPOINTS.md` para rutas y payloads esperados).
2. Reemplaza las exportaciones de los mocks en `src/adapters/api/*.ts` o crea un nuevo adaptador y actualiza las importaciones donde sea necesario.
3. Añade una variable de entorno o configuración para alternar entre `mock` y `real` si lo deseas.

Consejos

- Mantén las respuestas mock alineadas con los contratos de `API_ENDPOINTS.md` para que la UI se comporte igual al cambiar al backend real.
- Añade tests unitarios para el comportamiento de los adaptadores; los tests con mocks pueden ubicarse en `src/__tests__/`.
