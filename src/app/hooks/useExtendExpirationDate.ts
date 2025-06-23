import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/src/utils/supabase/client'
import { createDeadlineExtendedNotification } from '@/src/utils/notificationHelpers'

interface ExtendExpirationDateParams {
  bidListItemId: string
  newExpirationDate: string
}

const extendExpirationDateSupabase = async ({ 
  bidListItemId, 
  newExpirationDate 
}: ExtendExpirationDateParams) => {
  console.log('🔄 Extending expiration date:', { bidListItemId, newExpirationDate })
  
  const { data, error } = await supabase
    .from('shipments')
    .update({ 
      expiration_date: newExpirationDate,
      updated_at: new Date().toISOString()
    })
    .eq('id', parseInt(bidListItemId))
    .select()

  if (error) {
    console.error('❌ Error extending expiration date:', error)
    throw new Error(`Error al extender fecha: ${error.message}`)
  }

  console.log('✅ Expiration date extended successfully:', data)

  // 🔔 Crear notificación de deadline extendido
  try {
    const updatedShipment = data[0] // Supabase devuelve array con el shipment actualizado
    if (updatedShipment) {
      // Obtener información completa del shipment para la notificación
      const { data: shipmentData, error: shipmentError } = await supabase
        .from('shipments')
        .select('uuid, origin_name, origin_country, destination_name, destination_country, profile_id')
        .eq('id', parseInt(bidListItemId))
        .single()

      if (shipmentError) {
        console.error('Error obteniendo datos del shipment para notificación:', shipmentError)
      } else if (shipmentData) {
        await createDeadlineExtendedNotification(
          shipmentData.profile_id,
          {
            uuid: shipmentData.uuid,
            origin: `${shipmentData.origin_country} - ${shipmentData.origin_name}`,
            destination: `${shipmentData.destination_country} - ${shipmentData.destination_name}`
          },
          newExpirationDate
        )
        console.log('✅ Notificación de deadline extendido enviada')
      }
    }
  } catch (notificationError) {
    console.error('❌ Error enviando notificación de deadline extendido:', notificationError)
    // No fallar la operación principal por error de notificación
  }

  return data
}

export const useExtendExpirationDate = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: extendExpirationDateSupabase,
    onSuccess: (data) => {
      console.log('✅ Extend expiration date success:', data)
      // Invalidar queries relacionadas para refrescar la data
      queryClient.invalidateQueries({ queryKey: ['shipments'] })
      return data
    },
    onError: (error) => {
      console.error('❌ Extend expiration date error:', error)
      throw error
    },
  })
}
