'use client'
import React from 'react'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/src/components/ui/dialog'
import { Button } from '@/src/components/ui/button'
import { DollarSign, Plus, AlertCircle } from 'lucide-react'
import ProposalFormAir from './ProposalFormAir'
import ProposalFormSea from './ProposalFormSea'
import { useTranslation } from '@/src/hooks/useTranslation'

interface ProposalModalProps {
  shippingType: string
  bidDataShippingType: string
  bidDataForAgent?: any
  onSubmit: (value: any) => void
}

export default function ProposalModal({ 
  shippingType, 
  bidDataShippingType, 
  bidDataForAgent,
  onSubmit 
}: ProposalModalProps) {
  const { t } = useTranslation()
  const [open, setOpen] = React.useState(false)

  const handleSubmit = (value: any) => {
    onSubmit(value)
    setOpen(false) // Cerrar modal después de enviar
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

  const isDisabled = bidDataForAgent?.status === 'Closed' || 
                    bidDataForAgent?.status === 'Cancelled' ||
                    (bidDataForAgent?.expiration_date && new Date(bidDataForAgent.expiration_date) < new Date())

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="relative group">
          <Button 
            className="bg-blue-500 hover:bg-blue-600 text-white transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
            size="default"
            disabled={isDisabled}
          >
            <DollarSign className="w-4 h-4 mr-2" />
            {t('agentOffers.proposePrice')}
          </Button>
          
          {/* Tooltip cuando está deshabilitado */}
          {isDisabled && (
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-sm rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
              <div className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4" />
                {getDisabledReason()}
              </div>
              <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
            </div>
          )}
        </div>
      </DialogTrigger>
      <DialogContent className="max-w-5xl max-h-[90vh] flex flex-col p-0 [&>button]:z-20 [&>button]:bg-white [&>button]:shadow-md [&>button]:border">
        {/* Header fijo */}
        <DialogHeader className="sticky top-0 z-10 bg-white border-b px-6 py-4 shadow-sm">
          <DialogTitle className="flex items-center gap-2 text-xl">
            <DollarSign className="w-5 h-5 text-blue-500" />
            {t('agentOffers.proposeNewPrice')} - {bidDataShippingType}
          </DialogTitle>
        </DialogHeader>
        
        {/* Contenido con scroll */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          {isMaritimo ? (
            <ProposalFormSea onSubmit={handleSubmit} bidDataForAgent={bidDataForAgent} />
          ) : (
            <ProposalFormAir onSubmit={handleSubmit} bidDataForAgent={bidDataForAgent} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 