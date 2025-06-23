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
import { DollarSign, Plus } from 'lucide-react'
import ProposalFormAir from './ProposalFormAir'
import ProposalFormSea from './ProposalFormSea'
import { useTranslation } from '@/src/hooks/useTranslation'

interface ProposalModalProps {
  shippingType: string
  bidDataShippingType: string
  onSubmit: (value: any) => void
}

export default function ProposalModal({ 
  shippingType, 
  bidDataShippingType, 
  onSubmit 
}: ProposalModalProps) {
  const { t } = useTranslation()
  const [open, setOpen] = React.useState(false)

  const handleSubmit = (value: any) => {
    onSubmit(value)
    setOpen(false) // Cerrar modal después de enviar
  }

  // Use the actual shipment type to determine which form to show
  const isMaritimo = bidDataShippingType === 'Marítimo'

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-blue-500 hover:bg-blue-600 text-white transition-colors"
          size="default"
        >
          <DollarSign className="w-4 h-4 mr-2" />
          {t('agentOffers.proposePrice')}
        </Button>
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
            <ProposalFormSea onSubmit={handleSubmit} />
          ) : (
            <ProposalFormAir onSubmit={handleSubmit} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 