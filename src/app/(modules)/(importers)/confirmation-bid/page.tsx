"use client"

import { useGetOfferById } from "@/src/app/hooks/useGetOfferById"
import { useGetShipment } from "@/src/app/hooks/useGetShipment"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Separator } from "@/src/components/ui/separator"
import { useTranslation } from "@/src/hooks/useTranslation"
import IconPrinter from "@/src/icons/PrintIcon"
import { copyProposalDetails } from "@/src/utils/clipboardUtils"
import { supabase } from "@/src/utils/supabase/client"
import { AlertTriangle,
  Building,
  Calendar,
  CheckCircle,
  Clock,
  Copy,
  DollarSign,
  Download,
  FileText,
  Globe,
  HomeIcon,
  MapPin,
  Package,
  Ship,
  User,
  Weight,
} from "lucide-react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

const ConfirmationPage = () => {
  const { t } = useTranslation()
  const [isCopied, setIsCopied] = useState(false)
  const router = useRouter()
  
  // Get URL parameters using searchParams (Next.js 13+ App Router)
  const [searchParams, setSearchParams] = useState<URLSearchParams>()
  
  useEffect(() => {
    setSearchParams(new URLSearchParams(window.location.search))
  }, [])
  
  const shipment = searchParams?.get('shipment')
  const offer = searchParams?.get('offer')
  
  const { data: offerData } = useGetOfferById({ offer_id: offer || null })
  const { data: shipmentData } = useGetShipment({ shipment_id: shipment || null })
  console.log(offerData, 'OfferData')
  console.log(shipmentData, 'shipmentData')

  if(!offerData || !shipmentData) {
    return <div>Loading...</div>
  }
  // Use the data from the hooks or fallback to defaults
  const finalOfferData = offerData || {
    // Offer information
    originBid: t('common.notSpecified'),
    finishBid: t('common.notSpecified'), 
    codeBid: t('common.notSpecified'),
    bidId: null,
    id: null,
    agent_id: null,
    agent_code: null,
    agent_name: t('common.notSpecified'),
    agent_company: t('common.notSpecified'),
    price: "USD 0",
    uuid: t('common.notSpecified'),
    status: "Active",
    bid_id: null,
    shipping_type: "1",
    
    details: {
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
    inserted_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  // Combine offer data with shipment data
  const combinedData = {
    ...finalOfferData,
    // Shipment information from shipmentData
    shipment_uuid: shipmentData?.uuid || t('common.notSpecified'),
    originBid: shipmentData?.origin_name ? `${shipmentData.origin_country} - ${shipmentData.origin_name}` : t('common.notSpecified'),
    finishBid: shipmentData?.destination_name ? `${shipmentData.destination_country} - ${shipmentData.destination_name}` : t('common.notSpecified'),
    codeBid: shipmentData?.uuid || t('common.notSpecified'),
    bidId: shipmentData?.id || null,
    bid_id: shipmentData?.id || null,
    
    // Shipment details
    shipment_value: shipmentData?.value || 0,
    currency: shipmentData?.currency || "USD",
    transportation: shipmentData?.transportation || t('common.notSpecified'),
    comex_type: shipmentData?.comex_type || "1",
    additional_info: shipmentData?.additional_info || null,
    shipping_date: shipmentData?.shipping_date || null,
    documents_url: shipmentData?.documents_url || null,
    expiration_date: shipmentData?.expiration_date || null,
    
    // Cargo details
    total_weight: shipmentData?.total_weight || null,
    measure_type: shipmentData?.measure_type || "Kg",
    volume: shipmentData?.volume || null,
    units: shipmentData?.units || null,
    merchandise_type: shipmentData?.merchandise_type || null,
    dangerous_merch: shipmentData?.dangerous_march || false,
    tariff_item: shipmentData?.tariff_item || null,

    incoterm_name: shipmentData?.incoterm_name || null,
    container_name: shipmentData?.container_name || null,
    container_type: null,
  }

  console.log('Documents URL:', shipmentData?.documents_url)
  console.log('Combined Data Documents URL:', combinedData?.documents_url)



  // Redirect to home if no data is available
  /*useEffect(() => {
    if (!combinedData.uuid || combinedData.uuid === t('common.notSpecified')) {
      toast({
        title: t('confirmationBid.noProposalData'),
        description: t('confirmationBid.noProposalDataMessage'),
        variant: "destructive",
      })
      router.push("/")
    }
  }, [combinedData, router, t])*/

  const copyToClipboard = async () => {
    const success = await copyProposalDetails(combinedData, t, () => {
      setIsCopied(true)
      setTimeout(() => setIsCopied(false), 2000)
    })
    
    if (!success) {
      console.error('Failed to copy to clipboard')
    }
  }

  const handleGoHome = () => {
    router.push("/")
  }

  const handlePrint = () => {
    window.print()
  }

  const handleDownloadDocument = async () => {
    if (!combinedData.documents_url) return

    try {
      // Extraer el path del archivo de la URL
      const url = new URL(combinedData.documents_url)
      const pathParts = url.pathname.split('/object/packaging-lists/')
      if (pathParts.length < 2) {
        console.error('URL de archivo inválida')
        return
      }
      
      const pathWithoutBucket = pathParts[1]
      
      // Obtener URL firmada de Supabase
      const { data: signedUrlData, error: signedUrlError } = await supabase.storage
        .from('packaging-lists')
        .createSignedUrl(pathWithoutBucket, 300) // URL válida por 5 minutos
      
      if (signedUrlError || !signedUrlData) {
        console.error('Error al obtener acceso al archivo:', signedUrlError)
        return
      }
      
      // Descargar usando la URL firmada
      const link = document.createElement('a')
      link.href = signedUrlData.signedUrl
      link.download = pathWithoutBucket.split('/').pop() || 'documento.xlsx'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (err) {
      console.error('Error downloading file:', err)
    }
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

  // Format commerce type
  const formatComexType = (type: string) => {
    switch(type) {
      case "1": return t('confirmationBid.import')
      case "2": return t('confirmationBid.export')
      default: return t('common.notSpecified')
    }
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
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0 mb-6">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">{t('confirmationBid.offerCode')}</span>
              <Badge variant="outline" className="text-sm font-medium border-2 border-primary px-3 py-1 w-fit">
                {combinedData.uuid}
              </Badge>
            </div>
            <div className="flex flex-col gap-1 sm:items-end">
              <span className="text-sm text-muted-foreground">{t('confirmationBid.auctionCode')}</span>
              <Badge variant="outline" className="text-sm font-medium px-3 py-1 w-fit">
                {combinedData.codeBid}
              </Badge>
            </div>
          </div>

          {/* Route information */}
          <div className="bg-muted/30 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Ship className="h-5 w-5 text-primary" />
                <span className="font-medium">
                  {t('confirmationBid.route')} {combinedData.shipping_type === "2" ? t('confirmationBid.air') : t('confirmationBid.maritime')}
                </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('confirmationBid.origin')}</p>
                  <p className="font-medium">{combinedData.originBid}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">{t('confirmationBid.destination')}</p>
                  <p className="font-medium">{combinedData.finishBid}</p>
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
                    {combinedData.price || `USD ${combinedData.details?.freight_fees?.value || 0}`}
                  </p>
                </div>
              </div>
            </div>
            <div className="bg-primary/5 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <div>
                  {combinedData.shipping_type === "1" ? (
                    <>
                      <p className="text-sm text-muted-foreground">{t('confirmationBid.container')}</p>
                      <p className="font-medium">{combinedData.details?.freight_fees?.container || t('common.notSpecified')}</p>
                    </>
                  ) : (
                    <>
                      <p className="text-sm text-muted-foreground">{t('confirmationBid.dimensions')}</p>
                      <p className="font-medium">
                        {combinedData.details?.freight_fees?.dimensions ? (
                          `${combinedData.details.freight_fees.dimensions.length}x${combinedData.details.freight_fees.dimensions.width}x${combinedData.details.freight_fees.dimensions.height} ${combinedData.details.freight_fees.dimensions.units || "cm"}`
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

          {/* Shipment Commercial Information */}
          <div className="bg-muted/30 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Globe className="h-5 w-5 text-primary" />
              <span className="font-medium">{t('confirmationBid.commercialInformation')}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between p-2 bg-white/50 rounded">
                  <span className="text-muted-foreground">{t('confirmationBid.shipmentValue')}:</span>
                  <span className="font-medium">{combinedData.currency} {Number(combinedData.shipment_value).toLocaleString()}</span>
                </div>
                <div className="flex justify-between p-2 bg-white/50 rounded">
                  <span className="text-muted-foreground">{t('bidInfo.comexType')}:</span>
                  <span className="font-medium">{formatComexType(combinedData.comex_type)}</span>
                </div>
                <div className="flex justify-between p-2 bg-white/50 rounded">
                  <span className="text-muted-foreground">{t('confirmationBid.transportation')}:</span>
                  <span className="font-medium">{combinedData.transportation}</span>
                </div>
              </div>
              <div className="space-y-3">
                {combinedData.incoterm_name && (
                  <div className="flex justify-between p-2 bg-white/50 rounded">
                    <span className="text-muted-foreground">{t('confirmationBid.incoterm')}:</span>
                    <span className="font-medium">{combinedData.incoterm_name}</span>
                  </div>
                )}
                {combinedData.tariff_item && (
                  <div className="flex justify-between p-2 bg-white/50 rounded">
                    <span className="text-muted-foreground">{t('confirmationBid.tariffItem')}:</span>
                    <span className="font-medium">{combinedData.tariff_item}</span>
                  </div>
                )}
                <div className="flex justify-between p-2 bg-white/50 rounded">
                  <span className="text-muted-foreground">{t('confirmationBid.shipmentCode')}:</span>
                  <span className="font-medium">{combinedData.shipment_uuid}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Cargo Information */}
          {(combinedData.total_weight || combinedData.volume || combinedData.units || combinedData.merchandise_type) && (
            <div className="bg-muted/30 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Weight className="h-5 w-5 text-primary" />
                <span className="font-medium">{t('confirmationBid.cargoInformation')}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  {combinedData.total_weight && (
                    <div className="flex justify-between p-2 bg-white/50 rounded">
                      <span className="text-muted-foreground">{t('confirmationBid.totalWeight')}:</span>
                      <span className="font-medium">{Number(combinedData.total_weight).toLocaleString()} {combinedData.measure_type}</span>
                    </div>
                  )}
                  {combinedData.volume && (
                    <div className="flex justify-between p-2 bg-white/50 rounded">
                      <span className="text-muted-foreground">{t('confirmationBid.volume')}:</span>
                      <span className="font-medium">{Number(combinedData.volume).toLocaleString()} m³</span>
                    </div>
                  )}
                  {combinedData.units && (
                    <div className="flex justify-between p-2 bg-white/50 rounded">
                      <span className="text-muted-foreground">{t('confirmationBid.units')}:</span>
                      <span className="font-medium">{Number(combinedData.units).toLocaleString()}</span>
                    </div>
                  )}
                </div>
                <div className="space-y-3">
                  {combinedData.merchandise_type && (
                    <div className="flex justify-between p-2 bg-white/50 rounded">
                      <span className="text-muted-foreground">{t('confirmationBid.merchandiseType')}:</span>
                      <span className="font-medium">{combinedData.merchandise_type}</span>
                    </div>
                  )}
                  {combinedData.container_name && (
                    <div className="flex justify-between p-2 bg-white/50 rounded">
                      <span className="text-muted-foreground">{t('confirmationBid.containerType')}:</span>
                      <span className="font-medium">{combinedData.container_name}</span>
                    </div>
                  )}
                  {combinedData.dangerous_merch && (
                    <div className="flex justify-between p-2 bg-white/50 rounded">
                      <span className="text-muted-foreground flex items-center gap-1">
                        <AlertTriangle className="h-4 w-4 text-orange-500" />
                        {t('confirmationBid.dangerousMerchandise')}:
                      </span>
                      <Badge variant="destructive" className="text-xs">
                        {t('confirmationBid.yes')}
                      </Badge>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Important Dates */}
          <div className="bg-muted/30 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-5 w-5 text-primary" />
              <span className="font-medium">{t('confirmationBid.importantDates')}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div className="flex justify-between p-2 bg-white/50 rounded">
                  <span className="text-muted-foreground">{t('confirmationBid.proposalCreated')}:</span>
                  <span className="font-medium">{formatDate(combinedData.inserted_at)}</span>
                </div>
                {combinedData.expiration_date && (
                  <div className="flex justify-between p-2 bg-white/50 rounded">
                    <span className="text-muted-foreground">{t('confirmationBid.originalExpiration')}:</span>
                    <span className="font-medium">{formatDate(combinedData.expiration_date)}</span>
                  </div>
                )}
                {combinedData.shipping_date && (
                  <div className="flex justify-between p-2 bg-white/50 rounded">
                    <span className="text-muted-foreground">{t('confirmationBid.plannedShippingDate')}:</span>
                    <span className="font-medium">{formatDate(combinedData.shipping_date)}</span>
                  </div>
                )}
              </div>
              <div className="space-y-3">
                {combinedData.additional_info && (
                  <div className="p-2 bg-white/50 rounded">
                    <span className="text-muted-foreground">{t('confirmationBid.additionalInformation')}:</span>
                    <p className="font-medium mt-1">{combinedData.additional_info}</p>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Documents Section */}
          <div className="bg-muted/30 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-5 w-5 text-primary" />
              <span className="font-medium">{t('confirmationBid.documents')}</span>
            </div>
            {combinedData.documents_url ? (
              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                      <FileText className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <span className="text-sm font-medium text-blue-800">
                        {t('confirmationBid.attachedDocuments')}
                      </span>
                      <p className="text-xs text-blue-600 mt-1">
                        {combinedData.documents_url.split('/').pop() || 'Documento'}
                      </p>
                    </div>
                  </div>
                  <button 
                    onClick={handleDownloadDocument}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Download className="h-4 w-4" />
                    {t('confirmationBid.downloadDocument')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <FileText className="h-5 w-5 text-gray-400" />
                  </div>
                  <div>
                    <span className="text-sm font-medium text-gray-600">
                      {t('confirmationBid.noDocuments')}
                    </span>
                    <p className="text-xs text-gray-500 mt-1">
                      {t('confirmationBid.noDocumentsMessage')}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Service details */}
          {combinedData.details?.basic_service && (
            combinedData.details.basic_service.free_days || 
            combinedData.details.basic_service.validity || 
            combinedData.details.basic_service.cancellation_fee
          ) && (
            <div className="bg-muted/30 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="font-medium">{t('confirmationBid.serviceDetails')}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                {combinedData.details.basic_service.free_days && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('confirmationBid.freeDays')}:</span>
                    <span className="font-medium">{combinedData.details.basic_service.free_days} {t('confirmationBid.days')}</span>
                  </div>
                )}
                {combinedData.details.basic_service.validity && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('confirmationBid.validity')}:</span>
                    <span className="font-medium">
                      {combinedData.details.basic_service.validity.time} {combinedData.details.basic_service.validity.unit}
                    </span>
                  </div>
                )}
                {combinedData.details.basic_service.cancellation_fee && (
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">{t('confirmationBid.cancellationFee')}:</span>
                    <span className="font-medium">USD {combinedData.details.basic_service.cancellation_fee}</span>
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
                {/* Para envíos 1s */}
                {combinedData.shipping_type === "1" && (
                  <div className="flex justify-between p-2 bg-white/50 rounded">
                    <span>{t('confirmationBid.container')}:</span>
                    <span className="font-medium">{combinedData.details?.freight_fees?.container || t('common.notSpecified')}</span>
                  </div>
                )}
                
                {/* Para envíos 2s */}
                {combinedData.shipping_type === "2" && combinedData.details?.freight_fees?.dimensions && (
                  <>
                    <div className="flex justify-between p-2 bg-white/50 rounded">
                      <span>{t('confirmationBid.length')}:</span>
                      <span className="font-medium">{combinedData.details.freight_fees.dimensions.length} {combinedData.details.freight_fees.dimensions.units || "cm"}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-white/50 rounded">
                      <span>{t('confirmationBid.width')}:</span>
                      <span className="font-medium">{combinedData.details.freight_fees.dimensions.width} {combinedData.details.freight_fees.dimensions.units || "cm"}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-white/50 rounded">
                      <span>{t('confirmationBid.height')}:</span>
                      <span className="font-medium">{combinedData.details.freight_fees.dimensions.height} {combinedData.details.freight_fees.dimensions.units || "cm"}</span>
                    </div>
                  </>
                )}
                
                <div className="flex justify-between p-2 bg-white/50 rounded">
                  <span>{t('confirmationBid.freightValue')}:</span>
                  <span className="font-medium">USD {combinedData.details?.freight_fees?.value || 0}</span>
                </div>
              </div>
            </div>

            {/* Cargos Adicionales (solo para 2) */}
            {combinedData.shipping_type === "2" && combinedData.details?.additional_fees && (
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="text-sm font-medium mb-3">{t('confirmationBid.additionalCharges')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {Object.entries(combinedData.details.additional_fees).map(([key, value]) => (
                    <div key={key} className="flex justify-between p-2 bg-white/50 rounded">
                      <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                      <span className="font-medium">USD {String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tarifas de Origen */}
            {combinedData.details?.origin_fees && (
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="text-sm font-medium mb-3">{t('confirmationBid.originRates')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {Object.entries(combinedData.details.origin_fees).map(([key, value]) => (
                    <div key={key} className="flex justify-between p-2 bg-white/50 rounded">
                      <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                      <span className="font-medium">USD {String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Tarifas de Destino */}
            {combinedData.details?.destination_fees && (
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="text-sm font-medium mb-3">{t('confirmationBid.destinationRates')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {Object.entries(combinedData.details.destination_fees).map(([key, value]) => (
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
            {combinedData.details?.basic_service && (
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="text-sm font-medium mb-3">{t('confirmationBid.basicService')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {combinedData.details.basic_service?.cancellation_fee && (
                    <div className="flex justify-between p-2 bg-white/50 rounded">
                      <span>{t('confirmationBid.cancellationFee')}:</span>
                      <span className="font-medium">USD {combinedData.details.basic_service.cancellation_fee}</span>
                    </div>
                  )}
                  {combinedData.details.basic_service?.free_days && (
                    <div className="flex justify-between p-2 bg-white/50 rounded">
                      <span>{t('confirmationBid.freeDays')}:</span>
                      <span className="font-medium">{combinedData.details.basic_service.free_days} {t('confirmationBid.days')}</span>
                    </div>
                  )}
                  {combinedData.details.basic_service?.validity && (
                    <div className="flex justify-between p-2 bg-white/50 rounded">
                      <span>{t('confirmationBid.validity')}:</span>
                      <span className="font-medium">
                        {combinedData.details.basic_service.validity.time} {combinedData.details.basic_service.validity.unit}
                      </span>
                    </div>
                  )}
                  {/* Mostrar cualquier otro campo en basic_service */}
                  {Object.entries(combinedData.details.basic_service).map(([key, value]) => {
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
            {combinedData.details?.other_fees && Object.keys(combinedData.details.other_fees).length > 0 && (
              <div className="bg-muted/30 rounded-lg p-4">
                <h4 className="text-sm font-medium mb-3">{t('confirmationBid.otherCharges')}</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                  {Object.entries(combinedData.details.other_fees).map(([key, value]) => (
                    <div key={key} className="flex justify-between p-2 bg-white/50 rounded">
                      <span className="capitalize">{key.replace(/_/g, ' ')}:</span>
                      <span className="font-medium">USD {String(value)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Enhanced Agent Information */}
            <div className="bg-primary/5 rounded-lg p-4 border border-primary/20">
              <div className="flex items-center gap-2 mb-3">
                <User className="h-5 w-5 text-primary" />
                <span className="font-medium">{t('confirmationBid.winningAgent')}</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      <span className="text-primary font-medium text-lg">
                        {combinedData.agent_name ? combinedData.agent_name.charAt(0).toUpperCase() : 'A'}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-lg">{combinedData.agent_name}</p>
                      {combinedData.agent_company && combinedData.agent_company !== t('common.notSpecified') && (
                        <div className="flex items-center gap-1 mt-1">
                          <Building className="h-4 w-4 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">{combinedData.agent_company}</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between p-2 bg-white/50 rounded">
                    <span className="text-muted-foreground">{t('confirmationBid.agentCode')}:</span>
                    <span className="font-medium">{combinedData.agent_code || t('common.notSpecified')}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-white/50 rounded">
                    <span className="text-muted-foreground">{t('confirmationBid.proposalDate')}:</span>
                    <span className="font-medium">{formatDate(combinedData.inserted_at)}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-white/50 rounded">
                    <span className="text-muted-foreground">{t('confirmationBid.proposalStatus')}:</span>
                    <Badge className="bg-green-100 text-green-800">
                      {t('confirmationBid.accepted')}
                    </Badge>
                  </div>
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
