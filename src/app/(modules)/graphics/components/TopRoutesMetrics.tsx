'use client'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Badge } from '@/src/components/ui/badge'
import { useGetTopRoutesMetrics, TopRoutesFilters } from '@/src/app/hooks/useGetTopRoutesMetrics'
import { 
  MapPin, 
  TrendingUp,
  Route,
  DollarSign,
  BarChart3,
  PieChart,
  Globe
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
  PieChart as RechartsPieChart,
  Cell,
  Pie
} from 'recharts'

interface TopRoutesMetricsProps {
  filters: TopRoutesFilters
}

// Colores para los gráficos
const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
const TRANSPORT_COLORS = {
  'Marítimo': '#3b82f6',
  'Aéreo': '#10b981', 
  'Terrestre': '#f59e0b',
  'Almacén': '#ef4444'
}

export function TopRoutesMetrics({ filters }: TopRoutesMetricsProps) {
  const { t } = useTranslation()
  const { data: metrics, isLoading, error } = useGetTopRoutesMetrics(filters)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const getConcentrationColor = (concentration: string) => {
    switch (concentration) {
      case 'high':
        return 'text-red-600'
      case 'medium':
        return 'text-yellow-600'
      case 'diversified':
        return 'text-green-600'
      default:
        return 'text-gray-600'
    }
  }

  const getConcentrationBadge = (concentration: string) => {
    switch (concentration) {
      case 'high':
        return 'destructive'
      case 'medium':
        return 'secondary'
      case 'diversified':
        return 'default'
      default:
        return 'outline'
    }
  }

  // Formatear datos para el gráfico de barras de rutas
  const formatRoutesChartData = () => {
    if (!metrics?.topRoutes) return []
    
    return metrics.topRoutes.map((route, index) => ({
      route: route.route.length > 25 ? route.route.substring(0, 22) + '...' : route.route,
      fullRoute: route.route,
      shipments: route.shipments_count,
      avgCost: route.avg_cost,
      percentage: route.percentage,
      color: COLORS[index % COLORS.length]
    }))
  }

  // Formatear datos para el gráfico de costos
  const formatCostChartData = () => {
    if (!metrics?.routeCosts) return []
    
    return metrics.routeCosts.map(route => ({
      route: route.route.length > 15 ? route.route.substring(0, 12) + '...' : route.route,
      fullRoute: route.route,
      avgCost: Number(route.avgCost.toFixed(0)),
      minCost: Number(route.minCost.toFixed(0)),
      maxCost: Number(route.maxCost.toFixed(0)),
      shipments: route.shipments
    }))
  }

  // Formatear datos para el gráfico circular de transporte
  const formatTransportChartData = () => {
    if (!metrics?.transportDistribution) return []
    
    return metrics.transportDistribution.map(transport => ({
      name: transport.transport_type,
      value: transport.count,
      percentage: transport.percentage,
      avgCost: transport.avg_cost,
      fill: TRANSPORT_COLORS[transport.transport_type as keyof typeof TRANSPORT_COLORS] || '#94a3b8'
    }))
  }

  const routesChartData = formatRoutesChartData()
  const costChartData = formatCostChartData()
  const transportChartData = formatTransportChartData()

  if (isLoading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            🗺️ {t('dashboard.importer.topRoutes.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            <span className="ml-2">{t('dashboard.importer.topRoutes.loading')}</span>
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
            <Route className="h-5 w-5" />
            🗺️ {t('dashboard.importer.topRoutes.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8">
            <p className="text-red-500">{t('dashboard.importer.topRoutes.error')}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!metrics || !metrics.summary.hasRouteData) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            🗺️ {t('dashboard.importer.topRoutes.title')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center p-8">
            <p className="text-gray-500">{t('dashboard.importer.topRoutes.noRoutesData')}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Métricas Principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Total de Rutas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.importer.topRoutes.totalRoutes')}
            </CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {metrics.totalRoutes}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {t('dashboard.importer.topRoutes.last90Days')}
            </p>
          </CardContent>
        </Card>

        {/* Total de Envíos */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.importer.topRoutes.totalShipments')}
            </CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {metrics.totalShipments}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              en {metrics.totalRoutes} rutas
            </p>
          </CardContent>
        </Card>

        {/* Costo Promedio por Ruta */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.importer.topRoutes.avgCostPerRoute')}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {formatCurrency(metrics.avgCostPerRoute)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              promedio general
            </p>
          </CardContent>
        </Card>

        {/* Concentración de Rutas */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.importer.topRoutes.routeConcentration')}
            </CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getConcentrationColor(metrics.summary.routeConcentration)}`}>
              {t(`dashboard.importer.topRoutes.concentration.${metrics.summary.routeConcentration}`)}
            </div>
            <div className="flex items-center mt-2">
              <Badge variant={getConcentrationBadge(metrics.summary.routeConcentration) as any}>
                {t(`dashboard.importer.topRoutes.concentrationDesc.${metrics.summary.routeConcentration}`)}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos Principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gráfico de Top 5 Rutas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {t('dashboard.importer.topRoutes.topRoutesChart')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={routesChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="route" 
                    fontSize={10}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis fontSize={12} />
                  <Tooltip 
                    labelFormatter={(label, payload) => {
                      const data = payload?.[0]?.payload
                      return data?.fullRoute || label
                    }}
                    formatter={(value, name) => {
                      switch (name) {
                        case 'shipments':
                          return [value, t('dashboard.importer.topRoutes.shipments')]
                        default:
                          return [value, name]
                      }
                    }}
                  />
                  <Bar 
                    dataKey="shipments" 
                    name="shipments"
                    radius={[4, 4, 0, 0]}
                  >
                    {routesChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              <p>• Número de envíos por ruta en los últimos 90 días</p>
            </div>
          </CardContent>
        </Card>

        {/* Gráfico de Distribución por Transporte */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <PieChart className="h-5 w-5" />
              {t('dashboard.importer.topRoutes.transportDistribution')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={transportChartData}
                    cx="50%"
                    cy="45%"
                    outerRadius={80}
                    dataKey="value"
                  >
                    {transportChartData.map((entry, index) => (
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
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {transportChartData.map((transport, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <div 
                      className="w-3 h-3 rounded-full" 
                      style={{ backgroundColor: transport.fill }}
                    />
                    <span>{transport.name}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-medium">{transport.value} envíos</div>
                    <div className="text-muted-foreground text-xs">
                      {formatCurrency(transport.avgCost)} promedio
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráfico de Comparación de Costos */}
      {costChartData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              {t('dashboard.importer.topRoutes.costComparison')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart 
                  data={costChartData}
                  margin={{ top: 20, right: 30, left: 20, bottom: 60 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="route" 
                    fontSize={10}
                    angle={-45}
                    textAnchor="end"
                    height={80}
                  />
                  <YAxis 
                    fontSize={12}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip 
                    labelFormatter={(label, payload) => {
                      const data = payload?.[0]?.payload
                      return data?.fullRoute || label
                    }}
                    formatter={(value, name) => {
                      switch (name) {
                        case 'avgCost':
                          return [formatCurrency(Number(value)), t('dashboard.importer.topRoutes.avgCost')]
                        case 'minCost':
                          return [formatCurrency(Number(value)), t('dashboard.importer.topRoutes.minCost')]
                        case 'maxCost':
                          return [formatCurrency(Number(value)), t('dashboard.importer.topRoutes.maxCost')]
                        default:
                          return [value, name]
                      }
                    }}
                  />
                  <Legend />
                  <Bar 
                    dataKey="minCost" 
                    name="minCost"
                    fill="#10b981" 
                    opacity={0.7}
                  />
                  <Bar 
                    dataKey="avgCost" 
                    name="avgCost"
                    fill="#3b82f6"
                  />
                  <Bar 
                    dataKey="maxCost" 
                    name="maxCost"
                    fill="#ef4444" 
                    opacity={0.7}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              <p>• <span className="text-green-600">■</span> {t('dashboard.importer.topRoutes.minCost')}</p>
              <p>• <span className="text-blue-600">■</span> {t('dashboard.importer.topRoutes.avgCost')}</p>
              <p>• <span className="text-red-600">■</span> {t('dashboard.importer.topRoutes.maxCost')}</p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabla de Detalles de Rutas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Route className="h-5 w-5" />
            Detalle de Rutas Principales
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">{t('dashboard.importer.topRoutes.route')}</th>
                  <th className="text-right p-2">Envíos</th>
                  <th className="text-right p-2">%</th>
                  <th className="text-right p-2">{t('dashboard.importer.topRoutes.avgCost')}</th>
                  <th className="text-right p-2">Rango</th>
                  <th className="text-right p-2">Ofertas</th>
                </tr>
              </thead>
              <tbody>
                {metrics.topRoutes.map((route, index) => (
                  <tr key={index} className="border-b hover:bg-gray-50">
                    <td className="p-2 font-medium">{route.route}</td>
                    <td className="text-right p-2">{route.shipments_count}</td>
                    <td className="text-right p-2">
                      <Badge variant="outline">{route.percentage.toFixed(1)}%</Badge>
                    </td>
                    <td className="text-right p-2 font-medium">
                      {route.avg_cost > 0 ? formatCurrency(route.avg_cost) : '-'}
                    </td>
                    <td className="text-right p-2 text-xs text-muted-foreground">
                      {route.min_cost > 0 && route.max_cost > 0 
                        ? `${formatCurrency(route.min_cost)} - ${formatCurrency(route.max_cost)}`
                        : '-'
                      }
                    </td>
                    <td className="text-right p-2">{route.total_offers}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 