import React, { Suspense } from 'react'
import { CargoTransportTabs } from './components/CargoTransportTabs.tsx'
import { CargoTransportListCards } from './components/CargoTransportListCards'

const LoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    <span className="ml-2">Loading...</span>
  </div>
)

const page = () => {
  return (
    <>
      <section className="flex justify-between w-full gap-8">
        <Suspense fallback={<LoadingFallback />}>
          <CargoTransportTabs
            children1={<CargoTransportListCards status={'Active'} />}
            children2={<CargoTransportListCards status={'Offering'} />}
            children3={<CargoTransportListCards status={'Closed'} />}
          ></CargoTransportTabs>
        </Suspense>
      </section>
    </>
  )
}

export default page
