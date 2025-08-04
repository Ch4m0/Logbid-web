import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/src/utils/supabase/client'
import { BidStatus, ShippingType } from '@/src/models/common'

interface Args {
  market_id: string | null
  user_id: number | null
  status: BidStatus
  shipping_type: ShippingType
}

export const useGetShipments = ({
  user_id,
  market_id,
  status,
  shipping_type,
}: Args) => {
  return useQuery({
    queryKey: ['shipments', user_id, market_id, status, shipping_type],
    queryFn: async () => {
      let query = supabase
        .from('shipments')
        .select(`
          *,
          offers(
            id,
            agent_code,
            agent_id,
            status,
            shipping_type,
            price,
            details,
            inserted_at
          )
        `)

      // Filtrar por market_id si se proporciona
      if (market_id) {
        query = query.eq('market_id', market_id)
      }

      // Filtrar por profile_id (user_id) si se proporciona
      if (user_id) {
        query = query.eq('profile_id', user_id)
      }

      // Filtrar por status
      if (status) {
        query = query.eq('status', status)
      }

      // Filtrar por shipping_type - mapear valores descriptivos a numéricos
      if (shipping_type) {
        query = query.eq('shipping_type', shipping_type)
      }

      // Ordenar por fecha de inserción descendente
      query = query.order('inserted_at', { ascending: false })

      const { data, error } = await query

      if (error) {
        throw error
      }

      // Transformar los datos para mantener compatibilidad con el modelo existente
      return data?.map((shipment) => ({
        id: shipment.id,
        status: shipment.status,
        uuid: shipment.uuid,
        agent_code: shipment.agent_code,
        origin_id: shipment.origin_id,
        origin: `${shipment.origin_country} - ${shipment.origin_name}`,
        origin_country: shipment.origin_country,
        destination_id: shipment.destination_id,
        destination: `${shipment.destination_country} - ${shipment.destination_name}`,
        destination_country: shipment.destination_country,
        transportation: shipment.transportation,
        comex_type: shipment.comex_type,
        expiration_date: shipment.expiration_date,
        shipping_type: shipment.shipping_type,
        shipping_date: shipment.shipping_date,
        value: shipment.value,
        currency: shipment.currency,
        additional_info: shipment.additional_info,
        user_id: shipment.profile_id,
        market_id: shipment.market_id,
        bid_details_id: shipment.shipment_details_id,
        inserted_at: shipment.inserted_at,
        last_price: shipment.offers?.length > 0 
          ? Math.min(...shipment.offers.map((offer: any) => parseFloat(offer.price)))
          : null,
        offers_count: shipment.offers?.length || 0
      })) || []
    },
    enabled: !!user_id && !!market_id,
  })
} 