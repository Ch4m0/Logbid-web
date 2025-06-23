import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/src/utils/supabase/client'

export interface AgentPerformanceFilters {
  agentId: string
  marketId?: string
  transportType?: string
  startDate?: string
  endDate?: string
  enabled?: boolean
}

export interface BasicMetrics {
  totalOffers: number
  acceptedOffers: number
  pendingOffers: number
  rejectedOffers: number
  conversionRate: number
  totalRevenue: number
  avgContractValue: number
  avgResponseTimeHours: number
  responseRate: number
}

export interface MarketPosition {
  ranking: number
  totalAgents: number
  percentile: number
}

export interface MonthlyTrend {
  month: string
  offers: number
  accepted: number
  revenue: number
  conversion_rate: number
}

export interface OfferStatusBreakdown {
  accepted: number
  pending: number
  rejected: number
  total: number
}

export interface RoutePerformance {
  route: string
  totalOffers: number
  acceptedOffers: number
  avgPrice: number
  successRate: number
}

export interface CompetitionAnalysis {
  avgCompetition: number
  minCompetition: number
  maxCompetition: number
  shipmentsParticipated: number
}

export interface AgentPerformanceMetrics {
  agentId: string
  period: {
    startDate: string
    endDate: string
    days: number
  }
  basicMetrics: BasicMetrics
  marketPosition: MarketPosition
  monthlyTrend: MonthlyTrend[]
  offerStatusBreakdown: OfferStatusBreakdown
  routePerformance: RoutePerformance[]
  competitionAnalysis: CompetitionAnalysis
  summary: {
    hasData: boolean
    performanceLevel: 'excellent' | 'good' | 'average' | 'needs_improvement'
    responseLevel: 'excellent' | 'good' | 'average' | 'poor'
    revenueLevel: 'high' | 'medium' | 'low' | 'very_low'
  }
}

export const useGetAgentPerformanceMetrics = (filters: AgentPerformanceFilters) => {
  return useQuery({
    queryKey: ['agentPerformanceMetrics', filters],
    queryFn: async (): Promise<AgentPerformanceMetrics> => {
      // Validar que tenemos un agentId
      if (!filters.agentId) {
        throw new Error('Agent ID is required for performance metrics')
      }

      // Preparar parámetros
      const params = {
        p_agent_id: filters.agentId,
        p_market_id: filters.marketId && filters.marketId !== 'all' ? parseInt(filters.marketId) : null,
        p_transport_type: filters.transportType && filters.transportType !== 'all' ? filters.transportType : null,
        p_start_date: filters.startDate || null,
        p_end_date: filters.endDate || null
      }

      // Llamar a la función RPC de Supabase
      const { data, error } = await supabase.rpc('get_agent_performance_metrics', params)

      if (error) {
        console.error('Error fetching agent performance metrics:', error)
        throw error
      }

      if (!data) {
        throw new Error('No data returned from agent performance metrics')
      }

      // Los datos ya vienen estructurados desde la función RPC
      return data as AgentPerformanceMetrics
    },
    enabled: filters.enabled !== false && !!filters.agentId,
    staleTime: 2 * 60 * 1000, // 2 minutos
    gcTime: 5 * 60 * 1000, // 5 minutos
  })
} 