import { useQuery } from '@tanstack/react-query'
import { fetchListContainer } from '../api/importerBidList'

export const useGetListContainer = (shipping_type: string) => {
  console.log(shipping_type)
  return useQuery({
    queryKey: ['list-container', shipping_type],
    queryFn: () => fetchListContainer(shipping_type),
  })
}
