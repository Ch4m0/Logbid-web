'use client'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/src/utils/supabase/client'

export interface SuccessRateFilters {
  userId: string
  marketId?: string
  transportType?: string
  daysPeriod?: number
  enabled?: boolean
}

export interface ShipmentStage {
  stage: string
  count: number
  percentage: number
}

export interface OfferTrend {
  week: string
  shipments: number
  offers: number
  completed: number
  avgOffersPerShipment: number
}

export interface AgentPerformance {
  agentId: string | null
  agentName: string
  totalOffers: number
  acceptedOffers: number
  successRate: number
  avgPrice: number
  lastActivityDays: number
}

export interface SuccessRateMetrics {
  totalShipments: number
  completedShipments: number
  successRate: number
  activeAgents: number
  totalOffers: number
  avgOffersPerShipment: number
  shipmentStages: ShipmentStage[]
  offerTrends: OfferTrend[]
  agentPerformance: AgentPerformance[]
  summary: {
    hasData: boolean
    performanceLevel: 'excellent' | 'good' | 'average' | 'needs_improvement'
    agentEngagement: 'high' | 'medium' | 'low' | 'very_low'
    topAgent: string
  }
  period: {
    days: number
    startDate: string
    endDate: string
  }
}

export const useGetSuccessRateMetrics = (filters: SuccessRateFilters) => {
  return useQuery({
    queryKey: [
      'success-rate-metrics', 
      filters.userId, 
      filters.marketId, 
      filters.transportType, 
      filters.daysPeriod
    ],
    queryFn: async (): Promise<SuccessRateMetrics> => {
      if (!filters.userId) {
        throw new Error('User ID is required')
      }

      const { data, error } = await supabase.rpc('get_success_rate_metrics', {
        user_id: filters.userId,
        market_id: filters.marketId || 'all',
        transport_type: filters.transportType || 'all',
        days_period: filters.daysPeriod || 90
      })

      if (error) {
        console.error('Error fetching success rate metrics:', error)
        throw error
      }

      console.log('Success rate metrics data:', data)
      return data as SuccessRateMetrics
    },
    enabled: filters.enabled !== false && !!filters.userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false
  })
} 