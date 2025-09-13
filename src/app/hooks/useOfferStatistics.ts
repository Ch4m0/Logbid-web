import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/src/utils/supabase/client'

interface OfferStatistics {
  price_stats: {
    min_price: string
    max_price: string
    avg_price: string
  }
  unique_agents: string[]
  unique_statuses: string[]
  total_offers: number
  shipment_id: string
}

interface Args {
  shipment_id: string | null
  enabled?: boolean
}

export const useOfferStatistics = ({ shipment_id, enabled = true }: Args) => {
  const result = useQuery({
    queryKey: ['offer-statistics', shipment_id],
    queryFn: async (): Promise<OfferStatistics> => {
      if (!shipment_id) {
        throw new Error('Shipment ID is required')
      }

      const { data, error } = await supabase.rpc('get_offer_statistics', {
        p_shipment_id: shipment_id
      })

      if (error) {
        console.error('❌ Error in get_offer_statistics:', error)
        throw error
      }

      // Check if the response contains an error
      if (data?.error) {
        throw new Error(data.error)
      }

      return data as OfferStatistics
    },
    enabled: enabled && !!shipment_id,
    staleTime: 1000 * 60 * 5, // 5 minutes
    refetchOnWindowFocus: false,
    retry: 1,
    gcTime: 1000 * 60 * 15, // 15 minutes
  })

  return result
}
