'use client'
import React, { useMemo } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/src/components/ui/dialog'
import { Button } from '@/src/components/ui/button'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, HelpCircle, Info, Target, Users, Award, AlertTriangle } from 'lucide-react'
import { Badge } from '@/src/components/ui/badge'
import { useGetAgentCompetitivePerformance, CompetitiveFilters } from '../../../hooks/useGetAgentCompetitivePerformance'
import { useTranslation } from '@/src/hooks/useTranslation'
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  Cell,
  ComposedChart,
  Line,
  Area,
  Legend
} from 'recharts'
import { TrendingDown, Crown, Trophy, Timer } from 'lucide-react'
import { cn } from '@/src/lib/utils'

interface CompetitiveAnalysisChartProps {
  filters: CompetitiveFilters
  className?: string
}

const CompetitiveAnalysisHelpModal = () => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <HelpCircle className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            Guía de Análisis Competitivo
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              0 Ofertas - Oportunidades Perdidas
            </h3>
            <p className="text-red-700 text-sm mb-2">
              Shipments que no recibieron ninguna oferta de los agentes.
            </p>
            <div className="text-red-600 text-xs">
              <strong>Posibles causas:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>💰 <strong>Precio muy bajo:</strong> Los agentes no ven rentabilidad</li>
                <li>🚫 <strong>Ruta difícil:</strong> Destinos remotos o complicados</li>
                <li>📦 <strong>Carga problemática:</strong> Dimensiones, peso o tipo de mercancía</li>
                <li>⏰ <strong>Tiempos muy ajustados:</strong> Fechas de entrega poco realistas</li>
                <li>📋 <strong>Información incompleta:</strong> Faltan detalles importantes</li>
              </ul>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
              <Target className="h-4 w-4" />
              1 Oferta - Demanda Baja
            </h3>
            <p className="text-yellow-700 text-sm mb-2">
              Shipments con poca competencia entre agentes.
            </p>
            <div className="text-yellow-600 text-xs">
              <strong>Interpretación:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>🎯 <strong>Nicho específico:</strong> Pocos agentes especializados en esa ruta</li>
                <li>⚖️ <strong>Precio justo:</strong> Atractivo pero no excesivamente alto</li>
                <li>🤝 <strong>Relación directa:</strong> Posible socio estratégico a largo plazo</li>
                <li>⏰ <strong>Urgencia moderada:</strong> Tiempos razonables pero específicos</li>
              </ul>
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
              <Users className="h-4 w-4" />
              2-3 Ofertas - Competencia Saludable
            </h3>
            <p className="text-orange-700 text-sm mb-2">
              El nivel ideal de competencia para obtener buenos precios y calidad.
            </p>
            <div className="text-orange-600 text-xs">
              <strong>Ventajas:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>💰 <strong>Precios competitivos:</strong> Suficiente competencia para bajar costos</li>
                <li>⚡ <strong>Respuesta rápida:</strong> Agentes motivados a ofrecer</li>
                <li>🏆 <strong>Calidad garantizada:</strong> Solo agentes serios participan</li>
                <li>🤔 <strong>Opciones de elección:</strong> Puedes comparar propuestas</li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <Award className="h-4 w-4" />
              4-5 Ofertas - Alta Demanda
            </h3>
            <p className="text-blue-700 text-sm mb-2">
              Shipments muy atractivos que generan mucho interés.
            </p>
            <div className="text-blue-600 text-xs">
              <strong>Características:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>💎 <strong>Ruta popular:</strong> Muchos agentes cubren esa zona</li>
                <li>📈 <strong>Precio atractivo:</strong> Buena rentabilidad para agentes</li>
                <li>📦 <strong>Carga estándar:</strong> Fácil de manejar y transportar</li>
                <li>📅 <strong>Flexibilidad:</strong> Fechas y condiciones razonables</li>
              </ul>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              5+ Ofertas - Sobre-demanda
            </h3>
            <p className="text-purple-700 text-sm mb-2">
              Shipments excepcionalmente atractivos pero posibles problemas.
            </p>
            <div className="text-purple-600 text-xs">
              <strong>Dos escenarios posibles:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>🎯 <strong>Jackpot:</strong> Precio muy atractivo en ruta popular</li>
                <li>⚠️ <strong>Red flag:</strong> Precio sospechosamente alto, revisa la carga</li>
                <li>🕐 <strong>Tiempo limitado:</strong> Urgencia que genera premium</li>
                <li>🤝 <strong>Saturación:</strong> Demasiados agentes, calidad variable</li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-2">📊 Distribución Ideal por Competencia</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Distribución Saludable:</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• 5-10% con 0 ofertas</li>
                  <li>• 15-20% con 1 oferta</li>
                  <li>• <strong>40-50% con 2-3 ofertas</strong></li>
                  <li>• 20-25% con 4-5 ofertas</li>
                  <li>• 5-10% con 5+ ofertas</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Señales de Alerta:</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• {'>'} 20% sin ofertas: Pricing problemático</li>
                  <li>• {'>'} 30% con 1 oferta: Mercado poco activo</li>
                  <li>• {'<'} 30% con 2-3 ofertas: Falta competencia sana</li>
                  <li>• {'>'} 20% con 5+ ofertas: Precios inflados</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg border border-green-200">
            <h3 className="font-semibold text-green-800 mb-2">💡 Estrategias por Nivel de Competencia</h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-green-700 mb-1">Para Shipments sin Ofertas:</h4>
                <ul className="text-green-600 text-xs space-y-1">
                  <li>• Incrementa el precio en 10-15%</li>
                  <li>• Amplía las fechas de entrega</li>
                  <li>• Revisa y completa la información del envío</li>
                  <li>• Considera rutas alternativas o consolidación</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-green-700 mb-1">Para Competencia Baja (1 oferta):</h4>
                <ul className="text-green-600 text-xs space-y-1">
                  <li>• Evalúa rápidamente si la oferta es razonable</li>
                  <li>• Verifica la reputación del agente</li>
                  <li>• Negocia términos específicos</li>
                  <li>• Considera construir relación a largo plazo</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-green-700 mb-1">Para Competencia Alta (4+ ofertas):</h4>
                <ul className="text-green-600 text-xs space-y-1">
                  <li>• Compara no solo precio, sino experiencia</li>
                  <li>• Evalúa tiempos de entrega ofrecidos</li>
                  <li>• Revisa cobertura de seguro</li>
                  <li>• Considera track record en esa ruta específica</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h3 className="font-semibold text-yellow-800 mb-2">🎯 Optimización de Tus Shipments</h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-yellow-700 mb-1">Para Aumentar Competencia:</h4>
                <ul className="text-yellow-600 text-xs space-y-1">
                  <li>• Publica con al menos 3-5 días de anticipación</li>
                  <li>• Incluye fotos y descripción detallada de la carga</li>
                  <li>• Ofrece flexibilidad en fechas (+/-2 días)</li>
                  <li>• Considera precios ligeramente por encima del mercado</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-yellow-700 mb-1">Para Mejorar la Calidad de Ofertas:</h4>
                <ul className="text-yellow-600 text-xs space-y-1">
                  <li>• Especifica requisitos de experiencia o certificaciones</li>
                  <li>• Incluye criterios de evaluación en la publicación</li>
                  <li>• Pide referencias de envíos similares</li>
                  <li>• Establece SLAs claros de comunicación</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h3 className="font-semibold text-red-800 mb-2">⚠️ Alertas del Mercado</h3>
            <ul className="text-red-700 text-sm space-y-1">
              <li>• <strong>Competencia consistentemente baja:</strong> Mercado poco desarrollado o precios fuera de rango</li>
              <li>• <strong>Demasiadas ofertas siempre:</strong> Posibles precios inflados o agentes poco selectivos</li>
              <li>• <strong>Patrones estacionales extremos:</strong> Considera planificación anticipada</li>
              <li>• <strong>Calidad variable:</strong> Implementa proceso de verificación de agentes</li>
            </ul>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">🏆 Mejores Prácticas</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• <strong>Sweet spot:</strong> Busca 2-4 ofertas como ideal</li>
              <li>• <strong>Diversificación:</strong> No dependas de un solo agente</li>
              <li>• <strong>Feedback:</strong> Califica agentes para mejorar el mercado</li>
              <li>• <strong>Análisis continuo:</strong> Revisa patrones mensualmente</li>
              <li>• <strong>Adaptabilidad:</strong> Ajusta estrategia según resultados</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export const CompetitiveAnalysisChart: React.FC<CompetitiveAnalysisChartProps> = ({
  filters,
  className
}) => {
  const { t } = useTranslation()
  const { data, isLoading, error } = useGetAgentCompetitivePerformance(filters)
  console.log(data, 'data')

  if (isLoading) {
    return (
      <div className={cn('space-y-4', className)}>
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-6 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-64 bg-gray-100 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error || !data?.summary.hasData) {
    return (
      <Card className={className}>
        <CardContent className="flex items-center justify-center h-64">
          <div className="text-center text-gray-500">
            <Target className="mx-auto h-12 w-12 mb-2 opacity-50" />
            <p className="text-lg font-medium">{t('dashboard.agent.competitive.noCompetitiveData')}</p>
            <p className="text-sm">{t('dashboard.agent.competitive.needMoreActivity')}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Formatear datos para gráficos
  const routeRankingData = data.routeRankings.map(route => ({
    route: route.route.replace(' → ', '\n'),
    agentWins: route.agentWins,
    marketWins: route.competitiveData.totalWins,
    agentPrice: route.agentAvgPrice,
    marketPrice: route.competitiveData.marketAvgPrice,
    successRate: route.agentSuccessRate,
    ranking: route.competitiveData.agentRankingByWins,
    competitors: route.competitiveData.totalAgents
  }))

  // Datos para radar chart de performance general
  const performanceRadarData = [
    {
      metric: t('dashboard.agent.competitive.conversion'),
      agentScore: data.marketPosition.percentiles.conversionPercentile,
      fullMark: 100
    },
    {
      metric: t('dashboard.agent.competitive.responseSpeed'),
      agentScore: data.responseTimeComparison.comparison.responsePercentile,
      fullMark: 100
    },
    {
      metric: t('dashboard.agent.competitive.winsVolume'),
      agentScore: data.marketPosition.percentiles.winPercentile,
      fullMark: 100
    }
  ]

  // Datos para análisis de precios
  const pricingComparisonData = data.pricingAnalysis.map(analysis => ({
    transportType: analysis.transportType === 'air' ? t('dashboard.agent.competitive.air') : t('dashboard.agent.competitive.sea'),
    agentPrice: analysis.agentData.avgPrice,
    marketMin: analysis.marketData.minPrice,
    marketQ1: analysis.marketData.q1Price,
    marketMedian: analysis.marketData.medianPrice,
    marketQ3: analysis.marketData.q3Price,
    marketMax: analysis.marketData.maxPrice,
    marketAvg: analysis.marketData.avgPrice,
    percentile: analysis.comparison.pricePercentile,
    position: analysis.comparison.pricePosition
  }))

  // Colores para diferentes posiciones
  const getPositionColor = (position: string) => {
    switch (position) {
      case 'budget': return '#22c55e'
      case 'competitive': return '#3b82f6'
      case 'premium': return '#f59e0b'
      case 'luxury': return '#ef4444'
      default: return '#6b7280'
    }
  }

  const getStrengthColor = (strength: string) => {
    switch (strength) {
      case 'leader': return 'text-green-600 bg-green-50 border-green-200'
      case 'strong': return 'text-blue-600 bg-blue-50 border-blue-200'
      case 'competitive': return 'text-yellow-600 bg-yellow-50 border-yellow-200'
      case 'emerging': return 'text-gray-600 bg-gray-50 border-gray-200'
      default: return 'text-gray-600 bg-gray-50 border-gray-200'
    }
  }

  const getStrengthIcon = (strength: string) => {
    switch (strength) {
      case 'leader': return Crown
      case 'strong': return Trophy
      case 'competitive': return Target
      default: return Timer
    }
  }

  const StrengthIcon = getStrengthIcon(data.summary.competitiveStrength)

  return (
    <div className={cn('space-y-6', className)}>
      {/* Header con resumen competitivo */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <StrengthIcon className="h-5 w-5" />
                {t('dashboard.agent.competitive.title')}
              </CardTitle>
              <CardDescription>
                {t('dashboard.agent.competitive.yourPosition')} {data.marketPosition.totalActiveAgents} {t('dashboard.agent.competitive.activeAgents')}
              </CardDescription>
            </div>
            <Badge className={cn('px-3 py-1', getStrengthColor(data.summary.competitiveStrength))}>
              {data.summary.competitiveStrength === 'leader' && t('dashboard.agent.competitive.marketLeader')}
              {data.summary.competitiveStrength === 'strong' && t('dashboard.agent.competitive.strongPosition')}
              {data.summary.competitiveStrength === 'competitive' && t('dashboard.agent.competitive.competitive')}
              {data.summary.competitiveStrength === 'emerging' && t('dashboard.agent.competitive.emerging')}
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Grid de gráficos principales */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Performance General - Radar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('dashboard.agent.competitive.generalPerformance')}</CardTitle>
            <CardDescription>
              {t('dashboard.agent.competitive.yourPercentile')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={performanceRadarData}>
                <PolarGrid />
                <PolarAngleAxis 
                  dataKey="metric" 
                  tick={{ fontSize: 12 }}
                  className="text-xs"
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]} 
                  tick={{ fontSize: 10 }}
                />
                <Radar
                  name={t('dashboard.agent.competitive.yourPerformance')}
                  dataKey="agentScore"
                  stroke="#3b82f6"
                  fill="#3b82f6"
                  fillOpacity={0.2}
                  strokeWidth={2}
                />
                <Tooltip 
                  formatter={(value: number) => [`${value.toFixed(1)}%`, t('dashboard.agent.competitive.percentile')]}
                />
              </RadarChart>
            </ResponsiveContainer>
            <div className="mt-4 grid grid-cols-3 gap-2 text-center">
              <div className="text-xs">
                <div className="font-semibold">#{data.marketPosition.agentRankings.conversionRank}</div>
                <div className="text-gray-500">{t('dashboard.agent.competitive.conversion')}</div>
              </div>
              <div className="text-xs">
                <div className="font-semibold">#{data.marketPosition.agentRankings.responseRank}</div>
                <div className="text-gray-500">{t('dashboard.agent.competitive.speed')}</div>
              </div>
              <div className="text-xs">
                <div className="font-semibold">#{data.marketPosition.agentRankings.winRank}</div>
                <div className="text-gray-500">{t('dashboard.agent.competitive.wins')}</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tiempo de Respuesta Comparativo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('dashboard.agent.competitive.responseTimeComparison')}</CardTitle>
            <CardDescription>
              {t('dashboard.agent.competitive.yourSpeedVsMarket')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Indicador visual de tiempo */}
              <div className="relative">
                <div className="flex justify-between text-xs text-gray-500 mb-2">
                  <span>{t('dashboard.agent.competitive.faster')}</span>
                  <span>{t('dashboard.agent.competitive.slower')}</span>
                </div>
                <div className="w-full h-8 bg-gradient-to-r from-green-100 via-yellow-100 to-red-100 rounded-lg relative">
                  {/* Posición del agente */}
                  <div 
                    className="absolute top-1 h-6 w-3 bg-blue-600 rounded-sm flex items-center justify-center transform -translate-x-1/2"
                    style={{ 
                      left: `${Math.min(100, Math.max(0, 100 - data.responseTimeComparison.comparison.responsePercentile))}%` 
                    }}
                  >
                    <div className="w-1 h-1 bg-white rounded-full"></div>
                  </div>
                </div>
                <div className="flex justify-between text-xs mt-2">
                  <span>{data.responseTimeComparison.marketStats.q1ResponseHours.toFixed(1)}h</span>
                  <span>{data.responseTimeComparison.marketStats.medianResponseHours.toFixed(1)}h</span>
                  <span>{data.responseTimeComparison.marketStats.q3ResponseHours.toFixed(1)}h</span>
                </div>
              </div>

              {/* Stats detalladas */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {data.responseTimeComparison.agentStats.avgResponseHours.toFixed(1)}h
                  </div>
                  <div className="text-xs text-gray-600">{t('dashboard.agent.competitive.yourAverage')}</div>
                </div>
                <div className="text-center p-3 bg-gray-50 rounded-lg">
                  <div className="text-2xl font-bold text-gray-600">
                    {data.responseTimeComparison.marketStats.avgResponseHours.toFixed(1)}h
                  </div>
                  <div className="text-xs text-gray-600">{t('dashboard.agent.competitive.marketAverage')}</div>
                </div>
              </div>

              {/* Badge de performance */}
              <div className="text-center">
                <Badge 
                  className={cn(
                    'px-3 py-1',
                    data.responseTimeComparison.comparison.responseLevel === 'excellent' 
                      ? 'bg-green-100 text-green-800 border-green-200'
                      : data.responseTimeComparison.comparison.responseLevel === 'good'
                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                      : data.responseTimeComparison.comparison.responseLevel === 'average'
                      ? 'bg-yellow-100 text-yellow-800 border-yellow-200'
                      : 'bg-red-100 text-red-800 border-red-200'
                  )}
                >
                  {data.responseTimeComparison.comparison.vsMarketAvg > 0 ? (
                    <TrendingDown className="w-3 h-3 mr-1" />
                  ) : (
                    <TrendingUp className="w-3 h-3 mr-1" />
                  )}
                  {Math.abs(data.responseTimeComparison.comparison.vsMarketAvg).toFixed(1)}% {t('dashboard.agent.competitive.vsMarket')}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Análisis de Precios por Tipo de Transporte */}
      {pricingComparisonData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('dashboard.agent.competitive.pricingAnalysis')}</CardTitle>
            <CardDescription>
              {t('dashboard.agent.competitive.pricingPosition')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={350}>
              <ComposedChart data={pricingComparisonData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="transportType" />
                <YAxis yAxisId="price" label={{ value: 'Precio ($)', angle: -90, position: 'insideLeft' }} />
                <YAxis yAxisId="percentile" orientation="right" label={{ value: 'Percentil (%)', angle: 90, position: 'insideRight' }} />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-white p-3 border rounded-lg shadow-lg">
                          <p className="font-semibold">{label}</p>
                          <p className="text-blue-600">{t('dashboard.agent.competitive.yourPrice')}: ${data.agentPrice.toLocaleString()}</p>
                          <p className="text-gray-600">{t('dashboard.agent.competitive.market')}: ${data.marketAvg.toLocaleString()}</p>
                          <p className="text-gray-500">{t('dashboard.agent.competitive.range')}: ${data.marketMin.toLocaleString()} - ${data.marketMax.toLocaleString()}</p>
                          <p className="text-sm">{t('dashboard.agent.competitive.percentile')}: {data.percentile.toFixed(1)}% ({data.position})</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Legend />
                
                {/* Rango del mercado (min-max) */}
                <Bar yAxisId="price" dataKey="marketMin" stackId="market" fill="#f3f4f6" name={t('dashboard.agent.competitive.marketRange')} />
                <Bar yAxisId="price" dataKey="marketMax" stackId="market" fill="transparent" />
                
                {/* Cuartiles del mercado */}
                <Bar yAxisId="price" dataKey="marketQ1" fill="#e5e7eb" name="Q1-Q3" />
                <Bar yAxisId="price" dataKey="marketQ3" fill="#e5e7eb" />
                
                {/* Mediana del mercado */}
                <Line yAxisId="price" type="monotone" dataKey="marketMedian" stroke="#6b7280" strokeWidth={2} name={t('dashboard.agent.competitive.marketMedian')} />
                
                {/* Precio del agente */}
                <Scatter yAxisId="price" dataKey="agentPrice" fill="#3b82f6" name="Tu Precio">
                  {pricingComparisonData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={getPositionColor(entry.position)} />
                  ))}
                </Scatter>
              </ComposedChart>
            </ResponsiveContainer>
            
            {/* Leyenda de posiciones */}
            <div className="mt-4 flex flex-wrap gap-2 justify-center">
              <Badge className="bg-green-100 text-green-800 border-green-200">{t('dashboard.agent.competitive.budget')}</Badge>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200">{t('dashboard.agent.competitive.competitive')}</Badge>
              <Badge className="bg-yellow-100 text-yellow-800 border-yellow-200">{t('dashboard.agent.competitive.premium')}</Badge>
              <Badge className="bg-red-100 text-red-800 border-red-200">{t('dashboard.agent.competitive.luxury')}</Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Ranking por Rutas Principales */}
      {routeRankingData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('dashboard.agent.competitive.routeRanking')}</CardTitle>
            <CardDescription>
              {t('dashboard.agent.competitive.routeRankingDesc')} {routeRankingData.length} {t('dashboard.agent.competitive.routesWhereCompete')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={routeRankingData} layout="horizontal" margin={{ top: 5, right: 30, left: 100, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis 
                  dataKey="route" 
                  type="category" 
                  width={100}
                  tick={{ fontSize: 11 }}
                />
                <Tooltip 
                  content={({ active, payload, label }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload
                      return (
                        <div className="bg-white p-3 border rounded-lg shadow-lg">
                          <p className="font-semibold">{label.replace('\n', ' → ')}</p>
                          <p className="text-blue-600">{t('dashboard.agent.competitive.yourWins')}: {data.agentWins}</p>
                          <p className="text-gray-600">{t('dashboard.agent.competitive.totalMarket')}: {data.marketWins}</p>
                          <p className="text-green-600">{t('dashboard.agent.performance.successRate')}: {data.successRate.toFixed(1)}%</p>
                          <p className="text-gray-500">{t('dashboard.agent.competitive.competitors')}: {data.competitors}</p>
                          <p className="text-gray-500">{t('dashboard.agent.competitive.ranking')}: #{data.ranking}</p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
                <Legend />
                <Bar dataKey="agentWins" fill="#3b82f6" name={t('dashboard.agent.competitive.yourWins')} />
                <Bar dataKey="marketWins" fill="#e5e7eb" name={t('dashboard.agent.competitive.totalMarket')} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Insights y Recomendaciones */}
      {(data.competitiveInsights.recommendations.length > 0 || data.competitiveInsights.summary.improvementAreas.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">{t('dashboard.agent.competitive.competitiveInsights')}</CardTitle>
            <CardDescription>
              {t('dashboard.agent.competitive.automaticAnalysis')}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Ventaja competitiva */}
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <h4 className="font-semibold text-green-800 mb-2">💪 {t('dashboard.agent.competitive.yourStrength')}</h4>
                <p className="text-green-700 text-sm">
                  {data.competitiveInsights.summary.competitiveAdvantage === 'response_time' && t('dashboard.agent.competitive.responseTimeExcellent')}
                  {data.competitiveInsights.summary.competitiveAdvantage === 'conversion_rate' && t('dashboard.agent.competitive.highConversionRate')}
                  {data.competitiveInsights.summary.competitiveAdvantage === 'market_presence' && t('dashboard.agent.competitive.strongMarketPresence')}
                  {data.competitiveInsights.summary.competitiveAdvantage === 'growth_opportunity' && t('dashboard.agent.competitive.growthOpportunity')}
                </p>
              </div>

              {/* Áreas de mejora */}
              {data.competitiveInsights.summary.improvementAreas.filter(area => area).length > 0 && (
                <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <h4 className="font-semibold text-yellow-800 mb-2">🎯 {t('dashboard.agent.competitive.opportunityAreas')}</h4>
                  <ul className="text-yellow-700 text-sm space-y-1">
                    {data.competitiveInsights.summary.improvementAreas
                      .filter(area => area)
                      .map((area, index) => (
                        <li key={index}>
                          • {area === 'response_time' && t('dashboard.agent.competitive.improveResponseTime')}
                          {area === 'conversion_rate' && t('dashboard.agent.competitive.increaseConversionRate')}
                          {area === 'pricing_strategy' && t('dashboard.agent.competitive.optimizePricingStrategy')}
                        </li>
                      ))}
                  </ul>
                </div>
              )}

              {/* Recomendaciones específicas */}
              {data.competitiveInsights.recommendations.filter(rec => rec).length > 0 && (
                <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-semibold text-blue-800 mb-2">🚀 {t('dashboard.agent.competitive.recommendations')}</h4>
                  <ul className="text-blue-700 text-sm space-y-1">
                    {data.competitiveInsights.recommendations
                      .filter(rec => rec)
                      .map((recommendation, index) => (
                        <li key={index}>• {recommendation}</li>
                      ))}
                  </ul>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
} 