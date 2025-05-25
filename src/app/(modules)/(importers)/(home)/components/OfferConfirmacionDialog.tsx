"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, X, AlertCircle, Ship, MapPin, DollarSign, Package, Calendar } from "lucide-react"
import { useBidStore } from "@/src/store/useBidStore"
import { useCloseBid } from "@/src/app/hooks/useCloseBid"
import { modalService } from "@/src/service/modalService"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"

interface OfferConfirmationProps {
  offerData: any
}

export function OfferConfirmationDialog(offerData) {
  console.log(JSON.stringify(offerData), 'OfferData')
  const router = useRouter()
  const [isConfirming, setIsConfirming] = useState(false)
  const { setBidData } = useBidStore()
  const { mutate: closeBid } = useCloseBid()

 
  const handleConfirm = () => {
    setIsConfirming(true)
    console.log('Abriendo modal')
    closeBid(
      { bid_id: offerData.bidId, offer_id: offerData.id },
      {
        onSuccess: (res) => {
          console.log('Subasta cerrada correctamente')

          setBidData({
           ...offerData,
          })
          router.push('confirmation-bid')
          modalService.closeModal()
        },
        onError: () => {
          console.error('Hubo un error tratando de cerrar la subasta')
        },
      }
    )
  }

  const onClose  = () => {
    modalService.closeModal()
  }

  return (
    <Card className="w-full">
    <CardHeader>
      <CardTitle className="flex items-center gap-2 text-xl">
        <CheckCircle className="h-5 w-5 text-green-500" />
        Confirmar Aceptación de Oferta
      </CardTitle>
      <CardDescription>Por favor revise los detalles de la oferta antes de aceptar</CardDescription>
    </CardHeader>

    <CardContent className="space-y-4">
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
          <Ship className="h-5 w-5 text-primary" />
          <span className="font-medium">Ruta Marítima</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start gap-2">
            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Origen</p>
              <p className="font-medium">{offerData.originBid}</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <p className="text-sm text-muted-foreground">Destino</p>
              <p className="font-medium">{offerData.finishBid}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Price and container */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-primary/5 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Precio Total</p>
              <p className="font-medium text-lg">
                {offerData.price || `USD ${offerData.details.freight_fees?.value}`}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-primary/5 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5 text-primary" />
            <div>
              <p className="text-sm text-muted-foreground">Contenedor</p>
              <p className="font-medium">{offerData.details.freight_fees?.container}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Service details */}
      <div className="bg-muted/30 rounded-lg p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-5 w-5 text-primary" />
          <span className="font-medium">Detalles del Servicio</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Días Libres:</span>
            <span className="font-medium">{offerData.details.basic_service?.free_days} días</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Validez:</span>
            <span className="font-medium">
              {offerData.details.basic_service?.validity?.time} {offerData.details.basic_service?.validity?.unit}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tarifa de Cancelación:</span>
            <span className="font-medium">USD {offerData.details?.basic_service?.cancellation_fee}</span>
          </div>
        </div>
      </div>

      {/* Fee summary */}
      <div className="space-y-2">
        <h4 className="text-sm font-medium">Resumen de Tarifas</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="flex justify-between p-2 bg-muted/20 rounded">
            <span>Flete:</span>
            <span className="font-medium">USD {offerData.details?.freight_fees?.value}</span>
          </div>
          <div className="flex justify-between p-2 bg-muted/20 rounded">
            <span>Manejo en Origen:</span>
            <span className="font-medium">USD {offerData.details?.origin_fees?.handling}</span>
          </div>
          <div className="flex justify-between p-2 bg-muted/20 rounded">
            <span>Manejo en Destino:</span>
            <span className="font-medium">USD {offerData.details.destination_fees?.handling}</span>
          </div>
          <div className="flex justify-between p-2 bg-muted/20 rounded">
            <span>Agencia:</span>
            <span className="font-medium">USD {offerData.details.destination_fees?.agency}</span>
          </div>
        </div>
      </div>

      {/* Warning */}
      <div className="flex items-center gap-2 p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800">
        <AlertCircle className="h-5 w-5 flex-shrink-0" />
        <p className="text-sm">
          Al aceptar esta oferta, usted está de acuerdo con los términos y condiciones establecidos.
        </p>
      </div>
    </CardContent>

    <CardFooter className="flex flex-col sm:flex-row sm:justify-between gap-3 pt-4">
      <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
        <X className="mr-2 h-4 w-4" />
        Cancelar
      </Button>
      <Button
        onClick={handleConfirm}
        disabled={isConfirming}
        className="w-full sm:w-auto bg-green-600 hover:bg-green-700"
      >
        {isConfirming ? (
          <>Procesando...</>
        ) : (
          <>
            <CheckCircle className="mr-2 h-4 w-4" />
            Confirmar y Aceptar
          </>
        )}
      </Button>
    </CardFooter>
  </Card>
  )
}
