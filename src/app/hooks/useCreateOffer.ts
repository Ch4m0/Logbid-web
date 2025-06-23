import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/src/utils/supabase/client'
import { createNewOfferNotification, getShipmentOwnerId } from '@/src/utils/notificationHelpers'

interface CreateOfferData {
  bid_id: number
  agent_id: string
  price: number
  shipping_type: string
  details?: any
  agent_code?: string
  // Propiedades del formulario que se deben mover a details
  basic_service?: any
  freight_fees?: any
  origin_fees?: any
  destination_fees?: any
  other_fees?: any
  additional_fees?: any
}

export const useCreateOffer = () => {
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: async (data: CreateOfferData) => {
      // Obtener el perfil del agente para generar agent_code si no existe
      let agentCode = data.agent_code
      if (!agentCode && data.agent_id) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, full_name')
          .eq('auth_id', data.agent_id)
          .single()
        
        if (profile) {
          // Generar un código simple basado en el ID del perfil
          agentCode = `AG${profile.id.toString().slice(-4)}`
        }
      }
      
      // Extraer las propiedades principales y el resto va a details
      const { bid_id, agent_id, price, shipping_type, agent_code: ac, details, ...formDetails } = data
      
      // Construir el objeto details con todos los detalles del formulario
      const detailsObject = {
        ...(details || {}), // Si ya hay details, los mantenemos
        ...formDetails      // Agregamos todos los datos del formulario
      }
      
      const offerData = {
        shipment_id: bid_id,
        agent_id: agent_id,
        agent_code: agentCode || 'AGENT001',
        price: parseFloat(price.toString()),
        shipping_type: shipping_type,
        details: detailsObject,
        status: 'pending'
      }

      const { data: result, error } = await supabase
        .from('offers')
        .insert(offerData)
        .select()
        .single()

      if (error) {
        console.error('Error creating offer:', error)
        throw new Error(`Error al crear la oferta: ${error.message}`)
      }

      // 🔔 Crear notificación para el importador
      try {
        // Obtener información del shipment
        const { data: shipmentData, error: shipmentError } = await supabase
          .from('shipments')
          .select('uuid, origin_name, origin_country, destination_name, destination_country, shipping_type, profile_id')
          .eq('id', bid_id)
          .single()

        if (shipmentError) {
          console.error('Error obteniendo datos del shipment para notificación:', shipmentError)
        } else if (shipmentData) {
          console.log('🔍 Datos del shipment para notificación:', shipmentData)
          console.log('🔍 Profile ID del importador:', shipmentData.profile_id)
          
          // Crear notificación de nueva oferta
          await createNewOfferNotification(
            shipmentData.profile_id,
            {
              uuid: shipmentData.uuid,
              origin: `${shipmentData.origin_country} - ${shipmentData.origin_name}`,
              destination: `${shipmentData.destination_country} - ${shipmentData.destination_name}`,
              shipping_type: shipmentData.shipping_type
            },
            {
              id: result.id,
              price: result.price.toString(),
              currency: 'USD', // Asumir USD por defecto
              agent_code: result.agent_code
            }
          )
          console.log('✅ Notificación de nueva oferta enviada al importador')
        }
      } catch (notificationError) {
        console.error('❌ Error enviando notificación de nueva oferta:', notificationError)
        // No fallar la operación principal por error de notificación
      }

      return result
    },
    onSuccess: (data) => {
      // Invalidar queries relacionadas para refrescar los datos
      queryClient.invalidateQueries({ queryKey: ['shipment'] })
      queryClient.invalidateQueries({ queryKey: ['bidListByMarket'] })
      return data
    },
    onError: (error: Error) => {
      console.error('Error in offer creation:', error)
      throw error
    },
  })
}
