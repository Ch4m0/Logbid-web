'use client'
import React, { Suspense } from 'react'
import { CargoTransporListAvaliable } from './components/CargoTransportListAvaliable'
import CargoTransportTabs from './components/CargoTransportListAvaliableTabs/CargoTransportListAvaliableTabs'

const LoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    <span className="ml-2">Loading...</span>
  </div>
)

const page = () => {
  return (
    <div className="flex gap-4">
      <Suspense fallback={<LoadingFallback />}>
        <CargoTransportTabs
          children1={<CargoTransporListAvaliable status={'Active'} />}
          children2={<CargoTransporListAvaliable status={'Offered'} />}
          children3={<CargoTransporListAvaliable status={'Closed'} />}
        ></CargoTransportTabs>
      </Suspense>
    </div>
  )
}

export default page
