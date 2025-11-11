import { Link } from "react-router-dom"
import { Facebook, Twitter, Instagram, Linkedin, Mail, Phone } from "lucide-react"

export default function Footer() {
  return (
    <footer className="bg-text-primary text-white mt-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-8 mb-8">
          {/* Brand */}
          <div>
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-lg">E</span>
              </div>
              <span className="font-bold text-lg hidden sm:inline">EventHub</span>
            </Link>
            <p className="text-sm text-gray-300 mb-4">Plataforma integral para la gestión de eventos con seguridad y eficiencia</p>
            <div className="flex gap-3">
              <a href="#" aria-label="Facebook" className="p-2 bg-white bg-opacity-10 rounded-lg hover:bg-opacity-20 transition-all">
                <Facebook className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Twitter" className="p-2 bg-white bg-opacity-10 rounded-lg hover:bg-opacity-20 transition-all">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="#" aria-label="Instagram" className="p-2 bg-white bg-opacity-10 rounded-lg hover:bg-opacity-20 transition-all">
                <Instagram className="w-4 h-4" />
              </a>
              <a href="#" aria-label="LinkedIn" className="p-2 bg-white bg-opacity-10 rounded-lg hover:bg-opacity-20 transition-all">
                <Linkedin className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Product */}
          <div>
            <h4 className="font-semibold text-white mb-4">Producto</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/eventos" className="text-gray-300 hover:text-white transition-colors">
                  Explorar Eventos
                </Link>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Características
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Precios
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  API Documentación
                </a>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="font-semibold text-white mb-4">Empresa</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Sobre Nosotros
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Blog
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Carreras
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Contacto
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="font-semibold text-white mb-4">Legal</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Política de Privacidad
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Términos de Servicio
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Política de Cookies
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-300 hover:text-white transition-colors">
                  Aviso Legal
                </a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Contacto</h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail className="w-4 h-4 flex-shrink-0" />
                <a href="mailto:soporte@eventhub.com" className="text-gray-300 hover:text-white transition-colors">
                  soporte@eventhub.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-4 h-4 flex-shrink-0" />
                <a href="tel:+1234567890" className="text-gray-300 hover:text-white transition-colors">
                  +1 (234) 567-890
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white border-opacity-10 my-8"></div>

        {/* Quick Links */}
        <div className="mb-8 pb-8 border-b border-white border-opacity-10">
          <h4 className="font-semibold text-white mb-4">Mapa del Sitio</h4>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4 text-sm">
            <Link to="/" className="text-gray-300 hover:text-white transition-colors">
              Inicio
            </Link>
            <Link to="/eventos" className="text-gray-300 hover:text-white transition-colors">
              Eventos
            </Link>
            <Link to="/login" className="text-gray-300 hover:text-white transition-colors">
              Login
            </Link>
            <Link to="/registro" className="text-gray-300 hover:text-white transition-colors">
              Registro
            </Link>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">
              FAQ
            </a>
            <a href="#" className="text-gray-300 hover:text-white transition-colors">
              Soporte
            </a>
          </div>
        </div>

        {/* Bottom Footer */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-300">
          <p>&copy; 2025 EventHub. Todos los derechos reservados.</p>
          <p>Versión 1.0.0 | Hecho con amor para gestores de eventos</p>
        </div>
      </div>
    </footer>
  )
}
