import { createNotification } from '@/src/utils/notificationHelpers'

// Función para crear notificaciones de prueba
export async function createTestNotifications(userId: string) {
  try {
    console.log('🧪 Creando notificaciones de prueba para:', userId)

    // Nueva oferta
    await createNotification({
      user_id: userId,
      type: 'new_offer',
      title: '🎉 ¡Nueva oferta recibida!',
      message: 'Recibiste una nueva oferta de $2,450 USD para tu envío Colombia - Cartagena → Estados Unidos - Miami',
      data: {
        shipment_uuid: 'ENV-001',
        agent_code: 'AG-456',
        price: '2450',
        currency: 'USD',
        origin: 'Colombia - Cartagena',
        destination: 'Estados Unidos - Miami'
      },
      shipment_id: 1
    })

    // Shipment próximo a expirar
    await createNotification({
      user_id: userId,
      type: 'shipment_expiring',
      title: '⏰ Shipment próximo a expirar',
      message: 'Tu envío Colombia - Bogotá → España - Madrid expira en 23 horas. Considera extender la fecha límite.',
      data: {
        shipment_uuid: 'ENV-003',
        expiration_date: new Date(Date.now() + 23 * 60 * 60 * 1000).toISOString(),
        hours_until_expiration: 23,
        origin: 'Colombia - Bogotá',
        destination: 'España - Madrid'
      },
      shipment_id: 3
    })

    // Oferta aceptada (solo para agentes - este es un ejemplo)
    await createNotification({
      user_id: userId,
      type: 'offer_accepted',
      title: '🎉 ¡Tu oferta fue aceptada!',
      message: '¡Felicidades! Tu oferta de $1,890 USD fue aceptada para el envío Colombia - Medellín → Estados Unidos - Los Angeles',
      data: {
        shipment_uuid: 'ENV-002',
        agent_code: 'AG-789',
        price: '1890',
        currency: 'USD',
        origin: 'Colombia - Medellín',
        destination: 'Estados Unidos - Los Angeles'
      },
      shipment_id: 2,
      offer_id: 5
    })

    // Oferta rechazada (solo para agentes - este es un ejemplo)
    await createNotification({
      user_id: userId,
      type: 'offer_rejected',
      title: '❌ Tu oferta no fue seleccionada',
      message: 'Tu oferta de $2,100 USD no fue seleccionada para el envío Colombia - Medellín → Estados Unidos - Los Angeles. La oferta ganadora fue de $1,890 USD',
      data: {
        shipment_uuid: 'ENV-002',
        agent_code: 'AG-456',
        price: '2100',
        currency: 'USD',
        origin: 'Colombia - Medellín',
        destination: 'Estados Unidos - Los Angeles'
      },
      shipment_id: 2,
      offer_id: 6
    })

    // Deadline extendido
    await createNotification({
      user_id: userId,
      type: 'deadline_extended',
      title: '📅 Fecha límite extendida',
      message: 'La fecha límite de tu envío Colombia - Cali → Francia - París se extendió exitosamente',
      data: {
        shipment_uuid: 'ENV-004',
        expiration_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        origin: 'Colombia - Cali',
        destination: 'Francia - París'
      },
      shipment_id: 4
    })

    // Cambio de estado
    await createNotification({
      user_id: userId,
      type: 'shipment_status_changed',
      title: '🔄 Estado actualizado',
      message: 'Tu envío Colombia - Barranquilla → Alemania - Hamburgo cambió de Active a ✅ Closed',
      data: {
        shipment_uuid: 'ENV-005',
        origin: 'Colombia - Barranquilla',
        destination: 'Alemania - Hamburgo'
      },
      shipment_id: 5
    })

    // Nuevo shipment disponible (para agentes)
    await createNotification({
      user_id: userId,
      type: 'new_shipment',
      title: '🚢 ¡Nuevo shipment disponible!',
      message: 'Nuevo marítimo disponible en Mercado Norte: Colombia - Santa Marta → Estados Unidos - New York ($15,400 USD)',
      data: {
        shipment_uuid: 'ENV-006',
        market_name: 'Mercado Norte',
        value: '15400',
        currency: 'USD',
        shipping_type: 'Marítimo',
        origin: 'Colombia - Santa Marta',
        destination: 'Estados Unidos - New York',
        expiration_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString()
      },
      shipment_id: 6
    })

    console.log('✅ Notificaciones de prueba creadas exitosamente')
    return { success: true, message: '7 notificaciones de prueba creadas' }
  } catch (error) {
    console.error('❌ Error creando notificaciones de prueba:', error)
    throw error
  }
}

// Función para limpiar notificaciones de prueba
export async function clearTestNotifications(userId: string) {
  try {
    const { supabase } = await import('@/src/utils/supabase/client')
    
    const { error } = await supabase
      .from('notifications')
      .delete()
      .eq('user_id', userId)
      .in('data->shipment_uuid', ['ENV-001', 'ENV-002', 'ENV-003', 'ENV-004', 'ENV-005', 'ENV-006'])

    if (error) throw error

    console.log('🧹 Notificaciones de prueba eliminadas')
    return { success: true, message: 'Notificaciones de prueba eliminadas' }
  } catch (error) {
    console.error('❌ Error eliminando notificaciones de prueba:', error)
    throw error
  }
} 