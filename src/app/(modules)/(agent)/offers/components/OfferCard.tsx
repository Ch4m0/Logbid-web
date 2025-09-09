// components/OfferCard.jsx
import { useState, useEffect } from "react";
import { Card } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { User, Tag, Calendar, Ship, DollarSign, Package, Ruler, ChevronDown, CheckCircle } from "lucide-react";
import { convertToColombiaTime } from "@/src/lib/utils";
import { Offer } from "@/src/models/Offer";
import { modalService } from "@/src/service/modalService";
import { useTranslation } from "@/src/hooks/useTranslation";
import { getTransportTypeName } from "@/src/utils/translateTypeName";

interface OfferCardProps {
    offer: Offer;
    toggleOfferDetails: (id: string) => void;
    expandedOffers: Record<string,  boolean>;
    acceptOffer?: (offer: any) => void;
}

const OfferCard = ({ offer, toggleOfferDetails, expandedOffers, acceptOffer }: OfferCardProps) => {
  const { t } = useTranslation()
  const [isAccepting, setIsAccepting] = useState(false)

  // Escuchar cuando el modal se cierre para resetear el estado
  useEffect(() => {
    const subscription = modalService.modal$.subscribe((modalContent) => {
      // Si el modal se cierra (modalContent es null), resetear el estado
      if (modalContent === null && isAccepting) {
        setIsAccepting(false)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [isAccepting])

  const handleAcceptOffer = () => {
    if (!acceptOffer) return
    setIsAccepting(true)
    acceptOffer(offer)
    // Note: You might want to reset isAccepting based on a success callback
    // This example assumes acceptOffer is asynchronous and will be handled elsewhere
  }

  return (
      <Card className="w-full border-l-4 border-l-primary overflow-hidden relative mb-4">
        {/* Solo mostrar el botón "Aceptar Oferta" si se proporciona la función acceptOffer */}
        {acceptOffer && (
          <div className="absolute top-2 right-2 z-10">
            <Button
              variant="default"
              size="sm"
              className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
              onClick={handleAcceptOffer}
              disabled={isAccepting || offer.status !== "pending"}
            >
              <CheckCircle className="h-4 w-4" />
              {isAccepting ? t('offerCard.accepting') : t('offerCard.acceptOffer')}
            </Button>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          <div className="md:col-span-3 p-4 bg-muted/10">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <User className="h-5 w-5 text-primary" />
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">{t('offerCard.agentCode')}</span>
                  <span className="font-medium">{offer.agent_code}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Tag className="h-5 w-5 text-primary" />
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">{t('offerCard.offerId')}</span>
                  <span className="font-medium">{offer.uuid}</span>
                </div>
              </div>

              <Badge
                className={
                  offer.status === "pending" ? "bg-green-100 text-green-800" : 
                  offer.status === "accepted" ? "bg-blue-100 text-blue-800" :
                  "bg-gray-100 text-gray-800"
                }
              >
                {offer.status === "pending" ? t('offerCard.pending') : 
                 offer.status === "accepted" ? t('offerCard.accepted') :
                 offer.status === "rejected" ? t('offerCard.rejected') : offer.status}
              </Badge>
            </div>
          </div>

          <div className="md:col-span-3 p-4">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">{t('offerCard.creationDate')}</span>
                  <span className="font-medium">{convertToColombiaTime(offer.inserted_at)}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <Ship className="h-5 w-5 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">{t('offerCard.shippingType')}</span>
                  <span className="font-medium">{getTransportTypeName(offer.shipping_type, t)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="md:col-span-3 p-4 bg-primary/5">
            <div className="flex items-center space-x-2 w-full">
              <DollarSign className="h-5 w-5 text-primary" />
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">{t('offerCard.offer')}</span>
                <span className="font-medium text-lg">{offer.price}</span>
              </div>
            </div>

            {/* Mostrar contenedor para marítimo o dimensiones para aéreo */}
            {offer.shipping_type === "Marítimo" && offer.details?.freight_fees?.container && (
              <div className="mt-3 flex items-center space-x-2">
                <Package className="h-5 w-5 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">{t('common.container')}</span>
                  <span className="font-medium">{offer.details.freight_fees.container}</span>
                </div>
              </div>
            )}
            
            {offer.shipping_type === "Aéreo" && offer.details?.freight_fees?.dimensions && (
              <div className="mt-3 flex items-center space-x-2">
                <Ruler className="h-5 w-5 text-muted-foreground" />
                <div className="flex flex-col">
                  <span className="text-sm text-muted-foreground">{t('common.dimensions')}</span>
                  <span className="font-medium">
                    {offer.details.freight_fees.dimensions.length}x
                    {offer.details.freight_fees.dimensions.width}x
                    {offer.details.freight_fees.dimensions.height} 
                    {offer.details.freight_fees.dimensions.units || "cm"}
                  </span>
                </div>
              </div>
            )}
          </div>

          <div className="md:col-span-3 p-4 flex items-center justify-center">
            <Button variant="outline" size="sm" className="w-full" onClick={() => toggleOfferDetails(offer.id)}>
              {expandedOffers[offer.id] ? (
                <>
                  {t('offerCard.hideDetails')} <ChevronDown className="ml-2 h-4 w-4" />
                </>
              ) : (
                <>
                  {t('common.showDetails')} <ChevronDown className="ml-2 h-4 w-4" />
                </>
              )}
            </Button>
          </div>
        </div>

        {expandedOffers[offer.id] && offer.details && (
          <div className="border-t border-border p-4">
            <Tabs defaultValue="freight">
              <TabsList className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 mb-4 h-auto">
                <TabsTrigger value="freight" className="text-xs sm:text-sm">{t('offerCard.freight')}</TabsTrigger>
                {offer.shipping_type === "Aéreo" && offer.details.additional_fees && (
                  <TabsTrigger value="additional" className="text-xs sm:text-sm">{t('offerCard.additionalCharges')}</TabsTrigger>
                )}
                {offer.details.origin_fees && <TabsTrigger value="origin" className="text-xs sm:text-sm">{t('offerCard.origin')}</TabsTrigger>}
                {offer.details.destination_fees && <TabsTrigger value="destination" className="text-xs sm:text-sm">{t('offerCard.destination')}</TabsTrigger>}
                {offer.details.basic_service && <TabsTrigger value="basic" className="text-xs sm:text-sm">{t('offerCard.basicService')}</TabsTrigger>}
                <TabsTrigger value="other" className="text-xs sm:text-sm">{t('offerCard.otherCharges')}</TabsTrigger>
              </TabsList>

              <TabsContent value="freight" className="space-y-2">
                <h3 className="font-medium text-sm">{t('offerCard.freightRates')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Para envíos marítimos */}
                  {offer.shipping_type === "Marítimo" && (
                    <>
                      <div className="flex justify-between p-2 bg-muted/20 rounded">
                        <span className="text-sm">{t('common.container')}</span>
                        <span className="font-medium">{offer.details.freight_fees?.container}</span>
                      </div>
                    </>
                  )}
                  
                  {/* Para envíos aéreos */}
                  {offer.shipping_type === "Aéreo" && offer.details.freight_fees?.dimensions && (
                    <>
                      <div className="flex justify-between p-2 bg-muted/20 rounded">
                        <span className="text-sm">{t('offerCard.length')}</span>
                        <span className="font-medium">{offer.details.freight_fees.dimensions.length} {offer.details.freight_fees.dimensions.units || "cm"}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-muted/20 rounded">
                        <span className="text-sm">{t('offerCard.width')}</span>
                        <span className="font-medium">{offer.details.freight_fees.dimensions.width} {offer.details.freight_fees.dimensions.units || "cm"}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-muted/20 rounded">
                        <span className="text-sm">{t('offerCard.height')}</span>
                        <span className="font-medium">{offer.details.freight_fees.dimensions.height} {offer.details.freight_fees.dimensions.units || "cm"}</span>
                      </div>
                    </>
                  )}
                  
                  {/* Común para ambos tipos */}
                  <div className="flex justify-between p-2 bg-muted/20 rounded">
                    <span className="text-sm">{t('offerCard.value')}</span>
                    <span className="font-medium">${offer.details.freight_fees?.value}</span>
                  </div>
                </div>
              </TabsContent>

              {/* Tab para cargos adicionales (solo aéreo) */}
              {offer.shipping_type === "Aéreo" && (
                <TabsContent value="additional" className="space-y-2">
                  <h3 className="font-medium text-sm">{t('offerCard.additionalCharges')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {offer.details.additional_fees && Object.entries(offer.details.additional_fees).map(([key, value]) => (
                      <div key={key} className="flex justify-between p-2 bg-muted/20 rounded">
                        <span className="text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                        <span className="font-medium">${value}</span>
                      </div>
                    ))}
                  </div>
                </TabsContent>
              )}

              <TabsContent value="origin" className="space-y-2">
                <h3 className="font-medium text-sm">{t('offerCard.originRates')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {offer.details.origin_fees && Object.entries(offer.details.origin_fees).map(([key, value]) => (
                    <div key={key} className="flex justify-between p-2 bg-muted/20 rounded">
                      <span className="text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="font-medium">${value}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="destination" className="space-y-2">
                <h3 className="font-medium text-sm">{t('offerCard.destinationRates')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {offer.details.destination_fees && Object.entries(offer.details.destination_fees).map(([key, value]) => (
                    <div key={key} className="flex justify-between p-2 bg-muted/20 rounded">
                      <span className="text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="font-medium">
                        {typeof value === 'string' && String(value).includes('%') ? String(value) : `$${String(value)}`}
                      </span>
                    </div>
                  ))}
                </div>
              </TabsContent>

              <TabsContent value="basic" className="space-y-2">
                <h3 className="font-medium text-sm">{t('offerCard.basicService')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {offer.details.basic_service && (
                    <>
                      <div className="flex justify-between p-2 bg-muted/20 rounded">
                        <span className="text-sm">{t('common.cancellationFee')}</span>
                        <span className="font-medium">${offer.details.basic_service?.cancellation_fee}</span>
                      </div>
                      <div className="flex justify-between p-2 bg-muted/20 rounded">
                        <span className="text-sm">{t('common.freeDays')}</span>
                        <span className="font-medium">{offer.details.basic_service?.free_days} {t('common.days')}</span>
                      </div>
                      {offer.details.basic_service?.validity && (
                        <div className="flex justify-between p-2 bg-muted/20 rounded">
                          <span className="text-sm">{t('common.validity')}</span>
                          <span className="font-medium">
                            {offer.details.basic_service?.validity?.time}{" "}
                            {offer.details.basic_service?.validity?.unit}
                          </span>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="other" className="space-y-2">
                <h3 className="font-medium text-sm">{t('offerCard.otherCharges')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {offer.details.other_fees && Object.entries(offer.details.other_fees).map(([key, value]) => (
                    <div key={key} className="flex justify-between p-2 bg-muted/20 rounded">
                      <span className="text-sm capitalize">{key.replace(/_/g, ' ')}</span>
                      <span className="font-medium">${value}</span>
                    </div>
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        )}
      </Card>
  );
};

export default OfferCard;