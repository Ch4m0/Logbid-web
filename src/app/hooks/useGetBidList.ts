import { useQuery } from '@tanstack/react-query'
import { getBidList } from '../api/importerBidList'

interface Args {
  market_id: string | null
  user_id: number | null
  status: 'Active' | 'Closed' | 'Offering'
}
export const useGetBidList = ({ user_id, market_id, status }: Args) => {
  return useQuery({
    queryKey: ['bids'],
    queryFn: async () => {
      return getBidList({ user_id, market_id, status })
    },
    enabled: !!user_id && !!market_id,
  })
}
