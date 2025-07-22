'use client'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Badge } from '@/src/components/ui/badge'
import { 
  useGetAgentPerformanceMetrics, 
  AgentPerformanceFilters 
} from '@/src/app/hooks/useGetAgentPerformanceMetrics'
import { useTranslation } from '@/src/hooks/useTranslation'
import { 
  Target, 
  TrendingUp, 
  Clock, 
  Users, 
  Award, 
  Zap,
  DollarSign,
  BarChart3
} from 'lucide-react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts'

interface AgentPerformanceMetricsProps {
  filters: AgentPerformanceFilters
}

export function AgentPerformanceMetrics({ filters }: AgentPerformanceMetricsProps) {
  const { t } = useTranslation()
  const { data: metrics, isLoading, error } = useGetAgentPerformanceMetrics(filters)

  // Helper para formatear moneda
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  // Helper para formatear porcentajes
  const formatPercentage = (value: number) => `${value.toFixed(1)}%`

  // Colores para gráficos
  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444']

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        <Card className="animate-pulse">
          <CardContent className="p-6">
            <div className="h-64 bg-gray-200 rounded"></div>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (error) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-red-500">{t('dashboard.agent.performance.errorLoading')}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {error.message}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!metrics?.summary.hasData) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <p className="text-gray-500">{t('dashboard.agent.performance.noDataAvailable')}</p>
            <p className="text-sm text-muted-foreground mt-2">
              {t('dashboard.agent.performance.sendOffersMessage')}
            </p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const basic = metrics.basicMetrics
  const position = metrics.marketPosition
  const trends = metrics.monthlyTrend
  const breakdown = metrics.offerStatusBreakdown
  const routes = metrics.routePerformance
  const competition = metrics.competitionAnalysis

  // Datos para el gráfico de status de ofertas
  const offerStatusData = [
    { name: t('dashboard.agent.performance.acceptedOffers'), value: breakdown.accepted, color: '#10B981' },
    { name: t('dashboard.agent.performance.pendingOffers'), value: breakdown.pending, color: '#3B82F6' },
    { name: t('dashboard.agent.performance.rejectedOffers'), value: breakdown.rejected, color: '#EF4444' }
  ].filter(item => item.value > 0)

  // Datos para el gráfico de tendencia mensual
  const monthlyTrendData = trends.map(trend => ({
    ...trend,
    month: new Date(trend.month + '-01').toLocaleDateString('es', { month: 'short', year: '2-digit' })
  })).reverse()

  // Helper para obtener el badge de performance
  const getPerformanceBadge = (level: string, value: number, suffix: string = '%') => {
    const variants = {
      excellent: 'default',
      good: 'secondary', 
      average: 'outline',
      needs_improvement: 'destructive',
      poor: 'destructive'
    } as const
    
    const colors = {
      excellent: 'text-green-600',
      good: 'text-blue-600',
      average: 'text-yellow-600', 
      needs_improvement: 'text-red-600',
      poor: 'text-red-600'
    } as const

    return (
      <Badge variant={variants[level as keyof typeof variants]}>
        <span className={colors[level as keyof typeof colors]}>
          {value.toFixed(1)}{suffix}
        </span>
      </Badge>
    )
  }

  return (
    <div className="space-y-6">
      {/* KPIs Principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.agent.performance.conversionRate')}</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {formatPercentage(basic.conversionRate)}
            </div>
            <div className="mt-1">
              {getPerformanceBadge(metrics.summary.performanceLevel, basic.conversionRate)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {basic.acceptedOffers} {t('dashboard.agent.of')} {basic.totalOffers} {t('dashboard.agent.performance.offers')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.agent.performance.totalRevenue')}</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {formatCurrency(basic.totalRevenue)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {t('dashboard.agent.performance.averageValue')}: {formatCurrency(basic.avgContractValue)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.agent.performance.marketRanking')}</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              #{position.ranking}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {t('dashboard.agent.performance.topPercentile')} {position.percentile ? position.percentile.toFixed(0) : '0'}% {t('dashboard.agent.of')} {position.totalAgents || 0} {t('dashboard.agent.performance.agents')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.agent.performance.responseTime')}</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {basic.avgResponseTimeHours ? basic.avgResponseTimeHours.toFixed(1) : '0.0'}{t('dashboard.agent.performance.hours')}
            </div>
            <div className="mt-1">
              {getPerformanceBadge(metrics.summary.responseLevel, basic.responseRate)}
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {t('dashboard.agent.performance.responseRate')}: {formatPercentage(basic.responseRate)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos de Tendencias */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tendencia Mensual */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t('dashboard.agent.performance.monthlyTrend')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis yAxisId="left" orientation="left" />
                <YAxis yAxisId="right" orientation="right" />
                <Tooltip 
                  formatter={(value, name) => [
                    name === 'conversion_rate' ? `${value}%` : value,
                    name === 'conversion_rate' ? t('dashboard.agent.performance.conversion') : 
                    name === 'offers' ? t('dashboard.agent.performance.offers') :
                    name === 'accepted' ? t('dashboard.agent.performance.acceptedOffers') : t('dashboard.agent.performance.totalRevenue')
                  ]}
                />
                <Legend />
                <Bar yAxisId="left" dataKey="offers" fill="#3B82F6" name={t('dashboard.agent.performance.offers')} />
                <Bar yAxisId="left" dataKey="accepted" fill="#10B981" name={t('dashboard.agent.performance.acceptedOffers')} />
                <Line 
                  yAxisId="right" 
                  type="monotone" 
                  dataKey="conversion_rate" 
                  stroke="#F59E0B" 
                  strokeWidth={3}
                  name={t('dashboard.agent.performance.conversion') + ' %'}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribución de Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {t('dashboard.agent.performance.offersDistribution')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={offerStatusData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {offerStatusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [value, t('dashboard.agent.performance.offers')]} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
            
            {/* Estadísticas adicionales */}
            <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
              <div className="text-center">
                <div className="font-semibold text-lg">{basic.totalOffers}</div>
                <div className="text-muted-foreground">{t('dashboard.agent.performance.totalOffers')}</div>
              </div>
              <div className="text-center">
                <div className="font-semibold text-lg">{basic.pendingOffers}</div>
                <div className="text-muted-foreground">{t('dashboard.agent.performance.pending')}</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance por Rutas */}
      {routes.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              {t('dashboard.agent.performance.routePerformance')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">{t('dashboard.agent.performance.route')}</th>
                    <th className="text-right p-2">{t('dashboard.agent.performance.offers')}</th>
                    <th className="text-right p-2">{t('dashboard.agent.performance.accepted')}</th>
                    <th className="text-right p-2">{t('dashboard.agent.performance.successRate')}</th>
                    <th className="text-right p-2">{t('dashboard.agent.performance.averagePrice')}</th>
                  </tr>
                </thead>
                <tbody>
                  {routes.map((route, index) => (
                    <tr key={index} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium">{route.route}</td>
                      <td className="text-right p-2">{route.totalOffers}</td>
                      <td className="text-right p-2">
                        <span className="text-green-600 font-medium">
                          {route.acceptedOffers}
                        </span>
                      </td>
                      <td className="text-right p-2">
                        <Badge 
                          variant={route.successRate >= 50 ? "default" : "outline"}
                          className="text-xs"
                        >
                          {route.successRate ? route.successRate.toFixed(1) : '0.0'}%
                        </Badge>
                      </td>
                      <td className="text-right p-2 font-medium">
                        {formatCurrency(route.avgPrice)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Análisis de Competencia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            {t('dashboard.agent.performance.competitionAnalysis')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {competition.avgCompetition}
              </div>
              <p className="text-sm text-muted-foreground">
                {t('dashboard.agent.performance.averageCompetition')}
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {competition.minCompetition}
              </div>
              <p className="text-sm text-muted-foreground">
                {t('dashboard.agent.performance.minCompetition')}
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {competition.maxCompetition}
              </div>
              <p className="text-sm text-muted-foreground">
                {t('dashboard.agent.performance.maxCompetition')}
              </p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">
                {competition.shipmentsParticipated}
              </div>
              <p className="text-sm text-muted-foreground">
                {t('dashboard.agent.performance.shipmentsParticipated')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Resumen de Performance */}
      <Card>
        <CardHeader>
          <CardTitle>{t('dashboard.agent.performance.performanceSummary')}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="mb-2">
                {getPerformanceBadge(metrics.summary.performanceLevel, basic.conversionRate)}
              </div>
              <p className="text-sm font-medium">{t('dashboard.agent.performance.conversionLevel')}</p>
              <p className="text-xs text-muted-foreground">
                {metrics.summary.performanceLevel === 'excellent' ? t('dashboard.agent.performance.excellent') :
                 metrics.summary.performanceLevel === 'good' ? t('dashboard.agent.performance.good') :
                 metrics.summary.performanceLevel === 'average' ? t('dashboard.agent.performance.average') :
                 t('dashboard.agent.performance.needsImprovement')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="mb-2">
                {getPerformanceBadge(metrics.summary.responseLevel, basic.responseRate)}
              </div>
              <p className="text-sm font-medium">{t('dashboard.agent.performance.responseLevel')}</p>
              <p className="text-xs text-muted-foreground">
                {t('dashboard.agent.performance.averageTime')}: {basic.avgResponseTimeHours ? basic.avgResponseTimeHours.toFixed(1) : '0.0'} {t('dashboard.agent.performance.hours')}
              </p>
            </div>
            
            <div className="text-center">
              <div className="mb-2">
                <Badge variant={metrics.summary.revenueLevel === 'high' ? 'default' : 'outline'}>
                  {metrics.summary.revenueLevel === 'high' ? t('dashboard.agent.performance.high') :
                   metrics.summary.revenueLevel === 'medium' ? t('dashboard.agent.performance.medium') :
                   metrics.summary.revenueLevel === 'low' ? t('dashboard.agent.performance.low') : t('dashboard.agent.performance.veryLow')}
                </Badge>
              </div>
              <p className="text-sm font-medium">{t('dashboard.agent.performance.revenueLevel')}</p>
              <p className="text-xs text-muted-foreground">
                {t('dashboard.agent.performance.lastDays')} {metrics.period.days} {t('dashboard.agent.performance.days')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 