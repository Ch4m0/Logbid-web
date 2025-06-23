'use client'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { DollarSign } from 'lucide-react'

interface RevenueChartProps {
  data: any[]
}

export function RevenueChart({ data }: RevenueChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <DollarSign className="h-5 w-5" />
          Revenue Potencial
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Oportunidades de ingresos disponibles
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80 flex items-center justify-center">
          <div className="text-center space-y-4">
            <div className="text-6xl font-bold text-green-600">$82.5K</div>
            <div className="text-lg text-gray-600">Revenue potencial total</div>
            <div className="text-sm text-blue-600">En {data?.length || 0} shipments disponibles</div>
            
            <div className="mt-6 p-4 bg-green-50 rounded-lg">
              <p className="text-sm font-medium text-green-800">
                💰 Si ganas el 20% de las ofertas: ~$16.5K
              </p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 