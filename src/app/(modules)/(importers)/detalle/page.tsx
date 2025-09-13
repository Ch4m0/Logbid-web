'use client'
import React, { Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useTranslation } from '@/src/hooks/useTranslation'
import { CargaProposalsList } from './components/CargaProposalsList'
import { ShipmentInfo } from './components/ShipmentInfo'
import { ArrowLeft } from 'lucide-react'

const LoadingFallback = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
    <span className="ml-2">Loading...</span>
  </div>
)

const Page = () => {
  const router = useRouter()
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  
  // Obtener shipment_id de la URL
  const shipmentId = searchParams.get('shipment_id')

  return (
    <div className="w-full">
      <button
        onClick={() => router.back()}
        className="bg-primary text-white font-semibold py-2 px-4 rounded mb-4 flex items-center"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {t('common.back')}
      </button>
      
      {/* Información del Shipment */}
      {shipmentId && (
        <Suspense fallback={<LoadingFallback />}>
          <ShipmentInfo shipmentId={shipmentId} />
        </Suspense>
      )}
      
      {/* Lista de Ofertas */}
      <Suspense fallback={<LoadingFallback />}>
        <CargaProposalsList />
      </Suspense>
    </div>
  )
}

export default Page
