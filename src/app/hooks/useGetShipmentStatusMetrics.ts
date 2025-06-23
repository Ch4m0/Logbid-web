'use client'
import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/src/utils/supabase/client'

export interface ShipmentStatusFilters {
  userId: string
  marketId?: string
  transportType?: string
  enabled?: boolean
}

export interface ShipmentStatusMetrics {
  activeShipments: number
  closedShipments: number
  shipmentsWithoutOffers: number
  shipmentsExpiringSoon: number
  totalShipments: number
  activePercentage: number
  closedPercentage: number
  withoutOffersPercentage: number
  expiringPercentage: number
  summary: {
    needsAttention: number
    criticalAlerts: number
    healthyShipments: number
  }
}

export const useGetShipmentStatusMetrics = (filters: ShipmentStatusFilters) => {
  return useQuery({
    queryKey: ['shipment-status-metrics', filters.userId, filters.marketId, filters.transportType],
    queryFn: async (): Promise<ShipmentStatusMetrics> => {
      if (!filters.userId) {
        throw new Error('User ID is required')
      }

      const { data, error } = await supabase.rpc('get_shipment_status_metrics', {
        user_id: filters.userId,
        market_id: filters.marketId || 'all',
        transport_type: filters.transportType || 'all'
      })

      if (error) {
        console.error('Error fetching shipment status metrics:', error)
        throw error
      }

      console.log('Shipment status metrics data:', data)
      return data as ShipmentStatusMetrics
    },
    enabled: filters.enabled !== false && !!filters.userId,
    staleTime: 30 * 1000, // 30 seconds
    refetchOnWindowFocus: false,
    refetchOnMount: false
  })
} 