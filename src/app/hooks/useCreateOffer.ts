import { useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/src/utils/supabase/client'

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

      // 🚀 Crear oferta y notificar al customer usando la función de base de datos
      const offerData = {
        shipment_id: bid_id,
        agent_id: agent_id,
        price: parseFloat(price.toString()),
        currency: 'USD', // Por ahora hardcodeado a USD
        shipping_type: shipping_type,
        agent_code: agentCode || 'AGENT001',
        additional_info: JSON.stringify({
          details: detailsObject
        })
      }

      console.log('📦 Datos de la oferta a enviar:', offerData)

      const { data: result, error } = await supabase
        .rpc('create_offer_and_notify', {
          offer_data: offerData
        })

      if (error) {
        console.error('Error creating offer:', error)
        throw new Error(`Error al crear la oferta: ${error.message}`)
      }

      if (!result.success) {
        throw new Error(`Error en la función: ${result.error}`)
      }

      console.log(`✅ Oferta creada y notificación enviada al customer ${result.customer_id}`)

      return result.offer
    },
    onSuccess: (data) => {
      // Invalidar queries relacionadas para refrescar los datos
      queryClient.invalidateQueries({ queryKey: ['shipment'] })
      queryClient.invalidateQueries({ queryKey: ['bidListByMarket'] })
      queryClient.invalidateQueries({ queryKey: ['notifications'] }) // Asegurar que se actualiza el contador
      return data
    },
    onError: (error: Error) => {
      console.error('Error in offer creation:', error)
      throw error
    },
  })
}
