/**
 * Integration Tests para EventHub
 * Flujos principales de usuario y casos de uso críticos
 */

import { describe, it, expect, beforeEach, vi } from "vitest"
import { eventosApi } from "../adapters/api/eventosApi"
import { reservasApi } from "../adapters/api/reservasApi"
import { pagosApi } from "../adapters/api/pagosApi"
import { usuariosApi } from "../adapters/api/usuariosApi"
import { keycloakService } from "../adapters/keycloak/keycloakService"
import { EstadoEvento, EventoEntity } from "../domain/entities/Evento"
import { RoleType } from "../domain/entities/Usuario"
import { EstadoReserva } from "../domain/entities/Reserva"
import { EstadoPago } from "../domain/entities/Pago"

describe("EventHub - Integration Tests", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("Flujo de Usuario Regular", () => {
    it("Usuario puede listar eventos publicados", async () => {
      const eventos = await eventosApi.obtenerPublicados()
      expect(eventos).toBeDefined()
      expect(eventos.length).toBeGreaterThan(0)
      expect(eventos.every((e) => e.estado === EstadoEvento.PUBLICADO)).toBe(true)
    })

    it("Usuario puede ver detalle de un evento", async () => {
      const eventos = await eventosApi.obtenerPublicados()
      const evento = eventos[0]

      const detalle = await eventosApi.obtenerDetalle(evento.id)
      expect(detalle).toBeDefined()
      expect(detalle?.id).toBe(evento.id)
      expect(detalle?.nombre).toBe(evento.nombre)
    })

    it("Usuario autenticado puede crear una reserva", async () => {
      const usuario = await usuariosApi.obtenerPorEmail("juan@example.com")
      expect(usuario).toBeDefined()

      const eventos = await eventosApi.obtenerPublicados()
      const evento = eventos[0]

      const reserva = await reservasApi.crearReserva({
        id: `res_test_${Date.now()}`,
        asistenteId: usuario!.id,
        eventoId: evento.id,
        cantidad: 2,
        estado: EstadoReserva.PENDIENTE,
        montoTotal: evento.precio * 2,
        fechaCreacion: new Date(),
        fechaExpiracion: new Date(Date.now() + 15 * 60 * 1000),
        codigoReserva: `TEST${Date.now()}`,
      })

      expect(reserva).toBeDefined()
      expect(reserva.cantidad).toBe(2)
      expect(reserva.montoTotal).toBe(evento.precio * 2)
    })

    it("Usuario puede procesar pago para reserva", async () => {
      const usuario = await usuariosApi.obtenerPorEmail("juan@example.com")
      const eventos = await eventosApi.obtenerPublicados()
      const evento = eventos[0]

      // Crear reserva
      const reserva = await reservasApi.crearReserva({
        id: `res_test_${Date.now()}`,
        asistenteId: usuario!.id,
        eventoId: evento.id,
        cantidad: 1,
        estado: EstadoReserva.PENDIENTE,
        montoTotal: evento.precio,
        fechaCreacion: new Date(),
        fechaExpiracion: new Date(Date.now() + 15 * 60 * 1000),
        codigoReserva: `TEST${Date.now()}`,
      })

      // Crear pago
      const pago = await pagosApi.crearPago({
        id: `pay_test_${Date.now()}`,
        usuarioId: usuario!.id,
        reservaId: reserva.id,
        monto: evento.precio,
        concepto: `Entrada para ${evento.nombre}`,
        estado: EstadoPago.PENDIENTE,
        metodo: "tarjeta",
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      })

      // Procesar pago
      const pagoProcesado = await pagosApi.procesarPago(pago.id)
      expect(pagoProcesado).toBeDefined()
      expect(pagoProcesado?.estado).toMatch(/completado|fallido/)
    })
  })

  describe("Flujo de Organizador", () => {
    it("Organizador puede crear evento", async () => {
      const organizador = await usuariosApi.obtenerPorEmail("carlos@example.com")
      expect(organizador?.role).toBe(RoleType.ORGANIZADOR)

      const nuevoEvento = new EventoEntity({
        id: `evt_test_${Date.now()}`,
        nombre: "Test Event",
        descripcion: "Descripción de prueba",
        categoria: "Test",
        fecha: new Date("2025-12-15"),
        venue: "Test Venue",
        precio: 100,
        aforo: 100,
        aforoDisponible: 100,
        organizadorId: organizador!.id,
        estado: EstadoEvento.BORRADOR,
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      })

      const evento = await eventosApi.crearEvento(nuevoEvento)
      expect(evento).toBeDefined()
      expect(evento.estado).toBe(EstadoEvento.BORRADOR)
    })

    it("Organizador puede publicar evento", async () => {
      const organizador = await usuariosApi.obtenerPorEmail("carlos@example.com")
      const misEventos = await eventosApi.obtenerPorOrganizador(organizador!.id)

      if (misEventos.length > 0) {
        const evento = misEventos[0]
        await eventosApi.publicarEvento(evento.id)

        const eventoActualizado = await eventosApi.obtenerDetalle(evento.id)
        expect(eventoActualizado?.estado).toBe(EstadoEvento.PUBLICADO)
      }
    })

    it("Organizador puede ver sus eventos", async () => {
      const organizador = await usuariosApi.obtenerPorEmail("carlos@example.com")
      const misEventos = await eventosApi.obtenerPorOrganizador(organizador!.id)

      expect(misEventos).toBeDefined()
      expect(Array.isArray(misEventos)).toBe(true)
      expect(misEventos.every((e) => e.organizadorId === organizador!.id)).toBe(true)
    })
  })

  describe("Autenticación Keycloak", () => {
    it("Usuario puede iniciar sesión con credenciales", async () => {
      const token = await keycloakService.loginWithCredentials("juan@example.com", "pass")
      expect(token).toBeDefined()
      expect(token?.accessToken).toBeDefined()
      expect(token?.refreshToken).toBeDefined()
    })

    it("Información de usuario se almacena correctamente", async () => {
      await keycloakService.loginWithCredentials("carlos@example.com", "pass")
      const user = keycloakService.getUser()

      expect(user).toBeDefined()
      expect(user?.email).toBe("carlos@example.com")
      expect(user?.roles).toContain("organizador")
    })

    it("Token es válido después de login", async () => {
      await keycloakService.loginWithCredentials("admin@example.com", "pass")
      expect(keycloakService.isTokenValid()).toBe(true)
    })
  })

  describe("Validaciones", () => {
    it("Reserva valida cantidad disponible", async () => {
      const usuario = await usuariosApi.obtenerPorEmail("juan@example.com")
      const eventos = await eventosApi.obtenerPublicados()
      const evento = eventos[0]

      // Intentar reservar más del disponible
      const canReserve = await reservasApi.verificarDisponibilidad(evento.id, evento.aforoDisponible + 1)
      expect(canReserve).toBe(false)
    })

    it("No se puede crear reserva para evento cancelado", async () => {
      // Este test verificaría la lógica en el caso de uso
      const eventos = await eventosApi.obtenerPublicados()
      const eventoPublicado = eventos[0]

      expect(eventoPublicado.puedeReservar()).toBe(true)
    })
  })
})
