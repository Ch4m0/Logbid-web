import { supabase } from '@/src/utils/supabase/client';
import { useQuery } from '@tanstack/react-query';

interface Args {
  marketId: string | null
  agentId: string | null  // ID del agente para filtrar sus ofertas
  shippingType: string
  searchTerm?: string
  page?: number
  limit?: number
  enabled?: boolean  // Para controlar si el hook debe ejecutarse
  // Filtros adicionales opcionales
  originFilter?: string
  destinationFilter?: string
  creationDateFilter?: string
  expirationDateFilter?: string
  uuidFilter?: string
  offersCountFilter?: string
}

export const useGetAgentOfferedShipments = ({
  marketId,
  agentId,
  shippingType,
  searchTerm,
  page = 1,
  limit = 10,
  enabled = true,
  originFilter,
  destinationFilter,
  creationDateFilter,
  expirationDateFilter,
  uuidFilter,
  offersCountFilter,
}: Args) => {
  return useQuery({
    queryKey: ['agentOfferedShipments', marketId, agentId, shippingType, searchTerm, page, limit, originFilter, destinationFilter, creationDateFilter, expirationDateFilter, uuidFilter, offersCountFilter],
    queryFn: async () => {
      
      // Llamar función de Supabase específica para ofertas del agente
      const { data, error } = await supabase.rpc('get_agent_offered_shipments_paginated', {
        p_market_id: marketId,
        p_agent_id: agentId,
        p_shipping_type: shippingType,
        p_search_term: searchTerm || null,
        p_page: page,
        p_limit: limit,
        // Filtros adicionales opcionales
        p_origin_filter: originFilter || null,
        p_destination_filter: destinationFilter || null,
        p_creation_date_filter: creationDateFilter || null,
        p_expiration_date_filter: expirationDateFilter || null,
        p_uuid_filter: uuidFilter || null,
        p_offers_count_filter: offersCountFilter || null
      })
      
      if (error) {
        console.error('❌ Error en función get_agent_offered_shipments_paginated:', error)
        throw error
      }
      
      // La función de Supabase devuelve directamente el objeto con la estructura:
      // {
      //   "data": [/* array de shipments */],
      //   "pagination": {
      //     "currentPage": 1,
      //     "totalPages": 15,
      //     "totalItems": 150,
      //     "hasNext": true,
      //     "hasPrev": false
      //   }
      // }
      return data
    },
    enabled: enabled && !!marketId && !!agentId,
    staleTime: 1000 * 60 * 10, // 10 minutos
  })
}
