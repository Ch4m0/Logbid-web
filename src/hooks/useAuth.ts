import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { supabase } from '@/src/utils/supabase/client'
import useAuthStore from '@/src/store/authStore'
import { getUserProfileClient } from '@/src/utils/auth-client'
import { useTranslation } from '@/src/hooks/useTranslation'

export type UserRole = 'agent' | 'importer' | 'exporter'

export const useAuth = () => {
  const router = useRouter()
  const { user, profile, setUser, setProfile, logout, isAuthenticated } = useAuthStore()
  const { changeLanguage } = useTranslation()
  const [loading, setLoading] = useState(true)

  // Función para sincronizar el idioma del usuario
  const syncUserLanguage = (userProfile: any) => {
    if (userProfile?.language) {
      changeLanguage(userProfile.language)
      console.log('🌐 Language synchronized:', userProfile.language)
    }
  }

  // Función para cargar el perfil del usuario
  const loadUserProfile = async (userId: string) => {
    console.log('👤 Loading user profile for:', userId)
    const { profile: userProfile, error } = await getUserProfileClient(userId)
    
    if (error) {
      console.error('❌ Error loading user profile:', error)
      return null
    }
    
    if (userProfile) {
      setProfile(userProfile)
      syncUserLanguage(userProfile)
      console.log('✅ User profile loaded and language synchronized')
      return userProfile
    }
    
    return null
  }

  // Verificar la sesión actual - solo si no hay usuario ya cargado
  useEffect(() => {
    // Si ya hay usuario autenticado, no hacer nada
    if (isAuthenticated && user && profile) {
      setLoading(false)
      return
    }

    const checkSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('❌ Error checking session:', error)
          logout()
          setLoading(false)
          return
        }

        if (session?.user) {
          console.log('✅ Active session found:', session.user.id)
          setUser(session.user as any)
          await loadUserProfile(session.user.id)
        } else {
          console.log('ℹ️ No active session')
          logout()
        }
      } catch (error) {
        console.error('💥 Unexpected error checking session:', error)
        logout()
      } finally {
        setLoading(false)
      }
    }

    checkSession()
  }, []) // Solo ejecutar una vez

  // Escuchar cambios de autenticación
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔄 Auth state changed:', event, session?.user?.id)
        
        if (event === 'SIGNED_IN' && session?.user) {
          // Solo cargar perfil si no es el mismo usuario o no hay perfil
          if (!user || String(user.id) !== String(session.user.id) || !profile) {
            setUser(session.user as any)
            await loadUserProfile(session.user.id)
          }
        } else if (event === 'SIGNED_OUT') {
          logout()
        }
        
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [user, profile]) // Dependencias para evitar cargas innecesarias

  // Función de login
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) {
        console.error('❌ Login error:', error)
        return { success: false, error: error.message }
      }

      if (data.user) {
        console.log('✅ Login successful:', data.user.id)
        setUser(data.user as any)
        await loadUserProfile(data.user.id)
        return { success: true, user: data.user }
      }

      return { success: false, error: 'No user returned' }
    } catch (error) {
      console.error('💥 Unexpected login error:', error)
      return { success: false, error: 'Error inesperado durante el login' }
    }
  }

  // Función para actualizar el idioma del usuario
  const updateUserLanguage = async (newLanguage: string) => {
    if (!user?.id || !profile?.id) {
      console.error('❌ Cannot update language: No user or profile')
      return { success: false, error: 'Usuario no autenticado' }
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ language: newLanguage })
        .eq('auth_id', user.id)
        .select()
        .single()

      if (error) {
        console.error('❌ Error updating user language:', error)
        return { success: false, error: error.message }
      }

      // Actualizar el perfil local
      const updatedProfile = { ...profile, language: newLanguage }
      setProfile(updatedProfile)
      
      // Cambiar el idioma de la interfaz
      changeLanguage(newLanguage)
      
      console.log('✅ User language updated:', newLanguage)
      return { success: true, profile: data }
    } catch (error) {
      console.error('💥 Unexpected error updating language:', error)
      return { success: false, error: 'Error inesperado al actualizar idioma' }
    }
  }

  // Función para verificar permisos
  const hasPermission = (requiredRole: UserRole): boolean => {
    if (!profile?.role) return false
    
    const userRole = profile.role
    
    // Mapeo de roles
    if (requiredRole === 'agent' && userRole === 'agent') return true
    if ((requiredRole === 'importer' || requiredRole === 'exporter') && 
        (userRole === 'customer' || userRole === 'admin')) return true
    
    return false
  }

  // Función para obtener el rol mapeado
  const getMappedRole = (): UserRole | null => {
    if (!profile?.role) return null
    
    switch (profile.role) {
      case 'agent':
        return 'agent'
      case 'customer':
      case 'admin':
        return 'importer'
      default:
        return null
    }
  }

  return {
    user,
    profile,
    loading,
    isAuthenticated,
    login,
    logout,
    hasPermission,
    getMappedRole,
    updateUserLanguage,
    loadUserProfile
  }
} 