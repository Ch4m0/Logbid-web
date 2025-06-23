'use client'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/src/utils/supabase/client'

export interface TopRoutesFilters {
  userId: string
  marketId?: string
  transportType?: string
  limitRoutes?: number
  enabled?: boolean
}

export interface RouteData {
  route: string
  origin_country: string
  destination_country: string
  shipments_count: number
  avg_cost: number
  min_cost: number
  max_cost: number
  total_offers: number
  transport_types: string[]
  percentage: number
}

export interface RouteCostData {
  route: string
  avgCost: number
  minCost: number
  maxCost: number
  shipments: number
}

export interface TransportDistributionData {
  transport_type: string
  count: number
  percentage: number
  avg_cost: number
}

export interface TopRoutesMetrics {
  totalShipments: number
  totalRoutes: number
  avgCostPerRoute: number
  topRoutes: RouteData[]
  routeCosts: RouteCostData[]
  transportDistribution: TransportDistributionData[]
  summary: {
    mostUsedRoute: string
    routeConcentration: 'high' | 'medium' | 'diversified'
    hasRouteData: boolean
  }
}

export const useGetTopRoutesMetrics = (filters: TopRoutesFilters) => {
  return useQuery({
    queryKey: [
      'top-routes-metrics', 
      filters.userId, 
      filters.marketId, 
      filters.transportType, 
      filters.limitRoutes
    ],
    queryFn: async (): Promise<TopRoutesMetrics> => {
      if (!filters.userId) {
        throw new Error('User ID is required')
      }

      const { data, error } = await supabase.rpc('get_top_routes_metrics', {
        user_id: filters.userId,
        market_id: filters.marketId || 'all',
        transport_type: filters.transportType || 'all',
        limit_routes: filters.limitRoutes || 5
      })

      if (error) {
        console.error('Error fetching top routes metrics:', error)
        throw error
      }

      console.log('Top routes metrics data:', data)
      return data as TopRoutesMetrics
    },
    enabled: filters.enabled !== false && !!filters.userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    refetchOnWindowFocus: false,
    refetchOnMount: false
  })
} 