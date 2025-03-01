import React, { Suspense } from 'react'
import { CargoTransportTabs } from './components/CargoTransportTabs.tsx'
import { CargoTransportListCards } from './components/CargoTransportListCards'

const page = () => {
  return (
    <>
      <section className="flex justify-between w-full gap-8">
        <Suspense fallback={<div>Loading...</div>}>
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
