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
    queryClient.invalidateQueries({ queryKey: ['shipment', shipmentId] })
  }, [queryClient, shipmentId])

  useEffect(() => {
    if (!shipmentId) return

    console.log('🚀 REALTIME: Configurando canal simple para ofertas')
    
    const channel = supabase
      .channel(`offers-shipment-${shipmentId}`)
      .on('postgres_changes', 
        { 
          event: 'INSERT', 
          schema: 'public', 
          table: 'offers',
          filter: `shipment_uuid=eq.${shipmentId}`
        },
        (payload: any) => {
          console.log('🎉 NUEVA OFERTA en shipment:', payload.new)
          invalidateOffers()
        }
      )
      .on('postgres_changes', 
        { 
          event: 'UPDATE', 
          schema: 'public', 
          table: 'offers',
          filter: `shipment_uuid=eq.${shipmentId}`
        },
        (payload: any) => {
          const updatedOffer = payload.new
          const oldOffer = payload.old
          
          console.log('🔄 OFERTA ACTUALIZADA en shipment:', {
            offerId: updatedOffer.id,
            oldStatus: oldOffer?.status,
            newStatus: updatedOffer.status,
            agentCode: updatedOffer.agent_code
          })

          // Si una oferta cambió a 'accepted' o 'rejected', es muy importante actualizar
          if (updatedOffer.status === 'accepted' || updatedOffer.status === 'rejected') {
            console.log(`🎯 Oferta ${updatedOffer.status === 'accepted' ? 'ACEPTADA' : 'RECHAZADA'}:`, {
              agentCode: updatedOffer.agent_code,
              price: updatedOffer.price,
              currency: updatedOffer.currency || 'USD'
            })
          }
          
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
