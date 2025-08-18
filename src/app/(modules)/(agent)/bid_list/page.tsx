'use client'
import React, { Suspense } from 'react'
import { AgentShipmentList } from './components/AgentShipmentList'
import CargoTransportTabs from './components/CargoTransportListAvaliableTabs/CargoTransportListAvaliableTabs'
import { ProtectedRoute } from '@/src/components/ProtectedRoute'
import { AgentOfferedShipments } from './components/AgentOfferedShipments'

const LoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    <span className="ml-2">Loading...</span>
  </div>
)

// Wrapper component to match the expected interface
const MyOffersWrapper = ({ status }: { status: string }) => (
  <AgentOfferedShipments status={status} />
)

const Page = () => {
  return (
    <ProtectedRoute allowedRoles={['agent']}>
      <div className="flex gap-4">
        <Suspense fallback={<LoadingFallback />}>
          <CargoTransportTabs
            children1={<AgentShipmentList status={'WithoutOffers'} />}
            children2={<MyOffersWrapper status={'MyOffers'} />}
            children3={<AgentShipmentList status={'Closed'} />}
          ></CargoTransportTabs>
        </Suspense>
      </div>
    </ProtectedRoute>
  )
}

export default Page
