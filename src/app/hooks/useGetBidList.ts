import { useQuery } from '@tanstack/react-query'
import { getBidList } from '../api/importerBidList'

interface Args {
  market_id: string | null
  user_id: number | null
  status: 'Active' | 'Closed' | 'Offering'
  shipping_type: 'Aéreo' | 'Marítimo'
}
export const useGetBidList = ({
  user_id,
  market_id,
  status,
  shipping_type,
}: Args) => {
  return useQuery({
    queryKey: ['bids'],
    queryFn: async () => {
      return getBidList({ user_id, market_id, status, shipping_type })
    },
    enabled: !!user_id && !!market_id,
  })
}
