import React, { Suspense } from 'react'
import { CargaTransportListHistory } from './components/CargaTransportListHistory'

const page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <CargaTransportListHistory />
    </Suspense>
  )
}

export default page
