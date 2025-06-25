'use client'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Badge } from '@/src/components/ui/badge'
import { useGetCostMetrics, CostFilters } from '@/src/app/hooks/useGetCostMetrics'
import { 
  DollarSign, 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  PiggyBank,
  Calculator,
  ArrowUpDown,
  Package
} from 'lucide-react'
import { useTranslation } from '@/src/hooks/useTranslation'

interface CostMetricsCardProps {
  filters: CostFilters
}

export function CostMetricsCard({ filters }: CostMetricsCardProps) {
  const { t } = useTranslation()
  const { data: metrics, isLoading, error } = useGetCostMetrics(filters)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatPercentage = (percentage: number) => {
    return `${percentage.toFixed(1)}%`
  }

  const getTrendIcon = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-red-500" />
      case 'down':
        return <TrendingDown className="h-4 w-4 text-green-500" />
      case 'stable':
        return <Minus className="h-4 w-4 text-gray-500" />
    }
  }

  const getTrendColor = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'text-red-500'
      case 'down':
        return 'text-green-500'
      case 'stable':
        return 'text-gray-500'
    }
  }

  const getTrendBadgeVariant = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return 'destructive'
      case 'down':
        return 'default'
      case 'stable':
        return 'secondary'
    }
  }

  const getTrendText = (trend: 'up' | 'down' | 'stable') => {
    switch (trend) {
      case 'up':
        return `📈 ${t('dashboard.customer.costMetrics.trends.up')}`
      case 'down':
        return `📉 ${t('dashboard.customer.costMetrics.trends.down')}`
      case 'stable':
        return `➖ ${t('dashboard.customer.costMetrics.trends.stable')}`
    }
  }

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            💰 {t('dashboard.customer.costMetrics.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">{t('dashboard.customer.costMetrics.loading')}</span>
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
            <DollarSign className="h-5 w-5" />
            💰 {t('dashboard.customer.costMetrics.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8">
            <p className="text-red-500">{t('dashboard.customer.costMetrics.error')}</p>
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
            <DollarSign className="h-5 w-5" />
            💰 {t('dashboard.customer.costMetrics.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8">
            <p className="text-gray-500">{t('dashboard.customer.costMetrics.noData')}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const getDateRangeText = (dateRange: string) => {
    switch (dateRange) {
      case '7d':
        return t('dashboard.customer.dateRanges.7d')
      case '30d':
        return t('dashboard.customer.dateRanges.30d')
      case '3m':
        return t('dashboard.customer.dateRanges.3m')
      case '6m':
        return t('dashboard.customer.dateRanges.6m')
      case '1y':
        return t('dashboard.customer.dateRanges.1y')
      default:
        return t('dashboard.customer.dateRanges.30d')
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {/* Gasto Total */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('dashboard.customer.costMetrics.totalSpent')}
          </CardTitle>
          <DollarSign className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(metrics.totalSpent)}
          </div>
          <div className="flex items-center mt-2">
            {getTrendIcon(metrics.costTrend)}
            <span className={`text-xs ml-1 ${getTrendColor(metrics.costTrend)}`}>
              {formatPercentage(metrics.trendPercentage)} {t('dashboard.customer.costMetrics.vsPreviousPeriod')}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {t('dashboard.customer.costMetrics.basedOn')} {metrics.acceptedOffersCount} {t('dashboard.customer.costMetrics.completedShipments')}
          </p>
        </CardContent>
      </Card>

      {/* Precio Promedio */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('dashboard.customer.costMetrics.averagePrice')}
          </CardTitle>
          <Calculator className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {formatCurrency(metrics.averagePrice)}
          </div>
          <div className="flex items-center mt-2">
            <Package className="h-3 w-3 text-muted-foreground mr-1" />
            <span className="text-xs text-muted-foreground">
              {t('dashboard.customer.costMetrics.perShipment')}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {t('dashboard.customer.costMetrics.basedOn')} {metrics.acceptedOffersCount} {t('dashboard.customer.costMetrics.shipments')}
          </p>
        </CardContent>
      </Card>

      {/* Ahorro Obtenido */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('dashboard.customer.costMetrics.totalSavings')}
          </CardTitle>
          <PiggyBank className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(metrics.totalSavings)}
          </div>
          <div className="flex items-center mt-2">
            <TrendingDown className="h-3 w-3 text-green-500 mr-1" />
            <span className="text-xs text-green-600">
              {t('dashboard.customer.costMetrics.comparingOffers')}
            </span>
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            {getDateRangeText(filters.dateRange)}
          </p>
        </CardContent>
      </Card>

      {/* Tendencia de Costos */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            {t('dashboard.customer.costMetrics.costTrends')}
          </CardTitle>
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <Badge variant={getTrendBadgeVariant(metrics.costTrend)} className="text-sm">
              {getTrendText(metrics.costTrend)}
            </Badge>
          </div>
          <div className="mt-3">
            <div className="text-sm text-muted-foreground">
              {t('dashboard.customer.costMetrics.previousPeriod')} {formatCurrency(metrics.periodComparison.previousPeriod)}
            </div>
            <div className="text-sm text-muted-foreground">
              {t('dashboard.customer.costMetrics.difference')} 
              <span className={`ml-1 font-medium ${
                metrics.periodComparison.difference >= 0 ? 'text-red-500' : 'text-green-500'
              }`}>
                {metrics.periodComparison.difference >= 0 ? '+' : ''}
                {formatCurrency(metrics.periodComparison.difference)}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 