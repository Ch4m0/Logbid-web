'use client'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/src/components/ui/dialog'
import { Button } from '@/src/components/ui/button'
import { Clock, Zap, TrendingUp, Target, HelpCircle, Info } from 'lucide-react'

interface ResponseTimeMetrics {
  avgResponseTimeHours: number
  medianResponseTimeHours: number
  fastestResponseHours: number
  marketAvgResponseHours: number
  improvementPercentage: number
  totalResponses: number
  responsesUnder24h: number
  responsesUnder1h: number
}

interface ResponseTimeChartProps {
  responseTimeMetrics?: ResponseTimeMetrics
}

const HelpModal = () => {
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
            Guía de Métricas de Tiempo de Respuesta
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Tiempo Promedio de Respuesta
            </h3>
            <p className="text-blue-700 text-sm">
              El tiempo promedio que tardas en enviar tu primera oferta después de que se publica un shipment. 
              Un tiempo menor indica mayor competitividad y mejores posibilidades de ganar el negocio.
            </p>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
              <Zap className="h-4 w-4" />
              Tiempo Mediano
            </h3>
            <p className="text-purple-700 text-sm">
              La mitad de tus respuestas son más rápidas que este tiempo y la otra mitad más lentas. 
              Es una mejor representación de tu performance típico que el promedio, ya que no se ve afectado por respuestas extremadamente lentas.
            </p>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Respuesta Más Rápida
            </h3>
            <p className="text-green-700 text-sm">
              Tu record de respuesta más rápida. Demuestra tu capacidad máxima cuando estás atento a nuevas oportunidades. 
              Las respuestas ultra-rápidas (menos de 30 minutos) suelen tener muy altas tasas de éxito.
            </p>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Eficiencia (Respuestas {'<'} 1 hora)
            </h3>
            <p className="text-orange-700 text-sm">
              Porcentaje de tus ofertas enviadas en menos de 1 hora. Las respuestas rápidas tienen mayor probabilidad de ser consideradas. 
              <strong>Meta recomendada:</strong> 80% o más para maximizar oportunidades.
            </p>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold text-gray-800 mb-2">📊 Comparación con el Mercado</h3>
            <p className="text-gray-700 text-sm">
              Cómo te comparas con otros agentes en el mismo mercado. Un porcentaje positivo significa que eres más rápido que el promedio. 
              Ser consistentemente más rápido te da ventaja competitiva.
            </p>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h3 className="font-semibold text-yellow-800 mb-2">💡 Consejos para Mejorar</h3>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>• <strong>Configura notificaciones:</strong> Recibe alertas inmediatas de nuevos shipments</li>
              <li>• <strong>Prepara plantillas:</strong> Ten ofertas pre-calculadas para rutas frecuentes</li>
              <li>• <strong>Revisa regularmente:</strong> Dedica momentos específicos del día a revisar oportunidades</li>
              <li>• <strong>Automatiza cuando sea posible:</strong> Usa herramientas que te ayuden a responder más rápido</li>
              <li>• <strong>Meta recomendada:</strong> Responder en menos de 2 horas durante horas laborales</li>
            </ul>
          </div>

          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h3 className="font-semibold text-red-800 mb-2">⚠️ Factores que Afectan el Tiempo</h3>
            <ul className="text-red-700 text-sm space-y-1">
              <li>• <strong>Horario:</strong> Shipments publicados fuera de horas laborales tardan más en responderse</li>
              <li>• <strong>Complejidad:</strong> Rutas nuevas o cargas especiales requieren más análisis</li>
              <li>• <strong>Documentación:</strong> Shipments con información incompleta toman más tiempo</li>
              <li>• <strong>Capacidad:</strong> En períodos de alta demanda puede ser más difícil responder rápido</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function ResponseTimeChart({ responseTimeMetrics }: ResponseTimeChartProps) {
  if (!responseTimeMetrics || responseTimeMetrics.totalResponses === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Tiempo de Respuesta
            </div>
            <HelpModal />
          </CardTitle>
          <p className="text-sm text-muted-foreground">
            Análisis de rapidez en ofertas
          </p>
        </CardHeader>
        <CardContent>
          <div className="h-80 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="text-lg text-gray-600">No hay datos de tiempo de respuesta disponibles</div>
              <div className="text-sm text-muted-foreground">
                Se necesitan shipments con ofertas para calcular estos datos
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Formatear tiempo para mostrar
  const formatTime = (hours: number) => {
    if (hours < 1) {
      const minutes = Math.round(hours * 60)
      return `${minutes}min`
    } else if (hours < 24) {
      return `${hours.toFixed(1)}h`
    } else {
      const days = Math.floor(hours / 24)
      const remainingHours = Math.round(hours % 24)
      return `${days}d ${remainingHours}h`
    }
  }

  const efficiencyPercentage = (responseTimeMetrics.responsesUnder1h / responseTimeMetrics.totalResponses) * 100
  const improvementText = responseTimeMetrics.improvementPercentage > 0 
    ? `${responseTimeMetrics.improvementPercentage}% más rápido que el promedio del mercado`
    : responseTimeMetrics.improvementPercentage < 0
    ? `${Math.abs(responseTimeMetrics.improvementPercentage)}% más lento que el promedio del mercado`
    : 'Igual al promedio del mercado'

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Tiempo de Respuesta
          </div>
          <HelpModal />
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Análisis de rapidez en ofertas ({responseTimeMetrics.totalResponses} respuestas)
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Métrica principal */}
          <div className="text-center space-y-4">
            <div className="text-6xl font-bold text-blue-600">
              {formatTime(responseTimeMetrics.avgResponseTimeHours)}
            </div>
            <div className="text-lg text-gray-600">Tiempo promedio de respuesta</div>
            <div className={`text-sm font-medium ${
              responseTimeMetrics.improvementPercentage > 0 ? 'text-green-600' : 
              responseTimeMetrics.improvementPercentage < 0 ? 'text-red-600' : 
              'text-gray-600'
            }`}>
              {improvementText}
            </div>
          </div>

          {/* Métricas adicionales */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 bg-blue-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Zap className="h-5 w-5 text-blue-600" />
              </div>
              <div className="text-lg font-semibold text-blue-600">
                {formatTime(responseTimeMetrics.medianResponseTimeHours)}
              </div>
              <div className="text-xs text-blue-700">Tiempo mediano</div>
            </div>

            <div className="text-center p-3 bg-green-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <TrendingUp className="h-5 w-5 text-green-600" />
              </div>
              <div className="text-lg font-semibold text-green-600">
                {formatTime(responseTimeMetrics.fastestResponseHours)}
              </div>
              <div className="text-xs text-green-700">Más rápida</div>
            </div>

            <div className="text-center p-3 bg-purple-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Target className="h-5 w-5 text-purple-600" />
              </div>
              <div className="text-lg font-semibold text-purple-600">
                {responseTimeMetrics.responsesUnder1h}
              </div>
              <div className="text-xs text-purple-700">En {'<'} 1 hora</div>
            </div>

            <div className="text-center p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center justify-center mb-2">
                <Clock className="h-5 w-5 text-orange-600" />
              </div>
              <div className="text-lg font-semibold text-orange-600">
                {efficiencyPercentage.toFixed(1)}%
              </div>
              <div className="text-xs text-orange-700">Eficiencia</div>
            </div>
          </div>

          {/* Comparación con mercado */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <h4 className="font-semibold text-gray-700 mb-2">📊 Comparación con el mercado</h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600">Tu promedio:</span>
                <span className="font-semibold ml-2">{formatTime(responseTimeMetrics.avgResponseTimeHours)}</span>
              </div>
              <div>
                <span className="text-gray-600">Promedio mercado:</span>
                <span className="font-semibold ml-2">{formatTime(responseTimeMetrics.marketAvgResponseHours)}</span>
              </div>
            </div>
          </div>

          {/* Consejos basados en performance */}
          <div className={`p-4 rounded-lg ${
            efficiencyPercentage > 80 ? 'bg-green-50 border border-green-200' :
            efficiencyPercentage > 50 ? 'bg-yellow-50 border border-yellow-200' :
            'bg-red-50 border border-red-200'
          }`}>
            <h4 className={`font-semibold mb-2 ${
              efficiencyPercentage > 80 ? 'text-green-800' :
              efficiencyPercentage > 50 ? 'text-yellow-800' :
              'text-red-800'
            }`}>
              💡 {efficiencyPercentage > 80 ? 'Excelente rapidez' : 
                   efficiencyPercentage > 50 ? 'Buen tiempo de respuesta' : 
                   'Oportunidad de mejora'}
            </h4>
            <p className={`text-sm ${
              efficiencyPercentage > 80 ? 'text-green-700' :
              efficiencyPercentage > 50 ? 'text-yellow-700' :
              'text-red-700'
            }`}>
              {efficiencyPercentage > 80 
                ? 'Mantienes un excelente tiempo de respuesta. Los clientes valoran la rapidez.'
                : efficiencyPercentage > 50
                ? 'Tienes un buen tiempo de respuesta, pero puedes mejorar respondiendo más rápido.'
                : 'Considera mejorar tu tiempo de respuesta para ganar más clientes. Las respuestas rápidas aumentan las posibilidades de éxito.'
              }
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 