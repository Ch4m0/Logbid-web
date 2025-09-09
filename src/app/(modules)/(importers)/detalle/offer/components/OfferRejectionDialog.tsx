"use client"

import { useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { X, AlertTriangle, MapPin, DollarSign, User } from "lucide-react"
import { useRejectOffer } from "@/src/app/hooks/useRejectOffer"
import { modalService } from "@/src/service/modalService"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Textarea } from "@/src/components/ui/textarea"
import { Label } from "@/src/components/ui/label"
import { useTranslation } from "@/src/hooks/useTranslation"

export function OfferRejectionDialog(offerData: any) {
  const { t } = useTranslation()
  const router = useRouter()
  const [isRejecting, setIsRejecting] = useState(false)
  const [rejectionReason, setRejectionReason] = useState("")
  const { mutate: rejectOffer } = useRejectOffer()

  const handleConfirm = () => {
    setIsRejecting(true)
    rejectOffer(
      { 
        offer_id: offerData.id
      },
      {
        onSuccess: () => {
          console.log('✅ Oferta rechazada correctamente')
          modalService.closeModal()
          // Refrescar la página o redirigir
          router.refresh()
        },
        onError: (error) => {
          console.error('❌ Error rechazando oferta:', error)
          setIsRejecting(false)
        },
      }
    )
  }

  const onClose = () => {
    modalService.closeModal()
  }

  return (
    <Card className="w-full max-w-2xl max-h-[600px] overflow-hidden flex flex-col">
      <CardHeader className="flex-shrink-0">
        <CardTitle className="flex items-center gap-2 text-xl">
          <AlertTriangle className="h-5 w-5 text-red-500" />
          {t('offerRejection.title')}
        </CardTitle>
        <CardDescription>{t('offerRejection.description')}</CardDescription>
      </CardHeader>

      <CardContent className="space-y-4 overflow-y-auto flex-1 pr-2">
        {/* Información básica de la oferta */}
        <div className="flex justify-between items-center">
          <Badge variant="outline" className="text-sm font-medium border-2 border-primary px-3 py-1">
            {offerData.uuid}
          </Badge>
          <Badge className="bg-yellow-100 text-yellow-800">
            {t('common.pending')}
          </Badge>
        </div>

        {/* Información del agente */}
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <User className="h-5 w-5 text-primary" />
            <span className="font-medium">{t('common.logisticsAgent')}</span>
          </div>
          <div className="space-y-1">
            <p className="font-medium">{offerData.agent_name || t('common.agentGeneric')}</p>
            <p className="text-sm text-muted-foreground">{offerData.agent_company || t('common.companyNotSpecified')}</p>
            <p className="text-sm text-muted-foreground">{t('common.code')}: {offerData.agent_code}</p>
          </div>
        </div>

        {/* Información de la ruta */}
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <MapPin className="h-5 w-5 text-primary" />
            <span className="font-medium">{t('common.routeDetail')}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <p className="text-sm text-muted-foreground">{t('common.originGeneric')}</p>
              <p className="font-medium">
                {offerData.origin_country && offerData.origin_name 
                  ? `${offerData.origin_country} - ${offerData.origin_name}`
                  : t('common.notSpecified')
                }
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">{t('common.destinationGeneric')}</p>
              <p className="font-medium">
                {offerData.destination_country && offerData.destination_name 
                  ? `${offerData.destination_country} - ${offerData.destination_name}`
                  : t('common.notSpecified')
                }
              </p>
            </div>
          </div>
        </div>

        {/* Precio */}
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-red-600" />
            <div>
              <p className="text-sm text-muted-foreground">{t('common.offerPrice')}</p>
              <p className="font-medium text-lg text-red-700">USD {offerData.price}</p>
            </div>
          </div>
        </div>

        {/* Campo de razón de rechazo */}
        <div className="space-y-2">
          <Label htmlFor="rejection-reason">{t('offerRejection.reason')} ({t('common.optional')})</Label>
          <Textarea
            id="rejection-reason"
            placeholder={t('offerRejection.reasonPlaceholder')}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            className="min-h-[80px]"
          />
        </div>

        {/* Warning */}
        <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800">
          <AlertTriangle className="h-5 w-5 flex-shrink-0" />
          <p className="text-sm">
            {t('offerRejection.warning')}
          </p>
        </div>
      </CardContent>

      <CardFooter className="flex flex-col sm:flex-row sm:justify-between gap-3 pt-4 flex-shrink-0">
        <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
          <X className="mr-2 h-4 w-4" />
          {t('common.cancel')}
        </Button>
        <Button
          variant="destructive"
          onClick={handleConfirm}
          disabled={isRejecting}
          className="w-full sm:w-auto"
        >
          {isRejecting ? (
            <>{t('offerRejection.processing')}</>
          ) : (
            <>
              <AlertTriangle className="mr-2 h-4 w-4" />
              {t('offerRejection.confirmReject')}
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  )
}
