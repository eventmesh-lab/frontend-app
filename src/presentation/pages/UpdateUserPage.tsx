import { useState } from "react"
import { useNavigate, useParams } from "react-router-dom"
import { Calendar, User, Phone, MapPin } from "lucide-react"
import useAuth from "../contexts/Auth"

export default function UpdateUserPage() {
    const { isAuthenticated, username } = useAuth()
    const navigate = useNavigate()

    const [nombre, setNombre] = useState("")
    const [apellido, setApellido] = useState("")
    const [telefono, setTelefono] = useState("")
    const [direccion, setDireccion] = useState("")
    const [fechaNacimiento, setFechaNacimiento] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)

    const [showSuccess, setShowSuccess] = useState(false)

    const validateForm = (): boolean => {
        
        console.log("Validando formulario con datos:")
        console.log("Nombre:", nombre)
        console.log("Apellido:", apellido)
        console.log("Teléfono:", telefono)
        console.log("Dirección:", direccion)
		console.log("Fecha de Nacimiento:", fechaNacimiento)

        if ( telefono!="" && !/^\d{11}$/.test(telefono)) {
            setError("El número de teléfono debe tener 11 dígitos")
            return false
        }
            const fecha = new Date(fechaNacimiento);
            const hoy = new Date();

            const edad = hoy.getFullYear() - fecha.getFullYear();
            const mes = hoy.getMonth() - fecha.getMonth();
            const dia = hoy.getDate() - fecha.getDate();

            const esMenorDe18 =
                edad < 18 ||
                (edad === 18 && mes < 0) ||
                (edad === 18 && mes === 0 && dia < 0);

            if (esMenorDe18 && fechaNacimiento != "") {
                setError("Debes tener al menos 18 años");
                console.log("Fecha de nacimiento inválida para ser mayor de 18 años:", fechaNacimiento);
                return false
            }
        
        return true
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (!validateForm()) return

        setIsLoading(true)

        try {
            const response = await fetch(`http://localhost:7181/api/users/updateUser/${username}`, {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    firstName: nombre,
                    lastName: apellido,
                    phoneNumber: telefono,
                    address: direccion,
                    birthdate: fechaNacimiento === "" ? null : fechaNacimiento,
                }),
            })

            if (!response.ok) {
                const errorData = await response.json()
                throw new Error(errorData.message || "Error al actualizar el usuario")
            }
            setShowSuccess(true);
        } catch (err) {
            console.error("Error de red/conexión:", err);
            setError("No se pudo conectar con el servidor. Verifica tu conexión.");
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-bg-secondary to-white py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="text-center text-3xl font-bold text-text-primary">Actualizar Perfil</h2>
                    <p className="mt-2 text-center text-text-secondary">Modifica tus datos personales</p>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="space-y-4">
                        {/* Nombre */}
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">Nombre</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 w-5 h-5 text-text-tertiary" />
                                <input
                                    type="text"
                                    value={nombre}
                                    onChange={(e) => setNombre(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary"
                                    placeholder="Juan"
                                />
                            </div>
                        </div>

                        {/* Apellido */}
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">Apellido</label>
                            <div className="relative">
                                <User className="absolute left-3 top-3 w-5 h-5 text-text-tertiary" />
                                <input
                                    type="text"
                                    value={apellido}
                                    onChange={(e) => setApellido(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary"
                                    placeholder="Perez"
                                />
                            </div>
                        </div>

                        {/* Teléfono */}
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">Teléfono</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-3 w-5 h-5 text-text-tertiary" />
                                <input
                                    type="text"
                                    value={telefono}
                                    onChange={(e) => setTelefono(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary"
                                    placeholder="04121234567"
                                />
                            </div>
                        </div>

                        {/* Dirección */}
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">Dirección</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-3 w-5 h-5 text-text-tertiary" />
                                <input
                                    type="text"
                                    value={direccion}
                                    onChange={(e) => setDireccion(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary"
                                    placeholder="Av. Principal, Caracas"
                                />
                            </div>
                        </div>

                        {/* Fecha de nacimiento */}
                        <div>
                            <label className="block text-sm font-medium text-text-primary mb-2">Fecha de nacimiento</label>
                            <div className="relative">
                                <Calendar className="absolute left-3 top-3 w-5 h-5 text-text-tertiary" />
                                <input
                                    type="datetime-local"
                                    value={fechaNacimiento}
                                    onChange={(e) => setFechaNacimiento(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 border border-border rounded-lg focus:ring-2 focus:ring-primary"
                                />
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="rounded-md bg-red-50 p-4 border border-red-200">
                                <p className="text-sm font-medium text-red-800">{error}</p>
                            </div>
                        )}

                        {/* Submit */}
                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full inline-flex justify-center items-center gap-2 py-2 px-4 border border-border rounded-lg shadow-sm bg-white text-sm font-medium text-text-primary hover:bg-bg-secondary transition-colors"

                            >
                                {isLoading ? "Actualizando..." : "Actualizar"}
                            </button>
                        </div>
                    </div>
                </form>
                {showSuccess && (
                    <div className="fixed bottom-4 right-4 bg-green-100 border border-green-300 text-green-800 px-4 py-3 rounded-lg shadow-md z-50">
                        <div className="flex items-center justify-between gap-4">
                            <span className="text-sm">¡Modificación exitosa!</span>
                            <button
                                onClick={() => {
                                    setShowSuccess(false);
                                    navigate("/perfil"); // o "/login"
                                }}
                                className="text-sm font-medium text-green-700 hover:underline"
                            >
                                Aceptar
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}