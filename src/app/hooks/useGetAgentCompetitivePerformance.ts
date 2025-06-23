import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/src/utils/supabase/client'

export interface CompetitiveFilters {
  agentId: string
  marketId?: string
  transportType?: string
  startDate?: string
  endDate?: string
  enabled?: boolean
}

export interface RouteRanking {
  route: string
  agentOffers: number
  agentWins: number
  agentSuccessRate: number
  agentAvgPrice: number
  competitiveData: {
    totalAgents: number
    totalOffers: number
    totalWins: number
    marketAvgPrice: number
    marketMedianPrice: number
    marketMinPrice: number
    marketMaxPrice: number
    agentRankingByWins: number
    pricePercentile: number
    pricePosition: 'low' | 'competitive' | 'premium'
  }
}

export interface ResponseTimeComparison {
  agentStats: {
    avgResponseHours: number
    medianResponseHours: number
  }
  marketStats: {
    avgResponseHours: number
    medianResponseHours: number
    q1ResponseHours: number
    q3ResponseHours: number
  }
  comparison: {
    responsePercentile: number
    vsMarketAvg: number
    responseLevel: 'excellent' | 'good' | 'average' | 'needs_improvement'
  }
}

export interface PricingAnalysis {
  transportType: string
  agentData: {
    offers: number
    avgPrice: number
    medianPrice: number
  }
  marketData: {
    avgPrice: number
    medianPrice: number
    q1Price: number
    q3Price: number
    minPrice: number
    maxPrice: number
  }
  comparison: {
    pricePercentile: number
    vsMarketAvg: number
    pricePosition: 'budget' | 'competitive' | 'premium' | 'luxury'
    recommendation: 'consider_increasing' | 'consider_decreasing' | 'well_positioned'
  }
}

export interface MarketPosition {
  totalActiveAgents: number
  agentRankings: {
    winRank: number
    responseRank: number
    conversionRank: number
  }
  percentiles: {
    winPercentile: number
    responsePercentile: number
    conversionPercentile: number
  }
}

export interface CompetitiveInsights {
  summary: {
    strongestRoutes: number
    competitiveAdvantage: 'response_time' | 'conversion_rate' | 'market_presence' | 'growth_opportunity'
    improvementAreas: string[]
  }
  recommendations: string[]
}

export interface AgentCompetitivePerformance {
  agentId: string
  period: {
    startDate: string
    endDate: string
    days: number
  }
  routeRankings: RouteRanking[]
  responseTimeComparison: ResponseTimeComparison
  pricingAnalysis: PricingAnalysis[]
  marketPosition: MarketPosition
  competitiveInsights: CompetitiveInsights
  summary: {
    hasData: boolean
    competitiveStrength: 'leader' | 'strong' | 'competitive' | 'emerging'
  }
}

export const useGetAgentCompetitivePerformance = (filters: CompetitiveFilters) => {
  return useQuery({
    queryKey: ['agentCompetitivePerformance', filters],
    queryFn: async (): Promise<AgentCompetitivePerformance> => {
      // Validar que tenemos un agentId
      if (!filters.agentId) {
        throw new Error('Agent ID is required for competitive performance metrics')
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
      const { data, error } = await supabase.rpc('get_agent_competitive_performance', params)

      if (error) {
        console.error('Error fetching agent competitive performance:', error)
        throw error
      }

      if (!data) {
        throw new Error('No data returned from agent competitive performance')
      }

      // Los datos ya vienen estructurados desde la función RPC
      return data as AgentCompetitivePerformance
    },
    enabled: filters.enabled !== false && !!filters.agentId,
    staleTime: 3 * 60 * 1000, // 3 minutos
    gcTime: 6 * 60 * 1000, // 6 minutos
  })
} 