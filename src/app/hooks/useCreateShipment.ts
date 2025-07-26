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
  fechaEmbarque?: string  // shipping_date
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

// Función para convertir fecha y hora a UTC correctamente
// Input: "2025-07-31 23:59:59" -> Output: "2025-07-31T23:59:59.000Z"
const formatDateTimeToUTC = (dateTimeString: string): string => {
  if (!dateTimeString) return ''
  
  // Si ya viene con formato de hora
  if (dateTimeString.includes(' ')) {
    // Parseamos manualmente para evitar problemas de zona horaria
    const [datePart, timePart] = dateTimeString.split(' ')
    const [year, month, day] = datePart.split('-').map(Number)
    const [hours, minutes, seconds] = timePart.split(':').map(Number)
    
    // Creamos la fecha en UTC directamente
    const date = new Date(Date.UTC(year, month - 1, day, hours, minutes, seconds))
    return date.toISOString()
  }
  
  // Si solo viene la fecha, asumimos final del día (23:59:59)
  const [year, month, day] = dateTimeString.split('-').map(Number)
  const date = new Date(Date.UTC(year, month - 1, day, 23, 59, 59))
  return date.toISOString()
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

      
      if (!profile?.auth_id) {
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
          .select('country_code, country')
          .eq('id', parseInt(data.origen))
          .single()

        const { data: destinationAirport, error: destinationError } = await supabase
          .from('airports')
          .select('country_code, country')
          .eq('id', parseInt(data.destino))
          .single()

        if (originError) {
          throw new Error(`Error al buscar aeropuerto origen: ${originError.message}`)
        }

        if (destinationError) {
          throw new Error(`Error al buscar aeropuerto destino: ${destinationError.message}`)
        }

        originData = { name: originAirport.country_code, country: originAirport.country }
        destinationData = { name: destinationAirport.country_code, country: destinationAirport.country }
      }

      if (!originData || !destinationData) {
        throw new Error('No se pudieron obtener los datos de origen y destino')
      }

      // Preparar datos para la función de base de datos
      const shipmentData = {
        status: 'Active',
        profile_id: profile.auth_id,
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
        expiration_date: formatDateTimeToUTC(data.fechaExpiracion),
        shipping_date: data.fechaEmbarque && 
          typeof data.fechaEmbarque === 'string' && 
          data.fechaEmbarque.trim() !== '' 
          ? formatDateTimeToUTC(data.fechaEmbarque)
          : null,
        additional_info: data.informacionAdicional || data.tipoMercancia || '',
      }

      console.log('🚀 Enviando datos a función RPC:', shipmentData)

      // 🚀 Crear shipment y notificar agentes automáticamente con función de BD
      const { data: result, error } = await supabase
        .rpc('create_shipment_and_notify', {
          shipment_data: shipmentData
        })

      if (error) {
        console.error('❌ Error en RPC:', error)
        throw new Error(`Error al crear el shipment: ${error.message}`)
      }

      if (!result?.success) {
        console.error('❌ Función RPC falló:', result)
        throw new Error(`Error en la función: ${result?.error || 'Error desconocido'}`)
      }

      console.log(`✅ Shipment creado y ${result.agents_notified} agentes notificados en ${result.market_name}`)

      // 🛒 Crear detalles de mercancía si hay datos disponibles
      const hasDetails = data.pesoTotal || data.tipoMedida || data.cbm || data.unidades || 
                        data.tipoMercancia || data.cargaClasificacion || data.partidaArancelaria ||
                        data.contenedor || data.incoterm

      if (hasDetails && result.shipment?.id) {
        console.log('📦 Creando detalles de mercancía...')
        
        // Preparar datos para shipment_details
        const shipmentDetailsData: ShipmentDetailsInsert = {
          total_weight: data.pesoTotal,
          measure_type: data.tipoMedida || undefined,
          volume: data.cbm,
          units: data.unidades,
          merchandise_type: data.tipoMercancia || undefined,
          dangerous_merch: data.cargaClasificacion ? data.cargaClasificacion.toLowerCase() === 'peligrosa' : false,
          tariff_item: data.partidaArancelaria || undefined,
          container_id: data.contenedor ? parseInt(data.contenedor) : undefined,
          incoterms_id: data.incoterm ? parseInt(data.incoterm) : undefined,
          special_requirements: data.informacionAdicional || undefined
        }

        // Filtrar campos undefined/null
        const cleanedDetailsData = Object.fromEntries(
          Object.entries(shipmentDetailsData).filter(([_, value]) => value !== undefined && value !== '' && value !== null)
        )

        if (Object.keys(cleanedDetailsData).length > 0) {
          console.log('📦 Datos de detalles a insertar:', cleanedDetailsData)

          // Insertar en shipment_details
          const { data: detailsResult, error: detailsError } = await supabase
            .from('shipment_details')
            .insert(cleanedDetailsData)
            .select('id')
            .single()

          if (detailsError) {
            console.error('❌ Error al crear detalles de mercancía:', detailsError)
            throw new Error(`Error al crear detalles de mercancía: ${detailsError.message}`)
          }

          if (detailsResult?.id) {
            console.log(`📦 Detalles de mercancía creados con ID: ${detailsResult.id}`)

            // Actualizar el shipment con el shipment_details_id
            const { error: updateError } = await supabase
              .from('shipments')
              .update({ shipment_details_id: detailsResult.id })
              .eq('id', result.shipment.id)

            if (updateError) {
              console.error('❌ Error al vincular detalles con shipment:', updateError)
              throw new Error(`Error al vincular detalles: ${updateError.message}`)
            }

            console.log('✅ Detalles de mercancía vinculados correctamente al shipment')
          }
        }
      }

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