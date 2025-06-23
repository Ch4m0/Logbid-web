import { supabase } from '@/src/utils/supabase/client'
import { NotificationData } from '@/src/hooks/useNotifications'

export interface CreateNotificationParams {
  user_id: string
  type: 'new_offer' | 'offer_accepted' | 'offer_rejected' | 'shipment_expiring' | 'shipment_status_changed' | 'deadline_extended' | 'new_shipment'
  title: string
  message: string
  data?: NotificationData
  shipment_id?: number
  offer_id?: number
}

// Función principal para crear notificaciones
export async function createNotification(params: CreateNotificationParams) {
  try {
    console.log('📨 NOTIF: Creando notificación para:', params.user_id, params.type)
    
    // Insert directo (RLS temporalmente deshabilitado)
    const { data, error } = await supabase
      .from('notifications')
      .insert({
        user_id: params.user_id,
        type: params.type,
        title: params.title,
        message: params.message,
        data: params.data || null,
        shipment_id: params.shipment_id || null,
        offer_id: params.offer_id || null,
        read: false
      })
      .select()

    if (error) {
      console.error('❌ NOTIF: Error creando notificación:', error)
      throw error
    }

    console.log('✅ NOTIF: Notificación creada exitosamente')
    return data
  } catch (error) {
    console.error('💥 NOTIF: Error inesperado:', error)
    throw error
  }
}

// Función específica: Nueva oferta recibida
export async function createNewOfferNotification(
  importerUserId: string,
  shipmentData: {
    uuid: string
    origin: string
    destination: string
    shipping_type: string
  },
  offerData: {
    id: number
    price: string
    currency: string
    agent_code: string
  }
) {
  return createNotification({
    user_id: importerUserId.toString(), // Asegurar que sea string
    type: 'new_offer',
    title: '🎉 ¡Nueva oferta recibida!',
    message: `Recibiste una nueva oferta de $${offerData.price} ${offerData.currency} para tu envío ${shipmentData.origin} → ${shipmentData.destination}`,
    data: {
      shipment_uuid: shipmentData.uuid,
      agent_code: offerData.agent_code,
      price: offerData.price,
      currency: offerData.currency,
      origin: shipmentData.origin,
      destination: shipmentData.destination
    },
    shipment_id: parseInt(shipmentData.uuid.split('-')[0]) || undefined,
    offer_id: offerData.id
  })
}

// Función específica: Oferta aceptada (para el AGENTE ganador)
export async function createOfferAcceptedNotification(
  agentUserId: string,
  shipmentData: {
    uuid: string
    origin: string
    destination: string
  },
  offerData: {
    id: number
    price: string
    currency: string
    agent_code: string
  }
) {
  return createNotification({
    user_id: agentUserId,
    type: 'offer_accepted',
    title: '🎉 ¡Tu oferta fue aceptada!',
    message: `¡Felicidades! Tu oferta de $${offerData.price} ${offerData.currency} fue aceptada para el envío ${shipmentData.origin} → ${shipmentData.destination}`,
    data: {
      shipment_uuid: shipmentData.uuid,
      agent_code: offerData.agent_code,
      price: offerData.price,
      currency: offerData.currency,
      origin: shipmentData.origin,
      destination: shipmentData.destination
    },
    shipment_id: parseInt(shipmentData.uuid.split('-')[0]) || undefined,
    offer_id: offerData.id
  })
}

// Función específica: Oferta rechazada (para otros AGENTES)
export async function createOfferRejectedNotification(
  agentUserId: string,
  shipmentData: {
    uuid: string
    origin: string
    destination: string
  },
  offerData: {
    id: number
    price: string
    currency: string
    agent_code: string
  },
  winningPrice: string
) {
  return createNotification({
    user_id: agentUserId,
    type: 'offer_rejected',
    title: '❌ Tu oferta no fue seleccionada',
    message: `Tu oferta de $${offerData.price} ${offerData.currency} no fue seleccionada para el envío ${shipmentData.origin} → ${shipmentData.destination}. La oferta ganadora fue de $${winningPrice} ${offerData.currency}`,
    data: {
      shipment_uuid: shipmentData.uuid,
      agent_code: offerData.agent_code,
      price: offerData.price,
      currency: offerData.currency,
      origin: shipmentData.origin,
      destination: shipmentData.destination,
      winningPrice: winningPrice
    },
    shipment_id: parseInt(shipmentData.uuid.split('-')[0]) || undefined,
    offer_id: offerData.id
  })
}

