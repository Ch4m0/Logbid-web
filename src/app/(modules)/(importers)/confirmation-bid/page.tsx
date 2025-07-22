"use client"

import { useState, useEffect } from "react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card"
import { Separator } from "@/src/components/ui/separator"
import { toast } from "@/src/components/ui/use-toast"
import IconPrinter from "@/src/icons/PrintIcon"
import { HomeIcon, Copy, CheckCircle, MapPin, DollarSign, Tag, Calendar, Ship, Package } from "lucide-react"
import { useRouter } from "next/navigation"
import { Badge } from "@/src/components/ui/badge"
import { useBidStore } from "@/src/store/useBidStore"
import { useTranslation } from "@/src/hooks/useTranslation"

const ConfirmationPage = () => {
  const { t } = useTranslation()
  const [isCopied, setIsCopied] = useState(false)
  const router = useRouter()
  const bidStoreData = useBidStore()
  console.log(bidStoreData, 'BidStoreData')

  // Get the actual offer data from the store instead of hardcoded data
  const offerData = {
    originBid: bidStoreData.originBid || t('common.notSpecified'),
    finishBid: bidStoreData.finishBid || t('common.notSpecified'), 
    codeBid: bidStoreData.codeBid || t('common.notSpecified'),
    bidId: (bidStoreData as any).bidId || null,
    id: (bidStoreData as any).id || null,
    agent_id: (bidStoreData as any).agent_id || null,
    agent_code: (bidStoreData as any).agent_code || null,
    price: (bidStoreData as any).price || "USD 0",
    uuid: (bidStoreData as any).uuid || t('common.notSpecified'),
    status: (bidStoreData as any).status || "Active",
    bid_id: (bidStoreData as any).bid_id || null,
    shipping_type: (bidStoreData as any).shipping_type || "Marítimo",
    details: (bidStoreData as any).details || {
      basic_service: {
        cancellation_fee: 0,
        free_days: 0,
        validity: {
          time: 0,
          unit: "min",
        },
      },
      destination_fees: {
        agency: 0,
        bl_emission: 0,
        collect_fee: "0%",
        handling: 0,
      },
      freight_fees: {
        container: t('common.notSpecified'),
        value: 0,
      },
      origin_fees: {
        handling: 0,
        security_manifest: 0,
      },
      other_fees: {
        cancellation: 0,
        carbon: 0,
        low_sulfur: 0,
        other: 0,
        pre_shipment_inspection: 0,
        security_facility: 0,
        security_manifest: 0,
      },
    },
    inserted_at: (bidStoreData as any).inserted_at || new Date().toISOString(),
    updated_at: (bidStoreData as any).updated_at || new Date().toISOString(),
  }

  // Redirect to home if no data is available
  useEffect(() => {
    if (!(bidStoreData as any).uuid && !bidStoreData.codeBid) {
      toast({
        title: t('confirmationBid.noProposalData'),
        description: t('confirmationBid.noProposalDataMessage'),
        variant: "destructive",
      })
      router.push("/")
    }
  }, [bidStoreData, router, t])

  const copyToClipboard = () => {
    const textToCopy = `
${t('confirmationBid.offerCode')}: ${offerData.uuid}
${t('confirmationBid.auctionCode')}: ${offerData.codeBid}
${t('confirmationBid.origin')}: ${offerData.originBid}
${t('confirmationBid.destination')}: ${offerData.finishBid}
${t('confirmationBid.shippingType')}: ${offerData.shipping_type}
${t('confirmationBid.container')}: ${offerData.details.freight_fees.container}
${t('confirmationBid.price')}: USD ${offerData.details.freight_fees.value}
${t('confirmationBid.date')}: ${formatDate(offerData.inserted_at)}
    `.trim()

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        setIsCopied(true)
        toast({
          title: t('confirmationBid.copiedToClipboard'),
          description: t('confirmationBid.copiedToClipboardMessage'),
        })
        setTimeout(() => setIsCopied(false), 2000)
      })
      .catch((err) => {
        toast({
          title: t('confirmationBid.copyError'),
          description: t('confirmationBid.copyErrorMessage'),
          variant: "destructive",
        })
      })
  }

  const handleGoHome = () => {
    router.push("/")
  }

  const handlePrint = () => {
    window.print()
  }

  console.log(offerData, 'OfferData')

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("es-ES", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    })
  }

  return (
    <div className="flex justify-center items-center min-h-[80vh] p-4">
      <Card className="w-full max-w-3xl shadow-lg print:shadow-none">
        <CardHeader className="border-b pb-6">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-2xl flex items-center gap-2">
                <CheckCircle className="h-6 w-6 text-green-500" />
                {t('confirmationBid.proposalAccepted')}
              </CardTitle>
              <CardDescription className="mt-1">{t('confirmationBid.proposalAcceptedMessage')}</CardDescription>
            </div>
            <Badge className="bg-green-100 text-green-800 print:hidden">{t('confirmationBid.confirmed')}</Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">{t('confirmationBid.offerCode')}</span>
              <Badge variant="outline" className="text-sm font-medium border-2 border-primary px-3 py-1">
                {offerData.uuid}
              </Badge>
            </div>
            <div className="flex flex-col gap-1 items-end">
              <span className="text-sm text-muted-foreground">{t('confirmationBid.auctionCode')}</span>
              <Badge variant="outline" className="text-sm font-medium px-3 py-1">
                {offerData.codeBid}
              </Badge>
            </div>
          </div>

          {/* Route information */}
          <div className="bg-muted/30 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Ship className="h-5 w-5 text-primary" />
              <span className="font-medium">
                {t('confirmationBid.route')} {offerData.shipping_type === "Aéreo" ? t('confirmationBid.air') : t('confirmationBid.maritime')}
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('confirmationBid.origin')}</p>
                  <p className="font-medium">{offerData.originBid}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('confirmationBid.destination')}</p>
                  <p className="font-medium">{offerData.finishBid}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Price and container/dimensions */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-primary/5 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('confirmationBid.totalPrice')}</p>
                  <p className="font-medium text-lg">
                    {offerData.price || `USD ${offerData.details?.freight_fees?.value || 0}`}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-primary/5 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <div>
                  {offerData.shipping_type === "Marítimo" ? (
                    <>
                      <p className="text-sm text-muted-foreground">{t('confirmationBid.container')}</p>
                      <p className="font-medium">{offerData.details?.freight_fees?.container || t('common.notSpecified')}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">{t('confirmationBid.dimensions')}</p>
                      <p className="font-medium">
                        {offerData.details?.freight_fees?.dimensions ? (
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
            <div className="bg-muted/30 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="font-medium">{t('confirmationBid.serviceDetails')}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {offerData.details.basic_service.free_days && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('confirmationBid.freeDays')}:</span>
                    <span className="font-medium">{offerData.details.basic_service.free_days} {t('confirmationBid.days')}</span>
                  </div>
                )}
                {offerData.details.basic_service.validity && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('confirmationBid.validity')}:</span>
                    <span className="font-medium">
                      {offerData.details.basic_service.validity.time} {offerData.details.basic_service.validity.unit}
                    </span>
                  </div>
                )}
                {offerData.details.basic_service.cancellation_fee && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('confirmationBid.cancellationFee')}:</span>
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
                {t('confirmationBid.freightRates')}
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {/* Para envíos marítimos */}
                {offerData.shipping_type === "Marítimo" && (
                  <div className="flex justify-between p-2 bg-white/50 rounded">
                    <span>{t('confirmationBid.container')}:</span>
                    <span className="font-medium">{offerData.details?.freight_fees?.container || t('common.notSpecified')}</span>
                  </div>
                )}
                
                {/* Para envíos aéreos */}
                {offerData.shipping_type === "Aéreo" && offerData.details?.freight_fees?.dimensions && (
                  <>
                    <div className="flex justify-between p-2 bg-white/50 rounded">
                      <span>{t('confirmationBid.length')}:</span>
                      <span className="font-medium">{offerData.details.freight_fees.dimensions.length} {offerData.details.freight_fees.dimensions.units || "cm"}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-white/50 rounded">
                      <span>{t('confirmationBid.width')}:</span>
                      <span className="font-medium">{offerData.details.freight_fees.dimensions.width} {offerData.details.freight_fees.dimensions.units || "cm"}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-white/50 rounded">
                      <span>{t('confirmationBid.height')}:</span>
                      <span className="font-medium">{offerData.details.freight_fees.dimensions.height} {offerData.details.freight_fees.dimensions.units || "cm"}</span>
                    </div>
                  </>
                )}
                
                <div className="flex justify-between p-2 bg-white/50 rounded">
                  <span>{t('confirmationBid.freightValue')}:</span>
                  <span className="font-medium">USD {offerData.details?.freight_fees?.value || 0}</span>
                </div>
              </div>
            </div>

            {/* Cargos Adicionales (solo para aéreo) */}
            {offerData.shipping_type === "Aéreo" && offerData.details?.additional_fees && (
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="text-sm font-medium mb-3">{t('confirmationBid.additionalCharges')}</h4>
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
                <h4 className="text-sm font-medium mb-3">{t('confirmationBid.originRates')}</h4>
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
                <h4 className="text-sm font-medium mb-3">{t('confirmationBid.destinationRates')}</h4>
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
                <h4 className="text-sm font-medium mb-3">{t('confirmationBid.basicService')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {offerData.details.basic_service?.cancellation_fee && (
                    <div className="flex justify-between p-2 bg-white/50 rounded">
                      <span>{t('confirmationBid.cancellationFee')}:</span>
                      <span className="font-medium">USD {offerData.details.basic_service.cancellation_fee}</span>
                    </div>
                  )}
                  {offerData.details.basic_service?.free_days && (
                    <div className="flex justify-between p-2 bg-white/50 rounded">
                      <span>{t('confirmationBid.freeDays')}:</span>
                      <span className="font-medium">{offerData.details.basic_service.free_days} {t('confirmationBid.days')}</span>
                    </div>
                  )}
                  {offerData.details.basic_service?.validity && (
                    <div className="flex justify-between p-2 bg-white/50 rounded">
                      <span>{t('confirmationBid.validity')}:</span>
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
                <h4 className="text-sm font-medium mb-3">{t('confirmationBid.otherCharges')}</h4>
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

            {/* Agent information */}
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-medium">A</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">{t('confirmationBid.agentInformation')}</p>
                  <p className="font-medium">{t('confirmationBid.agent')}</p>
                  <p className="text-sm">{t('confirmationBid.code')}: {offerData.agent_code || t('common.notSpecified')}</p>
                  <p className="text-sm">{t('confirmationBid.creationDate')}: {formatDate(offerData.inserted_at)}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        <Separator className="print:hidden" />

        <CardFooter className="flex flex-col sm:flex-row sm:justify-between gap-4 pt-6 print:hidden">
          <Button variant="outline" onClick={handleGoHome} className="w-full sm:w-auto">
            <HomeIcon className="mr-2 h-4 w-4" />
            {t('confirmationBid.returnToAuctions')}
          </Button>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button variant="outline" onClick={handlePrint} className="w-full sm:w-auto">
              <IconPrinter className="mr-2 h-4 w-4" />
              {t('confirmationBid.print')}
            </Button>

            <Button onClick={copyToClipboard} className="w-full sm:w-auto" variant="default">
              {isCopied ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  {t('confirmationBid.copied')}
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  {t('confirmationBid.copyDetails')}
                </>
              )}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}

export default ConfirmationPage
