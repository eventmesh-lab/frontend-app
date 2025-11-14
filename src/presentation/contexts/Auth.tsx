import React, {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react"
import axios from "axios"
import jwtDecode from 'jwt-decode'

interface DecodedToken {
    preferred_username?: string
    email?: string
    email_verified?: boolean
    realm_access?: {
        roles: string[]
    }
    name?: string

}

interface AuthContextType {
    logged: boolean
    username: string | null
    role: string | null
    name: string | null
    isAuthenticated: boolean
    accessToken: string | null
    refreshToken: string | null
    login: (accessToken: string, refreshToken: string) => void
    logout: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

interface AuthProviderProps {
    children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [accessToken, setAccessToken] = useState<string | null>(
        localStorage.getItem("accessToken")
    )
    const [refreshToken, setRefreshToken] = useState<string | null>(
        localStorage.getItem("refreshToken")
    )
    const [username, setUsername] = useState<string | null>(null)
    const [role, setRole] = useState<string | null>(null)
    const [logged, setLogged] = useState<boolean>(!!accessToken)
    const [isVerified, setIsVerified] = useState<boolean>(false)
    const [name, setName] = useState<string | null>(null)

    // Decodificar token cuando cambia
    useEffect(() => {
        if (accessToken) {
            const decoded = jwtDecode<DecodedToken>(accessToken)
            setUsername(decoded?.preferred_username || decoded?.email || 'Unknown');
            const rolesRealm = decoded?.realm_access?.roles || []
            const role = rolesRealm.includes("Administrador")
                ? "admin"
                : rolesRealm.includes("Organizador")
                    ? "Organizador"
                : rolesRealm.includes("Soporte")
                        ? "Soporte"
                : "Usuario"
            setRole(role)
            setName(decoded?.name || 'unknown')
            setLogged(true)
            setIsVerified(decoded?.email_verified || false)
            localStorage.setItem("accessToken", accessToken)
        } else {
            setUsername(null)
            setLogged(false)
            localStorage.removeItem("accessToken")
        }
    }, [accessToken])

    useEffect(() => {
        if (refreshToken) {
            localStorage.setItem("refreshToken", refreshToken)
        } else {
            localStorage.removeItem("refreshToken")
        }
    }, [refreshToken])

    // Refrescar token cada 60 segundos
    useEffect(() => {
        const interval = setInterval(async () => {
            if (!refreshToken) return

            try {
                const res = await axios.post(
                    "http://localhost:8180/realms/myrealm/protocol/openid-connect/token",
                    new URLSearchParams({
                        grant_type: "refresh_token",
                        client_id: "aspnetcore",
                        refresh_token: refreshToken,
                        client_secret: 'PzaioIxlVKVINnJ7VJwCILdBoUlUWB05'
                    }),
                    {
                        headers: {
                            "Content-Type": "application/x-www-form-urlencoded",
                        },
                    }
                )

                setAccessToken(res.data.access_token)
                setRefreshToken(res.data.refresh_token)
            } catch (err) {
                console.error("Token refresh failed:", err)
                logout()
            }
        }, 60 * 1000)

        return () => clearInterval(interval)
    }, [refreshToken])

    const login = (accessToken: string, refreshToken: string) => {
        setAccessToken(accessToken)
        setRefreshToken(refreshToken)
    }

    const logout = () => {
        setAccessToken(null)
        setRefreshToken(null)
        setLogged(false)
    }

    return (
        <AuthContext.Provider
            value={{ logged, username, isAuthenticated: !!accessToken, role, name, accessToken, refreshToken, login, logout }}
        >
            {children}
        </AuthContext.Provider>
    )
}

const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider")
    }
    return context
}

export default useAuth