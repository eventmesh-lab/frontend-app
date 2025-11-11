import { type Evento, EstadoEvento, EventoEntity } from "../../domain/entities/Evento"

class EventosApiAdapter {
  private eventos = new Map<string, EventoEntity>()
  private eventIdCounter = 1000

  constructor() {
    this.inicializarDatos()
  }

  private inicializarDatos(): void {
    const eventosInicial: Evento[] = [
      {
        id: "evt_001",
        nombre: "Tech Conference 2025",
        descripcion:
          "Conferencia anual de tecnología con expertos internacionales en IA, Cloud y DevOps. Incluye charlas magistrales, workshops y networking.",
        categoria: "Tecnología",
        fecha: new Date("2025-03-15T09:00:00"),
        venue: "Centro de Convenciones Downtown",
        precio: 150,
        aforo: 500,
        aforoDisponible: 350,
        organizadorId: "org_001",
        estado: EstadoEvento.PUBLICADO,
        imagen: "/tech-conference.jpg",
        fechaCreacion: new Date("2025-01-01"),
        fechaActualizacion: new Date("2025-01-10"),
      },
      {
        id: "evt_002",
        nombre: "Workshop React Avanzado",
        descripcion:
          "Taller intensivo de 2 días sobre React. Aprende hooks, context API, performance optimization y patrones avanzados. Incluye proyectos prácticos.",
        categoria: "Educación",
        fecha: new Date("2025-02-28T14:00:00"),
        venue: "Aula Virtual",
        precio: 50,
        aforo: 100,
        aforoDisponible: 75,
        organizadorId: "org_002",
        estado: EstadoEvento.PUBLICADO,
        imagen: "/react-workshop.jpg",
        fechaCreacion: new Date("2025-01-05"),
        fechaActualizacion: new Date("2025-01-08"),
      },
      {
        id: "evt_003",
        nombre: "Startup Networking Night",
        descripcion:
          "Evento de networking para emprendedores y fundadores de startups. Conoce inversores, mentores y otros founders. Incluye cócteles y cenas.",
        categoria: "Negocios",
        fecha: new Date("2025-02-15T18:00:00"),
        venue: "Rooftop Bar & Lounge",
        precio: 25,
        aforo: 200,
        aforoDisponible: 150,
        organizadorId: "org_001",
        estado: EstadoEvento.PUBLICADO,
        imagen: "/networking-event.jpg",
        fechaCreacion: new Date("2025-01-02"),
        fechaActualizacion: new Date("2025-01-07"),
      },
      {
        id: "evt_004",
        nombre: "Digital Marketing Summit",
        descripcion:
          "Cumbre de marketing digital donde expertos compartirán las últimas tendencias en SEO, SEM, social media marketing y analytics.",
        categoria: "Marketing",
        fecha: new Date("2025-03-22T10:00:00"),
        venue: "Gran Hotel Marina",
        precio: 100,
        aforo: 300,
        aforoDisponible: 300,
        organizadorId: "org_003",
        estado: EstadoEvento.PUBLICADO,
        imagen: "/digital-marketing.jpg",
        fechaCreacion: new Date("2025-01-03"),
        fechaActualizacion: new Date("2025-01-09"),
      },
    ]

    eventosInicial.forEach((evt) => this.eventos.set(evt.id, new EventoEntity(evt)))
  }

  async crearEvento(evento: Evento): Promise<EventoEntity> {
    // Simular latencia de red
    await this.delay(300)

    if (this.eventos.has(evento.id)) {
      throw new Error("El evento ya existe")
    }

    const eventoEntity = new EventoEntity(evento)
    this.eventos.set(evento.id, eventoEntity)
    console.log("[v0] Evento creado:", evento.id)
    return eventoEntity
  }

  async obtenerPublicados(): Promise<EventoEntity[]> {
    await this.delay(200)

    const eventos = Array.from(this.eventos.values()).filter((evt) => evt.estado === EstadoEvento.PUBLICADO)

    console.log("[v0] Eventos publicados recuperados:", eventos.length)
    return eventos
  }

  async obtenerDetalle(id: string): Promise<EventoEntity | null> {
    await this.delay(150)

    const evento = this.eventos.get(id) || null
    console.log("[v0] Detalle evento:", id, evento ? "encontrado" : "no encontrado")
    return evento
  }

  async publicarEvento(id: string): Promise<void> {
    await this.delay(250)

    const evento = this.eventos.get(id)
    if (!evento) {
      throw new Error("Evento no encontrado")
    }

    evento.estado = EstadoEvento.PUBLICADO
    evento.fechaActualizacion = new Date()
    this.eventos.set(id, evento)

    console.log("[v0] Evento publicado:", id)
  }

  async obtenerPorOrganizador(organizadorId: string): Promise<EventoEntity[]> {
    await this.delay(200)

    const eventos = Array.from(this.eventos.values()).filter((evt) => evt.organizadorId === organizadorId)

    console.log("[v0] Eventos del organizador:", organizadorId, "cantidad:", eventos.length)
    return eventos
  }

  async editarEvento(id: string, datos: Partial<Evento>): Promise<EventoEntity | null> {
    await this.delay(300)

    const evento = this.eventos.get(id)
    if (!evento) {
      console.warn("[v0] Evento no encontrado para editar:", id)
      return null
    }

    const actualizado = new EventoEntity({ ...evento, ...datos, fechaActualizacion: new Date() })
    this.eventos.set(id, actualizado)

    console.log("[v0] Evento editado:", id)
    return actualizado
  }

  async cancelarEvento(id: string): Promise<void> {
    await this.delay(250)

    const evento = this.eventos.get(id)
    if (!evento) {
      throw new Error("Evento no encontrado")
    }

    evento.estado = EstadoEvento.CANCELADO
    evento.fechaActualizacion = new Date()
    this.eventos.set(id, evento)

    console.log("[v0] Evento cancelado:", id)
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}

export const eventosApi = new EventosApiAdapter()
