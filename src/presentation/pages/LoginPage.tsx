"use client"

import type React from "react"

import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import axios from 'axios';
//import { useAuth } from "../contexts/AuthContext"
import useAuth from "../contexts/Auth"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const { login } = useAuth();
    const navigate = useNavigate()
    const location = useLocation()

    const from = (location.state as any)?.from?.pathname || "/"

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsLoading(true)

        e.preventDefault();
        setError(null)
        setIsLoading(true)
        const config = {
            username: email,
            password: password,
            client_id: 'aspnetcore',
            //client_id: 'admin-cli',
            realm: 'myrealm',
            //realm: 'master',
            keycloakBaseUrl: 'http://localhost:8180',
            cliente_secret: 'PzaioIxlVKVINnJ7VJwCILdBoUlUWB05'
        };
        console.log("Email:", email)
        console.log("Password:", password)
        console.log("Email:", config.username)
        console.log("Password:", config.password)
        try {
            const response = await axios.post(
                `${config.keycloakBaseUrl}/realms/${config.realm}/protocol/openid-connect/token`,
                new URLSearchParams({
                    grant_type:'password',
                    client_id:config.client_id,
                    username:config.username,
                    password: config.password,
                    client_secret: config.cliente_secret
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }
            );
           
            login(response.data.access_token, response.data.refresh_token);
            navigate('/');
        } catch (err) {
            setError(err instanceof Error ? err.message : "Error en login")
        } finally {
            setIsLoading(false)
        }
    }

    /* const handleOAuth = () => {
       initiateOAuth()
     }*/

    return (
        <div className="min-h-screen flex items-center justify-center bg-bg-secondary py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <div className="flex justify-center mb-4">
                        <div className="w-12 h-12 bg-primary rounded-lg flex items-center justify-center">
                            <span className="text-white font-bold text-xl">E</span>
                        </div>
                    </div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-text-primary">Inicia sesión en EventHub</h2>
                </div>

                {error && (
                    <div className="rounded-md bg-red-50 p-4 border border-red-200">
                        <p className="text-sm font-medium text-red-800">{error}</p>
                    </div>
                )}

                <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
                    <div className="rounded-md shadow-sm -space-y-px">
                        <div>
                            <label htmlFor="email" className="sr-only">
                                Email
                            </label>
                            <input
                                id="email"
                                name="email"
                                type="email"
                                autoComplete="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-border placeholder-text-tertiary text-text-primary rounded-t-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                placeholder="Email"
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="sr-only">
                                Contraseña
                            </label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="current-password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-border placeholder-text-tertiary text-text-primary rounded-b-md focus:outline-none focus:ring-primary focus:border-primary focus:z-10 sm:text-sm"
                                placeholder="Contraseña"
                            />
                        </div>
                    </div>

                    {/* Usuarios de ejemplo para desarrollo */}
                    <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
                        <p className="text-xs font-semibold text-blue-900 mb-2">Usuarios de prueba:</p>
                        <div className="text-xs text-blue-800 space-y-1">
                            <p>Usuario: juan@example.com / pass</p>
                            <p>Organizador: carlos@example.com / pass</p>
                            <p>Admin: admin@example.com / pass</p>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full inline-flex justify-center items-center gap-2 py-2 px-4 border border-border rounded-lg shadow-sm bg-white text-sm font-medium text-text-primary hover:bg-bg-secondary transition-colors"
                        >
                            {isLoading ? "Autenticando..." : "Iniciar sesión"}
                        </button>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border"></div>
                        </div>
                        <div className="relative flex justify-center text-sm">
                            <span className="px-2 bg-white text-text-tertiary">O continúa con</span>
                        </div>
                    </div>

                    <button
                        type="button"
                        //onClick={handleOAuth}
                        className="w-full inline-flex justify-center py-2 px-4 border border-border rounded-md shadow-sm bg-white text-sm font-medium text-text-primary hover:bg-bg-secondary"
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                            <path d="M15.545 6.558a9.42 9.42 0 01.139 1.626c0 2.449-.356 4.68-1.015 6.467h.049c.02.323.021.645.021.967v.75c0 .73-.074 1.446-.221 2.141H6.92c.166-.678.316-1.268.455-1.77.13-.461.243-.925.243-1.435V8.587c0-.312-.03-.623-.08-.92h8.006z" />
                        </svg>
                        <span className="ml-2">Keycloak OAuth</span>
                    </button>
                </form>
            </div>
        </div>
    )
}