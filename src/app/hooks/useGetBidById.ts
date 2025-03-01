import { useMutation, useQuery } from '@tanstack/react-query'
import { fetchDetailById } from '../api/importerBidList'

export const useGetBidById = () => {
  return useMutation({
    mutationKey: ['get-bid-by-id'],
    mutationFn: fetchDetailById,
  })
}
