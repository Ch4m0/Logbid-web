'use client'
import { useEffect, useState } from 'react'
import { supabase } from '@/src/utils/supabase/client'
import { Badge } from '@/src/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import useAuthStore from '@/src/store/authStore'

export function RealtimeTest() {
  const [isConnected, setIsConnected] = useState(false)
  const [events, setEvents] = useState<any[]>([])
  const [connectionAttempts, setConnectionAttempts] = useState(0)
  const profile = useAuthStore((state) => state.profile)

  useEffect(() => {
    console.log('🧪 REALTIME TEST: Iniciando prueba de conexión...', {
      profileId: profile?.id,
      authId: profile?.auth_id
    })

    if (!profile?.id || !profile?.auth_id) {
      console.warn('🧪 REALTIME TEST: Usuario no autenticado completamente')
      return
    }

    setConnectionAttempts(prev => prev + 1)
    
    // Mismo delay que el hook principal
    const timer = setTimeout(() => {
      const channelName = `test-shipments-${Date.now()}`
      console.log('🧪 REALTIME TEST: Creando canal:', channelName)

      const channel = supabase
        .channel(channelName)
        .on(
          'postgres_changes',
          {
            event: '*', // Escuchar todos los eventos
            schema: 'public',
            table: 'shipments'
          },
          (payload) => {
            console.log('🧪 REALTIME TEST: Evento detectado!', payload)
            setEvents(prev => [
              {
                event: payload.eventType,
                timestamp: new Date().toLocaleTimeString(),
                data: payload.new || payload.old,
                attempt: connectionAttempts
              },
              ...prev.slice(0, 4) // Mantener solo los últimos 5 eventos
            ])
          }
        )
        .subscribe((status) => {
          console.log('🧪 REALTIME TEST: Status:', status)
          setIsConnected(status === 'SUBSCRIBED')
          
          if (status === 'SUBSCRIBED') {
            console.log('✅ REALTIME TEST: Conectado exitosamente')
          } else if (status === 'CHANNEL_ERROR') {
            console.error('❌ REALTIME TEST: Error en canal')
          } else if (status === 'TIMED_OUT') {
            console.error('⏰ REALTIME TEST: Timeout')
          } else if (status === 'CLOSED') {
            console.warn('🔒 REALTIME TEST: Canal cerrado')
          }
        })

      return () => {
        console.log('🧪 REALTIME TEST: Limpiando canal de prueba...', channelName)
        supabase.removeChannel(channel)
      }
    }, 1000) // Mismo delay que el hook principal

    return () => {
      clearTimeout(timer)
    }
  }, [profile?.id, profile?.auth_id])

  return (
    <Card className="w-full max-w-md mb-4">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <span>Realtime Test</span>
          <Badge variant={isConnected ? "default" : "destructive"}>
            {isConnected ? "Conectado" : "Desconectado"}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <div className="text-sm">
            <div>Estado: {isConnected ? "✅ Listo" : "❌ Sin conexión"}</div>
            <div>Intentos: {connectionAttempts}</div>
            <div>Usuario: {profile?.id ? "✅ Autenticado" : "❌ No autenticado"}</div>
          </div>
          
          {events.length > 0 && (
            <div className="space-y-1">
              <p className="text-sm font-medium">Eventos recientes:</p>
              {events.map((event, index) => (
                <div key={index} className="text-xs bg-muted p-2 rounded">
                  <div className="font-medium">{event.event} - {event.timestamp}</div>
                  <div className="text-muted-foreground">
                    UUID: {event.data?.uuid?.substring(0, 8)}... (Intento #{event.attempt})
                  </div>
                </div>
              ))}
            </div>
          )}
          
          {events.length === 0 && isConnected && (
            <p className="text-xs text-muted-foreground">
              Esperando eventos de shipments...
            </p>
          )}

          {!isConnected && (
            <p className="text-xs text-red-600">
              Verifique la consola para detalles del error
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  )
} 