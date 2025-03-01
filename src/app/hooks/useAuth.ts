// src/hooks/useAuth.js
import { useMutation } from '@tanstack/react-query'
import { loginUser } from '../api/auth'

export const useAuth = () => {
  return useMutation({
    mutationFn: loginUser,
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
