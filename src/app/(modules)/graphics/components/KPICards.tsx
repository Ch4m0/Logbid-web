'use client'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { TrendingUp, Users, Package, DollarSign, Clock, Target, Activity, AlertCircle } from 'lucide-react'

interface ProcessedData {
  totalShipments: number
  totalOffers: number
  averagePrice: number
  conversionRate: number
  data: any[]
}

interface KPICardsProps {
  data: ProcessedData | null
}

export function KPICards({ data }: KPICardsProps) {
  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cargando...</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded animate-pulse"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  const kpis = [
    {
      title: 'Total Shipments',
      value: data.totalShipments.toLocaleString(),
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      description: 'Envíos activos',
      trend: '+12%'
    },
    {
      title: 'Total Ofertas',
      value: data.totalOffers.toLocaleString(),
      icon: Users,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      description: 'Ofertas recibidas',
      trend: '+8%'
    },
    {
      title: 'Precio Promedio',
      value: `$${data.averagePrice.toLocaleString('en-US', { 
        minimumFractionDigits: 0, 
        maximumFractionDigits: 0 
      })}`,
      icon: DollarSign,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
      description: 'Por shipment',
      trend: '-3%'
    },
    {
      title: 'Tasa Conversión',
      value: `${data.conversionRate.toFixed(1)}%`,
      icon: Target,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      description: 'Shipments con ofertas',
      trend: '+5%'
    }
  ]

  // KPIs adicionales calculados
  const additionalKPIs = [
    {
      title: 'Ofertas por Shipment',
      value: data.totalShipments > 0 ? (data.totalOffers / data.totalShipments).toFixed(1) : '0',
      icon: TrendingUp,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-100',
      description: 'Promedio de competencia',
      trend: '+15%'
    },
    {
      title: 'Tiempo Respuesta',
      value: '2.4h',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      description: 'Promedio agentes',
      trend: '-12%'
    },
    {
      title: 'Shipments Activos',
      value: data.data.filter((item: any) => item.status === 'Active').length.toLocaleString(),
      icon: Activity,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-100',
      description: 'En proceso',
      trend: '+7%'
    },
    {
      title: 'Sin Ofertas',
      value: data.data.filter((item: any) => (item.offers_count || 0) === 0).length.toLocaleString(),
      icon: AlertCircle,
      color: 'text-red-600',
      bgColor: 'bg-red-100',
      description: 'Requieren atención',
      trend: '-18%'
    }
  ]

  const allKPIs = [...kpis, ...additionalKPIs]

  return (
    <div className="space-y-4">
      {/* KPIs Principales */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Métricas Principales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {kpis.map((kpi, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {kpi.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${kpi.bgColor}`}>
                  <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-muted-foreground">{kpi.description}</p>
                  <span className={`text-xs font-medium ${
                    kpi.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {kpi.trend}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* KPIs Secundarios */}
      <div>
        <h3 className="text-lg font-semibold mb-3">Métricas Operacionales</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {additionalKPIs.map((kpi, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {kpi.title}
                </CardTitle>
                <div className={`p-2 rounded-full ${kpi.bgColor}`}>
                  <kpi.icon className={`h-4 w-4 ${kpi.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{kpi.value}</div>
                <div className="flex items-center justify-between mt-2">
                  <p className="text-xs text-muted-foreground">{kpi.description}</p>
                  <span className={`text-xs font-medium ${
                    kpi.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {kpi.trend}
                  </span>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  )
} 