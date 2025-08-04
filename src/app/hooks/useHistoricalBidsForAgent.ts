import { useQuery } from '@tanstack/react-query'
import { getBidList } from '../api/importerBidList'
import { fetchHistoricalBidsForAgent } from '../api/agentBid'

interface Args {
  market_id: string | null
  user_id: number | null
  status: 'Active' | 'Closed'
  shipping_type: '1' | '2'
}
export const useHistoricalBidsForAgent = ({
  user_id,
  market_id,
  status,
  shipping_type,
}: Args) => {
  return useQuery({
    queryKey: ['bids-historical'],
    queryFn: async () => {
      return fetchHistoricalBidsForAgent({
        user_id,
        market_id,
        status,
        shipping_type,
      })
    },
    enabled: !!user_id && !!market_id,
  })
}
