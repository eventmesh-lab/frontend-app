/**
 * Utilidades para manejar IDs de usuario
 * Convierte emails a GUIDs determinísticos para usar con las APIs que requieren GUID
 */

/**
 * Genera un GUID determinístico a partir de un email
 * Usa un algoritmo similar a UUID v5 pero simplificado para el navegador
 * Esto asegura que el mismo email siempre genere el mismo GUID
 */
export function emailToGuid(email: string): string {
  if (!email) {
    throw new Error("El email es requerido para generar el GUID")
  }

  // Normalizar el email (minúsculas, sin espacios)
  const normalizedEmail = email.toLowerCase().trim()

  // Generar múltiples hashes para crear un GUID más robusto
  const hash1 = simpleHash(normalizedEmail)
  const hash2 = simpleHash(normalizedEmail + "salt1")
  const hash3 = simpleHash(normalizedEmail + "salt2")
  const hash4 = simpleHash(normalizedEmail + "salt3")
  const hash5 = simpleHash(normalizedEmail + "salt4")
  
  // Convertir los hashes a formato GUID (8-4-4-4-12)
  // Formato: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  // donde x es hexadecimal y y es uno de 8, 9, A, o B
  const part1 = padHex(hash1 & 0xffffffff, 8)
  const part2 = padHex((hash2 >> 16) & 0xffff, 4)
  const part3 = padHex(((hash3 & 0x0fff) | 0x4000), 4) // Versión 4
  const part4 = padHex(((hash4 & 0x3fff) | 0x8000), 4) // Variante (10xx)
  const part5a = padHex((hash5 >> 16) & 0xffff, 4)
  const part5b = padHex(hash5 & 0xffffffff, 8)

  return `${part1}-${part2}-${part3}-${part4}-${part5a}${part5b}`
}

/**
 * Función hash simple que genera un número a partir de un string
 * Genera un hash de 32 bits de forma determinística
 */
function simpleHash(str: string): number {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convertir a entero de 32 bits
  }
  // Asegurar que sea positivo
  return Math.abs(hash) >>> 0 // Convertir a unsigned 32-bit
}

/**
 * Convierte un número a hexadecimal y lo rellena con ceros
 */
function padHex(num: number, length: number): string {
  return num.toString(16).padStart(length, '0').substring(0, length)
}

/**
 * Alternativa: Usar el email directamente como string si la API lo acepta
 * Algunas APIs pueden aceptar strings que no sean GUIDs estrictos
 */
export function emailToId(email: string): string {
  if (!email) {
    throw new Error("El email es requerido")
  }
  // Normalizar el email
  return email.toLowerCase().trim()
}

/**
 * Determina si un string es un GUID válido
 */
export function isValidGuid(str: string): boolean {
  const guidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
  return guidRegex.test(str)
}

/**
 * Obtiene el ID del usuario desde el email
 * Intenta usar el email como GUID primero, si no funciona, genera un GUID determinístico
 */
export function getUserIdFromEmail(email: string): string {
  // Primero intentar usar el email directamente (por si la API lo acepta)
  // Si la API requiere un GUID, usar emailToGuid
  return emailToGuid(email)
}
