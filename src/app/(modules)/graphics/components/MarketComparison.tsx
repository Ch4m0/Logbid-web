'use client'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Building } from 'lucide-react'

interface Market {
  id: number
  name: string
}

interface MarketComparisonProps {
  data: Array<{
    marketId: number
    marketName: string
    shipments: number
    offers: number
    avgPrice: number
    conversionRate: number
  }>
}

export function MarketComparison({ data }: MarketComparisonProps) {
  // Usar datos reales del dashboard
  const comparisonData = data.map(market => ({
    name: market.marketName,
    shipments: market.shipments,
    offers: market.offers,
    avgPrice: market.avgPrice,
    conversionRate: market.conversionRate
  }))

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">{label}</p>
          <div className="space-y-1">
            <p className="text-blue-600">
              <span className="font-medium">Shipments:</span> {payload[0].value}
            </p>
            <p className="text-green-600">
              <span className="font-medium">Ofertas:</span> {payload[1].value}
            </p>
            <p className="text-purple-600">
              <span className="font-medium">Tasa conversión:</span> {payload[2].value}%
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
          <Building className="h-5 w-5" />
          Comparación entre Mercados
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Performance comparativo de todos los mercados
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={comparisonData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="shipments" fill="#3B82F6" name="Shipments" />
              <Bar dataKey="offers" fill="#10B981" name="Ofertas" />
              <Bar dataKey="conversionRate" fill="#8B5CF6" name="Conversión %" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        {/* Tabla resumen */}
        <div className="mt-6">
          <h4 className="font-semibold mb-3">Resumen por Mercado</h4>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {comparisonData.map(market => (
              <div key={market.name} className="p-3 bg-gray-50 rounded-lg">
                <h5 className="font-medium">{market.name}</h5>
                <div className="text-sm space-y-1 mt-2">
                  <p>Shipments: <span className="font-medium">{market.shipments}</span></p>
                  <p>Ofertas: <span className="font-medium">{market.offers}</span></p>
                  <p>Precio prom: <span className="font-medium">${market.avgPrice.toLocaleString()}</span></p>
                  <p>Conversión: <span className="font-medium">{market.conversionRate}%</span></p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 