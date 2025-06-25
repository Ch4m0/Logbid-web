'use client'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Badge } from '@/src/components/ui/badge'
import { useGetSuccessRateMetrics, SuccessRateFilters } from '@/src/app/hooks/useGetSuccessRateMetrics'
import { 
  CheckCircle, 
  Users,
  Target,
  TrendingUp,
  Award,
  Activity,
  Clock,
  BarChart3
} from 'lucide-react'
import { useTranslation } from '@/src/hooks/useTranslation'
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Cell,
  Pie,
  ComposedChart,
  Line
} from 'recharts'

interface SuccessRateMetricsProps {
  filters: SuccessRateFilters
}

// Colores para los gráficos
const STAGE_COLORS = {
  'Completado': '#10b981',
  'Con Ofertas': '#3b82f6', 
  'Activo': '#f59e0b',
  'Expirado': '#ef4444'
}

const PERFORMANCE_COLORS = {
  'excellent': '#10b981',
  'good': '#3b82f6',
  'average': '#f59e0b',
  'needs_improvement': '#ef4444'
}

export function SuccessRateMetrics({ filters }: SuccessRateMetricsProps) {
  const { t } = useTranslation()
  const { data: metrics, isLoading, error } = useGetSuccessRateMetrics(filters)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getPerformanceColor = (level: string) => {
    return PERFORMANCE_COLORS[level as keyof typeof PERFORMANCE_COLORS] || '#94a3b8'
  }

  const getPerformanceBadge = (level: string) => {
    switch (level) {
      case 'excellent':
        return 'default'
      case 'good':
        return 'secondary'
      case 'average':
        return 'outline'
      case 'needs_improvement':
        return 'destructive'
      default:
        return 'outline'
    }
  }

  const getEngagementColor = (level: string) => {
    switch (level) {
      case 'high':
        return 'text-green-600'
      case 'medium':
        return 'text-blue-600'
      case 'low':
        return 'text-yellow-600'
      case 'very_low':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  // Formatear datos para el gráfico de estados de envío
  const formatStagesChartData = () => {
    if (!metrics?.shipmentStages) return []
    
    return metrics.shipmentStages.map(stage => ({
      name: t(`dashboard.customer.successRate.stages.${stage.stage}`),
      value: stage.count,
      percentage: stage.percentage,
      fill: STAGE_COLORS[stage.stage as keyof typeof STAGE_COLORS] || '#94a3b8'
    }))
  }

  // Formatear datos para el gráfico de tendencias
  const formatTrendsChartData = () => {
    if (!metrics?.offerTrends) return []
    
    return metrics.offerTrends.map(trend => ({
      week: trend.week,
      shipments: trend.shipments,
      offers: trend.offers,
      completed: trend.completed,
      avgOffers: trend.avgOffersPerShipment,
      successRate: trend.shipments > 0 ? ((trend.completed / trend.shipments) * 100).toFixed(1) : 0
    }))
  }

  // Formatear datos para la tabla de agentes
  const formatAgentsData = () => {
    if (!metrics?.agentPerformance) return []
    
    return metrics.agentPerformance.slice(0, 8).map((agent, index) => ({
      ...agent,
      displayName: agent.agentName.length > 25 ? agent.agentName.substring(0, 22) + '...' : agent.agentName,
      fullName: agent.agentName,
      activityStatus: agent.lastActivityDays <= 7 ? 'active' : agent.lastActivityDays <= 30 ? 'recent' : 'inactive',
      // Generar una key única para casos donde agentId es null
      uniqueKey: agent.agentId || `unknown-agent-${index}`
    }))
  }

  const stagesChartData = formatStagesChartData()
  const trendsChartData = formatTrendsChartData()
  const agentsData = formatAgentsData()

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            🎯 {t('dashboard.customer.successRate.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">{t('dashboard.customer.successRate.loading')}</span>
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
            <Target className="h-5 w-5" />
            🎯 {t('dashboard.customer.successRate.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8">
            <p className="text-red-500">{t('dashboard.customer.successRate.error')}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!metrics || !metrics.summary.hasData) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            🎯 {t('dashboard.customer.successRate.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8">
            <p className="text-gray-500">{t('dashboard.customer.successRate.noData')}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Tasa de Éxito */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.customer.successRate.successRate')}
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold`} style={{ color: getPerformanceColor(metrics.summary.performanceLevel) }}>
              {metrics.successRate.toFixed(1)}%
            </div>
            <div className="flex items-center mt-2">
              <Badge variant={getPerformanceBadge(metrics.summary.performanceLevel) as any}>
                {t(`dashboard.customer.successRate.performance.${metrics.summary.performanceLevel}`)}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.completedShipments} de {metrics.totalShipments} envíos
            </p>
          </CardContent>
        </Card>

        {/* Agentes Activos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.customer.successRate.activeAgents')}
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {metrics.activeAgents}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              últimos {metrics.period.days} días
            </p>
          </CardContent>
        </Card>

        {/* Promedio de Ofertas por Envío */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.customer.successRate.avgOffersPerShipment')}
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getEngagementColor(metrics.summary.agentEngagement)}`}>
              {metrics.avgOffersPerShipment.toFixed(1)}
            </div>
            <div className="flex items-center mt-2">
              <Badge variant="outline">
                {t(`dashboard.customer.successRate.engagement.${metrics.summary.agentEngagement}`)}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {metrics.totalOffers} ofertas totales
            </p>
          </CardContent>
        </Card>

        {/* Agente Más Activo */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.customer.successRate.topAgent')}
            </CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-sm font-bold text-purple-600 mb-2">
              {metrics.summary.topAgent}
            </div>
            <p className="text-xs text-muted-foreground">
              {t(`dashboard.customer.successRate.engagementDesc.${metrics.summary.agentEngagement}`)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Estados de Envíos */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {t('dashboard.customer.successRate.shipmentStages')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stagesChartData}
                    cx="50%"
                    cy="45%"
                    outerRadius={80}
                    dataKey="value"
                  >
                    {stagesChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value, name, props) => [
                      `${value} envíos (${props.payload.percentage}%)`,
                      name
                    ]}
                  />
                  <Legend 
                    verticalAlign="bottom"
                    height={36}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {stagesChartData.map((stage, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: stage.fill }}
                    />
                    <span>{stage.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{stage.value} envíos</div>
                    <div className="text-muted-foreground text-xs">
                      {stage.percentage.toFixed(1)}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Tendencias Semanales */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t('dashboard.customer.successRate.weeklyActivity')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart 
                  data={trendsChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip 
                    formatter={(value, name) => {
                      switch (name) {
                        case 'shipments':
                          return [value, t('dashboard.customer.successRate.shipments')]
                        case 'offers':
                          return [value, 'Ofertas']
                        case 'completed':
                          return [value, t('dashboard.customer.successRate.completions')]
                        case 'avgOffers':
                          return [`${value} por envío`, t('dashboard.customer.successRate.avgOffers')]
                        default:
                          return [value, name]
                      }
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="shipments" 
                    name="shipments"
                    fill="#3b82f6" 
                    opacity={0.7}
                  />
                  <Bar 
                    dataKey="offers" 
                    name="offers"
                    fill="#10b981"
                    opacity={0.7}
                  />
                  <Bar 
                    dataKey="completed" 
                    name="completed"
                    fill="#f59e0b"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="avgOffers" 
                    name="avgOffers"
                    stroke="#ef4444" 
                    strokeWidth={3}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Ranking de Agentes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            {t('dashboard.customer.successRate.agentRanking')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {agentsData.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b">
                    <th className="text-left p-2">#</th>
                    <th className="text-left p-2">{t('dashboard.customer.successRate.agentName')}</th>
                    <th className="text-right p-2">{t('dashboard.customer.successRate.totalOffersCount')}</th>
                    <th className="text-right p-2">{t('dashboard.customer.successRate.acceptedCount')}</th>
                    <th className="text-right p-2">{t('dashboard.customer.successRate.successRatePercent')}</th>
                    <th className="text-right p-2">{t('dashboard.customer.successRate.avgPrice')}</th>
                    <th className="text-center p-2">{t('dashboard.customer.successRate.activity')}</th>
                  </tr>
                </thead>
                <tbody>
                  {agentsData.map((agent, index) => (
                    <tr key={agent.uniqueKey} className="border-b hover:bg-gray-50">
                      <td className="p-2 font-medium text-gray-500">
                        {index + 1}
                      </td>
                      <td className="p-2">
                        <div className="font-medium" title={agent.fullName}>
                          {agent.displayName}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          ID: {agent.agentId ? agent.agentId.substring(0, 8) + '...' : 'No disponible'}
                        </div>
                      </td>
                      <td className="text-right p-2 font-medium">
                        {agent.totalOffers}
                      </td>
                      <td className="text-right p-2">
                        <span className="text-green-600 font-medium">
                          {agent.acceptedOffers}
                        </span>
                      </td>
                      <td className="text-right p-2">
                        <Badge 
                          variant={agent.successRate >= 50 ? "default" : "outline"}
                          className="text-xs"
                        >
                          {agent.successRate.toFixed(1)}%
                        </Badge>
                      </td>
                      <td className="text-right p-2 font-medium">
                        {agent.avgPrice > 0 ? formatCurrency(agent.avgPrice) : '-'}
                      </td>
                      <td className="text-center p-2">
                        <div className="flex items-center justify-center">
                          <div className={`w-2 h-2 rounded-full mr-2 ${
                            agent.activityStatus === 'active' ? 'bg-green-500' :
                            agent.activityStatus === 'recent' ? 'bg-yellow-500' : 'bg-red-500'
                          }`} />
                          <span className="text-xs text-muted-foreground">
                            {agent.lastActivityDays} {t('dashboard.customer.successRate.daysAgo')}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center p-8">
              <p className="text-gray-500">{t('dashboard.customer.successRate.noAgentsData')}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumen de Análisis */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5" />
              {t('dashboard.customer.successRate.successAnalysis')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t('dashboard.customer.successRate.performanceLevel')}</span>
                <Badge variant={getPerformanceBadge(metrics.summary.performanceLevel) as any}>
                  {t(`dashboard.customer.successRate.performance.${metrics.summary.performanceLevel}`)}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {t(`dashboard.customer.successRate.performanceDesc.${metrics.summary.performanceLevel}`)}
              </div>
              <div className="border-t pt-4">
                <div className="text-xs text-muted-foreground">
                  {t('dashboard.customer.successRate.period')}: {metrics.period.days} {t('dashboard.customer.successRate.days')}
                </div>
                <div className="text-xs text-muted-foreground">
                  {new Date(metrics.period.startDate).toLocaleDateString()} - {new Date(metrics.period.endDate).toLocaleDateString()}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              {t('dashboard.customer.successRate.agentActivity')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">{t('dashboard.customer.successRate.agentEngagement')}</span>
                <Badge variant="outline" className={getEngagementColor(metrics.summary.agentEngagement)}>
                  {t(`dashboard.customer.successRate.engagement.${metrics.summary.agentEngagement}`)}
                </Badge>
              </div>
              <div className="text-sm text-muted-foreground">
                {t(`dashboard.customer.successRate.engagementDesc.${metrics.summary.agentEngagement}`)}
              </div>
              <div className="border-t pt-4">
                <div className="text-xs text-muted-foreground">
                  {t('dashboard.customer.successRate.topAgent')}: {metrics.summary.topAgent}
                </div>
                <div className="text-xs text-muted-foreground">
                  {metrics.avgOffersPerShipment.toFixed(1)} ofertas promedio por envío
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 