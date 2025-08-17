'use client'
import { useEffect, useState, useRef } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/src/utils/supabase/client'
import useAuthStore from '@/src/store/authStore'
import { useRouter, useSearchParams } from 'next/navigation'

// Hook híbrido: Realtime con fallback automático a polling
export const useRealtimeShipmentsWithPagination = (refetchCallback?: () => void) => {
  const profile = useAuthStore((state) => state.profile)
  const user = useAuthStore((state) => state.user)
  const queryClient = useQueryClient()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [isConnected, setIsConnected] = useState(false)
  const [connectionMode, setConnectionMode] = useState<'realtime' | 'polling'>('realtime')
  const lastCheckRef = useRef<Date>(new Date())
  const pollingIntervalRef = useRef<NodeJS.Timeout>()
  const realtimeChannelRef = useRef<any>(null)

  // Inicialización silenciosa del sistema híbrido

  // Función para invalidar queries y actualizar
  const invalidateAndRefresh = () => {
    queryClient.invalidateQueries({ queryKey: ['shipments'] })
    queryClient.invalidateQueries({ queryKey: ['bidListByMarket'] })
    queryClient.invalidateQueries({ queryKey: ['bidList'] })

    if (refetchCallback) {
      refetchCallback()
    }
  }

  // Función de polling como respaldo
  const checkForNewShipments = async () => {
    try {
      const marketId = searchParams.get('market') ?? user?.all_markets?.[0]?.id?.toString()
      if (!marketId) return

      // Verificación silenciosa de nuevos shipments

      const { data: newShipments, error } = await supabase
        .from('shipments')
        .select('id, uuid, inserted_at, status, shipping_type')
        .eq('market', marketId)
        .eq('status', 'Active')
        .gte('inserted_at', lastCheckRef.current.toISOString())
        .order('inserted_at', { ascending: false })

      if (error) {
        return
      }

      if (newShipments && newShipments.length > 0) {
        // Actualizar la última verificación
        lastCheckRef.current = new Date()
        
        // Navegar a página 1 si es necesario
        const currentPage = Number(searchParams.get('page')) || 1
        if (currentPage !== 1) {
          const newParams = new URLSearchParams(searchParams.toString())
          newParams.set('page', '1')
          router.push(`?${newParams.toString()}`)
        }

        invalidateAndRefresh()
      }
    } catch (error) {
      // Error silencioso en verificación
    }
  }

  // Función para iniciar polling como fallback
  const startPollingFallback = () => {
    if (pollingIntervalRef.current) return // Ya está activo

    setConnectionMode('polling')
    lastCheckRef.current = new Date()
    pollingIntervalRef.current = setInterval(checkForNewShipments, 10000)
  }

  // Función para detener polling
  const stopPollingFallback = () => {
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current)
      pollingIntervalRef.current = undefined
    }
  }

  useEffect(() => {
    if (!profile?.id || !profile?.auth_id) {
      return
    }

    // Inicializar timestamp
    lastCheckRef.current = new Date()

    // Intentar Realtime primero con timeout
    const timer = setTimeout(() => {
      try {
        const channel = supabase
          .channel('shipments-hybrid')
          .on(
            'postgres_changes',
            {
              event: 'INSERT',
              schema: 'public',
              table: 'shipments'
            },
            (payload) => {
              // Actualizar timestamp y detener polling si está activo
              lastCheckRef.current = new Date()
              stopPollingFallback()
              
              const currentPage = Number(searchParams.get('page')) || 1
              if (currentPage !== 1) {
                const newParams = new URLSearchParams(searchParams.toString())
                newParams.set('page', '1')
                router.push(`?${newParams.toString()}`)
              }
              
              invalidateAndRefresh()
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              setIsConnected(true)
              setConnectionMode('realtime')
              stopPollingFallback() // Detener polling si estaba activo
            } else if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT' || status === 'CLOSED') {
              setIsConnected(true) // Mantenemos "conectado" porque polling funcionará
              startPollingFallback()
            }
          })

        realtimeChannelRef.current = channel

        // Timeout de 10 segundos para activar polling si Realtime no conecta
        setTimeout(() => {
          if (connectionMode === 'realtime' && !isConnected) {
            startPollingFallback()
            setIsConnected(true)
          }
        }, 10000)

      } catch (error) {
        startPollingFallback()
        setIsConnected(true)
      }
    }, 1000)

    // Cleanup
    return () => {
      clearTimeout(timer)
      if (realtimeChannelRef.current) {
        supabase.removeChannel(realtimeChannelRef.current)
      }
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current)
      }
      setIsConnected(false)
    }
  }, [profile?.id, profile?.auth_id])

  return { isConnected }
} 