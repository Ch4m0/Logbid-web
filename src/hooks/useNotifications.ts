'use client'
import { useEffect, useState, useCallback } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/src/utils/supabase/client'
import { toast } from '@/src/components/ui/use-toast'
import useAuthStore from '@/src/store/authStore'
import { useTranslation } from '@/src/hooks/useTranslation'

export interface Notification {
  id: number
  user_id: string
  type: 'new_offer' | 'offer_accepted' | 'offer_rejected' | 'shipment_expiring' | 'shipment_status_changed' | 'deadline_extended' | 'deadline_extended_for_agents' | 'new_shipment' | 'shipment_cancelled'
  title: string
  message: string
  data?: any
  shipment_id?: number
  offer_id?: number
  read: boolean
  created_at: string
  updated_at: string
}

export interface NotificationData {
  shipment_uuid?: string
  agent_code?: string
  price?: string
  currency?: string
  expiration_date?: string
  hours_until_expiration?: number
  origin?: string
  destination?: string
  // Para notificaciones de nuevo shipment
  market_name?: string
  value?: string
  shipping_type?: string
  // Para notificaciones de oferta rechazada
  winningPrice?: string
  // Para notificaciones de cambio de estado
  oldStatus?: string
  newStatus?: string
  offer_uuid?: string
}

// Hook principal para gestionar notificaciones
export const useNotifications = () => {
  const profile = useAuthStore((state) => state.profile)
  const queryClient = useQueryClient()
  const { t } = useTranslation()

  // Obtener todas las notificaciones del usuario
  const {
    data: notifications = [],
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: ['notifications', profile?.auth_id],
    queryFn: async (): Promise<Notification[]> => {
      if (!profile?.auth_id) {
        console.log('❌ QUERY: No hay profile.auth_id para obtener notificaciones')
        return []
      }
      
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', profile.auth_id)
        .order('created_at', { ascending: false })
        .limit(50)

      if (error) {
        console.error('❌ QUERY: Error obteniendo notificaciones:', error)
        throw error
      }
      
      return data || []
    },
    enabled: !!profile?.auth_id,
    refetchOnWindowFocus: true,
    staleTime: 5 * 1000, // Reducido a 5 segundos
    refetchInterval: 30 * 1000, // Reducido a 15 segundos como respaldo,
  })

  // Contar notificaciones no leídas
  const unreadCount = notifications.filter(n => !n.read).length
  
  // Marcar notificación como leída
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications'] })
    }
  })

  // Marcar todas como leídas
  const markAllAsReadMutation = useMutation({
    mutationFn: async () => {
      if (!profile?.auth_id) return
      
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('user_id', profile.auth_id)
        .eq('read', false)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', profile?.auth_id] })
    }
  })

  // Eliminar notificación
  const deleteNotificationMutation = useMutation({
    mutationFn: async (notificationId: number) => {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) throw error
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', profile?.auth_id] })
    }
  })

  // Función para interpolar títulos de notificación
  const interpolateNotificationTitle = useCallback((notification: Notification) => {
    const { type } = notification;
    
    switch (type) {
      case 'new_offer':
        return `🎉 ${t('notifications.toasts.newOfferReceived')}`;
      case 'offer_accepted':
        return `✅ ${t('notifications.toasts.offerAccepted')}`;
      case 'offer_rejected':
        return `❌ ${t('notifications.toasts.offerRejected')}`;
      case 'shipment_expiring':
        return `⏰ ${t('notifications.toasts.shipmentExpiring')}`;
      case 'shipment_status_changed':
        return `🔄 ${t('notifications.toasts.statusUpdated')}`;
      case 'deadline_extended':
        return `📅 ${t('notifications.toasts.deadlineExtended')}`;
      case 'deadline_extended_for_agents':
        return `⏰ ${t('notifications.toasts.deadlineExtendedForAgents')}`;
      case 'new_shipment':
        return `🚢 ${t('notifications.toasts.newShipmentAvailable')}`;
      default:
        return notification.title;
    }
  }, [t]);

  // Función para interpolar mensajes de notificación
  const interpolateNotificationMessage = useCallback((notification: Notification) => {
    const { message, data } = notification;
    
    // Si el mensaje contiene placeholders {{}} (mensajes legacy), interpolarlos
    if (message.includes('{{')) {
      // Función helper para reemplazar variables en el template
      const interpolateTemplate = (template: string, variables: any): string => {
        return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
          return variables[key] || match;
        });
      };

      return interpolateTemplate(message, {
        price: data?.price || '0',
        currency: data?.currency || 'USD',
        origin: data?.origin || '',
        destination: data?.destination || '',
        hours: data?.hours_until_expiration || '0',
        winningPrice: data?.winningPrice || '0',
        oldStatus: data?.oldStatus || '',
        newStatus: data?.newStatus || '',
        statusEmoji: '🔄',
        value: data?.value ? Number(data.value).toLocaleString() : '0',
        shippingType: data?.shipping_type?.toLowerCase() || '',
        marketName: data?.market_name || '',
        cancellationReason: data?.cancellation_reason || ''
      });
    }
    
    // Si no tiene placeholders, usar el mensaje tal como viene (ya interpolado desde el backend)
    return message;
  }, []);

  // Función para mostrar toast basado en el tipo de notificación
  const showNotificationToast = useCallback((notification: Notification) => {
    const getToastConfig = (type: string) => {
      const interpolatedMessage = interpolateNotificationMessage(notification);
      
      switch (type) {
        case 'new_offer':
          return {
            title: interpolateNotificationTitle(notification),
            description: interpolatedMessage,
            variant: 'default' as const,
            duration: 5000
          }
        case 'offer_accepted':
          return {
            title: interpolateNotificationTitle(notification),
            description: interpolatedMessage,
            variant: 'default' as const,
            duration: 5000
          }
        case 'offer_rejected':
          return {
            title: interpolateNotificationTitle(notification),
            description: interpolatedMessage,
            variant: 'destructive' as const,
            duration: 4000
          }
        case 'shipment_expiring':
          return {
            title: interpolateNotificationTitle(notification),
            description: interpolatedMessage,
            variant: 'destructive' as const,
            duration: 6000
          }
        case 'shipment_status_changed':
          return {
            title: interpolateNotificationTitle(notification),
            description: interpolatedMessage,
            variant: 'default' as const,
            duration: 4000
          }
        case 'deadline_extended':
          return {
            title: interpolateNotificationTitle(notification),
            description: interpolatedMessage,
            variant: 'default' as const,
            duration: 4000
          }
        case 'deadline_extended_for_agents':
          return {
            title: interpolateNotificationTitle(notification),
            description: interpolatedMessage,
            variant: 'default' as const,
            duration: 5000
          }
        case 'new_shipment':
          return {
            title: interpolateNotificationTitle(notification),
            description: interpolatedMessage,
            variant: 'default' as const,
            duration: 5000
          }
        default:
          return {
            title: notification.title,
            description: interpolatedMessage,
            variant: 'default' as const,
            duration: 4000
          }
      }
    }

    const config = getToastConfig(notification.type)
    toast(config)
  }, [interpolateNotificationTitle, interpolateNotificationMessage])

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refetch,
    markAsRead: markAsReadMutation.mutate,
    markAllAsRead: markAllAsReadMutation.mutate,
    deleteNotification: deleteNotificationMutation.mutate,
    showNotificationToast,
    interpolateNotificationMessage,
    interpolateNotificationTitle,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    isDeletingNotification: deleteNotificationMutation.isPending
  }
}

