import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/src/utils/supabase/client'
import { BidStatus, ShippingType } from '@/src/models/common'

interface Args {
  market_id: string | null
  user_id: string | null  // Cambiar a string porque profile_id es UUID
  status: BidStatus
  shipping_type: ShippingType
  filterType?: 'withoutOffers' | 'withOffers' | 'closed'
  searchTerm?: string
  page?: number
  limit?: number
  // Filtros adicionales opcionales
  originFilter?: string
  destinationFilter?: string
  creationDateFilter?: string
  expirationDateFilter?: string
  uuidFilter?: string
  offersCountFilter?: string
}

export const useGetShipments = ({
  user_id,
  market_id,
  status,
  shipping_type,
  filterType,
  searchTerm,
  page = 1,
  limit = 10,
  originFilter,
  destinationFilter,
  creationDateFilter,
  expirationDateFilter,
  uuidFilter,
  offersCountFilter,
}: Args) => {

  return useQuery({
    queryKey: ['shipments', user_id, market_id, status, shipping_type, filterType, searchTerm, page, limit, originFilter, destinationFilter, creationDateFilter, expirationDateFilter, uuidFilter, offersCountFilter],
    queryFn: async () => {
      
      // Llamar función de Supabase que devuelve el objeto completo con paginación
      const { data, error } = await supabase.rpc('get_shipments_paginated', {
        p_user_id: user_id,
        p_market_id: market_id,
        p_status: status,
        p_shipping_type: shipping_type,
        p_filter_type: filterType || 'all',
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
        console.error('❌ Error en función get_shipments_paginated:', error)
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
    enabled: !!market_id, // Solo ejecutar si hay market_id
    staleTime: 1000 * 60 * 10, // 10 minutos
  })
}