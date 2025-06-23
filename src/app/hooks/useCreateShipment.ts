import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createSupabaseClient } from '@/src/utils/supabase/client'
import useAuthStore from '@/src/store/authStore'
import { notifyAgentsAboutNewShipment } from '@/src/utils/notificationHelpers'

interface CreateShipmentData {
  tipoTransporte: string  // shipping_type: 'Marítimo' | 'Aéreo'
  origen: string         // origin_id
  destino: string        // destination_id  
  tipoComex: string      // comex_type: 'Importación' | 'Exportación'
  tipoEnvio: string      // transportation: 'FCL' | 'LCL' | 'Carga suelta'
  valor: string          // value
  moneda: string         // currency
  fechaExpiracion: string // expiration_date
  informacionAdicional?: string // additional_info
  tipoMercancia: string   // Used for additional_info
  market_id: number
  // Campos adicionales del formulario
  contenedor?: string     // container_id
  empaque?: string       // packaging
  pesoTotal?: number     // total_weight
  tipoMedida?: string    // measure_type
  cbm?: number          // volume
  unidades?: number     // units
  incoterm?: string     // incoterms_id
  cargaClasificacion?: string // dangerous_merch classification
  partidaArancelaria?: string // tariff_item
}

interface ShipmentInsert {
  status: string
  profile_id: string
  market_id: number
  origin_name: string
  origin_country: string
  destination_name: string
  destination_country: string
  transportation: string
  comex_type: string
  shipping_type: string
  value: number
  currency: string
  expiration_date: string
  additional_info: string
}

interface ShipmentDetailsInsert {
  total_weight?: number
  measure_type?: string
  volume?: number
  units?: number
  merchandise_type?: string
  dangerous_merch?: boolean
  tariff_item?: string
  container_id?: number
  incoterms_id?: number
  special_requirements?: string
}

export const useCreateShipment = () => {
  const queryClient = useQueryClient()
  const profile = useAuthStore((state) => state.profile)
  const user = useAuthStore((state) => state.user)
  const supabase = createSupabaseClient()

  return useMutation({
    mutationFn: async (data: CreateShipmentData): Promise<any> => {

      
      if (!profile?.id) {
        throw new Error('Usuario no autenticado')
      }



      // Obtener información de origen y destino según el tipo de transporte
      let originData, destinationData



      if (data.tipoTransporte === 'Marítimo') {

        
        // Obtener puertos marítimos
        const { data: originPort, error: originError } = await supabase
          .from('maritime_ports')
          .select('port_name, country')
          .eq('id', parseInt(data.origen))
          .single()

        const { data: destinationPort, error: destinationError } = await supabase
          .from('maritime_ports')
          .select('port_name, country')
          .eq('id', parseInt(data.destino))
          .single()

        if (originError) {
          throw new Error(`Error al buscar puerto origen: ${originError.message}`)
        }

        if (destinationError) {
          throw new Error(`Error al buscar puerto destino: ${destinationError.message}`)
        }

        originData = { name: originPort.port_name, country: originPort.country }
        destinationData = { name: destinationPort.port_name, country: destinationPort.country }
      } else {

        
        // Obtener aeropuertos
        const { data: originAirport, error: originError } = await supabase
          .from('airports')
          .select('airport_name, country')
          .eq('id', parseInt(data.origen))
          .single()

        const { data: destinationAirport, error: destinationError } = await supabase
          .from('airports')
          .select('airport_name, country')
          .eq('id', parseInt(data.destino))
          .single()

        if (originError) {
          throw new Error(`Error al buscar aeropuerto origen: ${originError.message}`)
        }

        if (destinationError) {
          throw new Error(`Error al buscar aeropuerto destino: ${destinationError.message}`)
        }

        originData = { name: originAirport.airport_name, country: originAirport.country }
        destinationData = { name: destinationAirport.airport_name, country: destinationAirport.country }
      }



      if (!originData || !destinationData) {
        throw new Error('No se pudieron obtener los datos de origen y destino')
      }

      // Preparar datos para insertar el shipment principal (sin detalles por ahora)
      const shipmentData: ShipmentInsert = {
        status: 'Active',
        profile_id: profile.id,
        market_id: data.market_id,
        origin_name: originData.name,
        origin_country: originData.country,
        destination_name: destinationData.name,
        destination_country: destinationData.country,
        transportation: data.tipoEnvio,
        comex_type: data.tipoComex,
        shipping_type: data.tipoTransporte,
        value: parseFloat(data.valor),
        currency: data.moneda,
        expiration_date: new Date(data.fechaExpiracion).toISOString(),
        additional_info: data.informacionAdicional || data.tipoMercancia || '',
      }

      // Insertar en Supabase
      const { data: result, error } = await supabase
        .from('shipments')
        .insert(shipmentData)
        .select()
        .single()

      if (error) {
        throw new Error(`Error al crear el shipment: ${error.message}`)
      }

      // 🔔 Notificar a todos los agentes del mercado sobre el nuevo shipment
      try {
        
        if (!result.uuid) {
          throw new Error('UUID no disponible')
        }
        
        await notifyAgentsAboutNewShipment(
          data.market_id,
          {
            uuid: result.uuid,
            origin: `${originData.country} - ${originData.name}`,
            destination: `${destinationData.country} - ${destinationData.name}`,
            shipping_type: data.tipoTransporte,
            value: parseFloat(data.valor),
            currency: data.moneda,
            expiration_date: new Date(data.fechaExpiracion).toISOString()
          }
        )
      } catch (notificationError) {
        if (notificationError instanceof Error) {
        }
        // No fallar la operación principal por error de notificación
      }

      return result
    },
    onSuccess: (data) => {
      console.log('✅ SHIPMENT: Creado exitosamente, invalidando queries...')
      // Invalidar queries relacionadas para refrescar la lista
      queryClient.invalidateQueries({ queryKey: ['shipments'] })
      queryClient.invalidateQueries({ queryKey: ['bidList'] })
      queryClient.invalidateQueries({ queryKey: ['bidListByMarket'] })
      console.log('🔄 SHIPMENT: Queries invalidadas')
      return data
    },
    onError: (error: Error) => {
      throw error
    },
  })
} 