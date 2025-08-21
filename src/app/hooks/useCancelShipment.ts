import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/src/utils/supabase/client'
import { toast } from '@/src/components/ui/use-toast'
import { useTranslation } from '@/src/hooks/useTranslation'

interface CancelShipmentData {
  shipmentId: string
  cancellationReason: string
}

interface ShipmentCancelResponse {
  success: boolean
  shipment: any
  message: string
}

export const useCancelShipment = () => {
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  return useMutation<ShipmentCancelResponse, Error, CancelShipmentData>({
    mutationFn: async ({ shipmentId, cancellationReason }) => {
      console.log('🚫 Cancelando shipment:', { shipmentId, cancellationReason })

      // Primero, obtener los datos del shipment para las notificaciones
      const { data: shipmentData, error: fetchError } = await supabase
        .from('shipments')
        .select(`
          *,
          offers(
            id,
            agent_id
          )
        `)
        .eq('uuid', shipmentId)
        .single()

      if (fetchError) {
        console.error('❌ Error fetching shipment data:', fetchError)
        throw new Error('Error al obtener datos del shipment')
      }

      if (!shipmentData) {
        throw new Error('Shipment no encontrado')
      }

      // Verificar que el shipment esté en estado Active
      if (shipmentData.status !== 'Active') {
        throw new Error('Solo se pueden cancelar shipments activos')
      }

      // Actualizar el status del shipment a 'Cancelled' y agregar motivo
      const { data: updatedShipment, error: updateError } = await supabase
        .from('shipments')
        .update({ 
          status: 'Cancelled',
          cancellation_reason: cancellationReason,
          cancelled_at: new Date().toISOString()
        })
        .eq('uuid', shipmentId)
        .select()
        .single()

      if (updateError) {
        console.error('❌ Error updating shipment status:', updateError)
        throw updateError
      }

      console.log('✅ Shipment cancelado exitosamente:', updatedShipment)

      // Crear notificaciones para todos los agentes que hicieron ofertas
      if (shipmentData.offers && shipmentData.offers.length > 0) {
        console.log('📧 Enviando notificaciones a agentes...')
        // @ts-ignore
        const agentIds = [...new Set(shipmentData.offers.map((offer: any) => offer.agent_id))]
        
        const notificationPromises = agentIds.map(async (agentId: string) => {
          try {
            const { error: notificationError } = await supabase
              .from('notifications')
              .insert({
                user_id: agentId,
                type: 'shipment_cancelled',
                title: '🚫 Shipment Cancelado',
                message: `El embarque ${shipmentData.uuid} ha sido cancelado por el importador. No requiere más acciones.`,
                data: {
                  shipment_uuid: shipmentData.uuid,
                  origin: `${shipmentData.origin_country} - ${shipmentData.origin_name}`,
                  destination: `${shipmentData.destination_country} - ${shipmentData.destination_name}`,
                  cancellation_reason: cancellationReason,
                  cancelled_at: new Date().toISOString()
                },
                shipment_id: shipmentData.id,
                is_read: false,
                created_at: new Date().toISOString()
              })

            if (notificationError) {
              console.error('❌ Error creating notification for agent:', agentId, notificationError)
            } else {
              console.log('✅ Notification created for agent:', agentId)
            }
          } catch (error) {
            console.error('❌ Error in notification creation:', error)
          }
        })

        await Promise.all(notificationPromises)
        console.log('✅ Todas las notificaciones enviadas')
      }

      return {
        success: true,
        shipment: updatedShipment,
        message: 'Shipment cancelado exitosamente'
      }
    },
    onSuccess: (data) => {
      console.log('✅ Shipment cancelado exitosamente:', data)
      
      toast({
        title: t('notifications.toasts.shipmentCancelledSuccess'),
        description: t('notifications.toasts.shipmentCancelledDescription'),
        variant: 'default',
      })

      // Invalidar las queries relacionadas para refrescar las listas
      queryClient.invalidateQueries({ queryKey: ['shipments'] })
      queryClient.invalidateQueries({ queryKey: ['bidListByMarket'] })
      queryClient.invalidateQueries({ queryKey: ['shipment'] })
    },
    onError: (error) => {
      console.error('❌ Error cancelando shipment:', error)
      
      toast({
        title: t('notifications.toasts.shipmentCancellationError'),
        description: error.message || t('notifications.toasts.unexpectedError'),
        variant: 'destructive',
      })
    },
  })
}
