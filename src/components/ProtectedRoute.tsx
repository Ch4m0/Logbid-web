'use client'

import { UserRole } from '@/src/hooks/useAuth'
import useAuthStore from '@/src/store/authStore'
import { useRouter } from 'next/navigation'
import { useEffect, ReactNode, useState, useCallback } from 'react'

interface ProtectedRouteProps {
  children: ReactNode
  allowedRoles: UserRole[]
  fallbackRoute?: string
}

export function ProtectedRoute({ 
  children, 
  allowedRoles, 
  fallbackRoute = '/auth' 
}: ProtectedRouteProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const profile = useAuthStore((state) => state.profile)
  const router = useRouter()
  
  // Estado local para manejar la carga inicial y hidratación
  const [isLoading, setIsLoading] = useState(true)
  const [hasInitialized, setHasInitialized] = useState(false)

  // Función estable para obtener el rol mapeado usando useCallback
  const getMappedRole = useCallback((): UserRole | null => {
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
  }, [profile?.role])

  // Efecto para manejar la inicialización y permitir hidratación
  useEffect(() => {
    // Dar tiempo para que Zustand se hidrate desde localStorage
    const initializationTimer = setTimeout(() => {
      setHasInitialized(true)
      setIsLoading(false)
    }, 100) // Pequeño delay para permitir hidratación

    return () => clearTimeout(initializationTimer)
  }, [])

  // Efecto principal para manejar redirecciones, solo después de la inicialización
  useEffect(() => {
    if (!hasInitialized || isLoading) {
      return // No hacer nada hasta que se complete la inicialización
    }

    // Si no está autenticado, redirigir a la página de autenticación
    if (!isAuthenticated) {
      router.push(fallbackRoute)
      return
    }

    // Si está autenticado, verificar el rol
    const userRole = getMappedRole()
    if (userRole && !allowedRoles.includes(userRole)) {
      // Redirigir según el rol del usuario
      if (userRole === 'agent') {
        router.push('/graphics')
      } else if (userRole === 'importer') {
        router.push('/graphics')
      } else {
        router.push(fallbackRoute)
      }
    }
  }, [isAuthenticated, getMappedRole, allowedRoles, router, fallbackRoute, hasInitialized, isLoading])

  // Mostrar loading mientras se inicializa o se verifica la autenticación
  if (isLoading || !hasInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  // Si no está autenticado, no mostrar nada (se redirigirá)
  if (!isAuthenticated) {
    return null
  }

  // Verificar el rol
  const userRole = getMappedRole()
  if (!userRole || !allowedRoles.includes(userRole)) {
    return null
  }

  return <>{children}</>
}

// Hook para verificar si el usuario puede acceder a una ruta
export function useCanAccessRoute(allowedRoles: UserRole[]): boolean {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)
  const profile = useAuthStore((state) => state.profile)

  if (!isAuthenticated) return false

  // Función local para obtener el rol mapeado
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

  const userRole = getMappedRole()
  return userRole ? allowedRoles.includes(userRole) : false
} 