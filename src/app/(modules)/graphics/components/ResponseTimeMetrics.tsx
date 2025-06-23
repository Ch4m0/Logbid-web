'use client'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Badge } from '@/src/components/ui/badge'
import { useGetResponseTimeMetrics, ResponseTimeFilters } from '@/src/app/hooks/useGetResponseTimeMetrics'
import { 
  Clock, 
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Activity,
  Calendar
} from 'lucide-react'
import { useTranslation } from '@/src/hooks/useTranslation'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart
} from 'recharts'

interface ResponseTimeMetricsProps {
  filters: ResponseTimeFilters
}

export function ResponseTimeMetrics({ filters }: ResponseTimeMetricsProps) {
  const { t } = useTranslation()
  const { data: metrics, isLoading, error } = useGetResponseTimeMetrics(filters)

  const formatHours = (hours: number) => {
    if (hours < 24) {
      return `${hours.toFixed(1)} ${t('dashboard.importer.responseTime.hours')}`
    }
    return `${(hours / 24).toFixed(1)} ${t('dashboard.importer.responseTime.days')}`
  }

  const getResponseRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600'
    if (rate >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getResponseRateLabel = (rate: number) => {
    if (rate >= 80) return t('dashboard.importer.responseTime.excellent')
    if (rate >= 60) return t('dashboard.importer.responseTime.good')
    return t('dashboard.importer.responseTime.poor')
  }

  const getResponseRateBadge = (rate: number) => {
    if (rate >= 80) return 'default'
    if (rate >= 60) return 'secondary'
    return 'destructive'
  }

  // Format timeline data for charts
  const formatTimelineData = () => {
    if (!metrics?.responseTimeline) return []
    
    return metrics.responseTimeline.map(item => ({
      date: new Date(item.date).toLocaleDateString('es-ES', { 
        month: 'short', 
        day: 'numeric' 
      }),
      shipments: item.shipments_created,
      offers: item.offers_received,
      responseTime: Number(item.avg_response_time_hours.toFixed(1))
    }))
  }

  const chartData = formatTimelineData()

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            ⚡ {t('dashboard.importer.responseTime.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">{t('dashboard.importer.responseTime.loading')}</span>
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
            <Clock className="h-5 w-5" />
            ⚡ {t('dashboard.importer.responseTime.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8">
            <p className="text-red-500">{t('dashboard.importer.responseTime.error')}</p>
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
            <Clock className="h-5 w-5" />
            ⚡ {t('dashboard.importer.responseTime.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8">
            <p className="text-gray-500">{t('dashboard.importer.responseTime.noData')}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Tiempo Promedio Primera Oferta */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.importer.responseTime.averageFirstOffer')}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metrics.averageFirstOfferHours <= 24 ? 'text-green-600' : 'text-yellow-600'}`}>
              {formatHours(metrics.averageFirstOfferHours)}
            </div>
            <div className="flex items-center mt-2">
              {metrics.summary.fastResponse ? (
                <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
              ) : (
                <Clock className="h-3 w-3 text-yellow-500 mr-1" />
              )}
              <span className={`text-xs ${metrics.summary.fastResponse ? 'text-green-600' : 'text-yellow-600'}`}>
                {metrics.summary.fastResponse 
                  ? t('dashboard.importer.responseTime.within24Hours')
                  : t('dashboard.importer.responseTime.moreThan24Hours')
                }
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('dashboard.importer.responseTime.last7Days')}
            </p>
          </CardContent>
        </Card>

        {/* Envíos sin ofertas después de X días */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.importer.responseTime.noOffersAfterDays')} {metrics.daysThreshold} {t('dashboard.importer.responseTime.days')}
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${metrics.shipmentsNoOffersAfterXDays > 0 ? 'text-red-600' : 'text-green-600'}`}>
              {metrics.shipmentsNoOffersAfterXDays}
            </div>
            <div className="flex items-center mt-2">
              {metrics.shipmentsNoOffersAfterXDays > 0 ? (
                <AlertTriangle className="h-3 w-3 text-red-500 mr-1" />
              ) : (
                <CheckCircle className="h-3 w-3 text-green-500 mr-1" />
              )}
              <span className={`text-xs ${metrics.shipmentsNoOffersAfterXDays > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {metrics.shipmentsNoOffersAfterXDays > 0 
                  ? t('dashboard.importer.responseTime.needsAttention')
                  : t('dashboard.importer.responseTime.excellent')
                }
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              de {metrics.totalActiveShipments} {t('dashboard.importer.responseTime.shipments')}
            </p>
          </CardContent>
        </Card>

        {/* Tasa de Respuesta del Mercado */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.importer.responseTime.marketResponseRate')}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getResponseRateColor(metrics.marketResponseRate)}`}>
              {metrics.marketResponseRate.toFixed(1)}%
            </div>
            <div className="flex items-center mt-2">
              <Badge variant={getResponseRateBadge(metrics.marketResponseRate) as any}>
                {getResponseRateLabel(metrics.marketResponseRate)}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.totalOffersReceived} ofertas recibidas
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Línea de Tiempo */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {t('dashboard.importer.responseTime.responseTimeline')} - {t('dashboard.importer.responseTime.last7Days')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date" 
                  fontSize={12}
                />
                <YAxis 
                  yAxisId="left"
                  fontSize={12}
                />
                <YAxis 
                  yAxisId="right"
                  orientation="right"
                  fontSize={12}
                />
                <Tooltip 
                  labelFormatter={(label) => `Fecha: ${label}`}
                  formatter={(value, name) => {
                    switch (name) {
                      case 'shipments':
                        return [value, t('dashboard.importer.responseTime.shipmentsCreated')]
                      case 'offers':
                        return [value, t('dashboard.importer.responseTime.offersReceived')]
                      case 'responseTime':
                        return [`${value}h`, t('dashboard.importer.responseTime.avgResponseTime')]
                      default:
                        return [value, name]
                    }
                  }}
                />
                <Legend 
                  formatter={(value) => {
                    switch (value) {
                      case 'shipments':
                        return t('dashboard.importer.responseTime.shipmentsCreated')
                      case 'offers':
                        return t('dashboard.importer.responseTime.offersReceived')
                      case 'responseTime':
                        return t('dashboard.importer.responseTime.avgResponseTime')
                      default:
                        return value
                    }
                  }}
                />
                <Bar 
                  yAxisId="left"
                  dataKey="shipments" 
                  fill="#3b82f6" 
                  name="shipments"
                  opacity={0.8}
                />
                <Bar 
                  yAxisId="left"
                  dataKey="offers" 
                  fill="#10b981" 
                  name="offers"
                  opacity={0.8}
                />
                <Line 
                  yAxisId="right"
                  type="monotone" 
                  dataKey="responseTime" 
                  stroke="#f59e0b" 
                  strokeWidth={3}
                  name="responseTime"
                  dot={{ fill: '#f59e0b', strokeWidth: 2, r: 4 }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-sm text-muted-foreground">
            <p>• <span className="text-blue-600">■</span> {t('dashboard.importer.responseTime.shipmentsCreated')}</p>
            <p>• <span className="text-green-600">■</span> {t('dashboard.importer.responseTime.offersReceived')}</p>
            <p>• <span className="text-yellow-600">—</span> {t('dashboard.importer.responseTime.avgResponseTime')} ({t('dashboard.importer.responseTime.hours')})</p>
          </div>
        </CardContent>
      </Card>

      {/* Resumen de Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Resumen de Performance
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tiempo de Respuesta */}
            <div className={`p-4 border rounded-lg ${metrics.summary.fastResponse ? 'bg-green-50' : 'bg-yellow-50'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-medium ${metrics.summary.fastResponse ? 'text-green-800' : 'text-yellow-800'}`}>
                    {t('dashboard.importer.responseTime.fastResponse')}
                  </h3>
                  <p className={`text-2xl font-bold ${metrics.summary.fastResponse ? 'text-green-600' : 'text-yellow-600'}`}>
                    {formatHours(metrics.averageFirstOfferHours)}
                  </p>
                  <p className={`text-xs ${metrics.summary.fastResponse ? 'text-green-700' : 'text-yellow-700'}`}>
                    {metrics.summary.fastResponse 
                      ? t('dashboard.importer.responseTime.fastResponseTime')
                      : t('dashboard.importer.responseTime.slowResponseTime')
                    }
                  </p>
                </div>
                <Badge variant={metrics.summary.fastResponse ? 'default' : 'secondary'}>
                  {metrics.summary.fastResponse ? 'Rápido' : 'Lento'}
                </Badge>
              </div>
            </div>

            {/* Tasa de Respuesta */}
            <div className={`p-4 border rounded-lg ${
              metrics.marketResponseRate >= 80 ? 'bg-green-50' : 
              metrics.marketResponseRate >= 60 ? 'bg-yellow-50' : 'bg-red-50'
            }`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-medium ${
                    metrics.marketResponseRate >= 80 ? 'text-green-800' : 
                    metrics.marketResponseRate >= 60 ? 'text-yellow-800' : 'text-red-800'
                  }`}>
                    {t('dashboard.importer.responseTime.goodRate')}
                  </h3>
                  <p className={`text-2xl font-bold ${getResponseRateColor(metrics.marketResponseRate)}`}>
                    {metrics.marketResponseRate.toFixed(1)}%
                  </p>
                  <p className={`text-xs ${
                    metrics.marketResponseRate >= 80 ? 'text-green-700' : 
                    metrics.marketResponseRate >= 60 ? 'text-yellow-700' : 'text-red-700'
                  }`}>
                    {metrics.marketResponseRate >= 80 
                      ? t('dashboard.importer.responseTime.responseRateExcellent')
                      : metrics.marketResponseRate >= 60 
                        ? t('dashboard.importer.responseTime.responseRateGood')
                        : t('dashboard.importer.responseTime.responseRatePoor')
                    }
                  </p>
                </div>
                <Badge variant={getResponseRateBadge(metrics.marketResponseRate) as any}>
                  {getResponseRateLabel(metrics.marketResponseRate)}
                </Badge>
              </div>
            </div>

            {/* Atención Requerida */}
            <div className={`p-4 border rounded-lg ${metrics.summary.needsAttention ? 'bg-red-50' : 'bg-green-50'}`}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className={`font-medium ${metrics.summary.needsAttention ? 'text-red-800' : 'text-green-800'}`}>
                    {t('dashboard.importer.responseTime.needsAttention')}
                  </h3>
                  <p className={`text-2xl font-bold ${metrics.summary.needsAttention ? 'text-red-600' : 'text-green-600'}`}>
                    {metrics.shipmentsNoOffersAfterXDays}
                  </p>
                  <p className={`text-xs ${metrics.summary.needsAttention ? 'text-red-700' : 'text-green-700'}`}>
                    Sin ofertas después de {metrics.daysThreshold} días
                  </p>
                </div>
                <Badge variant={metrics.summary.needsAttention ? 'destructive' : 'default'}>
                  {metrics.summary.needsAttention ? 'Atención' : 'OK'}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 