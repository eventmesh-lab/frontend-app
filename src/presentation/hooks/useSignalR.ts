import { useEffect, useState } from 'react';
import { HubConnection, HubConnectionBuilder, LogLevel } from '@microsoft/signalr';
import useAuth from "../contexts/Auth"; // Ajusta la ruta si es distinta
import toast from 'react-hot-toast';

export const useSignalR = () => {
    const { isAuthenticated, username } = useAuth();
    const [connection, setConnection] = useState<HubConnection | null>(null);

    useEffect(() => {
        // 1. Guardián: Si no hay usuario, no hacemos nada todavía
        if (!isAuthenticated || !username) {
            return;
        }

        console.log(`🔌 Iniciando configuración SignalR para: ${username}`);

        // 2. Construir la conexión
        const newConnection = new HubConnectionBuilder()
            .withUrl("http://localhost:7184/hubs/notifications") // Asegúrate que este puerto sea el de tu launchSettings.json (http)
            .withAutomaticReconnect() // Reintenta si se cae internet
            .configureLogging(LogLevel.Information)
            .build();

        // 3. Configurar los "Oídos" (Listeners)

        // A) Escuchar ÉXITO (Burbuja Verde)
        newConnection.on("PagoCompletado", (msg: string) => {
            console.log("Notificación recibida:", msg);
            toast.success(msg, { duration: 5000, position: 'top-right' });
        });

        // B) Escuchar FALLO (Burbuja Roja) - Lo nuevo que agregamos
        newConnection.on("PagoFallido", (msg: string) => {
            console.log(" Alerta de fallo recibida:", msg);
            toast.error(msg, { duration: 6000, position: 'top-right' });
        });

        // 4. Iniciar conexión y Registrar al usuario
        const startConnection = async () => {
            try {
                await newConnection.start();
                console.log("SignalR Conectado. ID:", newConnection.connectionId);

                // Paso crítico: Unir al usuario a su grupo personal
                if (username) {
                    await newConnection.invoke("RegistrarUsuario", username);
                    console.log(` Usuario registrado en el grupo: ${username}`);
                }

            } catch (err) {
                console.error(" Error crítico al conectar/registrar SignalR:", err);
            }
        };

        startConnection();
        setConnection(newConnection);

        // 5. Limpieza al salir de la página
        return () => {
            if (newConnection) {
                newConnection.stop();
                console.log("Conexión SignalR cerrada.");
            }
        };

    }, [isAuthenticated, username]); // Se reinicia si cambia el usuario

    return { connection };
};

       