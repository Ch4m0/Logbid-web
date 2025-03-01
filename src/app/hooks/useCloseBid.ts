import { useMutation } from '@tanstack/react-query'
import { closeBid } from '../api/importerBidList'

export const useCloseBid = () => {
  return useMutation({
    mutationFn: closeBid,
    onSuccess: (data) => {
      return data
    },
    onError: (error) => {
      console.error(error)
      return 'Hubo un error tratando de cerrar la subasta'
    },
  })
}
