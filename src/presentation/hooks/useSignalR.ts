import { useEffect, useState } from 'react';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import useAuth from "../contexts/Auth"; // Ajusta la ruta si es necesario
import toast, { Toaster } from 'react-hot-toast';

export const useSignalR = () => {
    const { accessToken, isAuthenticated, username } = useAuth();
    const [connection, setConnection] = useState<HubConnection | null>(null);

    useEffect(() => {
        // 1. REGLA DE ORO: No intentar conectar si no hay usuario
        if (!isAuthenticated || !username) {
            console.log("⏳ Esperando autenticación y username para conectar SignalR...");
            return;
        }

        console.log(`🔌 Iniciando conexión para: ${username}`);

        // Usar URL relativa para que use el proxy de Vite en desarrollo
        // En producción, usar la URL absoluta desde la variable de entorno
        const signalRUrl = import.meta.env.VITE_SIGNALR_URL || 
          (import.meta.env.DEV ? "/notifications" : "http://localhost:7184/hubs/notifications")
        
        const newConnection = new HubConnectionBuilder()
            .withUrl(signalRUrl, {
              accessTokenFactory: () => accessToken || ""
            })
            .withAutomaticReconnect()
            .configureLogging(LogLevel.Information)
            .build();

        newConnection.on("PagoCompletado", (msg: string) => {
            console.log("📩 Notificación recibida:", msg);
            toast.success(msg, { duration: 5000, position: 'top-right' });
        });

        // 2. INICIAR Y REGISTRAR
        const startConnection = async () => {
            try {
                await newConnection.start();
                console.log("🟢 SignalR Conectado. ID:", newConnection.connectionId);

                // ESTA ES LA PARTE CRÍTICA
                console.log(`📤 Invocando RegistrarUsuario para: ${username}`);
                await newConnection.invoke("RegistrarUsuario", username);
                console.log("✅ FRONTEND: Registro enviado correctamente.");

            } catch (err: any) {
                // SignalR es opcional - la app funciona sin él
                // Solo loguear en modo desarrollo para debugging
                if (import.meta.env.DEV) {
                    console.warn("⚠️ SignalR no disponible (opcional):", err.message || err);
                }
                // No propagar el error - la aplicación continúa normalmente
            }
        };

        startConnection();

        setConnection(newConnection);

        return () => {
            // Detener conexión de forma segura
            newConnection.stop().catch(() => {
                // Ignorar errores al detener - no es crítico
            });
        };

    }, [isAuthenticated, username]); // Si 'username' cambia, se reconecta

    return { connection };
};