'use client'
import React, { useState } from 'react'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Badge } from '@/src/components/ui/badge'
import { useNotificationContext } from '@/src/components/NotificationProvider'
import { useNotifications } from '@/src/hooks/useNotifications'
import useAuthStore from '@/src/store/authStore'
import { createTestNotifications } from '@/src/utils/testNotifications'

export function RealtimeDebugger() {
  const { isConnected } = useNotificationContext()
  const { notifications, unreadCount, refetch } = useNotifications()
  const profile = useAuthStore((state) => state.profile)
  const [isCreatingTest, setIsCreatingTest] = useState(false)

  const handleCreateTestNotifications = async () => {
    if (!profile?.id) {
      alert('No hay usuario autenticado')
      return
    }

    setIsCreatingTest(true)
    try {
      await createTestNotifications(profile.id)
      alert('Notificaciones de prueba creadas')
      refetch()
    } catch (error) {
      console.error('Error creando notificaciones de prueba:', error)
      alert('Error creando notificaciones de prueba')
    } finally {
      setIsCreatingTest(false)
    }
  }

  return (
    <Card className="m-4">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          🔧 Realtime Debugger
          <Badge variant={isConnected ? 'default' : 'destructive'}>
            {isConnected ? 'Conectado' : 'Desconectado'}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <h4 className="font-medium">Estado de Conexión</h4>
            <p className="text-sm text-muted-foreground">
              Realtime: {isConnected ? '✅ Conectado' : '❌ Desconectado'}
            </p>
          </div>
          
          <div>
            <h4 className="font-medium">Usuario Actual</h4>
            <p className="text-sm text-muted-foreground">
              {profile?.email || 'No autenticado'}
            </p>
            <p className="text-sm text-muted-foreground">
              Role: {profile?.role || 'N/A'}
            </p>
          </div>

          <div>
            <h4 className="font-medium">Notificaciones</h4>
            <p className="text-sm text-muted-foreground">
              Total: {notifications.length}
            </p>
            <p className="text-sm text-muted-foreground">
              No leídas: {unreadCount}
            </p>
          </div>

          <div>
            <h4 className="font-medium">Última Actualización</h4>
            <p className="text-sm text-muted-foreground">
              {notifications[0]?.created_at ? new Date(notifications[0].created_at).toLocaleTimeString() : 'N/A'}
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <Button 
            onClick={() => refetch()}
            variant="outline"
            size="sm"
          >
            🔄 Refetch Notificaciones
          </Button>
          
          <Button 
            onClick={handleCreateTestNotifications}
            variant="outline"
            size="sm"
            disabled={isCreatingTest || !profile?.id}
          >
            {isCreatingTest ? '⏳ Creando...' : '🧪 Crear Notificaciones de Prueba'}
          </Button>
        </div>

        {notifications.length > 0 && (
          <div>
            <h4 className="font-medium mb-2">Últimas 3 Notificaciones</h4>
            <div className="space-y-2">
              {notifications.slice(0, 3).map((notification) => (
                <div key={notification.id} className="text-xs p-2 bg-gray-50 rounded">
                  <div className="flex justify-between">
                    <span className="font-medium">{notification.type}</span>
                    <span className={notification.read ? 'text-gray-500' : 'text-blue-600'}>
                      {notification.read ? 'Leída' : 'No leída'}
                    </span>
                  </div>
                  <div className="text-gray-600">{notification.title}</div>
                  <div className="text-gray-500">{new Date(notification.created_at).toLocaleString()}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 