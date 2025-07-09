'use client'
import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/src/utils/supabase/client'
import useAuthStore from '@/src/store/authStore'

// Hook para suscribirse a shipments en tiempo real
export const useRealtimeShipments = () => {
  const profile = useAuthStore((state) => state.profile)
  const queryClient = useQueryClient()
  const [isConnected, setIsConnected] = useState(false)

  useEffect(() => {
    if (!profile?.id) return
    
    // Crear canal de Supabase Realtime
    const channel = supabase
      .channel('shipments')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'shipments'
        },
                 (payload) => {
           
           // Invalidar queries para que se refresquen automáticamente
           queryClient.invalidateQueries({ queryKey: ['shipments'] })
           queryClient.invalidateQueries({ queryKey: ['bidListByMarket'] })
           queryClient.invalidateQueries({ queryKey: ['bidList'] })
           
         }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'shipments'
        },
        (payload) => {
          
          // Invalidar queries para actualizar los cambios
          queryClient.invalidateQueries({ queryKey: ['shipments'] })
          queryClient.invalidateQueries({ queryKey: ['bidListByMarket'] })
          queryClient.invalidateQueries({ queryKey: ['shipment', payload.new.uuid] })
          
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED')
      })

    // Cleanup al desmontar
    return () => {
      supabase.removeChannel(channel)
      setIsConnected(false)
    }
  }, [profile?.id, queryClient])

  return { isConnected }
} 