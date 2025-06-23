'use client'
import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/src/components/ui/dialog'
import { Button } from '@/src/components/ui/button'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingDown, HelpCircle, Info, TrendingUp, DollarSign, Calendar, BarChart3 } from 'lucide-react'
import { format, subDays, eachDayOfInterval } from 'date-fns'
import { es } from 'date-fns/locale'

interface CostTrendsChartProps {
  data: any[]
  dateRange: '7d' | '30d' | '3m' | '6m' | '1y'
}

const CostTrendsHelpModal = () => {
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
            Guía de Tendencias de Costos
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <TrendingDown className="h-4 w-4" />
              Costo Promedio (Línea Azul)
            </h3>
            <p className="text-blue-700 text-sm mb-2">
              El costo promedio por shipment en cada día del período seleccionado.
            </p>
            <div className="text-blue-600 text-xs">
              <strong>Qué te dice:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>📈 <strong>Tendencia alcista:</strong> Los costos están aumentando (posible inflación)</li>
                <li>📉 <strong>Tendencia bajista:</strong> Los costos están disminuyendo (mayor competencia)</li>
                <li>📊 <strong>Estabilidad:</strong> Costos consistentes indican mercado maduro</li>
                <li>⚡ <strong>Volatilidad:</strong> Grandes cambios diarios requieren atención</li>
              </ul>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Gasto Total (Línea Verde)
            </h3>
            <p className="text-green-700 text-sm mb-2">
              El dinero total invertido en transporte cada día.
            </p>
            <div className="text-green-600 text-xs">
              <strong>Interpretación:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>💰 <strong>Picos altos:</strong> Días con muchos shipments o envíos costosos</li>
                <li>💸 <strong>Control de gastos:</strong> Ayuda a identificar días de alto gasto</li>
                <li>📅 <strong>Planificación:</strong> Patrones regulares ayudan en presupuestación</li>
                <li>🎯 <strong>Optimización:</strong> Identifica oportunidades de consolidación</li>
              </ul>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Patrones Temporales
            </h3>
            <p className="text-purple-700 text-sm mb-2">
              Identificación de patrones por días, semanas o estaciones.
            </p>
            <div className="text-purple-600 text-xs">
              <strong>Busca estos patrones:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>📆 <strong>Días de la semana:</strong> ¿Lunes más caro que viernes?</li>
                <li>🗓️ <strong>Fin de semana:</strong> Costos diferentes en fines de semana</li>
                <li>🎄 <strong>Estacionalidad:</strong> Navidad, temporadas altas más costosas</li>
                <li>⚡ <strong>Urgencias:</strong> Shipments de último momento cuestan más</li>
              </ul>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Análisis de Correlación
            </h3>
            <p className="text-yellow-700 text-sm mb-2">
              Relación entre el volumen de shipments y los costos.
            </p>
            <div className="text-yellow-600 text-xs">
              <strong>Correlaciones importantes:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>⬆️ <strong>Más shipments = menor costo promedio:</strong> Economías de escala</li>
                <li>⬇️ <strong>Pocos shipments = mayor costo promedio:</strong> Rutas menos populares</li>
                <li>🔄 <strong>Sin correlación:</strong> Precios estables independiente del volumen</li>
                <li>⚠️ <strong>Correlación inversa:</strong> Puede indicar problemas de pricing</li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-2">📊 Cómo Interpretar las Tendencias</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Tendencias Positivas:</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Costos estables o decrecientes</li>
                  <li>• Gastos predecibles día a día</li>
                  <li>• Correlación volumen-costo lógica</li>
                  <li>• Patrones estacionales conocidos</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Señales de Alerta:</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Aumento sostenido de costos</li>
                  <li>• Alta volatilidad diaria</li>
                  <li>• Gastos impredecibles</li>
                  <li>• Correlaciones anómalas</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
            <h3 className="font-semibold text-orange-800 mb-2">💡 Estrategias de Optimización</h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-orange-700 mb-1">Para Reducir Costos Promedio:</h4>
                <ul className="text-orange-600 text-xs space-y-1">
                  <li>• Consolida shipments cuando sea posible</li>
                  <li>• Evita días/horarios pico si no es urgente</li>
                  <li>• Negocia tarifas preferenciales por volumen</li>
                  <li>• Planifica con más anticipación</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-orange-700 mb-1">Para Controlar Gastos Totales:</h4>
                <ul className="text-orange-600 text-xs space-y-1">
                  <li>• Establece presupuestos diarios/semanales</li>
                  <li>• Monitorea alertas de gasto alto</li>
                  <li>• Distribuye envíos a lo largo del mes</li>
                  <li>• Considera alternativas de rutas más económicas</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-orange-700 mb-1">Para Aprovechar Patrones:</h4>
                <ul className="text-orange-600 text-xs space-y-1">
                  <li>• Programa envíos en días de menor costo</li>
                  <li>• Anticipa aumentos estacionales</li>
                  <li>• Aprovecha temporadas bajas</li>
                  <li>• Ajusta inventarios según patrones de costo</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h3 className="font-semibold text-red-800 mb-2">⚠️ Alertas Importantes</h3>
            <ul className="text-red-700 text-sm space-y-1">
              <li>• <strong>Aumento {'>'} 20% en una semana:</strong> Investigar causas inmediatamente</li>
              <li>• <strong>Gastos diarios muy variables:</strong> Falta de planificación o control</li>
              <li>• <strong>Costos consistentemente altos:</strong> Necesidad de nuevos proveedores</li>
              <li>• <strong>Patrones inexplicables:</strong> Puede indicar errores en el sistema</li>
            </ul>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">🎯 Metas de Optimización</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• <strong>Variabilidad {'<'} 15%:</strong> Entre costos promedio semanales</li>
              <li>• <strong>Tendencia estable:</strong> O ligeramente decreciente año tras año</li>
              <li>• <strong>Predictibilidad:</strong> Gastos mensuales dentro del 10% del promedio</li>
              <li>• <strong>Eficiencia estacional:</strong> Aprovechar al menos 2 períodos de menor costo al año</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function CostTrendsChart({ data, dateRange }: CostTrendsChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []

    const days = dateRange === '7d' ? 7 : dateRange === '30d' ? 30 : 90
    const intervals = eachDayOfInterval({
      start: subDays(new Date(), days),
      end: new Date()
    })

    return intervals.map(date => {
      const dayShipments = data.filter(item => {
        const itemDate = new Date(item.inserted_at)
        return itemDate.toDateString() === date.toDateString()
      })

      const avgCost = dayShipments.length > 0
        ? dayShipments.reduce((sum, item) => sum + (parseFloat(item.last_price) || 0), 0) / dayShipments.length
        : 0
      
      const totalCost = dayShipments.reduce((sum, item) => sum + (parseFloat(item.last_price) || 0), 0)

      return {
        date: format(date, 'dd/MM', { locale: es }),
        avgCost: Math.round(avgCost),
        totalCost: Math.round(totalCost),
        shipments: dayShipments.length
      }
    })
  }, [data, dateRange])

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-semibold">Fecha: {label}</p>
          <div className="space-y-1">
            <p className="text-blue-600">
              <span className="font-medium">Costo promedio:</span> ${data.avgCost.toLocaleString()}
            </p>
            <p className="text-green-600">
              <span className="font-medium">Gasto total:</span> ${data.totalCost.toLocaleString()}
            </p>
            <p className="text-gray-600">
              <span className="font-medium">Shipments:</span> {data.shipments}
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
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5" />
            Tendencia de Costos
          </div>
          <CostTrendsHelpModal />
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Evolución de tus costos de envío
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
              <YAxis 
                tick={{ fontSize: 12 }}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip content={<CustomTooltip />} />
              
              <Line 
                type="monotone" 
                dataKey="avgCost" 
                stroke="#3B82F6" 
                strokeWidth={3}
                dot={{ fill: '#3B82F6', strokeWidth: 2, r: 4 }}
                name="Costo Promedio"
              />
              
              <Line 
                type="monotone" 
                dataKey="totalCost" 
                stroke="#10B981" 
                strokeWidth={2}
                dot={{ fill: '#10B981', strokeWidth: 2, r: 3 }}
                name="Gasto Total"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex flex-wrap justify-center gap-4 mt-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
            <span>Costo Promedio</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded-full"></div>
            <span>Gasto Total</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 