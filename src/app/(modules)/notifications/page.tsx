'use client'
import React, { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import { es, enUS } from 'date-fns/locale'
import { 
  Check, 
  CheckCheck, 
  Trash2, 
  Eye,
  Package,
  DollarSign,
  Clock,
  RotateCcw,
  Calendar,
  X,
  Bell,
  Filter,
  Search
} from 'lucide-react'
import { Button } from '@/src/components/ui/button'
import { Badge } from '@/src/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Input } from '@/src/components/ui/input'
import { Separator } from '@/src/components/ui/separator'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select'
import { useNotifications, Notification } from '@/src/hooks/useNotifications'
import { useTranslation } from '@/src/hooks/useTranslation'
import { cn } from '@/src/lib/utils'
import { useRouter } from 'next/navigation'
import { ProtectedRoute } from '@/src/components/ProtectedRoute'
import useAuthStore from '@/src/store/authStore'
import { RealtimeDebugger } from '@/src/components/RealtimeDebugger'

export default function NotificationsPage() {
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
  const profile = useAuthStore((state) => state.profile)
  
  const [searchQuery, setSearchQuery] = useState('')
  const [typeFilter, setTypeFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const dateLocale = getCurrentLanguage() === 'es' ? es : enUS

  // Función para obtener el icono según el tipo de notificación
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'new_offer':
        return <DollarSign className="h-5 w-5 text-green-600" />
      case 'offer_accepted':
        return <Check className="h-5 w-5 text-green-600" />
      case 'offer_rejected':
        return <X className="h-5 w-5 text-red-600" />
      case 'shipment_expiring':
        return <Clock className="h-5 w-5 text-yellow-600" />
      case 'shipment_status_changed':
        return <RotateCcw className="h-5 w-5 text-blue-600" />
      case 'deadline_extended':
      case 'deadline_extended_for_agents':
        return <Calendar className="h-5 w-5 text-blue-600" />
      case 'new_shipment':
        return <Package className="h-5 w-5 text-purple-600" />
      default:
        return <Package className="h-5 w-5 text-gray-600" />
    }
  }

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
      case 'new_shipment':
        return 'bg-purple-100 text-purple-800'
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
    console.log(notification, 'notification')

    // Navegar según el tipo de notificación
    if (notification.shipment_id) {
      const shipmentData = notification.data
      console.log(profile, 'profile')
      const userRole = profile?.role

      if (shipmentData?.shipment_uuid) {
        if (userRole === 'agent') {
          // Para agentes: navegar a offers con offer_id
          const market_id = shipmentData.market_id || profile?.all_markets?.[0]?.id || '4'
          const shipping_type = shipmentData.shipping_type || 'Marítimo'
          router.push(`/offers?offer_id=${shipmentData.shipment_uuid}&market_id=${market_id}&shipping_type=${shipping_type}`)
        } else {
          // Fallback por defecto
          router.push(`/detalle?offer_id=${shipmentData.shipment_uuid}`)
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

  // Filtrar notificaciones
  const filteredNotifications = notifications.filter(notification => {
    const matchesSearch = notification.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         notification.message.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesType = typeFilter === 'all' || notification.type === typeFilter
    
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'unread' && !notification.read) ||
                         (statusFilter === 'read' && notification.read)
    
    return matchesSearch && matchesType && matchesStatus
  })

  if (isLoading) {
    return (
      <ProtectedRoute allowedRoles={['customer', 'agent']}>
        <div className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-200 rounded w-1/4"></div>
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute allowedRoles={['customer', 'agent']}>
      <RealtimeDebugger />
      <div className="container mx-auto p-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Bell className="h-8 w-8 text-blue-600" />
            <div>
                             <h1 className="text-3xl font-bold tracking-tight">{t('notifications.title')}</h1>
               <p className="text-muted-foreground">
                 {t('notifications.managedAllNotifications')}
               </p>
            </div>
          </div>
          {unreadCount > 0 && (
                         <Badge variant="secondary" className="text-lg px-3 py-1">
               {unreadCount} {t('notifications.unread').toLowerCase()}
             </Badge>
          )}
        </div>

        {/* Filtros y acciones */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
                             <span className="flex items-center gap-2">
                 <Filter className="h-5 w-5" />
                 {t('notifications.filtersAndActions')}
               </span>
              {unreadCount > 0 && (
                <Button
                  onClick={() => markAllAsRead()}
                  variant="outline"
                  size="sm"
                >
                                     <CheckCheck className="h-4 w-4 mr-2" />
                   {t('notifications.markAllAsRead')}
                </Button>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Búsqueda */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                 <Input
                   placeholder={t('notifications.searchPlaceholder')}
                   value={searchQuery}
                   onChange={(e) => setSearchQuery(e.target.value)}
                   className="pl-10"
                 />
              </div>

              {/* Filtro por tipo */}
                             <Select value={typeFilter} onValueChange={setTypeFilter}>
                 <SelectTrigger>
                   <SelectValue placeholder={t('notifications.filterByType')} />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all">{t('notifications.allTypes')}</SelectItem>
                   <SelectItem value="new_offer">{t('notifications.newOffers')}</SelectItem>
                   <SelectItem value="offer_accepted">{t('notifications.offersAccepted')}</SelectItem>
                   <SelectItem value="offer_rejected">{t('notifications.offersRejected')}</SelectItem>
                   <SelectItem value="shipment_expiring">{t('notifications.expiringSoon')}</SelectItem>
                   <SelectItem value="shipment_status_changed">{t('notifications.statusChanged')}</SelectItem>
                   <SelectItem value="deadline_extended">{t('notifications.deadlineExtended')}</SelectItem>
                   <SelectItem value="new_shipment">{t('notifications.newShipments')}</SelectItem>
                 </SelectContent>
               </Select>

              {/* Filtro por estado */}
                             <Select value={statusFilter} onValueChange={setStatusFilter}>
                 <SelectTrigger>
                   <SelectValue placeholder={t('notifications.filterByStatus')} />
                 </SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all">{t('notifications.allStatuses')}</SelectItem>
                   <SelectItem value="unread">{t('notifications.unread')}</SelectItem>
                   <SelectItem value="read">{t('notifications.read')}</SelectItem>
                 </SelectContent>
               </Select>
            </div>
          </CardContent>
        </Card>

        {/* Lista de notificaciones */}
        <Card>
          <CardHeader>
                         <CardTitle>
               {filteredNotifications.length === notifications.length 
                 ? `${notifications.length} ${t('notifications.notificationsCount')}` 
                 : `${filteredNotifications.length} ${t('notifications.of')} ${notifications.length} ${t('notifications.notificationsCount')}`}
             </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            {filteredNotifications.length === 0 ? (
              <div className="p-12 text-center text-gray-500">
                <Bell className="h-16 w-16 mx-auto mb-4 text-gray-300" />
                                 <h3 className="text-lg font-medium mb-2">{t('notifications.noNotifications')}</h3>
                 <p className="text-sm">
                   {searchQuery || typeFilter !== 'all' || statusFilter !== 'all'
                     ? t('notifications.noNotificationsFiltered')
                     : t('notifications.noNotificationsAtMoment')}
                 </p>
              </div>
            ) : (
              <div className="space-y-0">
                {filteredNotifications.map((notification, index) => (
                  <div key={notification.id}>
                    <div
                      className={cn(
                        "p-6 hover:bg-gray-50 cursor-pointer transition-colors",
                        !notification.read && "bg-blue-50 border-l-4 border-l-blue-500"
                      )}
                      onClick={() => handleNotificationClick(notification)}
                    >
                      <div className="flex items-start gap-4">
                        <div className="flex-shrink-0 mt-1">
                          {getNotificationIcon(notification.type)}
                        </div>
                        
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <h3 className="text-lg font-medium text-gray-900">
                              {interpolateNotificationTitle(notification)}
                            </h3>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-gray-500">
                                {formatRelativeTime(notification.created_at)}
                              </span>
                              {!notification.read && (
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                              )}
                            </div>
                          </div>
                          
                                                     <p className="text-gray-600 mb-3">
                             {interpolateNotificationMessage(notification)}
                           </p>
                          
                          {/* Datos adicionales según el tipo */}
                          {notification.data && (
                            <div className="flex items-center gap-2 flex-wrap">
                              {notification.data.shipment_uuid && (
                                <Badge 
                                  variant="outline" 
                                  className={cn("text-sm", getNotificationBadgeColor(notification.type))}
                                >
                                  ID: {notification.data.shipment_uuid}
                                </Badge>
                              )}
                              {notification.data.price && (
                                <Badge variant="outline" className="text-sm">
                                  💰 {notification.data.price} {notification.data.currency || 'USD'}
                                </Badge>
                              )}
                                                             {notification.data.agent_code && (
                                 <Badge variant="outline" className="text-sm">
                                   {t('notifications.agent')}: {notification.data.agent_code}
                                 </Badge>
                               )}
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          {!notification.read && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                markAsRead(notification.id)
                              }}
                              className="h-8 w-8 p-0"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          )}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              deleteNotification(notification.id)
                            }}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                    {index < filteredNotifications.length - 1 && <Separator />}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </ProtectedRoute>
  )
} 