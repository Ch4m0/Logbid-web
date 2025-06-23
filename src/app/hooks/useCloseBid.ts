import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/src/utils/supabase/client'
import { notifyAgentsAboutBidClosure } from '@/src/utils/notificationHelpers'

interface CloseBidArgs {
  bid_id: number
  offer_id: number
}

const closeBidWithSupabase = async ({ bid_id, offer_id }: CloseBidArgs) => {
  // Primero obtener la información de la oferta aceptada para extraer el agent_code
  const { data: acceptedOffer, error: fetchError } = await supabase
    .from('offers')
    .select('agent_code')
    .eq('id', offer_id)
    .single()

  if (fetchError) {
    throw new Error(`Error fetching offer: ${fetchError.message}`)
  }

  // 1. Actualizar el status del shipment a 'Closed' y guardar el agent_code del ganador
  const { error: shipmentError } = await supabase
    .from('shipments')
    .update({ 
      status: 'Closed',
      agent_code: acceptedOffer.agent_code
    })
    .eq('id', bid_id)

  if (shipmentError) {
    throw new Error(`Error updating shipment: ${shipmentError.message}`)
  }

  // 2. Actualizar el status de la oferta aceptada a 'accepted'
  const { error: offerError } = await supabase
    .from('offers')
    .update({ status: 'accepted' })
    .eq('id', offer_id)

  if (offerError) {
    throw new Error(`Error updating offer: ${offerError.message}`)
  }

  // 3. Actualizar el status de las demás ofertas del mismo shipment a 'rejected'
  const { error: rejectError } = await supabase
    .from('offers')
    .update({ status: 'rejected' })
    .eq('shipment_id', bid_id)
    .neq('id', offer_id)

  if (rejectError) {
    throw new Error(`Error rejecting other offers: ${rejectError.message}`)
  }

  // 🔔 Crear notificaciones para agentes sobre el resultado del bid
  try {
    // Obtener información del shipment para notificaciones
    const { data: shipmentData, error: shipmentInfoError } = await supabase
      .from('shipments')
      .select('uuid, origin_name, origin_country, destination_name, destination_country, profile_id')
      .eq('id', bid_id)
      .single()

    if (shipmentInfoError) {
      console.error('Error obteniendo datos del shipment para notificación:', shipmentInfoError)
    } else if (shipmentData) {
      // Notificar a todos los agentes sobre el resultado del bid
      await notifyAgentsAboutBidClosure(
        bid_id,
        offer_id,
        {
          uuid: shipmentData.uuid,
          origin: `${shipmentData.origin_country} - ${shipmentData.origin_name}`,
          destination: `${shipmentData.destination_country} - ${shipmentData.destination_name}`
        }
      )
      console.log('✅ Notificaciones enviadas a todos los agentes sobre el resultado del bid')

      // 🔕 NO notificar al importador - él es quien acepta la oferta
      console.log('🔕 Importador no recibe notificación - él es quien acepta la oferta')
    }
  } catch (notificationError) {
    console.error('❌ Error enviando notificaciones:', notificationError)
    // No fallar la operación principal por error de notificación
  }

  return { success: true, message: 'Bid closed successfully' }
}

export const useCloseBid = () => {
  return useMutation({
    mutationFn: closeBidWithSupabase,
    onSuccess: (data) => {
      console.log('Bid closed successfully:', data)
      return data
    },
    onError: (error) => {
      console.error('Error closing bid:', error)
      return 'Hubo un error tratando de cerrar la subasta'
    },
  })
}