// Hook para suscribirse a notificaciones en tiempo real
export const useRealtimeNotifications = () => {
  const profile = useAuthStore((state) => state.profile)
  const queryClient = useQueryClient()
  const { t } = useTranslation()
  const [isConnected, setIsConnected] = useState(false)

  // Función para mostrar toast simplificada
  const showNotificationToast = useCallback((notification: Notification) => {
    console.log('🔄 REALTIME: Nueva notificación', notification.message)
    const getToastConfig = (type: string) => {
      switch (type) {
        case 'new_offer':
          return {
            title: `🎉 ${t('notifications.toasts.newOfferReceived')}`,
            description: notification.message,
            variant: 'default' as const,
            duration: 5000
          }
        case 'offer_accepted':
          return {
            title: `✅ ${t('notifications.toasts.offerAccepted')}`,
            description: notification.message,
            variant: 'default' as const,
            duration: 5000
          }
        case 'offer_rejected':
          return {
            title: `❌ ${t('notifications.toasts.offerRejected')}`,
            description: notification.message,
            variant: 'destructive' as const,
            duration: 4000
          }
        case 'shipment_expiring':
          return {
            title: `⏰ ${t('notifications.toasts.shipmentExpiring')}`,
            description: notification.message,
            variant: 'destructive' as const,
            duration: 6000
          }
        case 'shipment_status_changed':
          return {
            title: `🔄 ${t('notifications.toasts.statusUpdated')}`,
            description: notification.message,
            variant: 'default' as const,
            duration: 4000
          }
        case 'deadline_extended':
          return {
            title: `📅 ${t('notifications.toasts.deadlineExtended')}`,
            description: notification.message,
            variant: 'default' as const,
            duration: 4000
          }
        case 'deadline_extended_for_agents':
          return {
            title: `⏰ ${t('notifications.toasts.deadlineExtendedForAgents')}`,
            description: notification.message,
            variant: 'default' as const,
            duration: 5000
          }
        case 'new_shipment':
          return {
            title: `🚢 ${t('notifications.toasts.newShipmentAvailable')}`,
            description: notification.message,
            variant: 'default' as const,
            duration: 5000
          }
        case 'shipment_cancelled':
          return {
            title: `🚫 ${t('notifications.toasts.shipmentCancelled')}`,
            description: notification.message,
            variant: 'warning' as const,
            duration: 6000
          }
        default:
          return {
            title: notification.title,
            description: notification.message,
            variant: 'default' as const,
            duration: 4000
          }
      }
    }

    const config = getToastConfig(notification.type)
    toast(config as any)
  }, [t])

  useEffect(() => {
    if (!profile?.auth_id) {
      return
    }

    const channel = supabase
      .channel(`notifications-${profile.auth_id}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${profile.auth_id}`
        },
        async (payload) => {
          const newNotification = payload.new as Notification
          
          // Mostrar toast inmediatamente
          try {
            showNotificationToast(newNotification)
          } catch (error) {
            console.error('❌ REALTIME: Error mostrando toast:', error)
          }
          
          // Actualizar la cache de React Query
          queryClient.setQueryData(
            ['notifications', profile.auth_id],
            (oldData: Notification[] | undefined) => {
              if (!oldData) return [newNotification]
              // Verificar si la notificación ya existe para evitar duplicados
              const exists = oldData.some(n => n.id === newNotification.id)
              if (exists) return oldData
              const newData = [newNotification, ...oldData]
              return newData
            }
          )
          
          // Invalidar queries para refrescar datos
          queryClient.invalidateQueries({ queryKey: ['notifications', profile.auth_id] })
        }
      )
      .subscribe((status) => {
        setIsConnected(status === 'SUBSCRIBED')
        
        if (status !== 'SUBSCRIBED') {
          console.error('❌ Error canal notificaciones:', status)
        }
      })

    return () => {
      channel.unsubscribe()
    }
  }, [profile?.auth_id, queryClient, showNotificationToast])

  return { isConnected }
}