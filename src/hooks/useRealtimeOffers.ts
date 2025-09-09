'use client'
import { useEffect, useState, useCallback } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { supabase } from '../utils/supabase/client'

export const useRealtimeOffers = (shipmentId: string | null) => {
  const queryClient = useQueryClient()
  const [isConnected, setIsConnected] = useState(false)

  const invalidateOffers = useCallback(() => {
    console.log('🔄 Actualizando ofertas para shipment:', shipmentId)
    queryClient.invalidateQueries({ queryKey: ['offers', 'shipment', shipmentId] })
  }, [queryClient, shipmentId])

  useEffect(() => {
    if (!shipmentId) return

    console.log('🚀 REALTIME: Configurando canal simple para ofertas')
    
    const channel = supabase
      .channel('offers-simple')
      .on('postgres_changes', 
        { event: 'INSERT', schema: 'public', table: 'offers' },
        (payload) => {
          console.log('🎉 NUEVA OFERTA:', payload.new)
          invalidateOffers()
        }
      )
      .subscribe((status) => {
        console.log('📡 Canal ofertas:', status)
        setIsConnected(status === 'SUBSCRIBED')
        
        if (status !== 'SUBSCRIBED') {
          console.error('❌ Error canal:', status)
        }
      })

    return () => {
      console.log('🧹 Limpiando canal ofertas')
      channel.unsubscribe()
    }
  }, [shipmentId, invalidateOffers])

  return { isConnected }
}
