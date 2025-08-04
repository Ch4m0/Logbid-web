import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/src/utils/supabase/client'

export interface DashboardFilters {
  marketId: string | 'all'
  dateRange: '7d' | '30d' | '3m' | '6m' | '1y'
  transportType: 'all' | '2' | '1'
  userId: string
  userRole: 'customer' | 'agent'
  enabled?: boolean
}

export interface DashboardMetrics {
  // Métricas generales
  totalShipments: number
  totalOffers: number
  averagePrice: number
  conversionRate: number
  
  // Métricas específicas por rol
  // Para importadores
  totalSpent?: number
  avgCost?: number
  shipmentsWithOffers?: number
  avgOffers?: number
  responseRate?: number
  
  // Para agentes
  availableShipments?: number
  shipmentsWithoutOffers?: number
  potentialRevenue?: number
  averageCompetition?: number
  successRate?: number
  
  // Métricas por período
  trendsData: Array<{
    period: string
    shipments: number
    offers: number
    avgPrice: number
    conversionRate: number
  }>
  
  // Comparación entre mercados
  marketComparison: Array<{
    marketId: number
    marketName: string
    shipments: number
    offers: number
    avgPrice: number
    conversionRate: number
  }>
  
  // Métricas de tiempo de respuesta
  responseTimeMetrics?: {
    avgResponseTimeHours: number
    medianResponseTimeHours: number
    fastestResponseHours: number
    marketAvgResponseHours: number
    improvementPercentage: number
    totalResponses: number
    responsesUnder24h: number
    responsesUnder1h: number
  }
}

export const useGetDashboardMetrics = (filters: DashboardFilters) => {
  return useQuery({
    queryKey: ['dashboardMetrics', filters],
    queryFn: async (): Promise<DashboardMetrics> => {
      // Calcular rango de fechas
      const now = new Date()
      const daysMap = { '7d': 7, '30d': 30, '3m': 90, '6m': 180, '1y': 365 }
      const daysBack = daysMap[filters.dateRange]
      const startDate = new Date(now.getTime() - (daysBack * 24 * 60 * 60 * 1000))
      
      // Construir filtros base
      const marketFilter = filters.marketId === 'all' ? '' : `AND s.market_id = ${filters.marketId}`
      const transportFilter = filters.transportType === 'all' ? '' : `AND s.shipping_type = '${filters.transportType}'`
      const userFilter = filters.userRole === 'agent' 
        ? '' // Los agentes ven todos los shipments disponibles
        : `AND s.profile_id = ${filters.userId}` // Los importadores solo ven sus shipments
      
      // Query principal para métricas generales
      const { data: generalMetrics, error: generalError } = await supabase
        .rpc('get_dashboard_metrics', {
          p_start_date: startDate.toISOString(),
          p_end_date: now.toISOString(),
          p_market_id: filters.marketId === 'all' ? null : parseInt(filters.marketId),
          p_transport_type: filters.transportType === 'all' ? null : filters.transportType,
          p_user_id: filters.userRole === 'agent' ? null : filters.userId,
          p_user_role: filters.userRole
        })

      if (generalError) {
        console.error('Error fetching dashboard metrics:', generalError)
        throw generalError
      }

      // Query para tendencias temporales
      const { data: trendsData, error: trendsError } = await supabase
        .rpc('get_dashboard_trends', {
          p_start_date: startDate.toISOString(),
          p_end_date: now.toISOString(),
          p_market_id: filters.marketId === 'all' ? null : parseInt(filters.marketId),
          p_transport_type: filters.transportType === 'all' ? null : filters.transportType,
          p_user_id: filters.userRole === 'agent' ? null : filters.userId,
          p_user_role: filters.userRole,
          p_interval: filters.dateRange
        })

      if (trendsError) {
        console.error('Error fetching trends data:', trendsError)
        throw trendsError
      }

      // Query para comparación entre mercados (solo si se seleccionó 'all')
      let marketComparison = []
      if (filters.marketId === 'all') {
        const { data: marketData, error: marketError } = await supabase
          .rpc('get_market_comparison', {
            p_start_date: startDate.toISOString(),
            p_end_date: now.toISOString(),
            p_transport_type: filters.transportType === 'all' ? null : filters.transportType,
            p_user_id: filters.userRole === 'agent' ? null : filters.userId,
            p_user_role: filters.userRole
          })

        if (marketError) {
          console.error('Error fetching market comparison:', marketError)
        } else {
          marketComparison = marketData || []
        }
      }

      // Query para métricas de tiempo de respuesta
      let responseTimeMetrics: {
        avgResponseTimeHours: number
        medianResponseTimeHours: number
        fastestResponseHours: number
        marketAvgResponseHours: number
        improvementPercentage: number
        totalResponses: number
        responsesUnder24h: number
        responsesUnder1h: number
      } | undefined = undefined
      const { data: responseData, error: responseError } = await supabase
        .rpc('get_response_time_metrics', {
          p_start_date: startDate.toISOString(),
          p_end_date: now.toISOString(),
          p_market_id: filters.marketId === 'all' ? null : parseInt(filters.marketId),
          p_transport_type: filters.transportType === 'all' ? null : filters.transportType,
          p_user_id: filters.userRole === 'agent' ? null : filters.userId,
          p_user_role: filters.userRole
        })

      if (responseError) {
        console.error('Error fetching response time metrics:', responseError)
      } else if (responseData && responseData[0]) {
        const data = responseData[0]
        responseTimeMetrics = {
          avgResponseTimeHours: Number(data.avg_response_time_hours),
          medianResponseTimeHours: Number(data.median_response_time_hours),
          fastestResponseHours: Number(data.fastest_response_hours),
          marketAvgResponseHours: Number(data.market_avg_response_hours),
          improvementPercentage: Number(data.improvement_percentage),
          totalResponses: Number(data.total_responses),
          responsesUnder24h: Number(data.responses_under_24h),
          responsesUnder1h: Number(data.responses_under_1h)
        }
      }

      const metrics = generalMetrics[0] || {}
      
      return {
        // Convertir nombres de snake_case a camelCase para consistencia
        totalShipments: Number(metrics.total_shipments || 0),
        totalOffers: Number(metrics.total_offers || 0),
        averagePrice: Number(metrics.average_price || 0),
        conversionRate: Number(metrics.conversion_rate || 0),
        totalSpent: Number(metrics.total_spent || 0),
        avgCost: Number(metrics.avg_cost || 0),
        shipmentsWithOffers: Number(metrics.shipments_with_offers || 0),
        avgOffers: Number(metrics.avg_offers || 0),
        responseRate: Number(metrics.response_rate || 0),
        availableShipments: Number(metrics.available_shipments || 0),
        shipmentsWithoutOffers: Number(metrics.shipments_without_offers || 0),
        potentialRevenue: Number(metrics.potential_revenue || 0),
        averageCompetition: Number(metrics.average_competition || 0),
        successRate: Number(metrics.success_rate || 0),
        trendsData: trendsData || [],
        marketComparison,
        responseTimeMetrics
      }
    },
    enabled: filters.enabled !== false && (!!filters.userId || filters.userRole === 'agent'),
    staleTime: 5 * 60 * 1000, // 5 minutos
    gcTime: 10 * 60 * 1000, // 10 minutos
  })
} 