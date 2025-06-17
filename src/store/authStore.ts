// src/store/authStore.js
import { User } from '@/src/interfaces/Auth.interface'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface Market {
  id: number
  name: string
  created_at: string
  updated_at: string
}

interface Company {
  id: number
  name: string
  created_at: string
  updated_at: string
}

interface UserProfile {
  id: number
  uuid: string
  email: string
  name?: string
  last_name?: string
  id_number?: string
  company_name?: string
  role_id?: any // user_role type
  company_id?: number
  inserted_at: string
  updated_at: string
  auth_id: string
  // Relaciones
  all_markets?: Market[]
  company?: Company | null
}

interface AuthUser extends User {
  profile?: UserProfile | null
}

interface AuthState {
  user: AuthUser | null
  profile: UserProfile | null
  setUser: (user: AuthUser) => void
  setProfile: (profile: UserProfile) => void
  logout: () => void
  isAuthenticated: boolean
}

const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      profile: null,
      isAuthenticated: false,
      setUser: (user: AuthUser) => {
        console.log('🔄 Setting user in store:', user)
        set({ 
          user, 
          profile: user.profile || null,
          isAuthenticated: !!user 
        })
      },
      setProfile: (profile: UserProfile) => {
        console.log('🔄 Setting profile in store:', profile)
        const currentUser = get().user
        set({ 
          profile,
          user: currentUser ? { ...currentUser, profile } : null
        })
      },
      logout: () => {
        console.log('🚪 Clearing auth store')
        set({ 
          user: null, 
          profile: null,
          isAuthenticated: false 
        })
      },
    }),
    {
      name: 'logbidd-storage',
      // Solo persistir datos esenciales
      partialize: (state) => ({
        user: state.user,
        profile: state.profile,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
)

export default useAuthStore
