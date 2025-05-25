// components/OfferCard.jsx
import { useState } from "react";
import { Card } from "@/src/components/ui/card";
import { Badge } from "@/src/components/ui/badge";
import { Button } from "@/src/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs";
import { User, Tag, Calendar, Ship, DollarSign, Package, Ruler, ChevronDown, CheckCircle } from "lucide-react";
import { convertToColombiaTime } from "@/src/lib/utils";
import { Offer } from "@/src/models/Offer";

interface OfferCardProps {
    offer: Offer;
    toggleOfferDetails: (id: string) => void;
    expandedOffers: Record<string,  boolean>;
    acceptOffer?: (offer: any) => void;
}

const OfferCard = ({ offer, toggleOfferDetails, expandedOffers, acceptOffer }: OfferCardProps) => {
  const [isAccepting, setIsAccepting] = useState(false)

  const handleAcceptOffer = () => {
    setIsAccepting(true)
    acceptOffer(offer)
    // Note: You might want to reset isAccepting based on a success callback
    // This example assumes acceptOffer is asynchronous and will be handled elsewhere
  }

  

  return (
      <Card className="w-full border-l-4 border-l-primary overflow-hidden relative">
        <div className="absolute top-2 right-2 z-10">
        <Button
          variant="default"
          size="sm"
          className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-1"
          onClick={handleAcceptOffer}
          disabled={isAccepting || offer.status !== "Active"}
        >
          <CheckCircle className="h-4 w-4" />
          {isAccepting ? "Aceptando..." : "Aceptar Oferta"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-3 p-4 bg-muted/10">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-primary" />
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Código Agente</span>
                <span className="font-medium">{offer.agent_code}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Tag className="h-5 w-5 text-primary" />
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">ID Oferta</span>
                <span className="font-medium">{offer.uuid}</span>
              </div>
            </div>

            <Badge
              className={
                offer.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
              }
            >
              {offer.status}
            </Badge>
          </div>
        </div>

        <div className="md:col-span-3 p-4">
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Fecha de Creación</span>
                <span className="font-medium">{convertToColombiaTime(offer.inserted_at)}</span>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Ship className="h-5 w-5 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Tipo de Envío</span>
                <span className="font-medium">{offer.shipping_type}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="md:col-span-3 p-4 bg-primary/5">
          <div className="flex items-center space-x-2 w-full">
            <DollarSign className="h-5 w-5 text-primary" />
            <div className="flex flex-col">
              <span className="text-sm text-muted-foreground">Oferta</span>
              <span className="font-medium text-lg">{offer.price}</span>
            </div>
          </div>

          {/* Mostrar contenedor para marítimo o dimensiones para aéreo */}
          {offer.shipping_type === "Marítimo" && offer.details?.freight_fees?.container && (
            <div className="mt-3 flex items-center space-x-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Contenedor</span>
                <span className="font-medium">{offer.details.freight_fees.container}</span>
              </div>
            </div>
          )}
          
          {offer.shipping_type === "Aéreo" && offer.details?.freight_fees?.dimensions && (
            <div className="mt-3 flex items-center space-x-2">
              <Ruler className="h-5 w-5 text-muted-foreground" />
              <div className="flex flex-col">
                <span className="text-sm text-muted-foreground">Dimensiones</span>
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
                Ocultar Detalles <ChevronDown className="ml-2 h-4 w-4" />
              </>
            ) : (
              <>
                Ver Detalles <ChevronDown className="ml-2 h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>

      {expandedOffers[offer.id] && offer.details && (
        <div className="border-t border-border p-4">
          <Tabs defaultValue="freight">
            <TabsList className="grid grid-cols-5 mb-4">
              <TabsTrigger value="freight">Flete</TabsTrigger>
              {offer.shipping_type === "Aéreo" && offer.details.additional_fees && (
                <TabsTrigger value="additional">Cargos Adicionales</TabsTrigger>
              )}
              {offer.details.origin_fees && <TabsTrigger value="origin">Origen</TabsTrigger>}
              {offer.details.destination_fees && <TabsTrigger value="destination">Destino</TabsTrigger>}
              {offer.details.basic_service && <TabsTrigger value="basic">Servicio Básico</TabsTrigger>}
              <TabsTrigger value="other">Otros Cargos</TabsTrigger>
            </TabsList>

            <TabsContent value="freight" className="space-y-2">
              <h3 className="font-medium text-sm">Tarifas de Flete</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Para envíos marítimos */}
                {offer.shipping_type === "Marítimo" && (
                  <>
                    <div className="flex justify-between p-2 bg-muted/20 rounded">
                      <span className="text-sm">Contenedor</span>
                      <span className="font-medium">{offer.details.freight_fees?.container}</span>
                    </div>
                  </>
                )}
                
                {/* Para envíos aéreos */}
                {offer.shipping_type === "Aéreo" && offer.details.freight_fees?.dimensions && (
                  <>
                    <div className="flex justify-between p-2 bg-muted/20 rounded">
                      <span className="text-sm">Longitud</span>
                      <span className="font-medium">{offer.details.freight_fees.dimensions.length} {offer.details.freight_fees.dimensions.units || "cm"}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted/20 rounded">
                      <span className="text-sm">Ancho</span>
                      <span className="font-medium">{offer.details.freight_fees.dimensions.width} {offer.details.freight_fees.dimensions.units || "cm"}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted/20 rounded">
                      <span className="text-sm">Altura</span>
                      <span className="font-medium">{offer.details.freight_fees.dimensions.height} {offer.details.freight_fees.dimensions.units || "cm"}</span>
                    </div>
                  </>
                )}
                
                {/* Común para ambos tipos */}
                <div className="flex justify-between p-2 bg-muted/20 rounded">
                  <span className="text-sm">Valor</span>
                  <span className="font-medium">${offer.details.freight_fees?.value}</span>
                </div>
              </div>
            </TabsContent>

            {/* Tab para cargos adicionales (solo aéreo) */}
            {offer.shipping_type === "Aéreo" && (
              <TabsContent value="additional" className="space-y-2">
                <h3 className="font-medium text-sm">Cargos Adicionales</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {offer.details.additional_fees && 
                    Object.entries(offer.details.additional_fees).map(([key, value]) => (
                      <div key={key} className="flex justify-between p-2 bg-muted/20 rounded">
                        <span className="text-sm">
                          {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                        </span>
                        <span className="font-medium">${value}</span>
                      </div>
                    ))}
                </div>
              </TabsContent>
            )}

            <TabsContent value="origin" className="space-y-2">
              <h3 className="font-medium text-sm">Tarifas de Origen</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {offer.details.origin_fees && Object.entries(offer.details.origin_fees).map(([key, value]) => (
                  <div key={key} className="flex justify-between p-2 bg-muted/20 rounded">
                    <span className="text-sm">
                      {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                    <span className="font-medium">${value}</span>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="destination" className="space-y-2">
              <h3 className="font-medium text-sm">Tarifas de Destino</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {offer.details.destination_fees && Object.entries(offer.details.destination_fees).map(([key, value]) => (
                  <div key={key} className="flex justify-between p-2 bg-muted/20 rounded">
                    <span className="text-sm">
                      {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                    </span>
                    <span className="font-medium">{typeof value === 'string' && value.includes('%') ? value : `$${value}`}</span>
                  </div>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="basic" className="space-y-2">
              <h3 className="font-medium text-sm">Servicio Básico</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {offer.details.basic_service && (
                  <>
                    <div className="flex justify-between p-2 bg-muted/20 rounded">
                      <span className="text-sm">Tarifa de Cancelación</span>
                      <span className="font-medium">${offer.details.basic_service?.cancellation_fee}</span>
                    </div>
                    <div className="flex justify-between p-2 bg-muted/20 rounded">
                      <span className="text-sm">Días Libres</span>
                      <span className="font-medium">{offer.details.basic_service?.free_days} días</span>
                    </div>
                    {offer.details.basic_service?.validity && (
                      <div className="flex justify-between p-2 bg-muted/20 rounded">
                        <span className="text-sm">Validez</span>
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
              <h3 className="font-medium text-sm">Otros Cargos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {offer.details.other_fees &&
                  Object.entries(offer.details.other_fees).map(([key, value]) => (
                    <div key={key} className="flex justify-between p-2 bg-muted/20 rounded">
                      <span className="text-sm">
                        {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                      </span>
                      <span className="font-medium">{typeof value === 'string' && value.includes('%') ? value : `$${value}`}</span>
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