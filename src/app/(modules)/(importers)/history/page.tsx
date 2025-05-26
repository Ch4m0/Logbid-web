'use client'
import React, { Suspense } from 'react'
import { CargaTransportListHistory } from './components/CargaTransportListHistory'

const LoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    <span className="ml-2">Loading...</span>
  </div>
)

const page = () => {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <CargaTransportListHistory />
    </Suspense>
  )
}

export default page
