import { useEffect, useState } from 'react'
import { Clock } from 'lucide-react'

interface CountdownTimerProps {
  fechaExpiracion: string | Date
  onExpired?: () => void
  className?: string
}

/**
 * Componente que muestra un countdown hasta una fecha de expiración
 * Se actualiza cada segundo y llama a onExpired cuando el tiempo se agota
 */
export default function CountdownTimer({ fechaExpiracion, onExpired, className = '' }: CountdownTimerProps) {
  const [timeRemaining, setTimeRemaining] = useState<string>('')
  const [isExpired, setIsExpired] = useState(false)

  useEffect(() => {
    const expirationDate = new Date(fechaExpiracion)
    let intervalId: NodeJS.Timeout

    const updateCountdown = () => {
      const now = new Date()
      const remaining = expirationDate.getTime() - now.getTime()

      if (remaining <= 0) {
        setIsExpired(true)
        setTimeRemaining('00:00')
        if (onExpired && !isExpired) {
          onExpired()
        }
        if (intervalId) {
          clearInterval(intervalId)
        }
        return
      }

      const minutes = Math.floor(remaining / 60000)
      const seconds = Math.floor((remaining % 60000) / 1000)
      setTimeRemaining(`${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`)
    }

    // Actualizar inmediatamente
    updateCountdown()

    // Actualizar cada segundo
    intervalId = setInterval(updateCountdown, 1000)

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [fechaExpiracion, onExpired, isExpired])

  if (isExpired) {
    return (
      <div className={`flex items-center gap-2 text-red-600 ${className}`}>
        <Clock className="w-4 h-4" />
        <span className="font-semibold">Tiempo agotado</span>
      </div>
    )
  }

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <Clock className="w-4 h-4 text-blue-600" />
      <span className="font-semibold text-gray-900">Tiempo restante: {timeRemaining}</span>
    </div>
  )
}
