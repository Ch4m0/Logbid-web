'use client'
import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts'
import { Truck } from 'lucide-react'

interface TransportTypeChartProps {
  data: any[]
}

export function TransportTypeChart({ data }: TransportTypeChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []

    const transportTypes = data.reduce((acc, item) => {
      const type = item.shipping_type || 'Desconocido'
      acc[type] = (acc[type] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    return Object.entries(transportTypes).map(([type, count]) => ({
      name: type,
      value: count as number,
      percentage: (((count as number) / data.length) * 100).toFixed(1)
    }))
  }, [data])

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444']

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{data.name}</p>
          <p className="text-sm">
            <span className="font-medium">Cantidad:</span> {data.value}
          </p>
          <p className="text-sm">
            <span className="font-medium">Porcentaje:</span> {data.percentage}%
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="h-5 w-5" />
          Distribución por Tipo de Transporte
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Proporción de shipments por tipo de transporte
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percentage }) => `${name}: ${percentage}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        {/* Estadísticas adicionales */}
        <div className="mt-4 space-y-2">
          {chartData.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: COLORS[index % COLORS.length] }}
                ></div>
                <span>{item.name}</span>
              </div>
              <div className="flex gap-4">
                <span className="font-medium">{item.value} shipments</span>
                <span className="text-muted-foreground">{item.percentage}%</span>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
} 