// Función específica: Shipment próximo a expirar
export async function createShipmentExpiringNotification(
  importerUserId: string,
  shipmentData: {
    uuid: string
    origin: string
    destination: string
    expiration_date: string
  },
  hoursUntilExpiration: number
) {
  return createNotification({
    user_id: importerUserId,
    type: 'shipment_expiring',
    title: '⏰ Shipment próximo a expirar',
    message: `Tu envío ${shipmentData.origin} → ${shipmentData.destination} expira en ${hoursUntilExpiration} horas. Considera extender la fecha límite.`,
    data: {
      shipment_uuid: shipmentData.uuid,
      expiration_date: shipmentData.expiration_date,
      hours_until_expiration: hoursUntilExpiration,
      origin: shipmentData.origin,
      destination: shipmentData.destination
    },
    shipment_id: parseInt(shipmentData.uuid.split('-')[0]) || undefined
  })
}

// Función específica: Cambio de estado del shipment
export async function createShipmentStatusChangedNotification(
  importerUserId: string,
  shipmentData: {
    uuid: string
    origin: string
    destination: string
  },
  oldStatus: string,
  newStatus: string
) {
  const getStatusEmoji = (status: string) => {
    switch (status) {
      case 'Active': return '🟢'
      case 'Closed': return '✅'
      case 'Offering': return '📋'
      default: return '🔄'
    }
  }

  return createNotification({
    user_id: importerUserId,
    type: 'shipment_status_changed',
    title: '🔄 Estado actualizado',
    message: `Tu envío ${shipmentData.origin} → ${shipmentData.destination} cambió de ${oldStatus} a ${getStatusEmoji(newStatus)} ${newStatus}`,
    data: {
      shipment_uuid: shipmentData.uuid,
      origin: shipmentData.origin,
      destination: shipmentData.destination,
      oldStatus: oldStatus,
      newStatus: newStatus
    },
    shipment_id: parseInt(shipmentData.uuid.split('-')[0]) || undefined
  })
}

// Función específica: Fecha límite extendida
export async function createDeadlineExtendedNotification(
  importerUserId: string,
  shipmentData: {
    uuid: string
    origin: string
    destination: string
  },
  newExpirationDate: string
) {
  return createNotification({
    user_id: importerUserId,
    type: 'deadline_extended',
    title: '📅 Fecha límite extendida',
    message: `La fecha límite de tu envío ${shipmentData.origin} → ${shipmentData.destination} se extendió exitosamente`,
    data: {
      shipment_uuid: shipmentData.uuid,
      expiration_date: newExpirationDate,
      origin: shipmentData.origin,
      destination: shipmentData.destination
    },
    shipment_id: parseInt(shipmentData.uuid.split('-')[0]) || undefined
  })
}

// Función para obtener el user_id del propietario de un shipment
export async function getShipmentOwnerId(shipmentId: number): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('shipments')
      .select('profile_id')
      .eq('id', shipmentId)
      .single()

    if (error) {
      return null
    }

    return data?.profile_id || null
  } catch (error) {
    return null
  }
}

// Función para obtener el agent_id de una oferta
export async function getAgentIdFromOffer(offerId: number): Promise<string | null> {
  try {
    const { data, error } = await supabase
      .from('offers')
      .select('agent_id')
      .eq('id', offerId)
      .single()

    if (error) {
      return null
    }

    return data?.agent_id || null
  } catch (error) {
    return null
  }
}

