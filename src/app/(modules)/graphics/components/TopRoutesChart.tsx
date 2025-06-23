'use client'
import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { MapPin } from 'lucide-react'

interface TopRoutesChartProps {
  data: any[]
}

export function TopRoutesChart({ data }: TopRoutesChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []

    const routes = data.reduce((acc, item) => {
      const origin = item.origin_country || item.origin_name || 'Desconocido'
      const destination = item.destination_country || item.destination_name || 'Desconocido'
      const route = `${origin} → ${destination}`
      
      if (!acc[route]) {
        acc[route] = {
          route,
          count: 0,
          totalValue: 0,
          offers: 0
        }
      }
      
      acc[route].count += 1
      acc[route].totalValue += parseFloat(item.value) || 0
      acc[route].offers += item.offers_count || 0
      
      return acc
    }, {} as Record<string, any>)

    return Object.values(routes)
      .sort((a: any, b: any) => b.count - a.count)
      .slice(0, 10) // Top 10 rutas
      .map((route: any) => ({
        ...route,
        avgValue: route.count > 0 ? Math.round(route.totalValue / route.count) : 0,
        avgOffers: route.count > 0 ? Math.round(route.offers / route.count) : 0
      }))
  }, [data])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg max-w-xs">
          <p className="font-semibold text-sm">{label}</p>
          <div className="space-y-1 text-xs">
            <p>
              <span className="font-medium">Shipments:</span> {data.count}
            </p>
            <p>
              <span className="font-medium">Valor promedio:</span> ${data.avgValue.toLocaleString()}
            </p>
            <p>
              <span className="font-medium">Ofertas promedio:</span> {data.avgOffers}
            </p>
          </div>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="h-5 w-5" />
          Rutas Más Populares
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Top 10 rutas con mayor volumen de shipments
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="horizontal"
              margin={{ top: 5, right: 30, left: 100, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                type="number" 
                tick={{ fontSize: 10 }}
              />
              <YAxis 
                type="category" 
                dataKey="route"
                tick={{ fontSize: 8 }}
                width={90}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar 
                dataKey="count" 
                fill="#3B82F6" 
                name="Shipments"
                radius={[0, 4, 4, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Lista detallada */}
        <div className="mt-4 max-h-40 overflow-y-auto">
          <h4 className="font-semibold mb-2 text-sm">Detalle de Rutas</h4>
          <div className="space-y-2">
            {chartData.slice(0, 5).map((route: any, index) => (
              <div key={route.route} className="flex items-center justify-between text-xs bg-gray-50 p-2 rounded">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-600">#{index + 1}</span>
                  <span className="text-gray-800 max-w-[200px] truncate">{route.route}</span>
                </div>
                <div className="flex gap-3 text-gray-600">
                  <span>{route.count} shipments</span>
                  <span>${route.avgValue.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 