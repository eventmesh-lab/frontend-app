"use client"

import { useEffect } from "react"
import { useEventos } from "../hooks/useEventos"
import AdminLayout from "../layouts/AdminLayout"
import LoadingSpinner from "../components/ui/LoadingSpinner"
import Card from "../components/ui/Card"

export default function AdminDashboardPage() {
  const { eventos, isLoading, obtenerEventos } = useEventos()

  useEffect(() => {
    obtenerEventos()
  }, [obtenerEventos])

  const eventosPublicados = eventos.filter((e) => e.estado === "publicado")
  const eventosCancelados = eventos.filter((e) => e.estado === "cancelado")

  return (
    <AdminLayout>
      <div>
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-text-primary mb-2">Dashboard de Administración</h1>
          <p className="text-text-secondary">Monitorea la plataforma y sus estadísticas</p>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <LoadingSpinner message="Cargando datos..." />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <div className="text-center">
                <p className="text-3xl font-bold text-primary">{eventos.length}</p>
                <p className="text-text-secondary text-sm">Total de eventos</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-3xl font-bold text-success">{eventosPublicados.length}</p>
                <p className="text-text-secondary text-sm">Eventos activos</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-3xl font-bold text-danger">{eventosCancelados.length}</p>
                <p className="text-text-secondary text-sm">Cancelados</p>
              </div>
            </Card>
            <Card>
              <div className="text-center">
                <p className="text-3xl font-bold text-accent">100%</p>
                <p className="text-text-secondary text-sm">Disponibilidad</p>
              </div>
            </Card>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
