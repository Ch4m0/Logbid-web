import { useQuery } from '@tanstack/react-query'
import { getBidList } from '../api/importerBidList'
import { BidStatus, ShippingType } from '@/src/models/common'

interface Args {
  market_id: string | null
  user_id: number | null
  status: BidStatus
  shipping_type: ShippingType
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
