'use client'
import React, { useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/src/components/ui/dialog'
import { Button } from '@/src/components/ui/button'
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts'
import { Package, HelpCircle, Info, CheckCircle, Clock, XCircle, AlertTriangle } from 'lucide-react'

interface MyShipmentsChartProps {
  data: any[]
}

const ShipmentStatusHelpModal = () => {
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
            Guía de Estados de Shipments
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <Package className="h-4 w-4" />
              Activos (Active)
            </h3>
            <p className="text-blue-700 text-sm mb-2">
              Shipments que están publicados y esperando ofertas de agentes.
            </p>
            <div className="text-blue-600 text-xs">
              <strong>Características:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>📅 <strong>Fecha límite pendiente:</strong> Aún no han alcanzado la fecha de cierre</li>
                <li>📝 <strong>Recibiendo ofertas:</strong> Los agentes pueden enviar propuestas</li>
                <li>👀 <strong>Visibles en el mercado:</strong> Aparecen en búsquedas de agentes</li>
                <li>⚡ <strong>Acción requerida:</strong> Revisa y responde a las ofertas recibidas</li>
              </ul>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              En Oferta (Offering)
            </h3>
            <p className="text-yellow-700 text-sm mb-2">
              Shipments que han recibido ofertas y están en proceso de evaluación.
            </p>
            <div className="text-yellow-600 text-xs">
              <strong>Estado intermedio:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>📋 <strong>Ofertas recibidas:</strong> Hay propuestas de agentes para revisar</li>
                <li>🤔 <strong>En evaluación:</strong> Estás comparando precios y condiciones</li>
                <li>⏰ <strong>Tiempo limitado:</strong> No demores mucho la decisión</li>
                <li>🎯 <strong>Próximo paso:</strong> Acepta la mejor oferta o continúa negociando</li>
              </ul>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Cerrados (Closed)
            </h3>
            <p className="text-green-700 text-sm mb-2">
              Shipments completados exitosamente - ya tienes agente asignado.
            </p>
            <div className="text-green-600 text-xs">
              <strong>Misión cumplida:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>✅ <strong>Oferta aceptada:</strong> Has seleccionado un agente</li>
                <li>🤝 <strong>Acuerdo cerrado:</strong> Términos y condiciones acordados</li>
                <li>📦 <strong>En proceso:</strong> El envío está siendo gestionado</li>
                <li>💰 <strong>Costo definido:</strong> Precio final acordado y confirmado</li>
              </ul>
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg">
            <h3 className="font-semibold text-red-800 mb-2 flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              Expirados (Expired)
            </h3>
            <p className="text-red-700 text-sm mb-2">
              Shipments que alcanzaron su fecha límite sin conseguir agente.
            </p>
            <div className="text-red-600 text-xs">
              <strong>Necesitan atención:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>⏰ <strong>Tiempo agotado:</strong> Pasaron la fecha de cierre sin acuerdo</li>
                <li>🔍 <strong>Analizar causas:</strong> ¿Precio muy bajo? ¿Ruta difícil?</li>
                <li>🔄 <strong>Republicar:</strong> Considera ajustar condiciones y volver a publicar</li>
                <li>📞 <strong>Contacto directo:</strong> Busca agentes específicos para esa ruta</li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-2">📊 Interpretación de la Distribución</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Distribución Saludable:</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• 60-70% Cerrados</li>
                  <li>• 20-30% Activos</li>
                  <li>• 5-10% En Oferta</li>
                  <li>• {'<'}5% Expirados</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Señales de Alerta:</h4>
                <ul className="text-gray-600 space-y-1">
                  <li>• Muchos Expirados: Precios poco atractivos</li>
                  <li>• Pocos Cerrados: Dificultad para cerrar acuerdos</li>
                  <li>• Demasiados Activos: Mercado saturado o precios altos</li>
                  <li>• Muchos En Oferta: Indecisión en selección</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
            <h3 className="font-semibold text-yellow-800 mb-2">💡 Acciones Recomendadas</h3>
            <div className="space-y-3">
              <div>
                <h4 className="font-medium text-yellow-700 mb-1">Para Shipments Activos:</h4>
                <ul className="text-yellow-600 text-xs space-y-1">
                  <li>• Monitorea regularmente las ofertas recibidas</li>
                  <li>• Ajusta precios si no recibes ofertas en 2-3 días</li>
                  <li>• Considera ampliar el rango de fechas de entrega</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-yellow-700 mb-1">Para Shipments En Oferta:</h4>
                <ul className="text-yellow-600 text-xs space-y-1">
                  <li>• Evalúa ofertas dentro de 24-48 horas</li>
                  <li>• Compara no solo precio, sino también reputación del agente</li>
                  <li>• Negocia términos específicos si es necesario</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-yellow-700 mb-1">Para Shipments Expirados:</h4>
                <ul className="text-yellow-600 text-xs space-y-1">
                  <li>• Analiza por qué no recibieron ofertas</li>
                  <li>• Ajusta precio o condiciones antes de republicar</li>
                  <li>• Considera rutas alternativas o consolidación</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-800 mb-2">🎯 Optimización del Proceso</h3>
            <ul className="text-blue-700 text-sm space-y-1">
              <li>• <strong>Tiempo de respuesta:</strong> Responde a ofertas en menos de 24 horas</li>
              <li>• <strong>Precios competitivos:</strong> Investiga precios de mercado antes de publicar</li>
              <li>• <strong>Información completa:</strong> Incluye todos los detalles del envío</li>
              <li>• <strong>Flexibilidad:</strong> Fechas y condiciones flexibles reciben más ofertas</li>
              <li>• <strong>Seguimiento activo:</strong> Revisa el estado de tus shipments diariamente</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function MyShipmentsChart({ data }: MyShipmentsChartProps) {
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return []

    const statusCounts = data.reduce((acc, item) => {
      const status = item.status || 'Desconocido'
      acc[status] = (acc[status] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const statusLabels: Record<string, string> = {
      'Active': 'Activos',
      'Closed': 'Cerrados',
      'Offering': 'En Oferta',
      'Expired': 'Expirados'
    }

    return Object.entries(statusCounts).map(([status, count]) => ({
      name: statusLabels[status] || status,
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
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Estado de mis Shipments
          </div>
          <ShipmentStatusHelpModal />
        </CardTitle>
        <p className="text-sm text-muted-foreground">
          Distribución por estado actual
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