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
import ProposalForm from './ProposalForm'
import ProposalFormMaritimo from './ProposalFormMaritimo'

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
  const [open, setOpen] = React.useState(false)

  const handleSubmit = (value: any) => {
    onSubmit(value)
    setOpen(false) // Cerrar modal después de enviar
  }

  const isMaritimo = bidDataShippingType === shippingType

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button 
          className="bg-blue-500 hover:bg-blue-600 text-white transition-colors"
          size="default"
        >
          <DollarSign className="w-4 h-4 mr-2" />
          Proponer Precio
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <DollarSign className="w-5 h-5 text-blue-500" />
            Proponer Nuevo Precio
          </DialogTitle>
        </DialogHeader>
        <div className="mt-4">
          {isMaritimo ? (
            <ProposalFormMaritimo onSubmit={handleSubmit} />
          ) : (
            <ProposalForm onSubmit={handleSubmit} />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
} 