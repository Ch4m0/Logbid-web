// src/store/authStore.js
import { User } from '@/src/interfaces/Auth.interface'
import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface AuthState {
  user: User | null
  setUser: (user: User) => void
  logout: () => void
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      setUser: (user: User | null) => set({ user }),
      logout: () => set({ user: null }),
    }),
    {
      name: 'logbidd-storage', 
    }
  )
)

export default useAuthStore
