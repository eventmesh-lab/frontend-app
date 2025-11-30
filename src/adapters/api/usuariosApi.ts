import { type Usuario, RoleType, UsuarioEntity } from "../../domain/entities/Usuario"
import { httpClient } from "./httpClient"

/**
 * Mapea un usuario desde la API a UsuarioEntity
 */
function mapUsuarioFromApi(data: any): UsuarioEntity {
  return new UsuarioEntity({
    id: data.id,
    nombre: data.nombre,
    email: data.email,
    avatar: data.avatar,
    role: data.role as RoleType,
    activo: data.activo !== undefined ? data.activo : true,
    fechaCreacion: new Date(data.fechaCreacion || new Date()),
    fechaActualizacion: new Date(data.fechaActualizacion || new Date()),
  })
}

/**
 * Mapea un usuario para enviarlo a la API
 */
function mapUsuarioToApi(usuario: Partial<Usuario>): any {
  const mapped: any = { ...usuario }
  if (usuario.fechaCreacion) {
    mapped.fechaCreacion = usuario.fechaCreacion instanceof Date ? usuario.fechaCreacion.toISOString() : usuario.fechaCreacion
  }
  if (usuario.fechaActualizacion) {
    mapped.fechaActualizacion = usuario.fechaActualizacion instanceof Date ? usuario.fechaActualizacion.toISOString() : usuario.fechaActualizacion
  }
  return mapped
}

class UsuariosApiAdapter {
  private client = httpClient.getUsersClient()

  async obtenerPorId(id: string): Promise<UsuarioEntity | null> {
    try {
      const response = await this.client.get(`/api/usuarios/${id}`)
      console.log("[v0] Usuario por ID:", id, "encontrado")
      return mapUsuarioFromApi(response.data)
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log("[v0] Usuario no encontrado:", id)
        return null
      }
      console.error("[v0] Error obteniendo usuario:", error)
      throw new Error(error.response?.data?.message || "Error al obtener el usuario")
    }
  }

  async obtenerPorEmail(email: string): Promise<UsuarioEntity | null> {
    try {
      // Si la API no tiene endpoint por email, buscar en todos y filtrar
      const response = await this.client.get("/api/usuarios", {
        params: { email }
      })
      const usuarios = Array.isArray(response.data) ? response.data : [response.data]
      const usuario = usuarios.find((u: any) => u.email === email)
      console.log("[v0] Usuario por email:", email, usuario ? "encontrado" : "no encontrado")
      return usuario ? mapUsuarioFromApi(usuario) : null
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.log("[v0] Usuario no encontrado por email:", email)
        return null
      }
      console.error("[v0] Error obteniendo usuario por email:", error)
      throw new Error(error.response?.data?.message || "Error al obtener el usuario")
    }
  }

  async obtenerMiPerfil(): Promise<UsuarioEntity | null> {
    try {
      const response = await this.client.get("/api/usuarios/me")
      console.log("[v0] Perfil obtenido")
      return mapUsuarioFromApi(response.data)
    } catch (error: any) {
      if (error.response?.status === 404 || error.response?.status === 401) {
        console.log("[v0] No se pudo obtener el perfil")
        return null
      }
      console.error("[v0] Error obteniendo perfil:", error)
      throw new Error(error.response?.data?.message || "Error al obtener el perfil")
    }
  }

  async crearUsuario(usuario: Usuario): Promise<UsuarioEntity> {
    try {
      const payload = mapUsuarioToApi(usuario)
      const response = await this.client.post("/api/usuarios", payload)
      console.log("[v0] Usuario creado:", response.data.id, "Email:", response.data.email)
      return mapUsuarioFromApi(response.data)
    } catch (error: any) {
      console.error("[v0] Error creando usuario:", error)
      throw new Error(error.response?.data?.message || "Error al crear el usuario")
    }
  }

  async actualizarUsuario(id: string, datos: Partial<Usuario>): Promise<UsuarioEntity | null> {
    try {
      const payload = mapUsuarioToApi(datos)
      const response = await this.client.put(`/api/usuarios/${id}`, payload)
      console.log("[v0] Usuario actualizado:", id)
      return mapUsuarioFromApi(response.data)
    } catch (error: any) {
      if (error.response?.status === 404) {
        console.warn("[v0] Usuario no encontrado para actualizar:", id)
        return null
      }
      console.error("[v0] Error actualizando usuario:", error)
      throw new Error(error.response?.data?.message || "Error al actualizar el usuario")
    }
  }

  async actualizarMiPerfil(datos: Partial<Usuario>): Promise<UsuarioEntity | null> {
    try {
      const payload = mapUsuarioToApi(datos)
      const response = await this.client.put("/api/usuarios/me", payload)
      console.log("[v0] Perfil actualizado")
      return mapUsuarioFromApi(response.data)
    } catch (error: any) {
      console.error("[v0] Error actualizando perfil:", error)
      throw new Error(error.response?.data?.message || "Error al actualizar el perfil")
    }
  }

  async obtenerTodos(): Promise<UsuarioEntity[]> {
    try {
      const response = await this.client.get("/api/usuarios")
      const usuarios = Array.isArray(response.data) ? response.data : []
      console.log("[v0] Total de usuarios:", usuarios.length)
      return usuarios.map(mapUsuarioFromApi)
    } catch (error: any) {
      console.error("[v0] Error obteniendo usuarios:", error)
      throw new Error(error.response?.data?.message || "Error al obtener usuarios")
    }
  }

  async obtenerPorRole(role: RoleType): Promise<UsuarioEntity[]> {
    try {
      const response = await this.client.get("/api/usuarios", {
        params: { role }
      })
      const usuarios = Array.isArray(response.data) ? response.data : []
      const filtered = usuarios.filter((u: any) => u.role === role)
      console.log("[v0] Usuarios con rol:", role, "cantidad:", filtered.length)
      return filtered.map(mapUsuarioFromApi)
    } catch (error: any) {
      console.error("[v0] Error obteniendo usuarios por rol:", error)
      throw new Error(error.response?.data?.message || "Error al obtener usuarios por rol")
    }
  }
}

export const usuariosApi = new UsuariosApiAdapter()
