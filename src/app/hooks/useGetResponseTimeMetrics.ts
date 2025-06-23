'use client'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/src/utils/supabase/client'

export interface ResponseTimeFilters {
  userId: string
  marketId?: string
  transportType?: string
  daysThreshold?: number
  enabled?: boolean
}

export interface ResponseTimelineData {
  date: string
  shipments_created: number
  offers_received: number
  avg_response_time_hours: number
}

export interface ResponseTimeMetrics {
  averageFirstOfferHours: number
  averageFirstOfferDays: number
  shipmentsNoOffersAfterXDays: number
  daysThreshold: number
  totalActiveShipments: number
  marketResponseRate: number
  totalOffersReceived: number
  responseTimeline: ResponseTimelineData[]
  summary: {
    fastResponse: boolean
    goodResponseRate: boolean
    needsAttention: boolean
  }
}

export const useGetResponseTimeMetrics = (filters: ResponseTimeFilters) => {
  return useQuery({
    queryKey: [
      'response-time-metrics', 
      filters.userId, 
      filters.marketId, 
      filters.transportType, 
      filters.daysThreshold
    ],
    queryFn: async (): Promise<ResponseTimeMetrics> => {
      if (!filters.userId) {
        throw new Error('User ID is required')
      }

      const { data, error } = await supabase.rpc('get_response_time_metrics', {
        user_id: filters.userId,
        market_id: filters.marketId || 'all',
        transport_type: filters.transportType || 'all',
        days_threshold: filters.daysThreshold || 3
      })

      if (error) {
        console.error('Error fetching response time metrics:', error)
        throw error
      }

      console.log('Response time metrics data:', data)
      return data as ResponseTimeMetrics
    },
    enabled: filters.enabled !== false && !!filters.userId,
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
    refetchOnMount: false
  })
} 