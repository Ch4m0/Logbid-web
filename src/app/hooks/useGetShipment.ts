import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/src/utils/supabase/client'

interface Args {
  shipment_id: string | null
}

export const useGetShipment = ({ shipment_id }: Args) => {
  return useQuery({
    queryKey: ['shipment', shipment_id],
    queryFn: async () => {
      if (!shipment_id) {
        throw new Error('Shipment ID is required')
      }

      // Usar la función RPC para obtener toda la información del shipment
      const { data, error } = await supabase
        .rpc('get_shipment_detailed', { p_shipment_uuid: shipment_id })

      if (error) {
        console.error('❌ Error en función get_shipment_detailed:', error)
        throw error
      }

      return data
    },
    enabled: !!shipment_id,
    staleTime: 1000 * 60 * 5, // 5 minutos
  })
}
