import { useMutation, useQueryClient } from '@tanstack/react-query'
import { createSupabaseClient } from '@/src/utils/supabase/client'
import useAuthStore from '@/src/store/authStore'

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

      // Preparar datos para la función de base de datos
      const shipmentData = {
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

      // 🚀 Crear shipment y notificar agentes automáticamente con función de BD
      const { data: result, error } = await supabase
        .rpc('create_shipment_and_notify', {
          shipment_data: shipmentData
        })

      if (error) {
        throw new Error(`Error al crear el shipment: ${error.message}`)
      }

      if (!result.success) {
        throw new Error(`Error en la función: ${result.error}`)
      }

      console.log(`✅ Shipment creado y ${result.agents_notified} agentes notificados en ${result.market_name}`)

      return result.shipment
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