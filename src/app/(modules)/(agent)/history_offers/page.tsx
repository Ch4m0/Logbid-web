import React, { Suspense } from 'react'
import { HistoricalListProposal } from './components/HistoricalListProposal'

const page = () => {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HistoricalListProposal />
    </Suspense>
  )
}

export default page
