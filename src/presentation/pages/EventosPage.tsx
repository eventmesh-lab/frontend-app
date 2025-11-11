"use client"

import { useEffect, useState } from "react"
import { useEventos } from "../hooks/useEventos"
import type { FiltrosEvento } from "../../application/useCases/eventos/ObtenerEventos"
import EventoCard from "../components/eventos/EventoCard"
import LoadingSpinner from "../components/ui/LoadingSpinner"
import EmptyState from "../components/ui/EmptyState"
import Alert from "../components/ui/Alert"
import Breadcrumb from "../components/common/Breadcrumb"

export default function EventosPage() {
  const { eventos, isLoading, error, obtenerEventos } = useEventos()
  const [filtros, setFiltros] = useState<FiltrosEvento>({})
  const [searchError, setSearchError] = useState<string | null>(null)

  useEffect(() => {
    const cargarEventos = async () => {
      try {
        setSearchError(null)
        await obtenerEventos(filtros)
      } catch (err) {
        setSearchError(err instanceof Error ? err.message : "Error cargando eventos")
      }
    }

    cargarEventos()
  }, [filtros, obtenerEventos])

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Breadcrumb />

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-text-primary mb-2">Eventos Publicados</h1>
          <p className="text-text-secondary">Descubre y reserva los eventos que te interesan</p>
        </div>

        {/* Filtros */}
        <div className="bg-white p-6 rounded-lg border border-border-light mb-8">
          <h2 className="text-lg font-semibold text-text-primary mb-4">Filtros</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <input
              type="text"
              placeholder="Categoría"
              value={filtros.categoria || ""}
              onChange={(e) => setFiltros({ ...filtros, categoria: e.target.value || undefined })}
              className="px-3 py-2 border border-border rounded-md text-text-primary"
            />
            <input
              type="date"
              value={filtros.fechaDesde ? filtros.fechaDesde.toISOString().split("T")[0] : ""}
              onChange={(e) =>
                setFiltros({
                  ...filtros,
                  fechaDesde: e.target.value ? new Date(e.target.value) : undefined,
                })
              }
              className="px-3 py-2 border border-border rounded-md text-text-primary"
            />
            <input
              type="number"
              placeholder="Precio máximo"
              value={filtros.precioMaximo || ""}
              onChange={(e) =>
                setFiltros({
                  ...filtros,
                  precioMaximo: e.target.value ? Number.parseFloat(e.target.value) : undefined,
                })
              }
              className="px-3 py-2 border border-border rounded-md text-text-primary"
            />
            <button
              onClick={() => setFiltros({})}
              className="px-4 py-2 bg-secondary text-text-primary rounded-md hover:bg-opacity-90 transition-colors"
            >
              Limpiar Filtros
            </button>
          </div>
        </div>

        {/* Errores */}
        {(error || searchError) && (
          <Alert type="error" title="Error" onClose={() => setSearchError(null)}>
            {error || searchError}
          </Alert>
        )}

        {/* Contenido */}
        {isLoading ? (
          <div className="flex justify-center py-12">
            <LoadingSpinner message="Cargando eventos..." />
          </div>
        ) : eventos.length === 0 ? (
          <EmptyState
            icon="🎉"
            title="No hay eventos disponibles"
            description="Intenta cambiar los filtros o vuelve más tarde"
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {eventos.map((evento) => (
              <EventoCard key={evento.id} evento={evento} />
            ))}
          </div>
        )}
      </div>
  )
}
