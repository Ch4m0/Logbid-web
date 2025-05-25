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

const ConfirmationPage = () => {
  const [isCopied, setIsCopied] = useState(false)
  const router = useRouter()
  const bidStoreData = useBidStore()
  console.log(bidStoreData, 'BidStoreData')

  // Get the actual offer data from the store instead of hardcoded data
  const offerData = {
    originBid: bidStoreData.originBid || "No especificado",
    finishBid: bidStoreData.finishBid || "No especificado", 
    codeBid: bidStoreData.codeBid || "No especificado",
    bidId: bidStoreData.bidId || null,
    id: bidStoreData.id || null,
    agent_id: bidStoreData.agent_id || null,
    price: bidStoreData.price || "USD 0",
    uuid: bidStoreData.uuid || "No especificado",
    status: bidStoreData.status || "Active",
    bid_id: bidStoreData.bid_id || null,
    shipping_type: bidStoreData.shipping_type || "Marítimo",
    details: bidStoreData.details || {
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
        container: "No especificado",
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
    inserted_at: bidStoreData.inserted_at || new Date().toISOString(),
    updated_at: bidStoreData.updated_at || new Date().toISOString(),
  }

  // Redirect to home if no data is available
  useEffect(() => {
    if (!bidStoreData.uuid && !bidStoreData.codeBid) {
      toast({
        title: "Sin datos de propuesta",
        description: "No se encontraron datos de la propuesta aceptada",
        variant: "destructive",
      })
      router.push("/")
    }
  }, [bidStoreData, router])

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
                  <p className="font-medium text-lg">USD {offerData.details?.freight_fees?.value || 0}</p>
                </div>
              </div>
            </div>

            <div className="bg-primary/5 rounded-lg p-4">
              <div className="flex items-center gap-2">
                <Package className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-sm text-muted-foreground">Contenedor</p>
                  <p className="font-medium">{offerData.details?.freight_fees?.container || "No especificado"}</p>
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
                  <span className="font-medium">{offerData.details?.basic_service?.free_days || 0} días</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Validez:</span>
                  <span className="font-medium">
                    {offerData.details?.basic_service?.validity?.time || 0} {offerData.details?.basic_service?.validity?.unit || "min"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tarifa de Cancelación:</span>
                  <span className="font-medium">USD {offerData.details?.basic_service?.cancellation_fee || 0}</span>
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
                  <span className="font-medium">USD {offerData.details?.freight_fees?.value || 0}</span>
                </div>
                <div className="flex justify-between p-2 bg-muted/20 rounded">
                  <span>Manejo en Origen:</span>
                  <span className="font-medium">USD {offerData.details?.origin_fees?.handling || 0}</span>
                </div>
                <div className="flex justify-between p-2 bg-muted/20 rounded">
                  <span>Manejo en Destino:</span>
                  <span className="font-medium">USD {offerData.details?.destination_fees?.handling || 0}</span>
                </div>
                <div className="flex justify-between p-2 bg-muted/20 rounded">
                  <span>Agencia:</span>
                  <span className="font-medium">USD {offerData.details?.destination_fees?.agency || 0}</span>
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
                  <span className="font-medium">USD {offerData.details?.other_fees?.carbon || 0}</span>
                </div>
                <div className="flex justify-between p-2 bg-muted/20 rounded">
                  <span>Bajo Azufre:</span>
                  <span className="font-medium">USD {offerData.details?.other_fees?.low_sulfur || 0}</span>
                </div>
                <div className="flex justify-between p-2 bg-muted/20 rounded">
                  <span>Inspección:</span>
                  <span className="font-medium">USD {offerData.details?.other_fees?.pre_shipment_inspection || 0}</span>
                </div>
                <div className="flex justify-between p-2 bg-muted/20 rounded">
                  <span>Seguridad:</span>
                  <span className="font-medium">USD {offerData.details?.other_fees?.security_facility || 0}</span>
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
                  <p className="text-sm">Código: {offerData.agent_id || "No especificado"}</p>
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
