// src/api/auth.ts
import { apiClient } from './apiClient'

interface Credential {
  email: string
  password: string
}

export const loginUser = async ({ email, password }: Credential) => {
  console.log(email, password, 'entroo')
  const response = await apiClient.post(`/auth/login`, {
    email,
    password,
  })
  return response.data
}

// Otras funciones relacionadas con la autenticación, si las tienes
