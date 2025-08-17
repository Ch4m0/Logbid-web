import { ShippingType } from '@/src/models/common'
import { apiClient } from './apiClient'

export const fetchListBidByMarket = async (
  market: string | null,
  status: string,
  user_id: number | null,
  shippingType: ShippingType
) => {
  let url = `/market/get_bids_by_market_id?market=${market}&status=${status}&shipping_type=${shippingType}`
  if (status === 'Offered') {
    url = url + `&user_id=${user_id}`
  }
  const respose = await apiClient.get(url)

  return respose.data.data.map((item: any) => ({
    id: item.id,
    uuid: item.uuid,
    inserted_at: item.inserted_at,
    expiration_date: item.expiration_date,
    shipping_type: item.shipping_type,
    origin: item.origin_country + ' - ' + item.origin_name,
    destination: item.destination_country + ' - ' + item.destination_name,
    destination_name: item.destination_name,
    origin_name: item.origin_name,
    origin_country: item.origin_country,
    destination_country: item.destination_country,
    last_price: item.last_price,
    agent_code: item.agent_code,
    offers_count: item.offers_count || 0,
  }))
}

export const createOffer = async (info: any) => {
  const response = await apiClient.post(`/agent/v2/create_offer`, {
    ...info,
  })
  return response.data
}

export const fetchHistoricalBidsForAgent = async ({
  user_id,
  market_id,
  status,
  shipping_type,
}: {
  user_id: number | null
  market_id: string | null
  status: 'Active' | 'Closed'
  shipping_type: string
}) => {
  const response = await apiClient.get(
    `/agent/offers_history_by_agent_id_and_market_id?shipping_type=${shipping_type}&user_id=${user_id}&market=${market_id}`
  )
  return response.data.data.map((item: any) => {
    return {
      ...item,
      origin_name: item.origin_name + '-' + item.origin_country,
      destination_name: item.destination_name + '-' + item.destination_country,
      price: `$ ${item.price}`,
    }
  })
}
