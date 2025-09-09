'use client'
import { ShippingIcon } from '@/src/components/ShippingIcon'
import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { useTranslation } from '@/src/hooks/useTranslation'
import { Eye } from 'lucide-react'

interface ListItemProps {
  offer: {
    id: number
    uuid: string
    agent_code?: string
    price: string
    inserted_at: string
    status?: string
    shipping_type: string
  }
  currency?: string
  onAcceptOffer: (offer: any) => void
  handleViewOfferDetail: (offerId: string) => void
}

export default function ListItem({ offer, currency, onAcceptOffer, handleViewOfferDetail }: ListItemProps) {
  const { t } = useTranslation()
  return (
    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between p-4 border rounded-lg gap-4 " style={{ backgroundColor: '#f8fafc' }}>
      {/* Información principal - Móvil: vertical, Desktop: horizontal */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 flex-1">
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
            <ShippingIcon shippingType={offer.shipping_type} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm sm:text-base truncate">{t('offerCard.agentCode')}: {offer.agent_code || 'N/A'}</p>
            <p className="text-xs sm:text-sm text-muted-foreground truncate">{t('offerCard.offerId')}: {offer.uuid}</p>
          </div>
        </div>
        
        {/* Precio y fecha */}
        <div className="text-left sm:text-right sm:min-w-fit">
          <p className="text-lg font-bold text-primary">{currency} {offer.price}</p>
          <p className="text-xs sm:text-sm text-muted-foreground">{new Date(offer.inserted_at).toLocaleString()}</p>
        </div>
      </div>

      {/* Badge de estado y botones */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-2">
        <div className="flex justify-start">
          <Badge
            className={`w-fit ${
              offer.status === "pending" ? "bg-yellow-100 text-yellow-800" : 
              offer.status === "accepted" ? "bg-green-100 text-green-800" :
              "bg-red-100 text-red-800"
            }`}
          >
            {offer.status === "pending" ? t('offerCard.pending') : 
             offer.status === "accepted" ? t('offerCard.accepted') :
             offer.status === "rejected" ? t('offerCard.rejected') : offer.status}
          </Badge>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1 sm:flex-none"
            onClick={(e) => {
              e.stopPropagation()
              handleViewOfferDetail(offer.uuid)
            }}
          >
            <Eye className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">{t('common.showDetails')}</span>
            <span className="sm:hidden">Ver</span>
          </Button>
          <Button 
            variant="default" 
            size="sm"
            className="flex-1 sm:flex-none"
            onClick={() => onAcceptOffer(offer)}
            disabled={offer.status === 'accepted' || offer.status === 'rejected'}
          >
            <span className="hidden sm:inline">{t('offerCard.acceptOffer')}</span>
            <span className="sm:hidden">Aceptar</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
