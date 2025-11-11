export enum RoleType {
  USUARIO = "usuario",
  ORGANIZADOR = "organizador",
  ADMIN = "admin",
}

export interface Usuario {
  id: string
  nombre: string
  email: string
  avatar?: string
  role: RoleType
  activo: boolean
  fechaCreacion: Date
  fechaActualizacion: Date
}

export class UsuarioEntity implements Usuario {
  id: string
  nombre: string
  email: string
  avatar?: string
  role: RoleType
  activo: boolean
  fechaCreacion: Date
  fechaActualizacion: Date

  constructor(data: Usuario) {
    this.id = data.id
    this.nombre = data.nombre
    this.email = data.email
    this.avatar = data.avatar
    this.role = data.role
    this.activo = data.activo
    this.fechaCreacion = data.fechaCreacion
    this.fechaActualizacion = data.fechaActualizacion
  }

  esAdmin(): boolean {
    return this.role === RoleType.ADMIN
  }

  esOrganizador(): boolean {
    return this.role === RoleType.ORGANIZADOR
  }

  esUsuario(): boolean {
    return this.role === RoleType.USUARIO
  }
}
