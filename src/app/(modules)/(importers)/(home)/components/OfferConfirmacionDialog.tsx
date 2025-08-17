"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/src/components/ui/dialog"
import { Button } from "@/src/components/ui/button"
import { Badge } from "@/src/components/ui/badge"
import { CheckCircle, X, AlertCircle, Ship, Plane, MapPin, DollarSign, Package, Calendar } from "lucide-react"
import { useBidStore } from "@/src/store/useBidStore"
import { useCloseBid } from "@/src/app/hooks/useCloseBid"
import { modalService } from "@/src/service/modalService"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { useTranslation } from "@/src/hooks/useTranslation"
import { useSendOfferAcceptedEmails } from "@/src/hooks/useSendOfferAcceptedEmails"

export function OfferConfirmationDialog(offerData: any) {
  console.log('OfferData received:', offerData)
  console.log('OfferData stringified:', JSON.stringify(offerData, null, 2))
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  const market = searchParams.get('market')
  const [isConfirming, setIsConfirming] = useState(false)
  const { mutate: closeBid } = useCloseBid()
  const { mutate: sendEmails } = useSendOfferAcceptedEmails()

 
  const handleConfirm = () => {
    console.log('offerData', offerData)
    setIsConfirming(true)
    console.log('Abriendo modal')
    closeBid(
      { bid_id: offerData.bidId, offer_id: offerData.id },
      {
        onSuccess: (res) => {
          console.log('Subasta cerrada correctamente')

          // Enviar emails de notificación
          sendEmails(
            { bid_id: offerData.bidId, offer_id: offerData.id },
            {
              onSuccess: (emailRes) => {
                console.log('✅ Emails enviados exitosamente:', emailRes)
              },
              onError: (emailError) => {
                console.error('❌ Error enviando emails:', emailError)
                // No bloquear el flujo si fallan los emails
              }
            }
          )

          router.push(`confirmation-bid?market=${market}&shipment=${offerData.shipment_uuid}&offer=${offerData.uuid}`)
          modalService.closeModal()
        },
        onError: () => {
          console.error('Hubo un error tratando de cerrar la subasta')
          setIsConfirming(false)
        },
      }
    )
  }

  const onClose  = () => {
    modalService.closeModal()
  }

  return (
    <Card className="w-full max-h-[600px] overflow-hidden flex flex-col">
    <CardHeader className="flex-shrink-0">
      <CardTitle className="flex items-center gap-2 text-xl">
        <CheckCircle className="h-5 w-5 text-green-500" />
        {t('offerConfirmation.title')}
      </CardTitle>
      <CardDescription>{t('offerConfirmation.description')}</CardDescription>
    </CardHeader>

    <CardContent className="space-y-4 overflow-y-auto flex-1 pr-2">
      <div className="flex justify-between items-center">
        <Badge variant="outline" className="text-sm font-medium border-2 border-primary px-3 py-1">
          {offerData.codeBid}
        </Badge>
        <Badge
          className={offerData.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"}
        >
          {offerData.status}
        </Badge>
      </div>

      {/* Route information */}
      <div className="bg-muted/30 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-2">
          {offerData.shipping_type === "2" ? (
            <Plane className="h-5 w-5 text-primary" />
          ) : (
            <Ship className="h-5 w-5 text-primary" />
          )}
          <span className="font-medium">
            {t('offerConfirmation.route')} {offerData.shipping_type === "2" ? t('offerConfirmation.air') : t('offerConfirmation.maritime')}
          </span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-2">
            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">{t('offerConfirmation.origin')}</p>
              <p className="font-medium">
                {offerData.origin_country && offerData.origin_name 
                  ? `${offerData.origin_country} - ${offerData.origin_name}`
                  : offerData.originBid || 'No especificado'}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">{t('offerConfirmation.destination')}</p>
              <p className="font-medium">
                {offerData.destination_country && offerData.destination_name 
                  ? `${offerData.destination_country} - ${offerData.destination_name}`
                  : offerData.finishBid || 'No especificado'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Price and container/dimensions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-primary/5 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">{t('common.totalPrice')}</p>
              <p className="font-medium text-lg">
                {offerData.price ? `$${offerData.price}` : 
                 offerData.details?.freight_fees?.value ? `USD ${offerData.details.freight_fees.value}` :
                 'Precio no disponible'}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-primary/5 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <div>
              {offerData.shipping_type === "1" ? (
                <>
                  <p className="text-sm text-muted-foreground">{t('common.container')}</p>
                  <p className="font-medium">{offerData.details.freight_fees?.container}</p>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">{t('common.dimensions')}</p>
                  <p className="font-medium">
                    {offerData.details.freight_fees?.dimensions ? (
                      `${offerData.details.freight_fees.dimensions.length}x${offerData.details.freight_fees.dimensions.width}x${offerData.details.freight_fees.dimensions.height} ${offerData.details.freight_fees.dimensions.units || "cm"}`
                    ) : (
                      t('common.notSpecified')
                    )}
                  </p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Service details */}
      {offerData.details?.basic_service && (
        offerData.details.basic_service.free_days || 
        offerData.details.basic_service.validity || 
        offerData.details.basic_service.cancellation_fee
      ) && (
        <div className="bg-muted/30 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-3">
            <Calendar className="h-5 w-5 text-primary" />
            <span className="font-medium">{t('common.serviceDetails')}</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {offerData.details.basic_service.free_days && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('common.freeDays')}:</span>
                <span className="font-medium">{offerData.details.basic_service.free_days} {t('common.days')}</span>
              </div>
            )}
            {offerData.details.basic_service.validity && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('common.validity')}:</span>
                <span className="font-medium">
                  {offerData.details.basic_service.validity.time} {offerData.details.basic_service.validity.unit}
                </span>
              </div>
            )}
            {offerData.details.basic_service.cancellation_fee && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('common.cancellationFee')}:</span>
                <span className="font-medium">USD {offerData.details.basic_service.cancellation_fee}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Detalles completos de la propuesta */}
      <div className="space-y-4">
        {/* Tarifas de Flete */}
        <div className="bg-muted/30 rounded-lg p-4">
          <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
            <Ship className="h-4 w-4 text-primary" />
            {t('offerCard.freightRates')}
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {/* Para envíos marítimos */}
            {offerData.shipping_type === "1" && (
              <div className="flex justify-between p-2 bg-white/50 rounded">
                <span>{t('common.container')}:</span>
                <span className="font-medium">{offerData.details.freight_fees?.container}</span>
              </div>
            )}
            
            {/* Para envíos aéreos */}
            {offerData.shipping_type === "2" && offerData.details.freight_fees?.dimensions && (
              <>
                <div className="flex justify-between p-2 bg-white/50 rounded">
                  <span>{t('offerCard.length')}:</span>
                  <span className="font-medium">{offerData.details.freight_fees.dimensions.length} {offerData.details.freight_fees.dimensions.units || "cm"}</span>
                </div>
                <div className="flex justify-between p-2 bg-white/50 rounded">
                  <span>{t('offerCard.width')}:</span>
                  <span className="font-medium">{offerData.details.freight_fees.dimensions.width} {offerData.details.freight_fees.dimensions.units || "cm"}</span>
                </div>
                <div className="flex justify-between p-2 bg-white/50 rounded">
                  <span>{t('offerCard.height')}:</span>
                  <span className="font-medium">{offerData.details.freight_fees.dimensions.height} {offerData.details.freight_fees.dimensions.units || "cm"}</span>
                </div>
              </>
            )}
            
            <div className="flex justify-between p-2 bg-white/50 rounded">
              <span>{t('offerConfirmation.freightValue')}:</span>
              <span className="font-medium">USD {offerData.details?.freight_fees?.value}</span>
            </div>
          </div>
        </div>

        {/* Cargos Adicionales (solo para aéreo) */}
        {offerData.shipping_type === "2" && offerData.details?.additional_fees && (
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="text-sm font-medium mb-3">{t('offerCard.additionalCharges')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {Object.entries(offerData.details.additional_fees).map(([key, value]) => (
                <div key={key} className="flex justify-between p-2 bg-white/50 rounded">
                  <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                  <span className="font-medium">USD {String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tarifas de Origen */}
        {offerData.details?.origin_fees && (
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="text-sm font-medium mb-3">{t('offerCard.originRates')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {Object.entries(offerData.details.origin_fees).map(([key, value]) => (
                <div key={key} className="flex justify-between p-2 bg-white/50 rounded">
                  <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                  <span className="font-medium">USD {String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tarifas de Destino */}
        {offerData.details?.destination_fees && (
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="text-sm font-medium mb-3">{t('offerCard.destinationRates')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {Object.entries(offerData.details.destination_fees).map(([key, value]) => (
                <div key={key} className="flex justify-between p-2 bg-white/50 rounded">
                  <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                  <span className="font-medium">
                    {typeof value === 'string' && String(value).includes('%') ? String(value) : `USD ${String(value)}`}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Servicio Básico */}
        {offerData.details?.basic_service && (
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="text-sm font-medium mb-3">{t('offerCard.basicService')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {offerData.details.basic_service?.cancellation_fee && (
                <div className="flex justify-between p-2 bg-white/50 rounded">
                  <span>{t('common.cancellationFee')}:</span>
                  <span className="font-medium">USD {offerData.details.basic_service.cancellation_fee}</span>
                </div>
              )}
              {offerData.details.basic_service?.free_days && (
                <div className="flex justify-between p-2 bg-white/50 rounded">
                  <span>{t('common.freeDays')}:</span>
                  <span className="font-medium">{offerData.details.basic_service.free_days} {t('common.days')}</span>
                </div>
              )}
              {offerData.details.basic_service?.validity && (
                <div className="flex justify-between p-2 bg-white/50 rounded">
                  <span>{t('common.validity')}:</span>
                  <span className="font-medium">
                    {offerData.details.basic_service.validity.time} {offerData.details.basic_service.validity.unit}
                  </span>
                </div>
              )}
              {/* Mostrar cualquier otro campo en basic_service */}
              {Object.entries(offerData.details.basic_service).map(([key, value]) => {
                if (!['cancellation_fee', 'free_days', 'validity'].includes(key) && value) {
                  return (
                    <div key={key} className="flex justify-between p-2 bg-white/50 rounded">
                      <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                      <span className="font-medium">{String(value)}</span>
                    </div>
                  );
                }
                return null;
              })}
            </div>
          </div>
        )}

        {/* Otros Cargos */}
        {offerData.details?.other_fees && Object.keys(offerData.details.other_fees).length > 0 && (
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="text-sm font-medium mb-3">{t('offerCard.otherCharges')}</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {Object.entries(offerData.details.other_fees).map(([key, value]) => (
                <div key={key} className="flex justify-between p-2 bg-white/50 rounded">
                  <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                  <span className="font-medium">USD {String(value)}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Warning */}
      <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
        <AlertCircle className="h-5 w-5 flex-shrink-0" />
        <p className="text-sm">
          {t('offerConfirmation.warning')}
        </p>
      </div>
    </CardContent>

    <CardFooter className="flex flex-col sm:flex-row sm:justify-between gap-3 pt-4 flex-shrink-0">
      <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
        <X className="mr-2 h-4 w-4" />
        {t('common.cancel')}
      </Button>
      <Button
        onClick={handleConfirm}
        disabled={isConfirming}
        className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
      >
        {isConfirming ? (
          <>{t('offerConfirmation.processing')}</>
        ) : (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            {t('offerConfirmation.confirmAndAccept')}
          </>
        )}
      </Button>
    </CardFooter>
  </Card>
  )
}
