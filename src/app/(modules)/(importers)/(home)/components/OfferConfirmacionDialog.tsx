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
import { CheckCircle, X, AlertCircle, Ship, MapPin, DollarSign, Package, Calendar } from "lucide-react"
import { useBidStore } from "@/src/store/useBidStore"
import { useCloseBid } from "@/src/app/hooks/useCloseBid"
import { modalService } from "@/src/service/modalService"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/src/components/ui/card"

interface OfferConfirmationProps {
  offerData: any
}

export function OfferConfirmationDialog(offerData: any) {
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
    <Card className="w-full max-h-[600px] overflow-hidden flex flex-col">
    <CardHeader className="flex-shrink-0">
      <CardTitle className="flex items-center gap-2 text-xl">
        <CheckCircle className="h-5 w-5 text-green-500" />
        Confirmar Aceptación de Oferta
      </CardTitle>
      <CardDescription>Por favor revise los detalles de la oferta antes de aceptar</CardDescription>
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
          <Ship className="h-5 w-5 text-primary" />
          <span className="font-medium">
            Ruta {offerData.shipping_type === "Aéreo" ? "Aérea" : "Marítima"}
          </span>
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

      {/* Price and container/dimensions */}
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
              {offerData.shipping_type === "Marítimo" ? (
                <>
                  <p className="text-sm text-muted-foreground">Contenedor</p>
                  <p className="font-medium">{offerData.details.freight_fees?.container}</p>
                </>
              ) : (
                <>
                  <p className="text-sm text-muted-foreground">Dimensiones</p>
                  <p className="font-medium">
                    {offerData.details.freight_fees?.dimensions ? (
                      `${offerData.details.freight_fees.dimensions.length}x${offerData.details.freight_fees.dimensions.width}x${offerData.details.freight_fees.dimensions.height} ${offerData.details.freight_fees.dimensions.units || "cm"}`
                    ) : (
                      "No especificado"
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
            <span className="font-medium">Detalles del Servicio</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {offerData.details.basic_service.free_days && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Días Libres:</span>
                <span className="font-medium">{offerData.details.basic_service.free_days} días</span>
              </div>
            )}
            {offerData.details.basic_service.validity && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Validez:</span>
                <span className="font-medium">
                  {offerData.details.basic_service.validity.time} {offerData.details.basic_service.validity.unit}
                </span>
              </div>
            )}
            {offerData.details.basic_service.cancellation_fee && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tarifa de Cancelación:</span>
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
            Tarifas de Flete
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
            {/* Para envíos marítimos */}
            {offerData.shipping_type === "Marítimo" && (
              <div className="flex justify-between p-2 bg-white/50 rounded">
                <span>Contenedor:</span>
                <span className="font-medium">{offerData.details.freight_fees?.container}</span>
              </div>
            )}
            
            {/* Para envíos aéreos */}
            {offerData.shipping_type === "Aéreo" && offerData.details.freight_fees?.dimensions && (
              <>
                <div className="flex justify-between p-2 bg-white/50 rounded">
                  <span>Longitud:</span>
                  <span className="font-medium">{offerData.details.freight_fees.dimensions.length} {offerData.details.freight_fees.dimensions.units || "cm"}</span>
                </div>
                <div className="flex justify-between p-2 bg-white/50 rounded">
                  <span>Ancho:</span>
                  <span className="font-medium">{offerData.details.freight_fees.dimensions.width} {offerData.details.freight_fees.dimensions.units || "cm"}</span>
                </div>
                <div className="flex justify-between p-2 bg-white/50 rounded">
                  <span>Altura:</span>
                  <span className="font-medium">{offerData.details.freight_fees.dimensions.height} {offerData.details.freight_fees.dimensions.units || "cm"}</span>
                </div>
              </>
            )}
            
            <div className="flex justify-between p-2 bg-white/50 rounded">
              <span>Valor del Flete:</span>
              <span className="font-medium">USD {offerData.details?.freight_fees?.value}</span>
            </div>
          </div>
        </div>

        {/* Cargos Adicionales (solo para aéreo) */}
        {offerData.shipping_type === "Aéreo" && offerData.details?.additional_fees && (
          <div className="bg-muted/30 rounded-lg p-4">
            <h4 className="text-sm font-medium mb-3">Cargos Adicionales</h4>
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
            <h4 className="text-sm font-medium mb-3">Tarifas de Origen</h4>
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
            <h4 className="text-sm font-medium mb-3">Tarifas de Destino</h4>
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
            <h4 className="text-sm font-medium mb-3">Servicio Básico</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              {offerData.details.basic_service?.cancellation_fee && (
                <div className="flex justify-between p-2 bg-white/50 rounded">
                  <span>Tarifa de Cancelación:</span>
                  <span className="font-medium">USD {offerData.details.basic_service.cancellation_fee}</span>
                </div>
              )}
              {offerData.details.basic_service?.free_days && (
                <div className="flex justify-between p-2 bg-white/50 rounded">
                  <span>Días Libres:</span>
                  <span className="font-medium">{offerData.details.basic_service.free_days} días</span>
                </div>
              )}
              {offerData.details.basic_service?.validity && (
                <div className="flex justify-between p-2 bg-white/50 rounded">
                  <span>Validez:</span>
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
            <h4 className="text-sm font-medium mb-3">Otros Cargos</h4>
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
          Al aceptar esta oferta, usted está de acuerdo con los términos y condiciones establecidos.
        </p>
      </div>
    </CardContent>

    <CardFooter className="flex flex-col sm:flex-row sm:justify-between gap-3 pt-4 flex-shrink-0">
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
