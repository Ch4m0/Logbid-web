'use client'
import { Button } from '@/src/components/ui/button'
import { useTranslation } from '@/src/hooks/useTranslation'
import { AlertCircle, DollarSign } from 'lucide-react'
import React from 'react'
import ProposalFormAir from './ProposalFormAir'
import ProposalFormSea from './ProposalFormSea'

interface ProposalModalProps {
  shippingType: string
  bidDataShippingType: string
  bidDataForAgent?: any
  onSubmit: (value: any) => void
  onClose?: () => void
}

export default function ProposalModal({ 
  shippingType, 
  bidDataShippingType, 
  bidDataForAgent,
  onSubmit,
  onClose 
}: ProposalModalProps) {
  const { t } = useTranslation()

  const handleSubmit = (value: any) => {
    onSubmit(value)
    onClose?.() // Cerrar modal después de enviar
  }

  // Use the actual shipment type to determine which form to show
  const isMaritimo = bidDataShippingType === '1'

  // Determinar por qué el botón está deshabilitado
  const getDisabledReason = () => {
    if (bidDataForAgent?.status === 'Closed') {
      return t('agentOffers.shipmentClosedMessage')
    }
    if (bidDataForAgent?.status === 'Cancelled') {
      return t('agentOffers.shipmentCancelledMessage')
    }
    if (bidDataForAgent?.expiration_date && new Date(bidDataForAgent.expiration_date) < new Date()) {
      return t('agentOffers.shipmentExpiredMessage')
    }
    return ''
  }

  const listStatus = ['Closed', 'Cancelled', 'Expired']

  const isDisabled = listStatus.includes(bidDataForAgent?.status)

  return (
    <div className="w-full max-h-[90vh] flex flex-col p-0">
      {/* Header fijo */}
      <div className="sticky top-0 z-10 bg-white border-b px-6 py-4 shadow-sm">
        <div className="flex items-center gap-2 text-xl">
          <DollarSign className="w-5 h-5 text-blue-500" />
          {t('agentOffers.proposeNewPrice')} - {bidDataShippingType}
        </div>
      </div>
      
      {/* Contenido con scroll */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {isMaritimo ? (
          <ProposalFormSea onSubmit={handleSubmit} bidDataForAgent={bidDataForAgent} />
        ) : (
          <ProposalFormAir onSubmit={handleSubmit} bidDataForAgent={bidDataForAgent} />
        )}
      </div>
    </div>
  )
} 