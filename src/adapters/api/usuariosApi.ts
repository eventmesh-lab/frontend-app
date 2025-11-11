import { type Usuario, RoleType, UsuarioEntity } from "../../domain/entities/Usuario"

class UsuariosApiAdapter {
  private usuarios = new Map<string, UsuarioEntity>()

  constructor() {
    this.inicializarDatos()
  }

  private inicializarDatos(): void {
    const usuariosInicial: Usuario[] = [
      {
        id: "usr_001",
        nombre: "Juan Pérez",
        email: "juan@example.com",
        role: RoleType.USUARIO,
        activo: true,
        avatar: "/user-avatar.jpg",
        fechaCreacion: new Date("2025-01-01"),
        fechaActualizacion: new Date("2025-01-01"),
      },
      {
        id: "org_001",
        nombre: "Carlos García",
        email: "carlos@example.com",
        role: RoleType.ORGANIZADOR,
        activo: true,
        avatar: "/organizer-avatar.jpg",
        fechaCreacion: new Date("2025-01-01"),
        fechaActualizacion: new Date("2025-01-01"),
      },
      {
        id: "org_002",
        nombre: "María López",
        email: "maria@example.com",
        role: RoleType.ORGANIZADOR,
        activo: true,
        avatar: "/organizer-avatar-2.jpg",
        fechaCreacion: new Date("2025-01-02"),
        fechaActualizacion: new Date("2025-01-02"),
      },
      {
        id: "org_003",
        nombre: "Roberto Martínez",
        email: "roberto@example.com",
        role: RoleType.ORGANIZADOR,
        activo: true,
        avatar: "/organizer-avatar-3.jpg",
        fechaCreacion: new Date("2025-01-03"),
        fechaActualizacion: new Date("2025-01-03"),
      },
      {
        id: "admin_001",
        nombre: "Admin Sistema",
        email: "admin@example.com",
        role: RoleType.ADMIN,
        activo: true,
        avatar: "/admin-avatar.png",
        fechaCreacion: new Date("2025-01-01"),
        fechaActualizacion: new Date("2025-01-01"),
      },
    ]

    usuariosInicial.forEach((usr) => this.usuarios.set(usr.id, new UsuarioEntity(usr)))
  }

  async obtenerPorId(id: string): Promise<UsuarioEntity | null> {
    await this.delay(150)

    const usuario = this.usuarios.get(id) || null
    console.log("[v0] Usuario por ID:", id, usuario ? "encontrado" : "no encontrado")
    return usuario
  }

  async obtenerPorEmail(email: string): Promise<UsuarioEntity | null> {
    await this.delay(200)

    const usuario = Array.from(this.usuarios.values()).find((usr) => usr.email === email) || null
    console.log("[v0] Usuario por email:", email, usuario ? "encontrado" : "no encontrado")
    return usuario
  }

  async crearUsuario(usuario: Usuario): Promise<UsuarioEntity> {
    await this.delay(350)

    if (this.usuarios.has(usuario.id)) {
      throw new Error("El usuario ya existe")
    }

    // Validar email único
    if (Array.from(this.usuarios.values()).some((u) => u.email === usuario.email)) {
      throw new Error("El email ya está registrado")
    }

    const usuarioEntity = new UsuarioEntity(usuario)
    this.usuarios.set(usuario.id, usuarioEntity)
    console.log("[v0] Usuario creado:", usuario.id, "Email:", usuario.email)
    return usuarioEntity
  }

  async actualizarUsuario(id: string, datos: Partial<Usuario>): Promise<UsuarioEntity | null> {
    await this.delay(300)

    const usuario = this.usuarios.get(id)
    if (!usuario) {
      console.warn("[v0] Usuario no encontrado para actualizar:", id)
      return null
    }

    const actualizado = new UsuarioEntity({
      ...usuario,
      ...datos,
      fechaActualizacion: new Date(),
    })
    this.usuarios.set(id, actualizado)

    console.log("[v0] Usuario actualizado:", id)
    return actualizado
  }

  async obtenerTodos(): Promise<UsuarioEntity[]> {
    await this.delay(300)

    const usuarios = Array.from(this.usuarios.values())
    console.log("[v0] Total de usuarios:", usuarios.length)
    return usuarios
  }

  async obtenerPorRole(role: RoleType): Promise<UsuarioEntity[]> {
    await this.delay(200)

    const usuarios = Array.from(this.usuarios.values()).filter((u) => u.role === role)
    console.log("[v0] Usuarios con rol:", role, "cantidad:", usuarios.length)
    return usuarios
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

export const usuariosApi = new UsuariosApiAdapter()
