
# Visión general de la arquitectura

Este repositorio sigue una organización por capas/hexagonal para mantener separadas las responsabilidades de la UI, la lógica de negocio y la infraestructura.

Carpetas principales

- `src/presentation/` — Componentes de UI, páginas, layouts, contextos y hooks.
- `src/application/` — Casos de uso (lógica de aplicación) agrupados por dominio (eventos, pagos, reservas). Son los puntos de entrada usados por la capa de presentación.
- `src/domain/` — Entidades de dominio (tipos/modelos) como `Evento`, `Reserva`, `Pago` y `Usuario`.
- `src/adapters/` — Adaptadores para sistemas externos (Keycloak, SignalR, clientes API). Suele contener implementaciones mock para desarrollo local.

Contrato y flujo de datos

- La capa de presentación invoca los Casos de Uso en `src/application/useCases/*`.
- Los Casos de Uso dependen de adaptadores para comunicarse con servicios externos. Los adaptadores ocultan detalles de transporte y se pueden intercambiar por mocks.
- Las entidades de dominio son clases o interfaces TypeScript sencillas usadas en toda la aplicación.

Por qué esta estructura

- La separación de responsabilidades facilita probar la lógica de negocio de forma independiente de la UI y del networking.
- Los adaptadores intercambiables aceleran el desarrollo y las pruebas, ya que permiten ejecutar la UI sin un backend.

Dónde empezar a leer

1. `src/presentation/pages/` para entender los flujos de usuario y puntos de entrada de la UI.
2. `src/application/useCases/` para ver las operaciones que realiza la aplicación.
3. `src/adapters/` para ver cómo la app habla con sistemas externos y qué partes son mocks.

