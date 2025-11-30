"use client"

import type React from "react"

import { useState } from "react"
import { useNavigate, useLocation, Link } from "react-router-dom"
import axios from 'axios';
//import { useAuth } from "../contexts/AuthContext"
import useAuth from "../contexts/Auth"
import { keycloakConfig } from "../../config/env"

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
        const authConfig = {
            username: email,
            password: password,
            client_id: keycloakConfig.clientId,
            realm: keycloakConfig.realm,
            keycloakBaseUrl: keycloakConfig.url,
            cliente_secret: keycloakConfig.clientSecret
        };
        console.log("Email:", email)
        console.log("Password:", password)
        console.log("Email:", authConfig.username)
        console.log("Password:", authConfig.password)
        try {
            const response = await axios.post(
                `${authConfig.keycloakBaseUrl}/realms/${authConfig.realm}/protocol/openid-connect/token`,
                new URLSearchParams({
                    grant_type:'password',
                    client_id:authConfig.client_id,
                    username:authConfig.username,
                    password: authConfig.password,
                    client_secret: authConfig.cliente_secret
                }),
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }
            );
           
            login(response.data.access_token, response.data.refresh_token);
            navigate('/');
        } catch (err: any) {
            let errorMessage = "Error en login";

            if (axios.isAxiosError(err)) {
                if (err.response?.data?.error_description) {
                    errorMessage = err.response.data.error_description;
                } else if (err.response?.data?.error) {
                    errorMessage = err.response.data.error;
                } else if (err.message) {
                    errorMessage = err.message;
                }
            }
            if (err.response?.data?.error_description === "Invalid user credentials") {
                errorMessage = "Usuario o contraseña incorrectos";
            }
            setError(errorMessage);
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

                    <div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full inline-flex justify-center items-center gap-2 py-2 px-4 border border-border rounded-lg shadow-sm bg-white text-sm font-medium text-text-primary hover:bg-bg-secondary transition-colors"
                        >
                            {isLoading ? "Autenticando..." : "Iniciar sesión"}
                        </button>
                    </div>
                    <div className="pt-6">
                        <Link
                            to="/changePassword"
                            className="w-full inline-flex justify-center items-center gap-2 py-2 px-4 border border-border rounded-lg shadow-sm bg-white text-sm font-medium text-text-primary hover:bg-bg-secondary transition-colors"
                        >
                            Cambiar contraseña
                        </Link>
                    </div>

                    <div className="relative">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-border"></div>
                        </div>
                       
                    </div>

                </form>
            </div>
        </div>
    )
}