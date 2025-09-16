'use client'
import { useGetShipment } from '@/src/app/hooks/useGetShipment'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Badge } from '@/src/components/ui/badge'
import { Ship, MapPin, Calendar, ArrowRight } from 'lucide-react'
import { useTranslation } from '@/src/hooks/useTranslation'
import { formatDateUTCAsLocal, formatPrice } from '@/src/lib/utils'

interface ShipmentInfoProps {
  shipmentId: string
}

export function ShipmentInfo({ shipmentId }: ShipmentInfoProps) {
  const { t } = useTranslation()
  const { data: shipment, isLoading, error } = useGetShipment({ shipment_id: shipmentId })

  if (isLoading) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !shipment) {
    return (
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="text-center text-red-500">
            {t('common.error')}: {error?.message || 'Shipment not found'}
          </div>
        </CardContent>
      </Card>
    )
  }

  // Función para obtener el ícono de transporte
  const getTransportIcon = () => {
    switch (shipment.shipping_type) {
      case '1':
        return <Ship className="w-5 h-5 text-blue-600" />
      case '2':
        return <Ship className="w-5 h-5 text-blue-600" /> // Podríamos usar Plane aquí
      default:
        return <Ship className="w-5 h-5 text-blue-600" />
    }
  }

  // Función para obtener el tipo de transporte
  const getTransportType = () => {
    switch (shipment.shipping_type) {
      case '1':
        return 'Maritime'
      case '2':
        return 'Air'
      default:
        return 'Maritime'
    }
  }

  // Función para obtener el badge del status
  const getStatusBadge = () => {
    switch (shipment.status) {
      case 'Active':
        return <Badge className="bg-green-100 text-green-800 border-green-200">Active</Badge>
      case 'Closed':
        return <Badge className="bg-blue-100 text-blue-800 border-blue-200">Closed</Badge>
      case 'Cancelled':
        return <Badge className="bg-red-100 text-red-800 border-red-200">Cancelled</Badge>
      case 'Expired':
        return <Badge className="bg-gray-100 text-gray-800 border-gray-200">Expired</Badge>
      default:
        return <Badge variant="outline">{shipment.status}</Badge>
    }
  }

  return (
    <Card className="mb-6 border-0 shadow-sm">
      <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                  {getTransportIcon()}

                  <span>{t('shipmentInfo.title')}</span>

                  {shipment.transportation && (
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                          {shipment.transportation}
                      </Badge>
                  )}
              </CardTitle>
        <p className="text-sm text-gray-500 font-mono">{shipment.uuid}</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Route */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <MapPin className="w-4 h-4 mr-2 text-gray-500" />
              {t('shipmentInfo.route')}
            </h3>
            <div className="flex items-center justify-between">
              <div className="text-center">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-2xl">{shipment.origin_flag || '🏳️'}</span>
                  <div>
                    <div className="font-semibold text-sm">{shipment.origin_country}</div>
                    <div className="text-xs text-gray-500">{shipment.origin_name}</div>
                  </div>
                </div>
              </div>
              <ArrowRight className="w-6 h-6 text-gray-400 mx-4" />
              <div className="text-center">
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-2xl">{shipment.destination_flag || '🏳️'}</span>
                  <div>
                    <div className="font-semibold text-sm">{shipment.destination_country}</div>
                    <div className="text-xs text-gray-500">{shipment.destination_name}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Schedule */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-gray-500" />
              {t('shipmentInfo.schedule')}
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{t('shipmentInfo.created')}:</span>
                <div className="text-right">
                  <div className="font-semibold text-sm font-mono">{formatDateUTCAsLocal(shipment.inserted_at).split(' ')[0]}</div>
                  <div className="text-xs text-gray-500">{formatDateUTCAsLocal(shipment.inserted_at).split(' ')[1]}</div>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">{t('shipmentInfo.expiration')}:</span>
                <div className="text-right">
                  <div className="font-semibold text-sm font-mono">{formatDateUTCAsLocal(shipment.expiration_date).split(' ')[0]}</div>
                  <div className="text-xs text-gray-500">{formatDateUTCAsLocal(shipment.expiration_date).split(' ')[1]}</div>
                </div>
              </div>
              {shipment.shipping_date && (
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">{t('shipmentInfo.shipping')}:</span>
                  <div className="font-semibold text-sm font-mono">{formatDateUTCAsLocal(shipment.shipping_date).split(' ')[0]}</div>
                </div>
              )}
            </div>
          </div>

          {/* Status & Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900">{t('shipmentInfo.status')}</h3>
            <div className="space-y-3">
              {getStatusBadge()}
              <div className="text-sm text-gray-600 space-y-1">
                {shipment.value && shipment.currency && (
                  <div className="font-semibold text-sm font-mono">
                    {t('shipmentInfo.value')}: {formatPrice(shipment.value, shipment.currency)}
                  </div>
                )}

                {shipment.agent_code && (
                  <div>{t('shipmentInfo.assignedAgent')}: {shipment.agent_code}</div>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
