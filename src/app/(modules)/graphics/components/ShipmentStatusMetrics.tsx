'use client'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Badge } from '@/src/components/ui/badge'
import { useGetShipmentStatusMetrics, ShipmentStatusFilters } from '@/src/app/hooks/useGetShipmentStatusMetrics'
import { 
  Package, 
  PackageCheck,
  AlertTriangle,
  Clock,
  CheckCircle,
  AlertCircle,
  Activity
} from 'lucide-react'
import { useTranslation } from '@/src/hooks/useTranslation'

interface ShipmentStatusMetricsProps {
  filters: ShipmentStatusFilters
}

export function ShipmentStatusMetrics({ filters }: ShipmentStatusMetricsProps) {
  const { t } = useTranslation()
  const { data: metrics, isLoading, error } = useGetShipmentStatusMetrics(filters)

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(1)}%`
  }

  const getStatusBadgeVariant = (type: 'critical' | 'warning' | 'success' | 'default') => {
    switch (type) {
      case 'critical':
        return 'destructive'
      case 'warning':
        return 'secondary'
      case 'success':
        return 'default'
      default:
        return 'outline'
    }
  }

  const getStatusColor = (type: 'critical' | 'warning' | 'success' | 'default') => {
    switch (type) {
      case 'critical':
        return 'text-red-600'
      case 'warning':
        return 'text-yellow-600'
      case 'success':
        return 'text-green-600'
      default:
        return 'text-blue-600'
    }
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            📦 {t('dashboard.customer.shipmentStatus.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">{t('dashboard.customer.shipmentStatus.loading')}</span>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            📦 {t('dashboard.customer.shipmentStatus.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8">
            <p className="text-red-500">{t('dashboard.customer.shipmentStatus.error')}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!metrics) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            📦 {t('dashboard.customer.shipmentStatus.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8">
            <p className="text-gray-500">{t('dashboard.customer.shipmentStatus.noData')}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Envíos Activos vs Cerrados */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('dashboard.customer.shipmentStatus.activeShipments')}
          </CardTitle>
          <Activity className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {metrics.activeShipments}
          </div>
          <div className="flex items-center mt-2">
            <Badge variant="outline" className="text-xs">
              {formatPercentage(metrics.activePercentage)} {t('dashboard.customer.shipmentStatus.ofActiveShipments')}
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {t('dashboard.customer.shipmentStatus.totalShipments')}: {metrics.totalShipments}
          </p>
        </CardContent>
      </Card>

      {/* Envíos Cerrados */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('dashboard.customer.shipmentStatus.closedShipments')}
          </CardTitle>
          <PackageCheck className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {metrics.closedShipments}
          </div>
                     <div className="flex items-center mt-2">
             <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
             <span className="text-xs text-green-600">
               {formatPercentage(metrics.closedPercentage)} {t('dashboard.customer.shipmentStatus.completed')}
             </span>
           </div>
          <p className="text-xs text-muted-foreground mt-1">
            {t('dashboard.customer.shipmentStatus.totalShipments')}: {metrics.totalShipments}
          </p>
        </CardContent>
      </Card>

      {/* Envíos Sin Ofertas */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('dashboard.customer.shipmentStatus.withoutOffers')}
          </CardTitle>
          <AlertTriangle className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${metrics.shipmentsWithoutOffers > 0 ? 'text-yellow-600' : 'text-green-600'}`}>
            {metrics.shipmentsWithoutOffers}
          </div>
          <div className="flex items-center mt-2">
            <AlertCircle className="h-3 w-3 text-yellow-500 mr-1" />
            <span className="text-xs text-yellow-600">
              {formatPercentage(metrics.withoutOffersPercentage)} {t('dashboard.customer.shipmentStatus.ofActiveShipments')}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {t('dashboard.customer.shipmentStatus.noOffersReceived')}
          </p>
        </CardContent>
      </Card>

      {/* Envíos Próximos a Vencer */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('dashboard.customer.shipmentStatus.expiringSoon')}
          </CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${metrics.shipmentsExpiringSoon > 0 ? 'text-red-600' : 'text-green-600'}`}>
            {metrics.shipmentsExpiringSoon}
          </div>
          <div className="flex items-center mt-2">
            <Clock className="h-3 w-3 text-red-500 mr-1" />
            <span className="text-xs text-red-600">
              {formatPercentage(metrics.expiringPercentage)} {t('dashboard.customer.shipmentStatus.ofActiveShipments')}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {t('dashboard.customer.shipmentStatus.within24Hours')}
          </p>
        </CardContent>
      </Card>

      {/* Resumen de Estado - Span completo */}
      <Card className="md:col-span-2 lg:col-span-4">
                 <CardHeader>
           <CardTitle className="flex items-center gap-2">
             <Package className="h-5 w-5" />
             {t('dashboard.customer.shipmentStatus.statusSummary')}
           </CardTitle>
         </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Necesitan Atención */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-yellow-50">
              <div>
                <h3 className="font-medium text-yellow-800">
                  {t('dashboard.customer.shipmentStatus.needsAttention')}
                </h3>
                <p className="text-2xl font-bold text-yellow-600">
                  {metrics.summary.needsAttention}
                </p>
                                 <p className="text-xs text-yellow-700">
                   {t('dashboard.customer.shipmentStatus.withoutOffersAndExpiring')}
                 </p>
               </div>
               <Badge variant={getStatusBadgeVariant('warning')}>
                 {metrics.summary.needsAttention > 0 ? t('dashboard.customer.shipmentStatus.actionRequired') : 'OK'}
               </Badge>
            </div>

            {/* Alertas Críticas */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-red-50">
              <div>
                <h3 className="font-medium text-red-800">
                  {t('dashboard.customer.shipmentStatus.criticalAlerts')}
                </h3>
                <p className="text-2xl font-bold text-red-600">
                  {metrics.summary.criticalAlerts}
                </p>
                <p className="text-xs text-red-700">
                  {t('dashboard.customer.shipmentStatus.requiresImmediate')}
                </p>
              </div>
                             <Badge variant={getStatusBadgeVariant('critical')}>
                 {metrics.summary.criticalAlerts > 0 ? t('dashboard.customer.shipmentStatus.urgent') : t('dashboard.customer.shipmentStatus.noAlerts')}
               </Badge>
            </div>

            {/* Envíos Saludables */}
            <div className="flex items-center justify-between p-4 border rounded-lg bg-green-50">
              <div>
                <h3 className="font-medium text-green-800">
                  {t('dashboard.customer.shipmentStatus.healthyShipments')}
                </h3>
                <p className="text-2xl font-bold text-green-600">
                  {metrics.summary.healthyShipments}
                </p>
                                 <p className="text-xs text-green-700">
                   {t('dashboard.customer.shipmentStatus.withOffersAndTime')}
                 </p>
               </div>
               <Badge variant={getStatusBadgeVariant('success')}>
                 {t('dashboard.customer.shipmentStatus.inOrder')}
               </Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 