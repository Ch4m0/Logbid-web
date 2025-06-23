'use client'
import { Globe } from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import { useTranslation } from '@/src/hooks/useTranslation'
import useAuthStore from '@/src/store/authStore'
import { useState, useEffect } from 'react'

const languages = [
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Español', flag: '🇪🇸' }
]

export function LanguageSelector() {
  const { changeLanguage, getCurrentLanguage, t } = useTranslation()
  // Solo usar el store sin ejecutar el hook completo
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const user = useAuthStore((state) => state.user)
  const profile = useAuthStore((state) => state.profile)
  const setProfile = useAuthStore((state) => state.setProfile)
  const [isUpdating, setIsUpdating] = useState(false)
  const [hasInitialized, setHasInitialized] = useState(false)
  
  // Sincronizar el idioma del perfil del usuario al cargar
  useEffect(() => {
    if (isAuthenticated && profile?.language && !hasInitialized) {
      const userLanguage = profile.language
      const currentLanguage = getCurrentLanguage()
      
      // Si el idioma del perfil es diferente al actual, sincronizar
      if (userLanguage !== currentLanguage) {
        changeLanguage(userLanguage)
        localStorage.setItem('logbid-language', userLanguage)
      }
      
      setHasInitialized(true)
    }
  }, [isAuthenticated, profile?.language, getCurrentLanguage, changeLanguage, hasInitialized])
  
  const currentLang = languages.find(lang => lang.code === getCurrentLanguage()) || languages[0]

  const handleLanguageChange = async (languageCode: string) => {
    // Forzar una actualización del estado para provocar re-render
    setIsUpdating(true)
    
    // Limpiar el cache del localStorage para forzar la recarga
    localStorage.setItem('logbid-language', languageCode)
    
    // Cambiar el idioma inmediatamente en la interfaz
    changeLanguage(languageCode)
    
    // Resetear la bandera de inicialización para permitir futuros cambios automáticos
    setHasInitialized(false)
    
    // Para el inglés, forzar específicamente 'en' en lugar de variantes regionales
    if (languageCode === 'en') {
      // Forzar explícitamente el cambio a inglés base
      setTimeout(() => {
        changeLanguage('en')
      }, 100)
    }
    
    // Si el usuario está autenticado, actualizar también en la base de datos
    if (isAuthenticated && user?.id && profile?.id) {
      try {
        // Implementación directa sin usar el hook useAuth
        const { supabase } = await import('@/src/utils/supabase/client')
        const { data, error } = await supabase
          .from('profiles')
          .update({ language: languageCode })
          .eq('auth_id', user.id)
          .select()
          .single()

        if (error) {
          console.error('❌ Error updating user language:', error)
        } else {
          // Actualizar el perfil local
          const updatedProfile = { ...profile, language: languageCode }
          setProfile(updatedProfile)
        }
      } catch (error) {
        console.error('💥 Unexpected error updating language preference:', error)
      }
    }
    
    // Force a small delay to ensure language change is processed
    setTimeout(() => {
      setIsUpdating(false)
    }, 200)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm" 
          className="flex items-center gap-2"
          disabled={isUpdating}
        >
          <Globe className={`h-4 w-4 ${isUpdating ? 'animate-spin' : ''}`} />
          <span className="text-lg">{currentLang.flag}</span>
          <span className="hidden sm:inline">{currentLang.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {languages.map((language) => (
          <DropdownMenuItem
            key={language.code}
            onClick={() => handleLanguageChange(language.code)}
            className="flex items-center gap-2 cursor-pointer"
            disabled={isUpdating}
          >
            <span className="text-lg">{language.flag}</span>
            <span>{language.name}</span>
            {getCurrentLanguage() === language.code && (
              <span className="ml-auto text-primary">✓</span>
            )}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
} 