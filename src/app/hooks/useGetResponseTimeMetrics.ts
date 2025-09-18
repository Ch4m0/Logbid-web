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

// Interface para los datos que devuelve la RPC
export interface ResponseTimeRPCData {
  avg_response_time_hours: number
  median_response_time_hours: number
  fastest_response_hours: number
  market_avg_response_hours: number
  improvement_percentage: number
  total_responses: number
  responses_under_24h: number
  responses_under_1h: number
}

// Interface para los datos que espera el componente
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

// Función para transformar datos de RPC al formato del componente
const transformRPCDataToMetrics = (rpcData: ResponseTimeRPCData[], filters: ResponseTimeFilters): ResponseTimeMetrics => {
  const data = rpcData[0] || {
    avg_response_time_hours: 0,
    median_response_time_hours: 0,
    fastest_response_hours: 0,
    market_avg_response_hours: 0,
    improvement_percentage: 0,
    total_responses: 0,
    responses_under_24h: 0,
    responses_under_1h: 0
  }

  const averageFirstOfferHours = data.avg_response_time_hours
  const averageFirstOfferDays = averageFirstOfferHours / 24
  const daysThreshold = filters.daysThreshold || 30
  
  // Calcular métricas adicionales
  const totalActiveShipments = Math.max(data.total_responses, 1) // Evitar división por 0
  const marketResponseRate = data.total_responses > 0 ? (data.responses_under_24h / data.total_responses) * 100 : 0
  const shipmentsNoOffersAfterXDays = Math.max(0, totalActiveShipments - data.total_responses)

  // Determinar estados de summary
  const fastResponse = averageFirstOfferHours <= 24
  const goodResponseRate = marketResponseRate >= 60
  const needsAttention = shipmentsNoOffersAfterXDays > 0

  // Generar timeline de ejemplo (puedes modificar esto según tus necesidades)
  const responseTimeline: ResponseTimelineData[] = [
    {
      date: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      shipments_created: Math.floor(totalActiveShipments / 7),
      offers_received: Math.floor(data.total_responses / 7),
      avg_response_time_hours: averageFirstOfferHours
    },
    {
      date: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      shipments_created: Math.floor(totalActiveShipments / 7),
      offers_received: Math.floor(data.total_responses / 7),
      avg_response_time_hours: averageFirstOfferHours
    },
    {
      date: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      shipments_created: Math.floor(totalActiveShipments / 7),
      offers_received: Math.floor(data.total_responses / 7),
      avg_response_time_hours: averageFirstOfferHours
    },
    {
      date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      shipments_created: Math.floor(totalActiveShipments / 7),
      offers_received: Math.floor(data.total_responses / 7),
      avg_response_time_hours: averageFirstOfferHours
    },
    {
      date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      shipments_created: Math.floor(totalActiveShipments / 7),
      offers_received: Math.floor(data.total_responses / 7),
      avg_response_time_hours: averageFirstOfferHours
    },
    {
      date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      shipments_created: Math.floor(totalActiveShipments / 7),
      offers_received: Math.floor(data.total_responses / 7),
      avg_response_time_hours: averageFirstOfferHours
    },
    {
      date: new Date().toISOString().split('T')[0],
      shipments_created: Math.floor(totalActiveShipments / 7),
      offers_received: Math.floor(data.total_responses / 7),
      avg_response_time_hours: averageFirstOfferHours
    }
  ]

  return {
    averageFirstOfferHours,
    averageFirstOfferDays,
    shipmentsNoOffersAfterXDays,
    daysThreshold,
    totalActiveShipments,
    marketResponseRate,
    totalOffersReceived: data.total_responses,
    responseTimeline,
    summary: {
      fastResponse,
      goodResponseRate,
      needsAttention
    }
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

      // Calcular fechas basadas en el threshold de días
      const endDate = new Date()
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - (filters.daysThreshold || 30))

      const { data, error } = await supabase.rpc('get_response_time_metrics', {
        p_start_date: startDate.toISOString().split('T')[0],
        p_end_date: endDate.toISOString().split('T')[0],
        p_market_id: filters.marketId ? parseInt(filters.marketId) : null,
        p_transport_type: filters.transportType || null,
        p_user_id: filters.userId,
        p_user_role: 'customer' // Asumiendo que es para customer, podrías hacer esto configurable
      })

      if (error) {
        console.error('Error fetching response time metrics:', error)
        throw error
      }

      console.log('Response time metrics RPC data:', data)
      
      // Transformar los datos de RPC al formato esperado por el componente
      const transformedData = transformRPCDataToMetrics(data as ResponseTimeRPCData[], filters)
      console.log('Transformed response time metrics:', transformedData)
      
      return transformedData
    },
    enabled: filters.enabled !== false && !!filters.userId,
    staleTime: 60 * 1000, // 1 minute
    refetchOnWindowFocus: false,
    refetchOnMount: false
  })
} 