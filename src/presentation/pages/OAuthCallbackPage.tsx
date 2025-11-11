"use client"

import { useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
import { useAuth } from "../contexts/AuthContext"

export default function OAuthCallbackPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { handleOAuthCallback, error } = useAuth()

  useEffect(() => {
    const processCallback = async () => {
      const code = searchParams.get("code")
      const state = searchParams.get("state")

      if (!code || !state) {
        console.error("Parámetros OAuth inválidos")
        navigate("/login")
        return
      }

      try {
        await handleOAuthCallback(code)
        navigate("/")
      } catch (err) {
        console.error("Error procesando OAuth callback:", err)
        navigate("/login")
      }
    }

    processCallback()
  }, [searchParams, navigate, handleOAuthCallback])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h1 className="text-xl font-semibold text-text-primary">Procesando autenticación...</h1>
        {error && <p className="text-red-600 mt-4">{error}</p>}
      </div>
    </div>
  )
}
