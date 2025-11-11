"use client"

import { useEffect } from "react"
import { useAuth } from "../contexts/AuthContext"
import { useEventos } from "../hooks/useEventos"
import OrganizadorLayout from "../layouts/OrganizadorLayout"
import EventoCard from "../components/eventos/EventoCard"
import LoadingSpinner from "../components/ui/LoadingSpinner"
import EmptyState from "../components/ui/EmptyState"
import Card from "../components/ui/Card"
import Button from "../components/ui/Button"
import { Link } from "react-router-dom"

export default function OrganizadorDashboardPage() {
  const { usuario } = useAuth()
  const { eventos, isLoading, obtenerMisEventos, publicarEvento } = useEventos()

  useEffect(() => {
    if (usuario) {
      obtenerMisEventos(usuario.id)
    }
  }, [usuario, obtenerMisEventos])

  const eventosPublicados = eventos.filter((e) => e.estado === "publicado")
  const eventosBorrador = eventos.filter((e) => e.estado === "borrador")
  const ventaTotalPotencial = eventos.reduce((sum, e) => sum + e.aforo * e.precio, 0)

  return (
    <OrganizadorLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Dashboard del Organizador</h1>
          <p className="text-text-secondary">Gestiona tus eventos y visualiza estadísticas</p>
        </div>

        {/* Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">{eventos.length}</p>
              <p className="text-text-secondary text-sm">Total de eventos</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-success">{eventosPublicados.length}</p>
              <p className="text-text-secondary text-sm">Publicados</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-warning">{eventosBorrador.length}</p>
              <p className="text-text-secondary text-sm">Borradores</p>
            </div>
          </Card>
          <Card>
            <div className="text-center">
              <p className="text-3xl font-bold text-primary">${ventaTotalPotencial}</p>
              <p className="text-text-secondary text-sm">Venta potencial</p>
            </div>
          </Card>
        </div>

        {/* Crear evento */}
        <div className="mb-8">
          <Link to="/organizador/crear-evento">
            <Button variant="primary" size="lg">
              + Crear Nuevo Evento
            </Button>
          </Link>
        </div>

        {/* Eventos */}
        {isLoading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner message="Cargando tus eventos..." />
          </div>
        ) : eventos.length === 0 ? (
          <EmptyState
            icon="🎉"
            title="No tienes eventos"
            description="Crea tu primer evento para comenzar a organizar"
          />
        ) : (
          <div>
            <h2 className="text-2xl font-bold text-text-primary mb-4">Mis Eventos</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {eventos.map((evento) => (
                <EventoCard key={evento.id} evento={evento} showActions onPublish={publicarEvento} />
              ))}
            </div>
          </div>
        )}
      </div>
    </OrganizadorLayout>
  )
}
