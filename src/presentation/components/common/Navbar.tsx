"use client"

import { useAuth } from "../../contexts/AuthContext"
import { Link, useNavigate } from "react-router-dom"
import { useState } from "react"
import NotificationCenter from "./NotificationCenter"
import { Menu, X, ChevronDown } from "lucide-react"

export default function Navbar() {
  const { usuario, logout, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate("/")
    setIsUserMenuOpen(false)
    setIsMobileMenuOpen(false)
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
    setIsUserMenuOpen(false)
  }

  return (
    <nav className="bg-white border-b border-border-light shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 flex-shrink-0" onClick={() => setIsMobileMenuOpen(false)}>
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">E</span>
            </div>
            <span className="font-bold text-lg text-text-primary hidden sm:inline">EventHub</span>
          </Link>

          {/* Navegación Central - Desktop */}
          <div className="hidden lg:flex gap-8 items-center">
            <Link to="/eventos" className="text-text-secondary hover:text-primary transition-colors font-medium">
              Explorar Eventos
            </Link>
            {isAuthenticated && (
              <>
                <Link to="/mis-reservas" className="text-text-secondary hover:text-primary transition-colors font-medium">
                  Mis Reservas
                </Link>
                {usuario?.esOrganizador() && (
                  <Link to="/organizador" className="text-text-secondary hover:text-primary transition-colors font-medium">
                    Dashboard
                  </Link>
                )}
                {usuario?.esAdmin() && (
                  <Link to="/admin" className="text-text-secondary hover:text-primary transition-colors font-medium">
                    Admin
                  </Link>
                )}
              </>
            )}
          </div>

          {/* Acciones - Desktop */}
          <div className="hidden md:flex items-center gap-4">
            {isAuthenticated && <NotificationCenter />}

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-bg-secondary transition-colors"
                >
                  <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center text-white text-sm font-bold">
                    {usuario?.nombre.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm text-text-secondary hidden sm:inline">{usuario?.nombre}</span>
                  <ChevronDown className="w-4 h-4 text-text-secondary" />
                </button>

                {isUserMenuOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg border border-border-light py-1 z-50">
                    <div className="px-4 py-2 border-b border-border-light">
                      <p className="text-sm font-semibold text-text-primary">{usuario?.email}</p>
                      <p className="text-xs text-text-secondary mt-1">{usuario?.role}</p>
                    </div>
                    <Link
                      to="/perfil"
                      className="block px-4 py-2 text-sm text-text-secondary hover:bg-bg-secondary"
                      onClick={() => setIsUserMenuOpen(false)}
                    >
                      Mi Perfil
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-bg-secondary"
                    >
                      Cerrar sesión
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex gap-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-primary font-medium hover:bg-bg-secondary rounded-md transition-colors text-sm"
                >
                  Inicia sesión
                </Link>
                <Link
                  to="/registro"
                  className="px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors text-sm font-medium"
                >
                  Registrarse
                </Link>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={toggleMobileMenu}
            className="md:hidden p-2 rounded-md hover:bg-bg-secondary transition-colors"
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? (
              <X className="w-6 h-6 text-text-primary" />
            ) : (
              <Menu className="w-6 h-6 text-text-primary" />
            )}
          </button>
        </div>

        {/* Mobile Navigation Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-border-light py-4 space-y-3">
            <Link
              to="/eventos"
              className="block px-4 py-2 text-text-secondary hover:text-primary hover:bg-bg-secondary rounded-md transition-colors"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Explorar Eventos
            </Link>
            {isAuthenticated && (
              <>
                <Link
                  to="/mis-reservas"
                  className="block px-4 py-2 text-text-secondary hover:text-primary hover:bg-bg-secondary rounded-md transition-colors"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Mis Reservas
                </Link>
                {usuario?.esOrganizador() && (
                  <Link
                    to="/organizador"
                    className="block px-4 py-2 text-text-secondary hover:text-primary hover:bg-bg-secondary rounded-md transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                )}
                {usuario?.esAdmin() && (
                  <Link
                    to="/admin"
                    className="block px-4 py-2 text-text-secondary hover:text-primary hover:bg-bg-secondary rounded-md transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Admin
                  </Link>
                )}
              </>
            )}
            <div className="border-t border-border-light pt-3 mt-3 space-y-2">
              {isAuthenticated ? (
                <>
                  <Link
                    to="/perfil"
                    className="block px-4 py-2 text-text-secondary hover:text-primary hover:bg-bg-secondary rounded-md transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Mi Perfil
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="w-full text-left px-4 py-2 text-red-600 hover:bg-bg-secondary rounded-md transition-colors"
                  >
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <>
                  <Link
                    to="/login"
                    className="block px-4 py-2 text-text-secondary hover:text-primary hover:bg-bg-secondary rounded-md transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Inicia sesión
                  </Link>
                  <Link
                    to="/registro"
                    className="block px-4 py-2 bg-primary text-white rounded-md hover:bg-primary-dark transition-colors font-medium text-center"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Registrarse
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
