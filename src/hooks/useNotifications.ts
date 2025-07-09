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
  type: 'new_offer' | 'offer_accepted' | 'offer_rejected' | 'shipment_expiring' | 'shipment_status_changed' | 'deadline_extended' | 'deadline_extended_for_agents' | 'new_shipment'
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
    const { type, data, message } = notification;
    
    // Si el mensaje original ya no contiene texto hardcodeado español típico, usarlo tal como está
    // Esto es para compatibilidad con notificaciones futuras que ya vengan con claves de traducción
    const spanishIndicators = [
      'Recibiste una nueva', 
      'Tu oferta de', 
      'Nuevo aéreo', 
      'Nuevo marítimo', 
      'Tu envío', 
      'La fecha límite de',
      '¡Felicidades!',
      'expira en',
      'cambió de',
      'no fue seleccionada'
    ];
    const hasSpanishText = spanishIndicators.some(indicator => message.includes(indicator));
    
    // Si no tiene texto en español hardcodeado, probablemente ya está bien formateado
    if (!hasSpanishText && !message.includes('{{')) {
      return message;
    }
    
    // Función helper para reemplazar variables en el template
    const interpolateTemplate = (template: string, variables: any): string => {
      return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
        return variables[key] || match;
      });
    };

    try {
      switch (type) {
        case 'new_offer':
          return interpolateTemplate(t('notifications.messages.newOfferReceived'), {
            price: data?.price || '0',
            currency: data?.currency || 'USD',
            origin: data?.origin || '',
            destination: data?.destination || ''
          });

        case 'offer_accepted':
          return interpolateTemplate(t('notifications.messages.offerAccepted'), {
            price: data?.price || '0',
            currency: data?.currency || 'USD',
            origin: data?.origin || '',
            destination: data?.destination || ''
          });

        case 'offer_rejected':
          return interpolateTemplate(t('notifications.messages.offerRejected'), {
            price: data?.price || '0',
            currency: data?.currency || 'USD',
            origin: data?.origin || '',
            destination: data?.destination || '',
            winningPrice: data?.winningPrice || '0'
          });

        case 'shipment_expiring':
          return interpolateTemplate(t('notifications.messages.shipmentExpiring'), {
            origin: data?.origin || '',
            destination: data?.destination || '',
            hours: data?.hours_until_expiration || '0'
          });

        case 'shipment_status_changed':
          const getStatusEmoji = (status: string) => {
            switch (status) {
              case 'Active': return '🟢'
              case 'Closed': return '✅'
              case 'Offering': return '📋'
              default: return '🔄'
            }
          };
          return interpolateTemplate(t('notifications.messages.statusUpdated'), {
            origin: data?.origin || '',
            destination: data?.destination || '',
            oldStatus: data?.oldStatus || '',
            newStatus: data?.newStatus || '',
            statusEmoji: getStatusEmoji(data?.newStatus || '')
          });

        case 'deadline_extended':
          // Si no hay datos de origin/destination, intentar extraer del mensaje original
          let origin = data?.origin || '';
          let destination = data?.destination || '';
          
          if (!origin || !destination) {
            // Intentar extraer del mensaje original: "La fecha límite de tu envío ORIGIN → DESTINATION se extendió exitosamente"
            const routeMatch = message.match(/envío (.+?) → (.+?) se extendió/);
            if (routeMatch) {
              origin = routeMatch[1] || '';
              destination = routeMatch[2] || '';
            }
          }
          
          return interpolateTemplate(t('notifications.messages.deadlineExtended'), {
            origin,
            destination
          });

        case 'deadline_extended_for_agents':
          return interpolateTemplate(t('notifications.messages.deadlineExtendedForAgents'), {
            origin: data?.origin || '',
            destination: data?.destination || '',
            value: data?.value ? Number(data.value).toLocaleString() : '0',
            currency: data?.currency || 'USD'
          });

        case 'new_shipment':
          return interpolateTemplate(t('notifications.messages.newShipmentAvailable'), {
            shippingType: data?.shipping_type?.toLowerCase() || '',
            marketName: data?.market_name || '',
            origin: data?.origin || '',
            destination: data?.destination || '',
            value: data?.value ? Number(data.value).toLocaleString() : '0',
            currency: data?.currency || 'USD'
          });

        default:
          return notification.message;
      }
    } catch (error) {
      console.error('Error interpolating notification message:', error);
      return notification.message; // Fallback al mensaje original
    }
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
  }, [t, interpolateNotificationTitle, interpolateNotificationMessage])

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
  const { showNotificationToast } = useNotifications()
  const [isConnected, setIsConnected] = useState(false)
  const [retryCount, setRetryCount] = useState(0)
  const maxRetries = 3

  useEffect(() => {
    if (!profile?.auth_id) {
      return
    }


    const setupChannel = () => {
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
            
            // Actualizar la cache de React Query INMEDIATAMENTE
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
            
            // Forzar refetch inmediato
            await queryClient.refetchQueries({ queryKey: ['notifications', profile.auth_id] })
          }
        )
        .subscribe((status) => {
          
          if (status === 'SUBSCRIBED') {
            setIsConnected(true)
            setRetryCount(0)
          } else if (status === 'CHANNEL_ERROR') {
            handleReconnect()
          } else if (status === 'TIMED_OUT') {
            handleReconnect()
          }
        })

      return channel
    }

    const handleReconnect = () => {
      if (retryCount < maxRetries) {
        setRetryCount(prev => prev + 1)
        const timeoutId = setTimeout(() => {
          channel = setupChannel()
        }, 2000 * Math.pow(2, retryCount)) // Backoff exponencial
        return () => clearTimeout(timeoutId)
      } else {
        setIsConnected(false)
      }
    }

    let channel = setupChannel()

    // Cleanup
    return () => {
      supabase.removeChannel(channel)
      setIsConnected(false)
      setRetryCount(0)
    }
  }, [profile?.auth_id, queryClient, showNotificationToast, retryCount])

  return { isConnected }
}