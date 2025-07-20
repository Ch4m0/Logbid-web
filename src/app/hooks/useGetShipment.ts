import { useQuery } from '@tanstack/react-query'
import { supabase } from '@/src/utils/supabase/client'

interface Args {
  shipment_id: string | null
}

export const useGetShipment = ({ shipment_id }: Args) => {
  return useQuery({
    queryKey: ['shipment', shipment_id],
    queryFn: async () => {
      if (!shipment_id) {
        throw new Error('Shipment ID is required')
      }

      // Consultar shipment principal
      const { data: shipmentData, error: shipmentError } = await supabase
        .from('shipments')
        .select('*')
        .eq('uuid', shipment_id)
        .single()

      if (shipmentError) {
        throw shipmentError
      }

      // Consultar shipment_details si existe
      let shipmentDetails = null
      if (shipmentData.shipment_details_id) {
        const { data: detailsData, error: detailsError } = await supabase
          .from('shipment_details')
          .select('*')
          .eq('id', shipmentData.shipment_details_id)
          .single()
        
        if (!detailsError && detailsData) {
          shipmentDetails = detailsData
        }
      }

      // Consultar offers
      const { data: offersData } = await supabase
        .from('offers')
        .select('*')
        .eq('shipment_id', shipmentData.id)

      // Obtener información adicional de containers e incoterms si existen
      let containerInfo = null
      let incotermInfo = null

      if (shipmentDetails?.container_id) {
        const { data: container, error: containerError } = await supabase
          .from('containers')
          .select('name, type, shipping_type')
          .eq('id', shipmentDetails.container_id)
          .single()
        
        if (!containerError) {
          containerInfo = container
        }
      }

      if (shipmentDetails?.incoterms_id) {
        const { data: incoterm } = await supabase
          .from('incoterms')
          .select('name, english_name')
          .eq('id', shipmentDetails.incoterms_id)
          .single()
        incotermInfo = incoterm
      }

      // Transformar los datos para mantener compatibilidad con el modelo existente
      const offers = offersData || []
      
      const transformedData = {
        id: shipmentData.id,
        uuid: shipmentData.uuid,
        status: shipmentData.status,
        origin_country: shipmentData.origin_country,
        origin_name: shipmentData.origin_name,
        destination_country: shipmentData.destination_country,
        destination_name: shipmentData.destination_name,
        transportation: shipmentData.transportation,
        comex_type: shipmentData.comex_type,
        shipping_type: shipmentData.shipping_type,
        inserted_at: shipmentData.inserted_at,
        expiration_date: shipmentData.expiration_date,
        currency: shipmentData.currency,
        value: shipmentData.value,
        additional_info: shipmentData.additional_info,
        agent_code: shipmentData.agent_code,
        
        // Datos de shipment_details aplanados para compatibilidad
        total_weight: shipmentDetails?.total_weight,
        measure_type: shipmentDetails?.measure_type,
        volume: shipmentDetails?.volume,
        units: shipmentDetails?.units,
        merchandise_type: shipmentDetails?.merchandise_type,
        dangerous_march: shipmentDetails?.dangerous_merch, // Nota: el nombre cambia para mantener compatibilidad
        tariff_item: shipmentDetails?.tariff_item,
        container_id: shipmentDetails?.container_id,
        incoterms_id: shipmentDetails?.incoterms_id,
        dimensions: shipmentDetails?.dimensions,
        special_requirements: shipmentDetails?.special_requirements,
        
        // Referencias a las tablas relacionadas
        container_name: containerInfo?.name,
        incoterm_name: incotermInfo?.name,
        
        // Ofertas y precios
        offers: offers,
        lowestPrice: offers.length > 0 
          ? Math.min(...offers.map((offer: any) => parseFloat(offer.price))).toString()
          : '0',
        last_price: offers.length > 0 
          ? offers[offers.length - 1].price
          : '0'
      }

      return transformedData
    },
    enabled: !!shipment_id,
  })
}
