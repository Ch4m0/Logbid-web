import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/src/utils/supabase/client'

interface Args {
  shipment_id: string | null
  page?: number
  limit?: number
  searchTerm?: string
  enabled?: boolean
  // Filtros adicionales
  agentCodeFilter?: string
  offerIdFilter?: string
  priceMinFilter?: string
  priceMaxFilter?: string
  statusFilter?: string
}

export const useGetOffersByShipment = ({ 
  shipment_id, 
  page = 1, 
  limit = 10, 
  searchTerm,
  enabled = true,
  agentCodeFilter,
  offerIdFilter,
  priceMinFilter,
  priceMaxFilter,
  statusFilter
}: Args) => {
  
  const result = useQuery({
    queryKey: ['offers', 'shipment', shipment_id, page, limit, searchTerm, agentCodeFilter, offerIdFilter, priceMinFilter, priceMaxFilter, statusFilter, enabled],
    queryFn: async () => {
      if (!shipment_id) {
        throw new Error('Shipment ID is required')
      }

      // Llamar función de Supabase que devuelve el objeto completo con paginación
      const { data, error } = await supabase.rpc('get_offers_by_shipment_paginated', {
        p_shipment_id: shipment_id,
        p_page: page,
        p_limit: limit,
        p_search_term: searchTerm || null,
        p_agent_code_filter: agentCodeFilter || null,
        p_offer_id_filter: offerIdFilter || null,
        p_price_min_filter: priceMinFilter || null,
        p_price_max_filter: priceMaxFilter || null,
        p_status_filter: statusFilter || null
      })

      if (error) {
        console.error('❌ Error en función get_offers_by_shipment_paginated:', error)
        throw error
      }

      console.log('✅ OFFERS HOOK - Returning data with', data || 0, 'offers')

      // La función de Supabase devuelve directamente el objeto con la estructura:
      // {
      //   "data": [/* array de offers con info de agente */],
      //   "pagination": {
      //     "currentPage": 1,
      //     "totalPages": 5,
      //     "totalItems": 25,
      //     "hasNext": true,
      //     "hasPrev": false
      //   },
      //   "metrics": {
      //     "lowestPrice": "1500.00",
      //     "lastPrice": "2000.00", 
      //     "offersCount": 25
      //   }
      // }
      return data
    },
    enabled: enabled && !!shipment_id,
    staleTime: 1000 * 60 * 10, // 10 minutos
    refetchOnWindowFocus: false,
    retry: 1,
    gcTime: 1000 * 60 * 30, // 30 minutos
  })

  return result
}
