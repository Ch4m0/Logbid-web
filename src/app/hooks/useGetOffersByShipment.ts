import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/src/utils/supabase/client'

interface Args {
  shipment_id: string | null
}

export const useGetOffersByShipment = ({ shipment_id }: Args) => {
  return useQuery({
    queryKey: ['offers', 'shipment', shipment_id],
    queryFn: async () => {
      if (!shipment_id) {
        throw new Error('Shipment ID is required')
      }

      // Primero obtener el ID numérico del shipment por UUID
      const { data: shipmentData, error: shipmentError } = await supabase
        .from('shipments')
        .select('id')
        .eq('uuid', shipment_id)
        .single()

      if (shipmentError) {
        throw shipmentError
      }

      // Consultar offers del shipment
      const { data: offersData, error: offersError } = await supabase
        .from('offers')
        .select('*')
        .eq('shipment_id', shipmentData.id)
        .order('inserted_at', { ascending: false })

      if (offersError) {
        throw offersError
      }

      // Calcular métricas de las ofertas
      const offers = offersData || []
      const lowestPrice = offers.length > 0 
        ? Math.min(...offers.map((offer: any) => parseFloat(offer.price)))
        : 0
      const lastPrice = offers.length > 0 
        ? parseFloat(offers[offers.length - 1].price)
        : 0

      return {
        offers,
        lowestPrice: lowestPrice.toString(),
        lastPrice: lastPrice.toString(),
        offersCount: offers.length
      }
    },
    enabled: !!shipment_id,
  })
}
