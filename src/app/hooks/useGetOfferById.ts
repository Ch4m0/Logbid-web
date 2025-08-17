import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/src/utils/supabase/client'

interface Args {
  offer_id: string | null
}

export const useGetOfferById = ({ offer_id }: Args) => {
  return useQuery({
    queryKey: ['offer', offer_id],
    queryFn: async () => {
      if (!offer_id) {
        throw new Error('Offer ID is required')
      }

      // Consultar solo la oferta principal
      const { data: offerData, error: offerError } = await supabase
        .from('offers')
        .select('*')
        .eq('uuid', offer_id)
        .single()

      if (offerError) {
        throw offerError
      }

      // Consultar solo el perfil del agente si existe
      let agentProfile = null
      if (offerData.agent_id) {
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('id, full_name, company_name, role')
          .eq('auth_id', offerData.agent_id)
          .single()
        
        if (!profileError && profile) {
          agentProfile = profile
        }
      }

      // Retornar solo la información de la oferta
      const transformedData = {
        // Información de la oferta
        id: offerData.id,
        uuid: offerData.uuid,
        agent_id: offerData.agent_id,
        agent_code: offerData.agent_code,
        price: offerData.price,
        status: offerData.status,
        shipping_type: offerData.shipping_type,
        details: offerData.details,
        inserted_at: offerData.inserted_at,
        updated_at: offerData.updated_at,
        
        // Información del agente
        agent_name: agentProfile?.full_name || null,
        agent_company: agentProfile?.company_name || null,
        agent_role: agentProfile?.role || null,
        
        // Campos de compatibilidad para mantener la estructura existente
        originBid: null, // No se incluye información del shipment
        finishBid: null,
        codeBid: null,
        bidId: offerData.shipment_id || null,
        bid_id: offerData.shipment_id || null,
      }

      return transformedData
    },
    enabled: !!offer_id,
  })
}