// Función para notificar a todos los agentes sobre el resultado de un bid cerrado
export async function notifyAgentsAboutBidClosure(
  bidId: number,
  acceptedOfferId: number,
  shipmentData: {
    uuid: string
    origin: string
    destination: string
  }
) {
  try {

    // Obtener todas las ofertas del shipment agrupadas por agente
    const { data: offers, error } = await supabase
      .from('offers')
      .select('id, agent_id, price, agent_code')
      .eq('shipment_id', bidId)
      .order('price', { ascending: true })

    if (error) {
      return
    }

    if (!offers || offers.length === 0) {
      return
    }

    const acceptedOffer = offers.find(offer => offer.id === acceptedOfferId)
    if (!acceptedOffer) {
      return
    }

    // Agrupar ofertas por agente para evitar múltiples notificaciones al mismo agente
    const offersByAgent = offers.reduce((acc, offer) => {
      if (!acc[offer.agent_id]) {
        acc[offer.agent_id] = []
      }
      acc[offer.agent_id].push(offer)
      return acc
    }, {} as Record<string, typeof offers>)


    // Notificar a cada agente (solo una vez por agente)
    for (const [agentId, agentOffers] of Object.entries(offersByAgent)) {
      // Verificar si este agente tiene la oferta ganadora
      const hasWinningOffer = agentOffers.some(offer => offer.id === acceptedOfferId)
      
      if (hasWinningOffer) {
        // Notificar que su oferta fue aceptada
        await createOfferAcceptedNotification(
          agentId,
          shipmentData,
          {
            id: acceptedOffer.id,
            price: acceptedOffer.price.toString(),
            currency: 'USD',
            agent_code: acceptedOffer.agent_code
          }
        )
      } else {
        // Notificar que sus ofertas fueron rechazadas (una sola notificación por agente)
        const bestOfferFromAgent = agentOffers.reduce((best, current) => 
          current.price < best.price ? current : best
        )
        
        await createOfferRejectedNotification(
          agentId,
          shipmentData,
          {
            id: bestOfferFromAgent.id,
            price: bestOfferFromAgent.price.toString(),
            currency: 'USD',
            agent_code: bestOfferFromAgent.agent_code
          },
          acceptedOffer.price.toString()
        )
      }
    }

    const winnerCount = 1
    const rejectedCount = Object.keys(offersByAgent).length - 1
  } catch (error) {
  }
}

// Función específica: Nuevo shipment disponible (para AGENTES en el mercado)
export async function createNewShipmentNotification(
  agentUserId: string,
  shipmentData: {
    uuid: string
    origin: string
    destination: string
    shipping_type: string
    value: number
    currency: string
    expiration_date: string
  },
  marketData: {
    name: string
  }
) {
  return createNotification({
    user_id: agentUserId,
    type: 'new_shipment' as any, // Nuevo tipo de notificación
    title: '🚢 ¡Nuevo shipment disponible!',
    message: `Nuevo ${shipmentData.shipping_type.toLowerCase()} disponible en ${marketData.name}: ${shipmentData.origin} → ${shipmentData.destination} ($${shipmentData.value.toLocaleString()} ${shipmentData.currency})`,
    data: {
      shipment_uuid: shipmentData.uuid,
      market_name: marketData.name,
      value: shipmentData.value.toString(),
      currency: shipmentData.currency,
      shipping_type: shipmentData.shipping_type,
      origin: shipmentData.origin,
      destination: shipmentData.destination,
      expiration_date: shipmentData.expiration_date
    },
    shipment_id: parseInt(shipmentData.uuid.split('-')[0]) || undefined
  })
}

// Función para notificar a todos los agentes de un mercado sobre un nuevo shipment
export async function notifyAgentsAboutNewShipment(
  marketId: number,
  shipmentData: {
    uuid: string
    origin: string
    destination: string
    shipping_type: string
    value: number
    currency: string
    expiration_date: string
  }
) {
  try {

    // Obtener información del mercado
    const { data: marketInfo, error: marketError } = await supabase
      .from('markets')
      .select('name')
      .eq('id', marketId)
      .single()

    if (marketError) {
      return
    }

    // Usar función de BD que bypass RLS para obtener agentes del mercado
    
    const { data: agents, error: agentsError } = await supabase
      .rpc('get_market_agents', { market_id_param: marketId })


    if (agentsError) {
      return
    }

    if (!agents || agents.length === 0) {
      return
    }



    // Enviar notificación a cada agente
    const notificationPromises = agents.map(async (agent: any) => {
      try {
        await createNewShipmentNotification(
          agent.user_id, // usar user_id directamente de la función SQL
          shipmentData,
          { name: marketInfo.name }
        )
      } catch (error) {
      }
    })

    await Promise.all(notificationPromises)
  } catch (error) {
  }
} 