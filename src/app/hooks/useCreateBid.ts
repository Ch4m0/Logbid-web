import { createBid } from '../api/importerBidList'
import { useMutation } from '@tanstack/react-query'

export const useCreateBid = () => {
  return useMutation({
    mutationFn: createBid,
    onSuccess: (data) => {
      return data
    },
    onError: (error) => {
      console.error(error)
      return 'Hubo un error tratando de crear la transacción'
    },
  })
}
