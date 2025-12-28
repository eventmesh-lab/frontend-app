/**
 * Entidad que representa un venue (lugar) donde se pueden realizar eventos
 */
export interface Venue {
  id: string
  nombre: string
  direccion: string
  fechaCreacion?: Date
  fechaActualizacion?: Date
}

/**
 * Genera un GUID v4 válido
 */
export function generarGuid(): string {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0
    const v = c === 'x' ? r : (r & 0x3 | 0x8)
    return v.toString(16)
  })
}
