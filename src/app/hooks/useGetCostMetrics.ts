import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/src/utils/supabase/client'

export interface CostMetrics {
  totalSpent: number
  averagePrice: number
  totalSavings: number
  costTrend: 'up' | 'down' | 'stable'
  trendPercentage: number
  shipmentsCount: number
  acceptedOffersCount: number
  periodComparison: {
    currentPeriod: number
    previousPeriod: number
    difference: number
    percentageChange: number
  }
}

export interface CostFilters {
  marketId: string | 'all'
  dateRange: '7d' | '30d' | '3m' | '6m' | '1y'
  transportType: 'all' | '2' | '1'
  userId: string
  enabled?: boolean
}

export const useGetCostMetrics = (filters: CostFilters) => {
  return useQuery({
    queryKey: ['costMetrics', filters],
    queryFn: async (): Promise<CostMetrics> => {
      // Calcular rango de fechas
      const now = new Date()
      const daysMap = { '7d': 7, '30d': 30, '3m': 90, '6m': 180, '1y': 365 }
      const daysBack = daysMap[filters.dateRange]
      const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000))
      
      // Llamar a la función RPC de Supabase que hace todos los cálculos
      const { data, error } = await supabase.rpc('get_cost_metrics', {
        p_user_id: filters.userId, // Ya es UUID
        p_market_id: filters.marketId === 'all' ? null : parseInt(filters.marketId),
        p_transport_type: filters.transportType === 'all' ? null : filters.transportType,
        p_start_date: startDate.toISOString(),
        p_end_date: now.toISOString()
      })
      console.log(data, 'data')

      if (error) {
        console.error('Error fetching cost metrics from RPC:', error)
        throw error
      }

      if (!data) {
        throw new Error('No data returned from cost metrics RPC')
      }

      // Los datos ya vienen calculados desde Supabase
      return {
        totalSpent: Number(data.totalSpent || 0),
        averagePrice: Number(data.averagePrice || 0),
        totalSavings: Number(data.totalSavings || 0),
        costTrend: data.costTrend || 'stable',
        trendPercentage: Number(data.trendPercentage || 0),
        shipmentsCount: Number(data.shipmentsCount || 0),
        acceptedOffersCount: Number(data.acceptedOffersCount || 0),
        periodComparison: {
          currentPeriod: Number(data.periodComparison?.currentPeriod || 0),
          previousPeriod: Number(data.periodComparison?.previousPeriod || 0),
          difference: Number(data.periodComparison?.difference || 0),
          percentageChange: Number(data.periodComparison?.percentageChange || 0)
        }
      }
    },
    enabled: filters.enabled !== false && !!filters.userId,
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })
} 