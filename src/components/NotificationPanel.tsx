'use client'
import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { formatDistanceToNow } from 'date-fns'
import { enUS, es } from 'date-fns/locale'
import {
  CheckCheck,
  Eye,
  Package,
  Trash2
} from 'lucide-react'
// import { ScrollArea } from '@/src/components/ui/scroll-area'
import { Separator } from '@/src/components/ui/separator'
import { Notification, useNotifications } from '@/src/hooks/useNotifications'
import { useTranslation } from '@/src/hooks/useTranslation'
import { cn } from '@/src/lib/utils'
import useAuthStore from '@/src/store/authStore'
import { useRouter } from 'next/navigation'

interface NotificationPanelProps {
  onClose: () => void
}

export function NotificationPanel({ onClose }: NotificationPanelProps) {
  const { 
    notifications, 
    unreadCount, 
    isLoading, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification,
    interpolateNotificationMessage,
    interpolateNotificationTitle
  } = useNotifications()
  const { t, getCurrentLanguage } = useTranslation()
  const router = useRouter()

  const dateLocale = getCurrentLanguage() === 'es' ? es : enUS

  // Función para obtener el color del badge según el tipo
  const getNotificationBadgeColor = (type: string) => {
    switch (type) {
      case 'new_offer':
      case 'offer_accepted':
        return 'bg-green-100 text-green-800'
      case 'offer_rejected':
        return 'bg-red-100 text-red-800'
      case 'shipment_expiring':
        return 'bg-yellow-100 text-yellow-800'
      case 'shipment_status_changed':
      case 'deadline_extended':
      case 'deadline_extended_for_agents':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  // Función para manejar clic en notificación
  const handleNotificationClick = (notification: Notification) => {
    // Marcar como leída si no lo está
    if (!notification.read) {
      markAsRead(notification.id)
    }

    // Navegar según el tipo de notificación
    if (notification.shipment_id) {
      const shipmentData = notification.data
      const profile = useAuthStore.getState().profile
      const userRole = profile?.role
      console.log({userRole})

      if (shipmentData?.shipment_uuid) {
        // Cerrar el panel
        onClose()
        
        if (userRole === 'agent') {
          // Para agentes: navegar a offers con offer_id
          const market_id = shipmentData.market_id || profile?.all_markets?.[0]?.id || '4'
          const shipping_type = shipmentData.shipping_type || '1'
          router.push(`/offers?shipment_id=${shipmentData.shipment_uuid}&market_id=${market_id}&shipping_type=${shipping_type}`)
        } else {
          // Fallback por defecto
          router.push(`/detalle?bidId=${shipmentData.shipment_uuid}&market_id=${shipmentData.market_id}`)
        }
      }
    }
  }

  // Función para formatear la fecha relativa
  const formatRelativeTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), {
      addSuffix: true,
      locale: dateLocale
    })
  }

  if (isLoading) {
    return (
      <div className="p-3 sm:p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-4 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full max-w-sm sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl">
      {/* Header */}
      <div className="flex items-center justify-between p-3 sm:p-4 border-b">
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <h3 className="font-semibold text-base sm:text-lg truncate">🔔 {t('notifications.title')}</h3>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs shrink-0">
              {unreadCount} <span className="hidden sm:inline">{t('notifications.newNotifications')}</span>
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-1 shrink-0">
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => markAllAsRead()}
              className="text-xs p-1 sm:p-2"
            >
              <CheckCheck className="h-3 w-3 sm:h-4 sm:w-4 sm:mr-1" />
              <span className="hidden sm:inline">{t('notifications.markAll')}</span>
            </Button>
          )}
        </div>
      </div>

      {/* Lista de notificaciones */}
      <div className="h-64 sm:h-80 md:h-96 overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="p-6 sm:p-8 text-center text-gray-500">
            <Package className="h-8 w-8 sm:h-12 sm:w-12 mx-auto mb-4 text-gray-300" />
            <p className="text-sm">{t('notifications.noNotifications')}</p>
          </div>
        ) : (
          <div className="space-y-0">
            {notifications.map((notification, index) => (
              <div key={notification.id}>
                <div
                  className={cn(
                    "p-3 sm:p-4 hover:bg-gray-50 cursor-pointer transition-colors",
                    !notification.read && "bg-blue-50 border-l-4 border-l-blue-500"
                  )}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex items-start gap-2 sm:gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between mb-1 gap-2">
                        <p className="text-sm font-medium text-gray-900 line-clamp-2 sm:truncate flex-1">
                          {interpolateNotificationTitle(notification)}
                        </p>
                        <div className="flex flex-col sm:flex-row items-end sm:items-center gap-1 sm:gap-2 shrink-0">
                          <span className="text-xs text-gray-500 whitespace-nowrap">
                            {formatRelativeTime(notification.created_at)}
                          </span>
                          {!notification.read && (
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                        {interpolateNotificationMessage(notification)}
                      </p>
                      
                      {/* Datos adicionales según el tipo */}
                      {notification.data && (
                        <div className="flex flex-wrap items-center gap-1 sm:gap-2 mb-2">
                          {notification.data.shipment_uuid && (
                            <Badge 
                              variant="outline" 
                              className={cn("text-xs truncate max-w-[120px] sm:max-w-none", getNotificationBadgeColor(notification.type))}
                              title={notification.data.shipment_uuid}
                            >
                              {notification.data.shipment_uuid}
                            </Badge>
                          )}
                          {notification.data.price && (
                            <Badge variant="outline" className="text-xs whitespace-nowrap">
                              💰 {notification.data.price} {notification.data.currency || 'USD'}
                            </Badge>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex flex-col sm:flex-row items-center gap-1 shrink-0">
                      {!notification.read && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            markAsRead(notification.id)
                          }}
                          className="h-6 w-6 p-0"
                          title={t('notifications.markAsRead')}
                        >
                          <Eye className="h-3 w-3" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation()
                          deleteNotification(notification.id)
                        }}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                        title={t('notifications.delete')}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
                {index < notifications.length - 1 && <Separator />}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 0 && (
        <div className="border-t p-2 sm:p-3 text-center">
          <Button 
            variant="ghost" 
            size="sm" 
            className="text-blue-600 hover:text-blue-800 text-xs sm:text-sm w-full sm:w-auto"
            onClick={() => {
              onClose()
              router.push('/notifications') // Página completa de notificaciones
            }}
          >
            {t('notifications.viewAll')}
          </Button>
        </div>
      )}
    </div>
  )
} 