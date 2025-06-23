'use client'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/src/components/ui/dialog'
import { Button } from '@/src/components/ui/button'
import { 
  Package, 
  DollarSign, 
  Users, 
  Target, 
  TrendingUp, 
  AlertTriangle,
  HelpCircle,
  Info
} from 'lucide-react'

interface AgentData {
  availableShipments?: number
  shipmentsWithoutOffers?: number
  potentialRevenue?: number
  totalOffers?: number
  averageCompetition?: number
  successRate?: number
}

interface AgentKPICardsProps {
  data: AgentData | null
}

const AgentHelpModal = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto">
          <HelpCircle className="h-4 w-4 mr-2" />
          Ayuda con Métricas
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Guía de Métricas para Agentes de Transporte
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Shipments Disponibles
            </h3>
            <p className="text-blue-700 text-sm mb-2">
              Número total de shipments activos en tu mercado que puedes ofertar.
            </p>
            <div className="text-blue-600 text-xs">
              <strong>Interpretación:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>📈 <strong>Más oportunidades:</strong> Mayor volumen indica mercado activo</li>
                <li>⏰ <strong>Tiempo limitado:</strong> Los shipments tienen fecha de cierre</li>
                <li>🎯 <strong>Selecciona bien:</strong> Enfócate en rutas que dominas</li>
              </ul>
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              Sin Ofertas (Oportunidades Perdidas)
            </h3>
            <p className="text-red-700 text-sm mb-2">
              Shipments disponibles que aún no han recibido ninguna oferta.
            </p>
            <div className="text-red-600 text-xs">
              <strong>¡Oportunidad de oro!</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>🏆 <strong>Sin competencia:</strong> Estos shipments no tienen ofertas</li>
                <li>⚡ <strong>Actúa rápido:</strong> Sé el primero en ofertar</li>
                <li>💰 <strong>Mejores márgenes:</strong> Puedes ofrecer precios más competitivos</li>
              </ul>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Ingresos Potenciales
            </h3>
            <p className="text-green-700 text-sm mb-2">
              Valor total estimado de todos los shipments disponibles si ganaras todos.
            </p>
            <div className="text-green-600 text-xs">
              <strong>Cálculo del mercado:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>📊 <strong>Tamaño del mercado:</strong> Muestra el volumen total disponible</li>
                <li>🎯 <strong>Meta realista:</strong> Apunta a ganar 10-20% del total</li>
                <li>📈 <strong>Planificación:</strong> Ayuda a proyectar ingresos mensuales</li>
              </ul>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Ofertas Enviadas
            </h3>
            <p className="text-purple-700 text-sm mb-2">
              Número total de ofertas que has enviado en el período seleccionado.
            </p>
            <div className="text-purple-600 text-xs">
              <strong>Actividad comercial:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>🚀 <strong>Más ofertas = más posibilidades:</strong> Pero enfócate en calidad</li>
                <li>⚖️ <strong>Balance ideal:</strong> 3-5 ofertas diarias bien targetadas</li>
                <li>📋 <strong>Tracking:</strong> Monitorea cuántas se convierten en negocio</li>
              </ul>
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
              <Users className="h-4 w-4" />
              Competencia Promedio
            </h3>
            <p className="text-orange-700 text-sm mb-2">
              Número promedio de agentes compitiendo por cada shipment.
            </p>
            <div className="text-orange-600 text-xs">
              <strong>Nivel de competencia:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>🟢 <strong>1-2 agentes:</strong> Poca competencia, buenas oportunidades</li>
                <li>🟡 <strong>3-4 agentes:</strong> Competencia moderada, precio importante</li>
                <li>🔴 <strong>5+ agentes:</strong> Alta competencia, diferénciate por servicio</li>
              </ul>
            </div>
          </div>

          <div className="bg-cyan-50 p-4 rounded-lg">
            <h3 className="font-semibold text-cyan-800 mb-2 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Tasa de Éxito
            </h3>
            <p className="text-cyan-700 text-sm mb-2">
              Porcentaje de ofertas enviadas que se convierten en negocios ganados.
            </p>
            <div className="text-cyan-600 text-xs">
              <strong>KPI de eficiencia:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>🏆 <strong>20%+ es excelente:</strong> Demuestras alta competitividad</li>
                <li>👍 <strong>10-20% es bueno:</strong> Estás en el promedio del mercado</li>
                <li>📈 <strong>{'<'}10% necesita mejora:</strong> Revisa precios y estrategia</li>
              </ul>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h3 className="font-semibold text-yellow-800 mb-2">💡 Estrategias para Maximizar Ingresos</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-yellow-700 mb-1">Para ganar más ofertas:</h4>
                <ul className="text-yellow-600 text-xs space-y-1">
                  <li>• Responde rápido (primeras 2 horas)</li>
                  <li>• Ofrece precios competitivos pero realistas</li>
                  <li>• Incluye servicios adicionales</li>
                  <li>• Enfócate en tus rutas fuertes</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-yellow-700 mb-1">Para aumentar la tasa de éxito:</h4>
                <ul className="text-yellow-600 text-xs space-y-1">
                  <li>• Analiza la competencia antes de ofertar</li>
                  <li>• Personaliza cada propuesta</li>
                  <li>• Destaca tu experiencia en la ruta</li>
                  <li>• Mantén comunicación post-oferta</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-2">📊 Benchmarks del Mercado</h3>
            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Agente Nuevo:</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Tasa de éxito: 5-10%</li>
                  <li>• Ofertas/día: 1-3</li>
                  <li>• Tiempo respuesta: 4-8h</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Agente Experimentado:</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Tasa de éxito: 15-25%</li>
                  <li>• Ofertas/día: 3-8</li>
                  <li>• Tiempo respuesta: 1-2h</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h3 className="font-semibold text-red-800 mb-2">⚠️ Señales de Alerta</h3>
            <ul className="text-red-700 text-sm space-y-1">
              <li>• <strong>Tasa de éxito {'<'} 5%:</strong> Precios no competitivos o mala estrategia</li>
              <li>• <strong>Pocas ofertas enviadas:</strong> No estás siendo proactivo</li>
              <li>• <strong>Alta competencia consistente:</strong> Considera diversificar rutas</li>
              <li>• <strong>Muchas oportunidades sin ofertas:</strong> Mercado poco explorado</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function AgentKPICards({ data }: AgentKPICardsProps) {
  if (!data) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Métricas del Agente</CardTitle>
            <AgentHelpModal />
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-center text-gray-500">Cargando métricas...</p>
        </CardContent>
      </Card>
    )
  }

  const successRate = data.successRate || 0
  const conversionOpportunities = data.shipmentsWithoutOffers || 0

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">🚛 Métricas del Agente de Transporte</h3>
        <AgentHelpModal />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {/* Available Shipments */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Package className="h-4 w-4 text-blue-600" />
              Shipments Disponibles
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {data.availableShipments || 0}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Oportunidades en tu mercado
            </p>
          </CardContent>
        </Card>

        {/* Shipments Without Offers */}
        <Card className="border-red-200 bg-red-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-red-600" />
              Sin Ofertas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {conversionOpportunities}
            </div>
            <p className="text-xs text-red-700 mt-1">
              ¡Oportunidades sin competencia!
            </p>
          </CardContent>
        </Card>

        {/* Potential Revenue */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-600" />
              Ingresos Potenciales
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              ${(data.potentialRevenue || 0).toLocaleString()}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Valor total del mercado
            </p>
          </CardContent>
        </Card>

        {/* Total Offers */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-purple-600" />
              Ofertas Enviadas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {data.totalOffers || 0}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Total en el período
            </p>
          </CardContent>
        </Card>

        {/* Average Competition */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-orange-600" />
              Competencia Promedio
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {(data.averageCompetition || 0).toFixed(1)}
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Agentes por shipment
            </p>
          </CardContent>
        </Card>

        {/* Success Rate */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <div className={`h-4 w-4 rounded-full ${
                successRate >= 20 ? 'bg-green-500' :
                successRate >= 10 ? 'bg-yellow-500' :
                'bg-red-500'
              }`} />
              Tasa de Éxito
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${
              successRate >= 20 ? 'text-green-600' :
              successRate >= 10 ? 'text-yellow-600' :
              'text-red-600'
            }`}>
              {successRate.toFixed(1)}%
            </div>
            <p className="text-xs text-gray-600 mt-1">
              Ofertas convertidas en negocio
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        {/* High Priority Actions */}
        {conversionOpportunities > 0 && (
          <Card className="border-red-200 bg-gradient-to-r from-red-50 to-orange-50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <div className="p-2 bg-red-100 rounded-full">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                </div>
                <div>
                  <h4 className="font-semibold text-red-900 mb-2">🚨 Acción Inmediata</h4>
                  <p className="text-sm text-red-800 mb-2">
                    Hay <strong>{conversionOpportunities} shipments sin ofertas</strong> - ¡oportunidad de oro!
                  </p>
                  <p className="text-xs text-red-700">
                    Sé el primero en ofertar para tener ventaja competitiva
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Performance Insights */}
        <Card className="bg-gradient-to-r from-blue-50 to-cyan-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-full">
                <Target className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h4 className="font-semibold text-blue-900 mb-2">📈 Tu Performance</h4>
                <p className="text-sm text-blue-800 mb-2">
                  {successRate >= 20 ? '¡Excelente tasa de éxito! Mantén el nivel.' :
                   successRate >= 10 ? 'Buena tasa de éxito, hay margen de mejora.' :
                   'Focalízate en mejorar la calidad de tus ofertas.'}
                </p>
                <p className="text-xs text-blue-700">
                  Competencia promedio: {(data.averageCompetition || 0).toFixed(1)} agentes por shipment
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 