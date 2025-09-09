'use client'
import { AgentShipmentList } from './AgentShipmentList'

interface MyOffersWrapperProps {
  status: 'MyOffers'
}

export function MyOffersWrapper({ status }: MyOffersWrapperProps) {
  return <AgentShipmentList status={status} />
}
