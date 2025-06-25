'use client'
import React, { Suspense } from 'react'
import { ProtectedRoute } from '@/src/components/ProtectedRoute'
import { GraphicsDashboard } from './components/GraphicsDashboard'

const LoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    <span className="ml-2">Cargando estadísticas...</span>
  </div>
)

const GraphicsPage = () => {
  return (
    <ProtectedRoute allowedRoles={['customer', 'agent']}>
      <Suspense fallback={<LoadingFallback />}>
        <GraphicsDashboard />
      </Suspense>
    </ProtectedRoute>
  )
}

export default GraphicsPage 