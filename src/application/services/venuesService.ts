import { Venue, generarGuid } from "../../domain/entities/Venue"

const STORAGE_KEY = "eventmesh_venues"

/**
 * Servicio para gestionar venues (lugares) usando localStorage
 * En producción, esto debería conectarse a un backend API
 */
class VenuesService {
  /**
   * Obtiene todos los venues almacenados
   */
  obtenerTodos(): Venue[] {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (!stored) {
        // Si no hay venues, inicializar con los venues por defecto
        const defaultVenues = this.getDefaultVenues()
        this.guardarTodos(defaultVenues)
        return defaultVenues
      }
      return JSON.parse(stored)
    } catch (error) {
      console.error("[VenuesService] Error obteniendo venues:", error)
      return this.getDefaultVenues()
    }
  }

  /**
   * Obtiene un venue por su ID
   */
  obtenerPorId(id: string): Venue | null {
    const venues = this.obtenerTodos()
    return venues.find((v) => v.id === id) || null
  }

  /**
   * Crea un nuevo venue
   */
  crear(nombre: string, direccion: string): Venue {
    const nuevoVenue: Venue = {
      id: generarGuid(),
      nombre: nombre.trim(),
      direccion: direccion.trim(),
      fechaCreacion: new Date(),
      fechaActualizacion: new Date(),
    }

    const venues = this.obtenerTodos()
    venues.push(nuevoVenue)
    this.guardarTodos(venues)

    return nuevoVenue
  }

  /**
   * Actualiza un venue existente
   */
  actualizar(id: string, nombre: string, direccion: string): Venue | null {
    const venues = this.obtenerTodos()
    const index = venues.findIndex((v) => v.id === id)

    if (index === -1) {
      return null
    }

    venues[index] = {
      ...venues[index],
      nombre: nombre.trim(),
      direccion: direccion.trim(),
      fechaActualizacion: new Date(),
    }

    this.guardarTodos(venues)
    return venues[index]
  }

  /**
   * Elimina un venue
   */
  eliminar(id: string): boolean {
    const venues = this.obtenerTodos()
    const filtered = venues.filter((v) => v.id !== id)

    if (filtered.length === venues.length) {
      return false // No se encontró el venue
    }

    this.guardarTodos(filtered)
    return true
  }

  /**
   * Guarda todos los venues en localStorage
   */
  private guardarTodos(venues: Venue[]): void {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(venues))
    } catch (error) {
      console.error("[VenuesService] Error guardando venues:", error)
      throw new Error("Error al guardar los venues")
    }
  }

  /**
   * Retorna los venues por defecto (hardcodeados inicialmente)
   */
  private getDefaultVenues(): Venue[] {
    return [
      {
        id: "550e8400-e29b-41d4-a716-446655440000",
        nombre: "Teatro Nacional",
        direccion: "Av. Principal 123, Ciudad",
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      },
      {
        id: "660e8400-e29b-41d4-a716-446655440001",
        nombre: "Estadio Central",
        direccion: "Calle Deportiva 456, Ciudad",
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      },
      {
        id: "770e8400-e29b-41d4-a716-446655440002",
        nombre: "Centro de Convenciones",
        direccion: "Boulevard Empresarial 789, Ciudad",
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      },
      {
        id: "880e8400-e29b-41d4-a716-446655440003",
        nombre: "Auditorio Municipal",
        direccion: "Plaza Central 321, Ciudad",
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      },
      {
        id: "990e8400-e29b-41d4-a716-446655440004",
        nombre: "Arena Deportiva",
        direccion: "Zona Deportiva 654, Ciudad",
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      },
      {
        id: "aa0e8400-e29b-41d4-a716-446655440005",
        nombre: "Sala de Conciertos",
        direccion: "Distrito Musical 987, Ciudad",
        fechaCreacion: new Date(),
        fechaActualizacion: new Date(),
      },
    ]
  }
}

export const venuesService = new VenuesService()
