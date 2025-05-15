"use client"

import { useState } from "react"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle, CardDescription } from "@/src/components/ui/card"
import { Separator } from "@/src/components/ui/separator"
import { toast } from "@/src/components/ui/use-toast"
import IconPrinter from "@/src/icons/PrintIcon"
import { HomeIcon, Copy, CheckCircle, MapPin, DollarSign, Tag, Calendar, Ship, Package } from "lucide-react"
import { useRouter } from "next/navigation"
import { Badge } from "@/src/components/ui/badge"
import { useBidStore } from "@/src/store/useBidStore"

const ConfirmationPage = () => {
  const [isCopied, setIsCopied] = useState(false)
  const router = useRouter()
  const offerDat1 = useBidStore()
  console.log(offerDat1, 'OfferDat1')

  // Static offer data
  const offerData = {
    originBid: " United Kingdom -  Aberdour",
    finishBid: " Indonesia -  Adang Bay",
    codeBid: "BID-W6X7C8V",
    bidId: 5,
    id: 71,
    agent_id: 2,
    price: "USD 0",
    uuid: "OFF-TD0TF6W",
    status: "Active",
    bid_id: 5,
    shipping_type: "Marítimo",
    details: {
      basic_service: {
        cancellation_fee: 100,
        free_days: 30,
        validity: {
          time: 30,
          unit: "min",
        },
      },
      destination_fees: {
        agency: 50,
        bl_emission: 0,
        collect_fee: "2%",
        handling: 65,
      },
      freight_fees: {
        container: "40 HC",
        value: 9995,
      },
      origin_fees: {
        handling: 50,
        security_manifest: 100,
      },
      other_fees: {
        cancellation: 100,
        carbon: 35,
        low_sulfur: 68,
        other: 100,
        pre_shipment_inspection: 125,
        security_facility: 45,
        security_manifest: 45,
      },
    },
    inserted_at: "2025-05-10T18:25:44",
    updated_at: "2025-05-10T18:25:44",
  }

  const copyToClipboard = () => {
    const textToCopy = `
Código de oferta: ${offerData.uuid}
Código de subasta: ${offerData.codeBid}
Origen: ${offerData.originBid}
Destino: ${offerData.finishBid}
Tipo de envío: ${offerData.shipping_type}
Contenedor: ${offerData.details.freight_fees.container}
Precio: USD ${offerData.details.freight_fees.value}
Fecha: ${formatDate(offerData.inserted_at)}
    `.trim()

    navigator.clipboard
      .writeText(textToCopy)
      .then(() => {
        setIsCopied(true)
        toast({
          title: "Copiado al portapapeles",
          description: "La información ha sido copiada correctamente",
        })
        setTimeout(() => setIsCopied(false), 2000)
      })
      .catch((err) => {
        toast({
          title: "Error al copiar",
          description: "No se pudo copiar la información",
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

  // Format date
  const formatDate = (dateString) => {
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
                Propuesta Aceptada
              </CardTitle>
              <CardDescription className="mt-1">La propuesta ha sido aceptada exitosamente</CardDescription>
            </div>
            <Badge className="bg-green-100 text-green-800 print:hidden">Confirmado</Badge>
          </div>
        </CardHeader>

        <CardContent className="pt-6">
          <div className="flex justify-between items-center mb-6">
            <div className="flex flex-col gap-1">
              <span className="text-sm text-muted-foreground">Código de Oferta</span>
              <Badge variant="outline" className="text-sm font-medium border-2 border-primary px-3 py-1">
                {offerData.uuid}
              </Badge>
            </div>
            <div className="flex flex-col gap-1 items-end">
              <span className="text-sm text-muted-foreground">Código de Subasta</span>
              <Badge variant="outline" className="text-sm font-medium px-3 py-1">
                {offerData.codeBid}
              </Badge>
            </div>
          </div>

          {/* Route information */}
          <div className="bg-muted/30 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-2 mb-3">
              <Ship className="h-5 w-5 text-primary" />
              <span className="font-medium">Ruta {offerData.shipping_type}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Origen</p>
                  <p className="font-medium">{offerData.originBid}</p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="text-sm text-muted-foreground">Destino</p>
                  <p className="font-medium">{offerData.finishBid}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-primary/5 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Precio Total</p>
                  <p className="font-medium text-lg">USD {offerData.details.freight_fees.value}</p>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Contenedor</p>
                  <p className="font-medium">{offerData.details.freight_fees.container}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Service details */}
            <div className="bg-muted/30 rounded-lg p-4">
              <div className="flex items-center gap-2 mb-3">
                <Calendar className="h-5 w-5 text-primary" />
                <span className="font-medium">Detalles del Servicio</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Días Libres:</span>
                  <span className="font-medium">{offerData.details.basic_service.free_days} días</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Validez:</span>
                  <span className="font-medium">
                    {offerData.details.basic_service.validity.time} {offerData.details.basic_service.validity.unit}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tarifa de Cancelación:</span>
                  <span className="font-medium">USD {offerData.details.basic_service.cancellation_fee}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Fecha de Creación:</span>
                  <span className="font-medium">{formatDate(offerData.inserted_at)}</span>
                </div>
              </div>
            </div>

            {/* Fee summary */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                Resumen de Tarifas
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between p-2 bg-muted/20 rounded">
                  <span>Flete:</span>
                  <span className="font-medium">USD {offerData.details.freight_fees.value}</span>
                </div>
                <div className="flex justify-between p-2 bg-muted/20 rounded">
                  <span>Manejo en Origen:</span>
                  <span className="font-medium">USD {offerData.details.origin_fees.handling}</span>
                </div>
                <div className="flex justify-between p-2 bg-muted/20 rounded">
                  <span>Manejo en Destino:</span>
                  <span className="font-medium">USD {offerData.details.destination_fees.handling}</span>
                </div>
                <div className="flex justify-between p-2 bg-muted/20 rounded">
                  <span>Agencia:</span>
                  <span className="font-medium">USD {offerData.details.destination_fees.agency}</span>
                </div>
              </div>
            </div>

            {/* Additional fees */}
            <div className="space-y-2">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <Tag className="h-4 w-4 text-primary" />
                Cargos Adicionales
              </h4>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div className="flex justify-between p-2 bg-muted/20 rounded">
                  <span>Carbono:</span>
                  <span className="font-medium">USD {offerData.details.other_fees.carbon}</span>
                </div>
                <div className="flex justify-between p-2 bg-muted/20 rounded">
                  <span>Bajo Azufre:</span>
                  <span className="font-medium">USD {offerData.details.other_fees.low_sulfur}</span>
                </div>
                <div className="flex justify-between p-2 bg-muted/20 rounded">
                  <span>Inspección:</span>
                  <span className="font-medium">USD {offerData.details.other_fees.pre_shipment_inspection}</span>
                </div>
                <div className="flex justify-between p-2 bg-muted/20 rounded">
                  <span>Seguridad:</span>
                  <span className="font-medium">USD {offerData.details.other_fees.security_facility}</span>
                </div>
              </div>
            </div>

            {/* Agent information */}
            <div className="p-4 bg-muted/30 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                  <span className="text-primary font-medium">A</span>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Información del Agente</p>
                  <p className="font-medium">Agente</p>
                  <p className="text-sm">Código: {offerData.agent_id}</p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>

        <Separator className="print:hidden" />

        <CardFooter className="flex flex-col sm:flex-row sm:justify-between gap-4 pt-6 print:hidden">
          <Button variant="outline" onClick={handleGoHome} className="w-full sm:w-auto">
            <HomeIcon className="mr-2 h-4 w-4" />
            Regresar a tus subastas
          </Button>

          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Button variant="outline" onClick={handlePrint} className="w-full sm:w-auto">
              <IconPrinter className="mr-2 h-4 w-4" />
              Imprimir
            </Button>

            <Button onClick={copyToClipboard} className="w-full sm:w-auto" variant="default">
              {isCopied ? (
                <>
                  <CheckCircle className="mr-2 h-4 w-4" />
                  Copiado
                </>
              ) : (
                <>
                  <Copy className="mr-2 h-4 w-4" />
                  Copiar detalles
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
