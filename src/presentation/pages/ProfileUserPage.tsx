"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import useAuth from "../contexts/Auth"
import {
    User,
    ShieldCheck,
    LogOut,
    Calendar,
    Mail,
    MapPin,
    Phone,
    Clock,
    Edit3,
    Ticket,
    UserCircle,
    ClipboardList,
    Tag // Icono adicional para la categoría
} from "lucide-react"

import { apiConfig } from "../../config/env"

// Interfaces moved outside for cleaner code
interface Usuario {
    fullName: string
    email: string
    phoneNumber: string
    address: string
    birthdate: string
}

interface Historial {
    category: string // Agregado según tu DTO
    action: string
    timeDate: string
}

export default function PerfilUsuarioPage() {
    const { isAuthenticated, username, role } = useAuth()
    const [userData, setUserData] = useState<Usuario | null>(null)
    const [userHistory, setUserHistory] = useState<Historial[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        if (username) {
            setLoading(true)
            fetch(`${apiConfig.baseUrl}${apiConfig.users.getOne(username)}`, {
                method: 'GET',
            })
                .then((res) => res.json())
                .then((data) => {
                    setUserData(data.usuario);
                    setLoading(false)
                })
                .catch((error) => {
                    console.error('Error al obtener datos del usuario:', error);
                    setLoading(false)
                });

            // Fetch historial logic...
        }
    }, [username, role, isAuthenticated]);

    if (!isAuthenticated) {
        return (
            <div className="min-h-[60vh] flex flex-col items-center justify-center p-4">
                <div className="bg-white p-8 rounded-2xl shadow-xl text-center max-w-md w-full border border-gray-100">
                    <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ShieldCheck className="w-8 h-8 text-red-500" />
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Acceso Restringido</h2>
                    <p className="text-gray-500 mb-6">Necesitas iniciar sesión para acceder a tu perfil.</p>
                    <Link to="/login" className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-all shadow-md">
                        Iniciar Sesión
                        <LogOut className="w-4 h-4" />
                    </Link>
                </div>
            </div>
        )
    }

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center text-primary font-medium">Cargando perfil...</div>
    }

    return (
        <div className="min-h-screen bg-gray-50/50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-5xl mx-auto space-y-8">

                {/* Main Profile Card */}
                <div className="bg-white rounded-3xl shadow-xl border border-gray-100 overflow-hidden">
                    <div className="h-32 bg-gradient-to-r from-primary to-blue-600 relative">
                        <div className="absolute inset-0 bg-black/10"></div>
                    </div>

                    <div className="px-8 pb-8">
                        <div className="relative flex flex-col xl:flex-row items-end xl:items-center justify-between -mt-12 mb-8 gap-4">
                            <div className="flex items-end gap-6">
                                <div className="w-24 h-24 bg-white rounded-full p-1 shadow-lg">
                                    <div className="w-full h-full bg-gray-100 rounded-full flex items-center justify-center overflow-hidden">
                                        <UserCircle className="w-16 h-16 text-gray-400" />
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <h1 className="text-3xl font-bold text-gray-900">{userData?.fullName}</h1>
                                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                                        <ShieldCheck className="w-4 h-4 text-primary" />
                                        <span className="font-medium bg-primary/10 text-primary px-2 py-0.5 rounded-full">{role}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-3 w-full xl:w-auto mt-4 xl:mt-0">
                                <Link to="/actualizarPerfil" className="flex-1 xl:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all shadow-sm">
                                    <Edit3 className="w-4 h-4" /> Editar
                                </Link>
                                <Link to="/misEncuestas" className="flex-1 xl:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all shadow-sm">
                                    <ClipboardList className="w-4 h-4" /> Mis Encuestas
                                </Link>
                                <Link to="/generarCupon" className="flex-1 xl:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all shadow-sm">
                                    <Ticket className="w-4 h-4" /> Generar Cupón
                                </Link>
                            </div>
                        </div>

                        <div className="h-px bg-gray-100 w-full mb-8"></div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-8">
                            <ProfileField icon={Mail} label="Correo Electrónico" value={userData?.email} />
                            <ProfileField icon={Phone} label="Teléfono" value={userData?.phoneNumber} />
                            <ProfileField icon={MapPin} label="Dirección" value={userData?.address} />
                            <ProfileField icon={Calendar} label="Fecha de Nacimiento" value={userData?.birthdate?.slice(0, 10)} />
                        </div>
                    </div>
                </div>

                {/* History Section */}
                <div className="bg-white rounded-3xl shadow-lg border border-gray-100 p-8">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-2 bg-blue-50 rounded-lg">
                            <Clock className="w-6 h-6 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold text-gray-900">Historial de Actividades</h2>
                    </div>

                    <div className="relative">
                        {userHistory.length > 0 ? (
                            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-gray-200 before:to-transparent">
                                {userHistory.map((item, index) => (
                                    <div key={index} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                                        <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-gray-50 group-[.is-active]:bg-primary text-slate-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                                            <Clock className="w-5 h-5" />
                                        </div>
                                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-primary/30 transition-colors">
                                            <div className="flex items-center justify-between space-x-2 mb-1">
                                                <div className="font-bold text-slate-900">{item.action}</div>
                                                <time className="font-mono italic text-[10px] text-primary bg-primary/5 px-2 py-0.5 rounded-full">{item.timeDate}</time>
                                            </div>
                                            {/* Mostramos la categoría del DTO */}
                                            <div className="flex items-center gap-1 text-xs text-gray-400 mt-1">
                                                <Tag className="w-3 h-3" />
                                                <span>{item.category}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-10 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                                <Clock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No hay actividades recientes registradas.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

function ProfileField({ icon: Icon, label, value }: { icon: any, label: string, value?: string }) {
    return (
        <div className="flex items-start gap-4 p-3 rounded-xl hover:bg-gray-50 transition-colors">
            <div className="p-2.5 bg-primary/10 rounded-lg shrink-0">
                <Icon className="w-5 h-5 text-primary" />
            </div>
            <div>
                <p className="text-sm font-medium text-gray-500 mb-1">{label}</p>
                <p className="text-base font-semibold text-gray-900">
                    {value || <span className="text-gray-400 italic">No especificado</span>}
                </p>
            </div>
        </div>
    )
}
