import { useMutation } from '@tanstack/react-query'
import { createOffer } from '../api/agentBid'

export const useCreateOffer = () => {
  return useMutation({
    mutationFn: createOffer,
    onSuccess: (data) => {
      return data
    },
    onError: (error) => {
      console.error(error)
      return 'Hubo un error tratando de proponer precio'
    },
  })
}
