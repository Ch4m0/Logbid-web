'use client'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Target } from 'lucide-react'

interface AgentPerformanceChartProps {
  data: any[]
  dateRange: string
}

export function AgentPerformanceChart({ data, dateRange }: AgentPerformanceChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Target className="h-5 w-5" />
          Tu Performance
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Métricas de éxito como agente
        </p>
      </CardHeader>
      <CardContent>
        <div className="h-80 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-3xl font-bold text-green-600">68%</div>
              <div className="text-sm text-gray-600">Tasa de Éxito</div>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-3xl font-bold text-blue-600">24</div>
              <div className="text-sm text-gray-600">Ofertas Enviadas</div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <div className="text-3xl font-bold text-purple-600">$15.2K</div>
              <div className="text-sm text-gray-600">Revenue Este Mes</div>
            </div>
            <div className="text-center p-4 bg-orange-50 rounded-lg">
              <div className="text-3xl font-bold text-orange-600">1.2h</div>
              <div className="text-sm text-gray-600">Tiempo Respuesta</div>
            </div>
          </div>
          
          <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
            <p className="text-sm font-medium text-yellow-800">
              🏆 Ranking: #3 en tu mercado
            </p>
            <p className="text-xs text-yellow-700 mt-1">
              ¡Estás en el top 10% de agentes más exitosos!
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 