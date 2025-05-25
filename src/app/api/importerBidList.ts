import { BidListItem } from '@/src/models/BidListItem'
import { TransFormDataToCreateBid } from '@/src/transform/TransformDataToCreateBid'
import { apiClient } from './apiClient'
import { BidStatus, ShippingType } from '@/src/models/common'

interface Args {
  market_id: string | null
  user_id: number | null
  status: BidStatus
  shipping_type: ShippingType
}

export const getBidList = async ({
  market_id,
  user_id,
  status,
  shipping_type,
}: Args): Promise<BidListItem[]> => {
  const response = await apiClient.get(
    `/importer/bid_list?shipping_type=${shipping_type}&user_id=${user_id}&market_id=${market_id}&status=${status}`
  )

  // Mapea la respuesta para convertirla en una instancia de BidListItem
  return response.data.data.map(
    (item: any) =>
      new BidListItem(
        item.id,
        item.status,
        item.uuid,
        item.agent_code,
        item.origin_id,
        item.origin_country + ' - ' + item.origin_name,
        item.origin_country,
        item.destination_id,
        item.destination_country + ' - ' + item.destination_name,
        item.destination_country,
        item.transportation,
        item.comex_type,
        item.expiration_date,
        item.shipping_type,
        item.value,
        item.currency,
        item.additional_info,
        item.user_id,
        item.market_id,
        item.bid_details_id,
        item.inserted_at,
        item.last_price,
        item.offers ? item.offers.length : 0 // Contamos las ofertas reales del array, o 0 si es null
      )
  )
}

export const extendExpirationDate = ({
  bidListItemId,
  newExpirationDate,
}: {
  bidListItemId: string
  newExpirationDate: string
}) => {
  return apiClient.put(`importer/bid_extend/`, {
    expiration_date: newExpirationDate,
    id: bidListItemId,
  })
}

export const fetchAirports = async (query = '', page = 1) => {
  const response = await apiClient.get(
    `/cross/get_airports_by_filter?filter=${query}&page=${page}`
  )
  const data = response.data.data
  return {
    data,
    hasMore: data.length > 0, // Si el backend no devuelve un `nextCursor`, nos basamos en la longitud de los datos
  }
}
export const fetchMaritimePorts = async (query = '', page = 1) => {
  const response = await apiClient.get(
    `/cross/get_ports_by_filter?filter=${query}&page=${page}`
  )
  const data = response.data.data
  return {
    data,
    hasMore: data.length > 0, // Si el backend no devuelve un `nextCursor`, nos basamos en la longitud de los datos
  }
}

export const fetchListIncoterm = async () => {
  const response = await apiClient.get(`/cross/get_incoterms`)
  return response.data.data
}

export const createBid = async (data: any) => {
  const transformData = new TransFormDataToCreateBid()
  const dataTransformed = transformData.transform(data)
  const response = await apiClient.post(`/importer/create_bid`, {
    ...dataTransformed,
  })
  return response.data
}

function organizeContainers(containers: any) {
  return containers.sort((a: any, b: any) => {
    // Extraer los números de los nombres (20, 40, etc.)
    const sizeA = parseInt(a.name.match(/\d+/)?.[0] || 0)
    const sizeB = parseInt(b.name.match(/\d+/)?.[0] || 0)

    // Si los tamaños son diferentes, ordenar por tamaño
    if (sizeA !== sizeB) {
      return sizeA - sizeB
    }

    // Si los tamaños son iguales, ordenar alfabéticamente
    return a.name.localeCompare(b.name)
  })
}

export const fetchListContainer = async (shipping_type = 'Aéreo') => {
  const response = await apiClient.get(
    `/cross/get_containers?shipping_type=${shipping_type}`
  )
  return organizeContainers(response.data.data)
}

export const fetchDetailById = async ({ bid_id }: { bid_id: string }) => {
  const response = await apiClient.get(
    `/importer/get_bid_by_id?bid_id=${bid_id}`
  )

  // Calcular el menor precio de la lista de ofertas
  const lowestPrice = response.data.data.offers.length
    ? Math.min(
        ...response.data.data.offers.map((offer: any) =>
          parseFloat(offer.price)
        )
      )
    : null

  const _data = {
    ...response.data.data,
    lowestPrice: lowestPrice,
    offers: response.data.data.offers.map((offer: any) => ({
      ...offer,
      price: 'USD ' + offer.price,
    })),
  }
  return _data
}

export const closeBid = async ({
  bid_id,
  offer_id,
}: {
  bid_id: number
  offer_id: number
}) => {
  const response = await apiClient.put(`/importer/close_bid`, {
    bid_id: bid_id,
    offer_id,
  })

  return response.data.data
}

/*export const fetchHistoricalBids = async (
  user_id: string,
  market_id: string
) => {
  const response = await axios.get(
    `${API_BASE_URL}/importer/get_historical_bids?user_id=${user_id}&market_id=${market_id}&status=Closed`
  )
  return response.data.data
}*/

export const fetchHistoricalBids = async (
  user_id: string,
  market_id: string
) => {
  const response = await apiClient.get(
    `/importer/get_historical_bids?user_id=${user_id}&market_id=${market_id}&status=Closed`
  )
  return response.data.data
}
