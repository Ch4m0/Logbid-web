import { useMutation } from '@tanstack/react-query'
import { supabase } from '@/src/utils/supabase/client'
// Notifications for bid closure are now handled via RPC with SECURITY DEFINER

interface CloseBidArgs {
  bid_id: string
  offer_id: string
}

const closeBidWithSupabase = async ({ bid_id, offer_id }: CloseBidArgs) => {
  // Primero obtener la información de la oferta aceptada para extraer el agent_code y shipment_uuid
  const { data: acceptedOffer, error: fetchError } = await supabase
    .from('offers')
    .select('agent_code, shipment_uuid, id')
    .eq('uuid', offer_id)
    .single()

  if (fetchError) {
    throw new Error(`Error fetching offer: ${fetchError.message}`)
  }

  // Obtener información del shipment para conseguir el ID numérico
  const { data: shipmentData, error: shipmentFetchError } = await supabase
    .from('shipments')
    .select('id')
    .eq('uuid', bid_id)
    .single()

  if (shipmentFetchError) {
    throw new Error(`Error fetching shipment: ${shipmentFetchError.message}`)
  }

  // 1. Actualizar el status del shipment a 'Closed' y guardar el agent_code del ganador
  const { error: shipmentError } = await supabase
    .from('shipments')
    .update({ 
      status: 'Closed',
      agent_code: acceptedOffer.agent_code
    })
    .eq('uuid', bid_id)

  if (shipmentError) {
    throw new Error(`Error updating shipment: ${shipmentError.message}`)
  }

  // 2. Actualizar el status de la oferta aceptada a 'accepted'
  const { error: offerError } = await supabase
    .from('offers')
    .update({ status: 'accepted' })
    .eq('uuid', offer_id)

  if (offerError) {
    throw new Error(`Error updating offer: ${offerError.message}`)
  }

  // 3. Actualizar el status de las demás ofertas del mismo shipment a 'rejected'
  const { error: rejectError } = await supabase
    .from('offers')
    .update({ status: 'rejected' })
    .eq('shipment_uuid', acceptedOffer.shipment_uuid)
    .neq('uuid', offer_id)

  if (rejectError) {
    throw new Error(`Error rejecting other offers: ${rejectError.message}`)
  }

  // 🔔 Crear notificaciones para agentes sobre el resultado del bid
  try {
    // Delegar notificaciones a la función RPC con SECURITY DEFINER (bypass RLS)
    const { data: rpcResult, error: rpcError } = await supabase
      .rpc('notify_agents_about_bid_closure', {
        bid_id: shipmentData.id,
        accepted_offer_id: acceptedOffer.id
      })

    if (rpcError) {
      console.error('❌ Error en RPC notify_agents_about_bid_closure:', rpcError)
    } else {
      console.log('✅ RPC notify_agents_about_bid_closure ejecutada:', rpcResult)
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
