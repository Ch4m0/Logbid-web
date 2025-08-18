'use client'
import React, { createContext, useContext } from 'react'
import { useRealtimeNotifications } from '@/src/hooks/useNotifications'
import { useRealtimeShipments } from '@/src/hooks/useRealtimeShipments'
import useAuthStore from '@/src/store/authStore'

interface NotificationContextType {
  isConnected: boolean
  shipmentsConnected: boolean
}

const NotificationContext = createContext<NotificationContextType>({
  isConnected: false,
  shipmentsConnected: false
})

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, profile } = useAuthStore()
  const { isConnected } = useRealtimeNotifications()
  const { isConnected: shipmentsConnected } = useRealtimeShipments()

  // Activar notificaciones para importadores Y agentes autenticados
  const shouldShowNotifications = isAuthenticated && 
    profile?.role && 
    (profile.role === 'customer' || profile.role === 'agent')

  return (
    <NotificationContext.Provider value={{ isConnected, shipmentsConnected }}>
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotificationContext() {
  const context = useContext(NotificationContext)
  if (!context) {
    throw new Error('useNotificationContext must be used within a NotificationProvider')
  }
  return context
} 