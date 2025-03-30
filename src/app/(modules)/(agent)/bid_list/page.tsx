import React, { Suspense } from 'react'
import { CargoTransporListAvaliable } from './components/CargoTransportListAvaliable'
import CargoTransportTabs from './components/CargoTransportListAvaliableTabs/CargoTransportListAvaliableTabs'

const page = () => {
  return (
    <div className="flex gap-4">
      <Suspense fallback={<div>Loading...</div>}>
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
