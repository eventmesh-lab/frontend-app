# Lenguaje ubicuo — Plataforma de Gestión y Publicación de Eventos

Este documento mapea el lenguaje ubicuo acordado al código en el repositorio y lista los cambios aplicados para alinear el proyecto.

## Mapeo (término del dominio → artefacto en código)

- Evento → `src/domain/entities/Evento.ts` (`Evento`, `EventoEntity`, `EstadoEvento`)
- Organizador → `Usuario` con `RoleType.ORGANIZADOR` (`src/domain/entities/Usuario.ts`)
- Asistente → `Usuario` con `RoleType.USUARIO`
- Venue → campo `venue` en `Evento`
- Publicacion → acción `PublicarEvento` (use case: `src/application/useCases/eventos/PublicarEvento.ts`)
- Ticket → `src/domain/entities/Ticket.ts` (`Ticket`, `TicketEntity`, `EstadoTicket`)
- Reserva → `src/domain/entities/Reserva.ts` (`Reserva`, `ReservaEntity`, `EstadoReserva`)
- Pago de publicación / Pago de entrada → `src/domain/entities/Pago.ts` (`Pago`, `PagoEntity`, `EstadoPago`)
- Código QR → `Ticket.codigoQR`
- PrecioEntrada → `Evento.precio`
- FechaEvento → `Evento.fecha`
- Transmisión (streaming) → servicios y hooks en `src/adapters/signalr` / `src/presentation/hooks/useSignalR.ts` (si aplica)

## Estados normalizados (según documento de lenguaje ubicuo)

- EstadoEvento: BORRADOR, PENDIENTE_PAGO, PUBLICADO, EN_CURSO, FINALIZADO (se añadió `PENDIENTE_PAGO` en `src/domain/entities/Evento.ts`)
- EstadoTicket: PENDIENTE, CONFIRMADO, CANCELADO, USADO (se renombraron valores en `src/domain/entities/Ticket.ts`)
- EstadoPago: PENDIENTE, CONFIRMADO, FALLIDO (se renombró `COMPLETADO` → `CONFIRMADO` en `src/domain/entities/Pago.ts`)
- EstadoReserva: PENDIENTE, CONFIRMADA, CANCELADA, EXPIRADA (ya presente en `src/domain/entities/Reserva.ts`)


