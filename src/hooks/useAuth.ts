import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/src/utils/supabase/client'
import useAuthStore from '@/src/store/authStore'
import { getUserProfileClient } from '@/src/utils/auth-client'

export const useAuth = () => {
  const router = useRouter()
  const { user, profile, setUser, setProfile, logout, isAuthenticated } = useAuthStore()

  // Función para obtener y establecer el perfil del usuario
  const fetchAndSetProfile = async (userId: string) => {
    console.log('🔍 Fetching profile for user:', userId)
    const { profile: userProfile, error } = await getUserProfileClient(userId)
    
    if (userProfile && !error) {
      setProfile(userProfile)
    } else {
      console.warn('⚠️ Could not fetch user profile:', error)
    }
  }

  useEffect(() => {
    // Obtener la sesión inicial
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      
      if (session?.user) {
        console.log('🔄 Setting initial user from session')
        setUser(session.user as any)
        
        // Obtener perfil del usuario
        await fetchAndSetProfile(session.user.id)
      }
    }

    getInitialSession()

    // Escuchar cambios en la autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.id)
        
        if (event === 'SIGNED_IN' && session?.user) {
          setUser(session.user as any)
          // Obtener perfil del usuario recién logueado
          await fetchAndSetProfile(session.user.id)
        } else if (event === 'SIGNED_OUT') {
          logout()
          router.push('/auth')
        }
      }
    )

    return () => {
      subscription.unsubscribe()
    }
  }, [setUser, setProfile, logout, router])

  return {
    user,
    profile,
    isAuthenticated,
    logout: async () => {
      await supabase.auth.signOut()
    },
    refreshProfile: async () => {
      if (user?.id) {
        await fetchAndSetProfile(String(user.id))
      }
    }
  }
} 