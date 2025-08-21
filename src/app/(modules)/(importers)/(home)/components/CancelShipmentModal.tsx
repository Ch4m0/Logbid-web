'use client'

import { useState } from 'react'
import { useTranslation } from '@/src/hooks/useTranslation'
import { useCancelShipment } from '@/src/app/hooks/useCancelShipment'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/src/components/ui/dialog'
import { Button } from '@/src/components/ui/button'
import { Textarea } from '@/src/components/ui/textarea'
import { Label } from '@/src/components/ui/label'
import { AlertTriangle, X, CheckCircle } from 'lucide-react'

interface CancelShipmentModalProps {
  isOpen: boolean
  onClose: () => void
  shipment: {
    uuid: string
    origin: string
    destination: string
    value?: number
    currency?: string
  } | null
  onSuccess?: () => void
  hasOffers?: boolean
}

export default function CancelShipmentModal({
  isOpen,
  onClose,
  shipment,
  onSuccess,
  hasOffers = false
}: CancelShipmentModalProps) {
  const { t } = useTranslation()
  const [cancellationReason, setCancellationReason] = useState('')
  const [errors, setErrors] = useState<{ [key: string]: string }>({})

  const { mutate: cancelShipment, isPending } = useCancelShipment()

  const handleSubmit = () => {
    // Validar que se ingrese un motivo
    if (!cancellationReason.trim()) {
      setErrors({ reason: t('cancelShipment.reasonRequired') })
      return
    }

    if (!shipment) return

    // Limpiar errores
    setErrors({})

    // Cancelar el shipment
    cancelShipment(
      {
        shipmentId: shipment.uuid,
        cancellationReason: cancellationReason.trim()
      },
      {
        onSuccess: () => {
          setCancellationReason('')
          onClose()
          onSuccess?.()
        },
        onError: () => {
          // El error ya se maneja en el hook con toast
        }
      }
    )
  }

  const handleClose = () => {
    if (isPending) return // No permitir cerrar mientras se está procesando
    setCancellationReason('')
    setErrors({})
    onClose()
  }

  if (!shipment) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            {t('cancelShipment.title')}
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            {t('cancelShipment.confirmMessage')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {hasOffers && (
            <div className="rounded-md border border-red-300 bg-red-50 p-4 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <p className="font-semibold text-red-800">
                    {t('cancelShipment.penaltyIfOffers', { amount: 20 })}
                  </p>
                  <p className="text-xs text-red-700 mt-1">
                    {t('cancelShipment.warning')}
                  </p>
                </div>
              </div>
            </div>
          )}
          {/* Información del shipment */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 text-gray-800">
              Información del Embarque
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">ID:</span>
                <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                  {shipment.uuid}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Ruta:</span>
                <span className="font-medium">
                  {shipment.origin} → {shipment.destination}
                </span>
              </div>
              {shipment.value && shipment.currency && (
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor:</span>
                  <span className="font-medium">
                    {shipment.currency} {shipment.value}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Consecuencias de la cancelación */}
          <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
            <h4 className="font-semibold mb-2 text-yellow-800 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              {t('cancelShipment.description')}
            </h4>
            <ul className="space-y-2 text-sm text-yellow-700">
              <li className="flex items-start gap-2">
                <span className="font-bold">•</span>
                {t('cancelShipment.consequences.1')}
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">•</span>
                {t('cancelShipment.consequences.2')}
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">•</span>
                {t('cancelShipment.consequences.3')}
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold">•</span>
                {t('cancelShipment.consequences.4')}
              </li>
              {hasOffers && (
                <li className="flex items-start gap-2">
                  <span className="font-bold">•</span>
                  {t('cancelShipment.penaltyIfOffers', { amount: 20 })}
                </li>
              )}
            </ul>
          </div>

          {/* Campo de motivo */}
          <div className="space-y-2">
            <Label htmlFor="cancellationReason" className="text-sm font-medium">
              {t('cancelShipment.reasonLabel')} *
            </Label>
            <Textarea
              id="cancellationReason"
              placeholder={t('cancelShipment.reasonPlaceholder')}
              value={cancellationReason}
              onChange={(e) => {
                setCancellationReason(e.target.value)
                if (errors.reason) {
                  setErrors({ ...errors, reason: '' })
                }
              }}
              rows={4}
              maxLength={500}
              className={errors.reason ? 'border-red-500' : ''}
              disabled={isPending}
            />
            {errors.reason && (
              <p className="text-red-500 text-xs">{errors.reason}</p>
            )}
            <div className="flex justify-between text-xs text-gray-500">
              <span>
                {t('cancelShipment.warning')}
              </span>
              <span>
                {cancellationReason.length}/500
              </span>
            </div>
          </div>
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleClose}
            disabled={isPending}
            className="flex items-center gap-2"
          >
            <X className="h-4 w-4" />
            {t('cancelShipment.cancelButton')}
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || !cancellationReason.trim()}
            className="bg-red-600 hover:bg-red-700 flex items-center gap-2"
          >
            {isPending ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                Cancelando...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                {t('cancelShipment.confirmButton')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
