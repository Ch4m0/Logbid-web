import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/src/utils/supabase/client'
import { ShippingType } from '../../models/common';

export const useGetBidListByMarket = (
  marketId: string | null,
  status: string,
  user_id: number | null,
  shippingType: ShippingType
) => {
  return useQuery({
    queryKey: ['bidListByMarket', marketId, status, user_id, shippingType],
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
      if (marketId) {
        query = query.eq('market_id', marketId)
      }

      // Filtrar por status (para los nuevos valores de filtrado por ofertas, usar 'Active')
      if (status === 'WithoutOffers' || status === 'WithOffers') {
        query = query.eq('status', 'Active')
      } else if (status) {
        query = query.eq('status', status)
      }

      // Filtrar por shipping_type
      if (shippingType) {
        query = query.eq('shipping_type', shippingType)
      }

      // Note: Filtering by offers presence is now handled in the frontend component
      // This allows for more flexible filtering logic

      // Ordenar por fecha de inserción descendente
      query = query.order('inserted_at', { ascending: false })

      const { data, error } = await query

      if (error) {
        console.error('Error fetching bid list by market:', error)
        throw error
      }

      // Transformar los datos para mantener compatibilidad con el componente existente
      return data?.map((shipment) => ({
        id: shipment.id,
        uuid: shipment.uuid,
        inserted_at: shipment.inserted_at,
        expiration_date: shipment.expiration_date,
        shipping_date: shipment.shipping_date,
        shipping_type: shipment.shipping_type,
        origin: `${shipment.origin_country} - ${shipment.origin_name}`,
        destination: `${shipment.destination_country} - ${shipment.destination_name}`,
        destination_name: shipment.destination_name,
        origin_name: shipment.origin_name,
        origin_country: shipment.origin_country,
        destination_country: shipment.destination_country,
        last_price: shipment.offers?.length > 0 
          ? Math.min(...shipment.offers.map((offer: any) => parseFloat(offer.price)))
          : null,
        agent_code: shipment.agent_code,
        offers_count: shipment.offers?.length || 0,
        offers: shipment.offers || [], // ¡Agregar las ofertas!
        value: shipment.value,
        status: shipment.status
      })) || []
    },
    enabled: !!marketId,
  })
}
