import { useQuery } from '@tanstack/react-query'
import { fetchListBidByMarket } from '../api/agentBid'

export const useGetBidListByMarket = (
  marketId: string | null,
  status: string,
  user_id: number | null
) => {
  return useQuery({
    queryKey: ['bidListByMarket'],
    queryFn: () => fetchListBidByMarket(marketId, status, user_id),
  })
}
