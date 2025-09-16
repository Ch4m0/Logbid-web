'use client'
import { useEffect, useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/src/utils/supabase/client'

export const useRealtimeShipments = (marketId: string | null) => {
  const queryClient = useQueryClient()
  const [isConnected, setIsConnected] = useState(false)

  const invalidateShipments = useCallback(() => {
    queryClient.invalidateQueries({ queryKey: ['bidListByMarket'] })
    queryClient.invalidateQueries({ queryKey: ['shipments'] })
    queryClient.invalidateQueries({ queryKey: ['bidList'] })
    queryClient.invalidateQueries({ queryKey: ['agentOfferedShipments'] })
  }, [queryClient])

  useEffect(() => {
    if (!marketId) return

    
    const channel = supabase
      .channel('shipments-and-offers')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'shipments' },
        (payload: any) => {
          invalidateShipments()
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'shipments' },
        (payload: any) => {
          invalidateShipments()
        }
      )
      .on('postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'offers' },
        (payload: any) => {
          invalidateShipments()
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'offers' },
        (payload: any) => {
          invalidateShipments()
        }
      )
      .on('postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'offers' },
        (payload: any) => {
          invalidateShipments()
        }
      )
      .subscribe((status: any) => {
        setIsConnected(status === 'SUBSCRIBED')
        
        if (status !== 'SUBSCRIBED') {
          console.error('❌ Error canal shipments-and-offers:', status)
        } else {
          console.log('✅ Canal realtime conectado: shipments-and-offers')
        }
      })

    return () => {
      channel.unsubscribe()
    }
  }, [marketId, invalidateShipments])

  return { isConnected }
} 