import { useMutation } from '@tanstack/react-query'
import { extendExpirationDate } from '../api/importerBidList'

export const useExtendExpirationDate = () => {
  return useMutation({
    mutationFn: extendExpirationDate,
    onSuccess: (data) => {
      // Manejo del éxito (por ejemplo, guardar el usuario en Zustand)
      return data
    },
    onError: (error) => {
      // Manejo del error
      console.error(error)
      return 'Usuario o contrasena incorrecta'
    },
  })
}
