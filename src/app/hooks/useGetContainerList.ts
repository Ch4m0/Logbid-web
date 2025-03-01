import { useQuery } from '@tanstack/react-query'
import { fetchListContainer } from '../api/importerBidList'

export const useGetListContainer = () => {
  return useQuery({
    queryKey: ['list-container'],
    queryFn: fetchListContainer,
  })
}
