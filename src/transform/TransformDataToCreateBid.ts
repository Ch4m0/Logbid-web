type InputData = {
  user_id: number
  tipoTransporte: string
  origen: number
  destino: number
  tipoComex: string
  tipoEnvio: string
  contenedor: string
  empaque: string
  pesoTotal: string
  tipoMedida: string
  cbm: string
  unidades: string
  incoterm: string
  tipoMercancia: string
  cargaClasificacion: string
  partidaArancelaria: string
  valor: string
  moneda: string
  fechaExpiracion: string
  informacionAdicional: string
  market_id: number
}

type OutputData = {
  user_id: number
  origin_id: number
  destination_id: number
  transportation: string
  comex_type: string
  expiration_date: string
  shipping_type: string
  value: number
  currency: string
  additional_info: string
  total_weight: number
  measure_type: string
  volume: number
  units: number
  merchandise_type: string
  dangerous_merch: boolean
  tariff_item: string
  container_id: number | string
  incoterms_id: number
  market_id: number
}

export class TransFormDataToCreateBid {
  constructor() {}

  transform(input: InputData): OutputData {
    
    return {
      user_id: input.user_id, // Asignar un id de usuario fijo
      origin_id: input.origen, // Mantener el id de origen
      destination_id: input.destino, // Mantener el id de destino
      transportation: input.tipoEnvio, // Tipo de transporte
      comex_type: input.tipoComex, // Tipo de comex
      expiration_date: input.fechaExpiracion, // Fecha de expiración
      shipping_type: input.tipoTransporte, // Lógica para el tipo de envío
      value: parseFloat(input.valor), // Convertir valor a número
      currency: input.moneda, // Moneda
      additional_info: input.informacionAdicional || 'Prueba', // Información adicional
      total_weight: parseFloat(input.pesoTotal), // Convertir peso a número
      measure_type: input.tipoMedida, // Tipo de medida
      volume: parseFloat(input.cbm), // Convertir volumen a número
      units: parseInt(input.unidades, 10), // Convertir unidades a número
      merchandise_type: input.tipoMercancia, // Tipo de mercancía
      dangerous_merch: input.cargaClasificacion === 'General' ? false : true, // Determinar si la mercancía es peligrosa
      tariff_item: input.partidaArancelaria, // Partida arancelaria
      container_id: input.contenedor
        ? parseInt(input.contenedor)
        : parseInt(input.empaque), // Obtener el ID del contenedor o empaque si es null o vacío
      incoterms_id: parseInt(input.incoterm, 10), // Convertir incoterm a número
      market_id: input.market_id, // Asignar el id de mercado
    }
  }
}
