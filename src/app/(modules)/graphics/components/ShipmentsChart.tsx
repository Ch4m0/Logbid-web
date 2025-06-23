'use client'
import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp } from 'lucide-react'
import { format, subDays, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval } from 'date-fns'
import { es } from 'date-fns/locale'

interface ShipmentsChartProps {
  data: any[]
  dateRange: '7d' | '30d' | '3m' | '6m' | '1y'
}

export function ShipmentsChart({ data, dateRange }: ShipmentsChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []

    const now = new Date()
    let startDate: Date
    let dateFormat: string
    let intervals: Date[]

    // Configurar rangos de fecha
    switch (dateRange) {
      case '7d':
        startDate = subDays(now, 7)
        dateFormat = 'dd/MM'
        intervals = eachDayOfInterval({ start: startDate, end: now })
        break
      case '30d':
        startDate = subDays(now, 30)
        dateFormat = 'dd/MM'
        intervals = eachDayOfInterval({ start: startDate, end: now })
        break
      case '3m':
        startDate = subDays(now, 90)
        dateFormat = 'dd/MM'
        intervals = eachWeekOfInterval({ start: startDate, end: now })
        break
      case '6m':
        startDate = subDays(now, 180)
        dateFormat = 'MMM'
        intervals = eachWeekOfInterval({ start: startDate, end: now })
        break
      case '1y':
        startDate = subDays(now, 365)
        dateFormat = 'MMM'
        intervals = eachMonthOfInterval({ start: startDate, end: now })
        break
      default:
        startDate = subDays(now, 30)
        dateFormat = 'dd/MM'
        intervals = eachDayOfInterval({ start: startDate, end: now })
    }

    // Agrupar datos por intervalos
    const groupedData = intervals.map(intervalDate => {
      const intervalStart = intervalDate
      const intervalEnd = dateRange === '1y' || dateRange === '6m' || dateRange === '3m' 
        ? (dateRange === '1y' ? new Date(intervalDate.getFullYear(), intervalDate.getMonth() + 1, 0)
           : dateRange === '6m' || dateRange === '3m' ? subDays(intervalDate, -7) 
           : intervalDate)
        : intervalDate

      const shipmentsInInterval = data.filter(item => {
        const itemDate = new Date(item.inserted_at)
        return itemDate >= intervalStart && itemDate <= intervalEnd
      })

      const totalShipments = shipmentsInInterval.length
      const shipmentsWithOffers = shipmentsInInterval.filter(item => (item.offers_count || 0) > 0).length
      const totalOffers = shipmentsInInterval.reduce((sum, item) => sum + (item.offers_count || 0), 0)
      const avgPrice = shipmentsInInterval.length > 0 
        ? shipmentsInInterval.reduce((sum, item) => sum + (parseFloat(item.last_price) || 0), 0) / shipmentsInInterval.length 
        : 0

      return {
        date: format(intervalDate, dateFormat, { locale: es }),
        fullDate: intervalDate,
        totalShipments,
        shipmentsWithOffers,
        totalOffers,
        avgPrice: Math.round(avgPrice),
        conversionRate: totalShipments > 0 ? (shipmentsWithOffers / totalShipments) * 100 : 0
      }
    })

    return groupedData
  }, [data, dateRange])

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{`Fecha: ${label}`}</p>
          <div className="space-y-1">
            <p className="text-blue-600">
              <span className="font-medium">Shipments:</span> {payload[0].value}
            </p>
            <p className="text-green-600">
              <span className="font-medium">Con ofertas:</span> {payload[1].value}
            </p>
            <p className="text-purple-600">
              <span className="font-medium">Total ofertas:</span> {payload[2].value}
            </p>
            <p className="text-orange-600">
              <span className="font-medium">Precio promedio:</span> ${payload[3].value.toLocaleString()}
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
          <TrendingUp className="h-5 w-5" />
          Tendencia de Shipments
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Evolución de shipments y ofertas en el tiempo
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="date" 
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Línea principal: Total de shipments */}
              <Line 
                type="monotone" 
                dataKey="totalShipments" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                name="Total Shipments"
              />
              
              {/* Línea secundaria: Shipments con ofertas */}
              <Line 
                type="monotone" 
                dataKey="shipmentsWithOffers" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
                name="Con Ofertas"
              />
              
              {/* Línea de total de ofertas */}
              <Line 
                type="monotone" 
                dataKey="totalOffers" 
                stroke="#8B5CF6" 
                strokeWidth={2}
                dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 3 }}
                name="Total Ofertas"
              />
              
              {/* Línea de precio promedio */}
              <Line 
                type="monotone" 
                dataKey="avgPrice" 
                stroke="#F59E0B" 
                strokeWidth={2}
                dot={{ fill: '#F59E0B', strokeWidth: 2, r: 3 }}
                name="Precio Promedio"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        {/* Leyenda personalizada */}
        <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Total Shipments</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Con Ofertas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
            <span>Total Ofertas</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
            <span>Precio Promedio</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 