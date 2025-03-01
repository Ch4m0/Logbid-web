import React, { Suspense } from 'react'
import { CargoTransportList } from './components/CargoTransportList'
import { CargoTransportTabs } from './components/CargoTransportTabs.tsx'

const page = () => {
  return (
    <>
      <section className="flex justify-between w-full gap-8">
        <Suspense fallback={<div>Loading...</div>}>
          <CargoTransportTabs
            children1={<CargoTransportList status={'Active'} />}
            children2={<CargoTransportList status={'Offering'} />}
          ></CargoTransportTabs>
        </Suspense>
      </section>
    </>
  )
}

export default page
