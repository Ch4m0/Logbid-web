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
      .channel('shipments-simple')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'shipments' },
        () => {
          invalidateShipments()
        }
      )
      .on('postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'shipments' },
        () => {
          invalidateShipments()
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED')
        
        if (status !== 'SUBSCRIBED') {
          console.error('❌ Error canal shipments:', status)
        }
      })

    return () => {
      channel.unsubscribe()
    }
  }, [marketId, invalidateShipments])

  return { isConnected }
} 