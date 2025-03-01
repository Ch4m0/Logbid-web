import { useQuery } from '@tanstack/react-query'
import { getBidList } from '../api/importerBidList'
import { fetchHistoricalBidsForAgent } from '../api/agentBid'

interface Args {
  market_id: string | null
  user_id: number | null
  status: 'Active' | 'Closed'
}
export const useHistoricalBidsForAgent = ({
  user_id,
  market_id,
  status,
}: Args) => {
  return useQuery({
    queryKey: ['bids-historical'],
    queryFn: async () => {
      return fetchHistoricalBidsForAgent({ user_id, market_id, status })
    },
    enabled: !!user_id && !!market_id,
  })
}
