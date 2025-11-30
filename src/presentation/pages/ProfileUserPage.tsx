"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import useAuth from "../contexts/Auth"
import { User, ShieldCheck, LogOut, Calendar, Mail, MapPin, Phone, Clock } from "lucide-react"
import { apiConfig } from "../../config/env"

export default function PerfilUsuarioPage() {
    interface Usuario {
        fullName: string
        email: string
        phoneNumber: string
        address: string
        birthdate: string
    }

    interface Historial {
        action: string
        timeDate: string
    }

    const { isAuthenticated, username, role } = useAuth()
    const [userData, setUserData] = useState<Usuario | null>(null)
    const [userHistory, setUserHistory] = useState<Historial[]>([])
    const [error, setError] = useState<string | null>(null)
;

    useEffect(() => {
        console.log("Perfil cargado:", { username, role, isAuthenticated })

        if (username) {
            fetch(`${apiConfig.baseUrl}${apiConfig.users.getOne(username)}`, {
                method: 'GET',
            })
                .then((res) => res.json())
                .then((data) => {
                    setUserData(data.usuario);
                })
                .catch((error) => {
                    console.error('Error al obtener datos del usuario:', error);
                });
            /* fetch(`http://localhost:7247/users/getHistory/${username}`, {
                 method: 'GET',
             })
                 .then((res) => res.json())
                 .then((data) => {
                     setUserHistory(data);
                 })
                 .catch((error) => {
                     console.error('Error al obtener el historial:', error);
                 });*/
        }

    }, [username, role, isAuthenticated]);


    if (!isAuthenticated) {
        return (
            <div className="py-20 px-4 sm:px-6 lg:px-8 text-center space-y-6">
                <h2 className="text-3xl font-bold text-text-primary">Acceso restringido</h2>
                <p className="text-lg text-text-secondary">
                    Debes iniciar sesi�n para ver tu perfil.
                </p>
                <Link
                    to="/login"
                    className="px-6 py-3 bg-primary text-white rounded-lg font-semibold hover:bg-primary-dark transition-colors inline-flex items-center gap-2 justify-center"
                >
                    Iniciar Sesi�n
                    <LogOut className="w-5 h-5" />
                </Link>
            </div>
        )
    }

    return (

        <div className="py-20 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12">
            <section className="bg-white shadow-lg rounded-xl p-8 space-y-6">
                <h1 className="text-4xl font-bold text-text-primary">Tu Perfil</h1>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">

                    <div className="flex items-center gap-4">
                        <User className="w-6 h-6 text-primary" />
                        <div>
                            <p className="text-sm text-text-secondary">Nombre completo</p>
                            <p className="text-lg font-semibold text-text-primary">{userData?.fullName}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Mail className="w-6 h-6 text-primary" />
                        <div>
                            <p className="text-sm text-text-secondary">Correo electronico</p>
                            <p className="text-lg font-semibold text-text-primary">{userData?.email}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Phone className="w-6 h-6 text-primary" />
                        <div>
                            <p className="text-sm text-text-secondary">Telefono</p>
                            <p className="text-lg font-semibold text-text-primary">{userData?.phoneNumber}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <MapPin className="w-6 h-6 text-primary" />
                        <div>
                            <p className="text-sm text-text-secondary">Direccion</p>
                            <p className="text-lg font-semibold text-text-primary">{userData?.address}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <Calendar className="w-6 h-6 text-primary" />
                        <div>
                            <p className="text-sm text-text-secondary">Fecha de nacimiento</p>
                            <p className="text-lg font-semibold text-text-primary">
                                {userData?.birthdate?.slice(0, 10)}
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-4">
                        <ShieldCheck className="w-6 h-6 text-primary" />
                        <div>
                            <p className="text-sm text-text-secondary">Rol</p>
                            <p className="text-lg font-semibold text-text-primary">{role}</p>
                        </div>
                    </div>
                </div>
                <div className="pt-6">
                    <Link
                        to="/actualizarPerfil"
                        className="px-6 py-3 border-2 border-primary rounded-lg shadow-sm bg-white text-sm font-semibold text-primary inline-flex items-center gap-2 hover:bg-bg-secondary transition-colors"
                    >
                        Editar Perfil
                    </Link>
                </div>
            </section>
            {/* Historial del usuario */}
            <section className="bg-white shadow-lg rounded-xl p-8 space-y-6">
                <h2 className="text-2xl font-bold text-text-primary">Historial de Actividades</h2>
                <div className="max-h-96 overflow-y-auto divide-y divide-gray-200">
                    {userHistory.length > 0 ? (
                        userHistory.map((item, index) => (
                            <div key={index} className="py-4 flex items-start gap-4">
                                <Clock className="w-5 h-5 text-primary mt-1" />
                                <div>
                                    <p className="text-sm text-text-secondary">{item.timeDate}</p>
                                    <p className="text-base font-medium text-text-primary">{item.action}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-text-secondary">No hay historial disponible.</p>
                    )}
                </div>
            </section>

        </div>
    )
}


