'use client'
import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'
import { CostMetricsCard } from './CostMetricsCard'
import { ShipmentStatusMetrics } from './ShipmentStatusMetrics'
import { ResponseTimeMetrics } from './ResponseTimeMetrics'
import { TopRoutesMetrics } from './TopRoutesMetrics'
import { SuccessRateMetrics } from './SuccessRateMetrics'
import { CostFilters } from '@/src/app/hooks/useGetCostMetrics'
import { ShipmentStatusFilters } from '@/src/app/hooks/useGetShipmentStatusMetrics'
import { ResponseTimeFilters } from '@/src/app/hooks/useGetResponseTimeMetrics'
import { SuccessRateFilters } from '@/src/app/hooks/useGetSuccessRateMetrics'
import { useTranslation } from '@/src/hooks/useTranslation'
import { Calendar, Filter, BarChart3, Package, TrendingUp, Bell } from 'lucide-react'
import { createTestNotifications, clearTestNotifications } from '@/src/utils/testNotifications'
import { toast } from '@/src/components/ui/use-toast'

interface ImporterDashboardViewProps {
  profile: any
}

export function ImporterDashboardView({ profile }: ImporterDashboardViewProps) {
  const { t } = useTranslation()
  
  // Obtener el primer mercado del usuario como default
  const defaultMarketId = profile?.all_markets?.[0]?.id?.toString() || 'all'
  
  const [filters, setFilters] = useState<CostFilters>({
    marketId: defaultMarketId,
    dateRange: '30d',
    transportType: 'all',
    userId: profile?.id?.toString() || '',
    enabled: !!profile?.id
  })

  // Filtros para métricas de estado de envíos (sin rango de fecha)
  const shipmentFilters: ShipmentStatusFilters = {
    userId: profile?.id?.toString() || '',
    marketId: filters.marketId === 'all' ? undefined : filters.marketId,
    transportType: filters.transportType === 'all' ? undefined : filters.transportType,
    enabled: !!profile?.id
  }

  // Filtros para métricas de tiempo de respuesta
  const responseTimeFilters: ResponseTimeFilters = {
    userId: profile?.id?.toString() || '',
    marketId: filters.marketId === 'all' ? undefined : filters.marketId,
    transportType: filters.transportType === 'all' ? undefined : filters.transportType,
    daysThreshold: 3, // Configuración por defecto
    enabled: !!profile?.id
  }

  // Filtros para métricas de tasa de éxito
  const successRateFilters: SuccessRateFilters = {
    userId: profile?.id?.toString() || '',
    marketId: filters.marketId === 'all' ? undefined : filters.marketId,
    transportType: filters.transportType === 'all' ? undefined : filters.transportType,
    daysPeriod: 90, // Últimos 90 días
    enabled: !!profile?.id
  }

  const updateFilter = (key: keyof CostFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  // Función para probar notificaciones
  const handleTestNotifications = async () => {
    try {
      await createTestNotifications(profile.id)
      toast({
        title: '✅ Notificaciones de prueba creadas',
        description: 'Se crearon 6 notificaciones de prueba. Revisa la campana 🔔',
        duration: 3000
      })
    } catch (error) {
      toast({
        title: '❌ Error',
        description: 'No se pudieron crear las notificaciones de prueba',
        variant: 'destructive'
      })
    }
  }

  const handleClearNotifications = async () => {
    try {
      await clearTestNotifications(profile.id)
      toast({
        title: '🧹 Notificaciones eliminadas',
        description: 'Se eliminaron las notificaciones de prueba',
        duration: 3000
      })
    } catch (error) {
      toast({
        title: '❌ Error',
        description: 'No se pudieron eliminar las notificaciones',
        variant: 'destructive'
      })
    }
  }

  const dateRangeOptions = [
    { value: '7d', label: t('dashboard.importer.dateRanges.7d') },
    { value: '30d', label: t('dashboard.importer.dateRanges.30d') },
    { value: '3m', label: t('dashboard.importer.dateRanges.3m') },
    { value: '6m', label: t('dashboard.importer.dateRanges.6m') },
    { value: '1y', label: t('dashboard.importer.dateRanges.1y') }
  ]

  const transportTypeOptions = [
    { value: 'all', label: t('dashboard.importer.allTransportTypes') },
    { value: 'Marítimo', label: t('transport.maritime') },
    { value: 'Aéreo', label: t('transport.air') }
  ]

  return (
    <div className="p-8 space-y-6">
      {/* Botones de prueba de notificaciones */}
      <Card className="p-4 bg-yellow-50 border-yellow-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-yellow-600" />
            <div>
              <h3 className="font-semibold text-yellow-800">🧪 Prueba del Sistema de Notificaciones</h3>
              <p className="text-sm text-yellow-700">Prueba las notificaciones en tiempo real</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button onClick={handleTestNotifications} variant="outline" size="sm">
              <Bell className="h-4 w-4 mr-2" />
              Crear Notificaciones
            </Button>
            <Button onClick={handleClearNotifications} variant="outline" size="sm">
              🧹 Limpiar
            </Button>
          </div>
        </div>
      </Card>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Package className="h-8 w-8 text-blue-600" />
            {t('dashboard.importer.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('dashboard.importer.subtitle')}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <BarChart3 className="h-8 w-8 text-primary" />
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t('dashboard.importer.filtersTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Filtro de Mercado */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('dashboard.importer.marketLabel')}</label>
              <Select
                value={filters.marketId}
                onValueChange={(value) => updateFilter('marketId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('dashboard.importer.selectMarket')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('dashboard.importer.allMarkets')}</SelectItem>
                  {profile?.all_markets?.map((market: any) => (
                    <SelectItem key={market.id} value={market.id.toString()}>
                      {market.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro de Período */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('dashboard.importer.periodLabel')}</label>
              <Select
                value={filters.dateRange}
                onValueChange={(value: any) => updateFilter('dateRange', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('dashboard.importer.selectPeriod')} />
                </SelectTrigger>
                <SelectContent>
                  {dateRangeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro de Tipo de Transporte */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('dashboard.importer.transportTypeLabel')}</label>
              <Select
                value={filters.transportType}
                onValueChange={(value: any) => updateFilter('transportType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('dashboard.importer.selectTransportType')} />
                </SelectTrigger>
                <SelectContent>
                  {transportTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Botón de Actualizar */}
            <div className="space-y-2">
              <label className="text-sm font-medium invisible">{t('dashboard.importer.updateButton')}</label>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  // Forzar refetch actualizando filtros
                  setFilters(prev => ({ ...prev, enabled: false }))
                  setTimeout(() => {
                    setFilters(prev => ({ ...prev, enabled: true }))
                  }, 100)
                }}
              >
                <Calendar className="h-4 w-4 mr-2" />
                {t('dashboard.importer.updateButton')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas de Costo Total y Ahorro */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">💰 {t('dashboard.importer.costMetrics.title')}</h2>
        <CostMetricsCard filters={filters} />
      </div>

      {/* Métricas de Estado de Envíos */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">📦 {t('dashboard.importer.shipmentStatus.title')}</h2>
        <ShipmentStatusMetrics filters={shipmentFilters} />
      </div>

      {/* Métricas de Tiempo de Respuesta */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">⚡ {t('dashboard.importer.responseTime.title')}</h2>
        <ResponseTimeMetrics filters={responseTimeFilters} />
      </div>

      {/* Métricas de Rutas Principales */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">🗺️ {t('dashboard.importer.topRoutes.title')}</h2>
        <TopRoutesMetrics 
          filters={{
            userId: profile?.id?.toString() || '',
            marketId: filters.marketId === 'all' ? undefined : filters.marketId,
            transportType: filters.transportType === 'all' ? undefined : filters.transportType,
            limitRoutes: 5
          }}
        />
      </div>

      {/* Métricas de Tasa de Éxito y Actividad */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">🎯 {t('dashboard.importer.successRate.title')}</h2>
        <SuccessRateMetrics filters={successRateFilters} />
      </div>

      {/* Placeholder para futuras métricas */}
      <Card>
        <CardHeader>
          <CardTitle>📊 {t('dashboard.importer.upcomingMetrics.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8">
            <p className="text-gray-500">{t('dashboard.importer.upcomingMetrics.comingSoon')}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 