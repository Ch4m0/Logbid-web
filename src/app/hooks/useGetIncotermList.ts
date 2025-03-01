import { useQuery } from '@tanstack/react-query'
import { fetchListIncoterm } from '../api/importerBidList'

export const useGetIncotermList = () => {
  return useQuery({
    queryKey: ['incotermList'],
    queryFn: () => fetchListIncoterm(),
  })
}
