import axios from 'axios'

// Usar Supabase como base en lugar del API externo
const API_BASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://upvqodxyneqlrayrkyst.supabase.co'

export const apiClient = axios.create({
  baseURL: `${API_BASE_URL}/rest/v1`,
  headers: {
    'apikey': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    'Content-Type': 'application/json'
  }
})

// Interceptor para agregar el token de autenticación
apiClient.interceptors.request.use(async (config) => {
  // Si hay un token de Supabase disponible, lo agregamos
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('supabase.auth.token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
  }
  return config
})
