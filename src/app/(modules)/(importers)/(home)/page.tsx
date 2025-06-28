'use client'
import React, { Suspense } from 'react'
import { CargoTransportTabs } from './components/CargoTransportTabs.tsx'
import { ImporterShipmentCards } from './components/ImporterShipmentCards'
import { ProtectedRoute } from '@/src/components/ProtectedRoute'

const LoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    <span className="ml-2">Loading...</span>
  </div>
)

const page = () => {
  return (
    <ProtectedRoute allowedRoles={['customer']}>
      <section className="flex justify-between w-full gap-8">
        <Suspense fallback={<LoadingFallback />}>
          <CargoTransportTabs
            children1={<ImporterShipmentCards filterType={'withoutOffers'} />}
            children2={<ImporterShipmentCards filterType={'withOffers'} />}
            children3={<ImporterShipmentCards filterType={'closed'} />}
          ></CargoTransportTabs>
        </Suspense>
      </section>
    </ProtectedRoute>
  )
}

export default page
