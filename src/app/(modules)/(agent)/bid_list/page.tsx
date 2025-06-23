'use client'
import React, { Suspense } from 'react'
import { CargoTransporListAvaliable } from './components/CargoTransportListAvaliable'
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

const page = () => {
  return (
    <ProtectedRoute allowedRoles={['agent']}>
      <div className="flex gap-4">
        <Suspense fallback={<LoadingFallback />}>
          <CargoTransportTabs
            children1={<CargoTransporListAvaliable status={'WithoutOffers'} />}
            children2={<CargoTransporListAvaliable status={'WithOffers'} />}
            children3={<CargoTransporListAvaliable status={'Closed'} />}
            children4={<MyOffersWrapper status={'MyOffers'} />}
          ></CargoTransportTabs>
        </Suspense>
      </div>
    </ProtectedRoute>
  )
}

export default page
