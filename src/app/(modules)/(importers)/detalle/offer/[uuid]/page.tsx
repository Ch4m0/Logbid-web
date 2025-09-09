
"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Separator } from "@/src/components/ui/separator"
import { ArrowLeft, MapPin, DollarSign, FileText, User, Phone, Mail, Building, Loader2 } from "lucide-react"
import { useRouter, useParams, useSearchParams } from "next/navigation"
import { useGetOfferById } from "@/src/app/hooks/useGetOfferById"
import { useGetShipment } from "@/src/app/hooks/useGetShipment"
import { useTranslation } from "@/src/hooks/useTranslation"
import { modalService } from "@/src/service/modalService"
import { OfferConfirmationDialog } from "../../../(home)/components/OfferConfirmacionDialog"
import { OfferRejectionDialog } from "../components/OfferRejectionDialog"
import BidInfo from "../../components/BidInfo"

export default function OfferDetailPage() {
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()
  const { t } = useTranslation()
  
  const offerId = params.uuid as string
  const marketId = searchParams.get('market') || ''
  
  const { data: offer, isPending: loading, error } = useGetOfferById({ offer_id: offerId })
  
  // Obtener datos del shipment si la oferta ya está cargada
  const { data: shipmentData, isPending: shipmentLoading } = useGetShipment({ 
    shipment_id: offer?.shipment_uuid || null 
  })

  const handleAcceptOffer = () => {
    if (!offer) return
    
    const modalData = {
      id: offer.id,
      uuid: offer.uuid,
      agent_code: offer.agent_code,
      price: offer.price,
      shipping_type: offer.shipping_type,
      details: offer.details,
      status: offer.status,
      shipment_uuid: shipmentData?.uuid,
      ...{origin_country: shipmentData?.origin_country,
        origin_name: shipmentData?.origin_name, 
        destination_country: shipmentData?.destination_country, 
        destination_name: shipmentData?.destination_name,
      },
    }
    
    modalService.showModal({
      component: OfferConfirmationDialog,
      props: modalData,
    })
  }

  const handleRejectOffer = () => {
    if (!offer) return
    
    const modalData = {
      id: offer.id,
      uuid: offer.uuid,
      agent_code: offer.agent_code,
      agent_name: offer.agent_name,
      agent_company: offer.agent_company,
      price: offer.price,
      shipping_type: offer.shipping_type,
      origin_country: offer.origin_country,
      origin_name: offer.origin_name,
      destination_country: offer.destination_country,
      destination_name: offer.destination_name,
      status: offer.status,
    }
    
    modalService.showModal({
      component: OfferRejectionDialog,
      props: modalData,
    })
  }

  // Wrapper component para BidInfo con altura limitada
  const BidInfoWrapper = ({ bidDataForAgent }: { bidDataForAgent: any }) => (
    <div className="max-h-[90vh] overflow-y-auto">
      <BidInfo bidDataForAgent={bidDataForAgent} />
    </div>
  )

  const handleShowShipmentInfo = () => {
    if (!offer || !shipmentData || shipmentLoading) return
    
    modalService.showModal({
      component: BidInfoWrapper,
      props: { bidDataForAgent: shipmentData },
    })
  }

  if (loading) {
    return (
      <div className="container mx-auto p-6 flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2">
          <Loader2 className="w-6 h-6 animate-spin" />
          <span>{t('common.loading')}...</span>
        </div>
      </div>
    )
  }

  if (error || !offer) {
    return (
      <div className="container mx-auto p-6">
        <div className="text-center py-8">
          <h2 className="text-xl font-semibold text-destructive">{t('common.errorLoadingOffer')}</h2>
          <p className="text-muted-foreground mt-2">{t('common.offerNotFound')}</p>
          <Button variant="outline" onClick={() => router.back()} className="mt-4">
            <ArrowLeft className="w-4 h-4 mr-1" />
            {t('common.back')}
          </Button>
        </div>
      </div>
    )
  }

  // Procesar detalles completos si están disponibles
  const details = offer.details || {}
  const freight_fees = details.freight_fees || {}
  const destination_fees = details.destination_fees || {}
  const additional_fees = details.additional_fees || {}
  const origin_fees = details.origin_fees || {}
  const other_fees = details.other_fees || {}
  const basic_service = details.basic_service || {}
  const currency = details.currency || 'USD'

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge className="bg-yellow-100 text-yellow-800">{t('common.pending')}</Badge>
      case 'accepted':
        return <Badge className="bg-green-100 text-green-800">{t('common.accepted')}</Badge>
      case 'rejected':
        return <Badge className="bg-red-100 text-red-800">{t('common.rejected')}</Badge>
      default:
        return <Badge variant="outline">{status || t('common.pending')}</Badge>
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="space-y-4">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4 mr-1" />
          { t('common.back') }
        </Button>
        <div className="flex flex-col gap-4">
          {/* Título, badge y botón */}
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-bold text-card-foreground">{ t('common.offer')}</h1>
                {getStatusBadge(offer.status)}
              </div>
              <p className="text-muted-foreground text-sm sm:text-base break-all sm:break-normal">
                { t('common.code') }: {offer.uuid}
              </p>
            </div>
            
            {/* Botón alineado con el título */}
            <div className="flex-shrink-0">
              <Button 
                variant="outline" 
                size="lg" 
                className="w-full sm:w-auto" 
                onClick={handleShowShipmentInfo}
                disabled={shipmentLoading || !shipmentData}
              >
                {shipmentLoading ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4 mr-2" />
                )}
                <span className="hidden sm:inline">
                  {shipmentLoading ? t('common.loading2') : t('common.viewShipmentInfo')}
                </span>
                <span className="sm:hidden">
                  {shipmentLoading ? t('common.loading2') : t('common.shipmentInfoShort')}
                </span>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Información Principal */}
        <Card className="lg:col-span-2" style={{ backgroundColor: '#f8fafc' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-primary" />
              { t('common.offerInformation') }
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-primary/5 rounded-lg">
              <div>
                <p className="text-sm text-muted-foreground">{ t('common.totalPrice') }</p>
                <p className="text-3xl font-bold text-primary">{currency} {offer.price}</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-muted-foreground">{t('common.offerDate')}</p>
                <p className="font-medium">{new Date(offer.inserted_at).toLocaleString()}</p>
              </div>
            </div>

            <Separator />

            {/* Desglose de Precios */}
            <div>
              <h3 className="font-semibold mb-3">{t('common.priceBreakdown')}</h3>
              <div className="space-y-2">
                {/* Freight Fees */}
                {freight_fees.value && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('common.baseFreight')}</span>
                    <span>{currency} {freight_fees.value}</span>
                  </div>
                )}

                {/* Origin Fees */}
                {Object.keys(origin_fees).length > 0 && (
                  <>
                    <div className="text-sm font-medium text-muted-foreground mt-4 mb-2">{t('common.originFees')}</div>
                    {Object.entries(origin_fees).map(([key, value]) => (
                      <div key={key} className="flex justify-between pl-4">
                        <span className="text-muted-foreground capitalize">{key.replace('_', ' ')}</span>
                        <span>{currency} {value}</span>
                      </div>
                    ))}
                  </>
                )}

                {/* Destination Fees */}
                {Object.keys(destination_fees).length > 0 && (
                  <>
                    <div className="text-sm font-medium text-muted-foreground mt-4 mb-2">{t('common.destinationFees')}</div>
                    {Object.entries(destination_fees).map(([key, value]) => (
                      <div key={key} className="flex justify-between pl-4">
                        <span className="text-muted-foreground capitalize">{key.replace('_', ' ')}</span>
                        <span>{currency} {value}</span>
                      </div>
                    ))}
                  </>
                )}

                {/* Additional Fees */}
                {Object.keys(additional_fees).length > 0 && (
                  <>
                    <div className="text-sm font-medium text-muted-foreground mt-4 mb-2">{t('common.additionalFees')}</div>
                    {Object.entries(additional_fees).map(([key, value]) => (
                      <div key={key} className="flex justify-between pl-4">
                        <span className="text-muted-foreground capitalize">{key.replace('_', ' ')}</span>
                        <span>{currency} {value}</span>
                      </div>
                    ))}
                  </>
                )}

                {/* Other Fees */}
                {Object.keys(other_fees).length > 0 && (
                  <>
                    <div className="text-sm font-medium text-muted-foreground mt-4 mb-2">{t('common.otherFees')}</div>
                    {Object.entries(other_fees).map(([key, value]) => (
                      <div key={key} className="flex justify-between pl-4">
                        <span className="text-muted-foreground capitalize">{key.replace('_', ' ')}</span>
                        <span>{currency} {value}</span>
                      </div>
                    ))}
                  </>
                )}

                <Separator />
                <div className="flex justify-between font-bold text-lg">
                  <span>{t('common.total')}</span>
                  <span className="text-primary">{currency} {offer.price}</span>
                </div>
              </div>
            </div>

            {/* Información de Contenedor si está disponible */}
            {freight_fees.container && (
              <>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-3">{t('common.containerDetails')}</h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">{t('common.containerType')}</p>
                      <p className="font-medium">{freight_fees.container}</p>
                    </div>
                    {freight_fees.dimensions && (
                      <div>
                        <p className="text-sm text-muted-foreground">{t('common.dimensions')}</p>
                        <p className="font-medium">
                          {freight_fees.dimensions.length} x {freight_fees.dimensions.width} x {freight_fees.dimensions.height}
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Información del Agente */}
        <Card style={{ backgroundColor: '#f8fafc' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              {t('common.logisticsAgent')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-3">
                <User className="w-8 h-8 text-primary" />
              </div>
              <h3 className="font-semibold">{offer.agent_name || t('common.agentGeneric')}</h3>
              <p className="text-sm text-muted-foreground">{offer.agent_company || t('common.companyNotSpecified')}</p>
            </div>

            <Separator />

            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{offer.agent_role || t('common.logisticsAgent')}</span>
              </div>
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm">{t('common.code')}: {offer.agent_code}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Detalle de ruta */}
        <Card style={{ backgroundColor: '#f8fafc' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="w-5 h-5 text-primary" />
              {t('common.routeDetail')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm text-muted-foreground">{t('common.originGeneric')}</p>
                <p className="font-medium">
                  {offer.origin_country && offer.origin_name 
                    ? `${offer.origin_country} - ${offer.origin_name}`
                    : t('common.notSpecified')
                  }
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">{t('common.destinationGeneric')}</p>
                <p className="font-medium">
                  {offer.destination_country && offer.destination_name 
                    ? `${offer.destination_country} - ${offer.destination_name}`
                    : t('common.notSpecified')
                  }
                </p>
              </div>
              {offer.transportation && (
                <div>
                  <p className="text-sm text-muted-foreground">{t('common.transportationType')}</p>
                  <p className="font-medium">{offer.transportation}</p>
                </div>
              )}
              {details.transit_time && (
                <div>
                  <p className="text-sm text-muted-foreground">{t('common.transitTime')}</p>
                  <p className="font-medium">{details.transit_time}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Términos y Condiciones */}
        <Card style={{ backgroundColor: '#f8fafc' }}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-primary" />
              {t('common.termsAndConditions')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              {details.payment_terms && (
                <div>
                  <p className="text-sm text-muted-foreground">{t('common.paymentTerms')}</p>
                  <p className="font-medium">{details.payment_terms}</p>
                </div>
              )}
              
              {/* Basic Service Information */}
              {basic_service.validity && (
                <div>
                  <p className="text-sm text-muted-foreground">{t('common.offerValidity')}</p>
                  <p className="font-medium">
                    {basic_service.validity.time} {basic_service.validity.unit}
                  </p>
                </div>
              )}
              
              {basic_service.free_days && (
                <div>
                  <p className="text-sm text-muted-foreground">{t('common.freeDays')}</p>
                  <p className="font-medium">{basic_service.free_days} {t('common.days')}</p>
                </div>
              )}
              
              {basic_service.cancellation_fee && (
                <div>
                  <p className="text-sm text-muted-foreground">{t('common.cancellationFee')}</p>
                  <p className="font-medium">{currency} {basic_service.cancellation_fee}</p>
                </div>
              )}
              
              {additional_fees.insurance && (
                <div>
                  <p className="text-sm text-muted-foreground">{t('common.insurance')}</p>
                  <p className="font-medium text-sm">{t('common.includedUpTo')} {currency} {additional_fees.insurance}</p>
                </div>
              )}
              
              {details.incoterm && (
                <div>
                  <p className="text-sm text-muted-foreground">{t('common.incoterm')}</p>
                  <p className="font-medium">{details.incoterm}</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Información Adicional - Solo si hay datos no estructurados */}
        {details.additional_info && 
         typeof details.additional_info === 'string' && 
         !details.additional_info.includes('"details"') && (
          <Card className="lg:col-span-3" style={{ backgroundColor: '#f8fafc' }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                {t('common.additionalInfo')}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/30 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {details.additional_info}
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Acciones */}
        {offer.status === 'pending' && (
          <Card className="lg:col-span-3" style={{ backgroundColor: '#f8fafc' }}>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 sm:gap-4">
                <Button 
                  variant="outline" 
                  size="lg" 
                  className="w-full sm:w-auto" 
                  onClick={handleShowShipmentInfo}
                  disabled={shipmentLoading || !shipmentData}
                >
                  {shipmentLoading ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <FileText className="w-4 h-4 mr-2" />
                  )}
                  <span className="hidden sm:inline">
                    {shipmentLoading ? t('common.loading2') : t('common.viewShipmentInfo')}
                  </span>
                  <span className="sm:hidden">
                    {shipmentLoading ? t('common.loading2') : t('common.shipmentInfoShort')}
                  </span>
                </Button>
                <Button variant="destructive" size="lg" className="w-full sm:w-auto" onClick={handleRejectOffer}>
                  <span className="hidden sm:inline">{t('common.rejectOffer')}</span>
                  <span className="sm:hidden">{t('common.reject')}</span>
                </Button>
                <Button size="lg" className="px-4 sm:px-8 w-full sm:w-auto" onClick={handleAcceptOffer}>
                  <span className="hidden sm:inline">{t('common.acceptOffer')}</span>
                  <span className="sm:hidden">{t('common.accept')}</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}