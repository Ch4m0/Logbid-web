import { useQuery } from '@tanstack/react-query'
import { fetchListContainer } from '../api/importerBidList'

export const useGetListContainer = (shipping_type: string) => {
  return useQuery({
    queryKey: ['list-container', shipping_type],
    queryFn: () => fetchListContainer(shipping_type),
  })
}
