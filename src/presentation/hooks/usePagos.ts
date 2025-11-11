"use client"

import { useState, useCallback } from "react"
import type { Pago } from "../../domain/entities/Pago"
import { crearPagoUseCase, type CrearPagoDTO } from "../../application/useCases/pagos/CrearPago"
import { procesarPagoUseCase } from "../../application/useCases/pagos/ProcesarPago"

interface UsePagosReturn {
  pago: Pago | null
  pagos: Pago[]
  isLoading: boolean
  error: string | null
  crearPago: (data: CrearPagoDTO) => Promise<Pago>
  procesarPago: (pagoId: string) => Promise<void>
  limpiar: () => void
}

export function usePagos(): UsePagosReturn {
  const [pago, setPago] = useState<Pago | null>(null)
  const [pagos, setPagos] = useState<Pago[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const crearPago = useCallback(async (data: CrearPagoDTO) => {
    setIsLoading(true)
    setError(null)
    try {
      const resultado = await crearPagoUseCase.ejecutar(data)
      setPago(resultado)
      return resultado
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Error creando pago"
      setError(errorMsg)
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const procesarPago = useCallback(async (pagoId: string) => {
    setIsLoading(true)
    setError(null)
    try {
      await procesarPagoUseCase.ejecutar(pagoId)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error procesando pago")
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  const limpiar = useCallback(() => {
    setPago(null)
    setPagos([])
    setError(null)
  }, [])

  return {
    pago,
    pagos,
    isLoading,
    error,
    crearPago,
    procesarPago,
    limpiar,
  }
}
