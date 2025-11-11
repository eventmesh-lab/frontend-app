"use client"

import { Link } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"
import { ArrowRight, Calendar, Users, Zap, Lock, TrendingUp, Bell } from "lucide-react"

export default function HomePage() {
  const { isAuthenticated, usuario } = useAuth()

  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="relative py-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl md:text-5xl font-bold text-text-primary mb-6 text-balance">
                Gestiona tus eventos de forma integral
              </h1>
              <p className="text-lg text-text-secondary mb-8 text-pretty">
                Plataforma completa para organizar, promocionar y gestionar eventos con seguridad y eficiencia. Desde pequeñas reuniones hasta eventos masivos.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link
                  to="/eventos"
                  className="px-8 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors inline-flex items-center gap-2 justify-center"
                >
                  Explorar Eventos
                  <ArrowRight className="w-5 h-5" />
                </Link>
                {!isAuthenticated && (
                  <Link
                    to="/registro"
                    className="px-8 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition-colors inline-flex items-center gap-2 justify-center"
                  >
                    Crear Cuenta Gratis
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                )}
                {isAuthenticated && usuario?.esOrganizador() && (
                  <Link
                    to="/organizador"
                    className="px-8 py-3 border-2 border-primary text-primary rounded-lg font-semibold hover:bg-primary hover:text-white transition-colors inline-flex items-center gap-2 justify-center"
                  >
                    Mi Dashboard
                    <ArrowRight className="w-5 h-5" />
                  </Link>
                )}
              </div>
            </div>
            <div className="bg-gradient-to-br from-primary-light to-accent rounded-xl h-96 flex items-center justify-center shadow-lg">
              <div className="text-center text-white">
                <div className="text-6xl mb-4">🎉</div>
                <p className="text-2xl font-bold">Eventos sin límites</p>
                <p className="text-sm mt-2 opacity-90">Crea, promociona y gestiona</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Navigation Cards - For unauthenticated users */}
      {!isAuthenticated && (
        <section className="py-12 px-4 sm:px-6 lg:px-8 bg-bg-secondary">
          <div className="max-w-7xl mx-auto">
            <h2 className="text-3xl font-bold text-text-primary mb-8 text-center">Comienza tu viaje</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Link
                to="/eventos"
                className="group p-6 bg-white rounded-lg border border-border-light hover:shadow-lg hover:border-primary transition-all"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-blue-100 rounded-lg group-hover:bg-blue-200 transition-colors">
                    <Calendar className="w-6 h-6 text-blue-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary group-hover:text-primary transition-colors">
                    Explorar Eventos
                  </h3>
                </div>
                <p className="text-text-secondary">Descubre una variedad de eventos próximos en tu área</p>
              </Link>

              <Link
                to="/registro"
                className="group p-6 bg-white rounded-lg border border-border-light hover:shadow-lg hover:border-primary transition-all"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-green-100 rounded-lg group-hover:bg-green-200 transition-colors">
                    <Users className="w-6 h-6 text-green-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary group-hover:text-primary transition-colors">
                    Crear Cuenta
                  </h3>
                </div>
                <p className="text-text-secondary">Regístrate para hacer reservas y gestionar eventos</p>
              </Link>

              <Link
                to="/login"
                className="group p-6 bg-white rounded-lg border border-border-light hover:shadow-lg hover:border-primary transition-all"
              >
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-purple-100 rounded-lg group-hover:bg-purple-200 transition-colors">
                    <Zap className="w-6 h-6 text-purple-600" />
                  </div>
                  <h3 className="text-lg font-semibold text-text-primary group-hover:text-primary transition-colors">
                    Inicia Sesión
                  </h3>
                </div>
                <p className="text-text-secondary">Accede a tu cuenta y gestiona tus reservas</p>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Features Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-bg-secondary">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl font-bold text-text-primary mb-12 text-center">Características principales</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                title: "Gestión Completa",
                description: "Crea, publica y administra todos tus eventos en un solo lugar",
                icon: Calendar,
                color: "bg-blue-100",
                iconColor: "text-blue-600",
              },
              {
                title: "Reservas Seguras",
                description: "Sistema de reservas con confirmación y pagos integrados",
                icon: Lock,
                color: "bg-green-100",
                iconColor: "text-green-600",
              },
              {
                title: "Notificaciones",
                description: "Mantén a todos informados con notificaciones en tiempo real",
                icon: Bell,
                color: "bg-orange-100",
                iconColor: "text-orange-600",
              },
            ].map((feature, idx) => {
              const IconComponent = feature.icon
              return (
                <div
                  key={idx}
                  className="bg-white p-8 rounded-lg border border-border-light hover:shadow-md transition-shadow"
                >
                  <div className={`inline-block p-3 rounded-lg ${feature.color} mb-4`}>
                    <IconComponent className={`w-6 h-6 ${feature.iconColor}`} />
                  </div>
                  <h3 className="text-xl font-semibold text-text-primary mb-2">{feature.title}</h3>
                  <p className="text-text-secondary">{feature.description}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {[
              { label: "Eventos Activos", value: "1,234+", icon: Calendar },
              { label: "Usuarios", value: "50K+", icon: Users },
              { label: "Reservas", value: "100K+", icon: TrendingUp },
              { label: "Uptime", value: "99.9%", icon: Zap },
            ].map((stat, idx) => {
              const StatIcon = stat.icon
              return (
                <div key={idx} className="text-center">
                  <div className="inline-block p-3 bg-primary-light rounded-lg mb-4">
                    <StatIcon className="w-6 h-6 text-primary" />
                  </div>
                  <p className="text-3xl font-bold text-text-primary mb-2">{stat.value}</p>
                  <p className="text-text-secondary">{stat.label}</p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      {!isAuthenticated && (
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-primary text-white rounded-xl mx-4 sm:mx-6 lg:mx-8">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-4xl font-bold mb-4">¿Listo para comenzar?</h2>
            <p className="text-lg mb-8 opacity-90">Únete a EventHub y comienza a gestionar tus eventos hoy mismo. Es gratis y solo toma un minuto.</p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                to="/registro"
                className="px-8 py-3 bg-white text-primary rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-flex items-center gap-2 justify-center"
              >
                Registrarse Gratis
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link
                to="/login"
                className="px-8 py-3 border-2 border-white text-white rounded-lg font-semibold hover:bg-white hover:text-primary transition-colors inline-flex items-center gap-2 justify-center"
              >
                Iniciar Sesión
                <ArrowRight className="w-5 h-5" />
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Authenticated CTA Section */}
      {isAuthenticated && !usuario?.esOrganizador() && (
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-bg-secondary">
          <div className="max-w-3xl mx-auto text-center bg-white p-8 rounded-lg border border-primary">
            <h2 className="text-2xl font-bold text-text-primary mb-4">¿Quieres organizar eventos?</h2>
            <p className="text-text-secondary mb-6">Solicita acceso como organizador y comienza a crear tus propios eventos</p>
            <Link
              to="/perfil"
              className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors inline-flex items-center gap-2"
            >
              Solicitar Acceso
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </section>
      )}
    </div>
  )
}
