import { useQuery } from '@tanstack/react-query'
import { fetchHistoricalBids } from '../api/importerBidList'

export const useHistoricalBids = (user_id: string, market_id: string) => {
  return useQuery({
    queryKey: ['historical-bids'],
    queryFn: () => {
      return fetchHistoricalBids(user_id, market_id)
    },
  })
}
