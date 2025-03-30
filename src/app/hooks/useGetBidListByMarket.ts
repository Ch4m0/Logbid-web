import { useQuery } from '@tanstack/react-query'
import { fetchListBidByMarket } from '../api/agentBid'
import { ShippingType } from '../../models/common';

export const useGetBidListByMarket = (
  marketId: string | null,
  status: string,
  user_id: number | null,
  shippingType: ShippingType
) => {
  return useQuery({
    queryKey: ['bidListByMarket'],
    queryFn: () => fetchListBidByMarket(marketId, status, user_id, shippingType),
  })
}
