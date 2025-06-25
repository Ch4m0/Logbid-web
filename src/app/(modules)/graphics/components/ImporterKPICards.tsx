'use client'
import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/src/components/ui/dialog'
import { Button } from '@/src/components/ui/button'
import { useTranslation } from '@/src/hooks/useTranslation'
import { 
  Package, 
  DollarSign, 
  TrendingUp, 
  MessageCircle, 
  CheckCircle, 
  XCircle,
  HelpCircle,
  Info
} from 'lucide-react'

interface ImporterKPICardsProps {
  data: {
    totalShipments: number
    totalSpent: number
    avgCost: number
    shipmentsWithOffers: number
    avgOffers: number
    conversionRate: number
  }
}

const ImporterHelpModal = () => {
  const { t } = useTranslation()
  
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="ml-auto">
          <HelpCircle className="h-4 w-4 mr-2" />
          {t('dashboard.help.helpGuide')}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Info className="h-5 w-5" />
            {t('dashboard.help.helpGuide')}
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2 flex items-center gap-2">
              <Package className="h-4 w-4" />
              {t('dashboard.customer.totalShipments')}
            </h3>
            <p className="text-blue-700 text-sm mb-2">
              Número total de shipments que has publicado en el período seleccionado.
            </p>
            <div className="text-blue-600 text-xs">
              <strong>Interpretación:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>📈 <strong>Alto volumen:</strong> Indica un negocio activo y creciente</li>
                <li>📊 <strong>Tendencia:</strong> Observa si aumenta o disminuye mes a mes</li>
                <li>🎯 <strong>Meta:</strong> Mantener consistencia según tu capacidad operativa</li>
              </ul>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold text-green-800 mb-2 flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              {t('dashboard.customer.totalSpent')}
            </h3>
            <p className="text-green-700 text-sm mb-2">
              Suma total de dinero invertido en transporte durante el período.
            </p>
            <div className="text-green-600 text-xs">
              <strong>Utilidad:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>💰 <strong>Control de presupuesto:</strong> Seguimiento de gastos logísticos</li>
                <li>📋 <strong>Planificación:</strong> Ayuda a proyectar costos futuros</li>
                <li>🔍 <strong>Análisis:</strong> Compara con ingresos para calcular márgenes</li>
              </ul>
            </div>
          </div>

          <div className="bg-purple-50 p-4 rounded-lg">
            <h3 className="font-semibold text-purple-800 mb-2 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              {t('dashboard.customer.averageCost')}
            </h3>
            <p className="text-purple-700 text-sm mb-2">
              Promedio de dinero gastado por cada shipment enviado.
            </p>
            <div className="text-purple-600 text-xs">
              <strong>Valor estratégico:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>💡 <strong>Eficiencia:</strong> Menor costo = mayor eficiencia operativa</li>
                <li>📊 <strong>Benchmark:</strong> Compara con costos históricos</li>
                <li>🎛️ <strong>Optimización:</strong> Identifica oportunidades de ahorro</li>
              </ul>
            </div>
          </div>

          <div className="bg-orange-50 p-4 rounded-lg">
            <h3 className="font-semibold text-orange-800 mb-2 flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              {t('dashboard.customer.offersPerShipment')}
            </h3>
            <p className="text-orange-700 text-sm mb-2">
              Número promedio de ofertas que recibe cada uno de tus shipments.
            </p>
            <div className="text-orange-600 text-xs">
              <strong>Indicador de atractivo:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>🔥 <strong>3+ ofertas:</strong> Shipment muy atractivo, buena competencia</li>
                <li>📈 <strong>1-2 ofertas:</strong> Normal, considera mejorar condiciones</li>
                <li>⚠️ <strong>0 ofertas:</strong> Revisa precios, rutas o especificaciones</li>
              </ul>
            </div>
          </div>

          <div className="bg-cyan-50 p-4 rounded-lg">
            <h3 className="font-semibold text-cyan-800 mb-2 flex items-center gap-2">
              <CheckCircle className="h-4 w-4" />
              Shipments con Ofertas
            </h3>
            <p className="text-cyan-700 text-sm mb-2">
              Cantidad de shipments que han recibido al menos una oferta.
            </p>
            <div className="text-cyan-600 text-xs">
              <strong>Métrica de éxito:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>✅ <strong>85%+:</strong> Excelente, tus shipments son muy atractivos</li>
                <li>👍 <strong>70-84%:</strong> Bueno, hay margen de mejora</li>
                <li>🔍 <strong>{'<'}70%:</strong> Revisa estrategia de precios y condiciones</li>
              </ul>
            </div>
          </div>

          <div className="bg-yellow-50 p-4 rounded-lg">
            <h3 className="font-semibold text-yellow-800 mb-2 flex items-center gap-2">
              <XCircle className="h-4 w-4" />
              {t('dashboard.customer.conversionRate')}
            </h3>
            <p className="text-yellow-700 text-sm mb-2">
              Porcentaje de shipments que logran recibir ofertas del total publicado.
            </p>
            <div className="text-yellow-600 text-xs">
              <strong>KPI principal:</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>🎯 <strong>Meta ideal:</strong> 80% o más de tus shipments con ofertas</li>
                <li>📊 <strong>Benchmark:</strong> Promedio del mercado suele ser 60-70%</li>
                <li>🚀 <strong>Optimización:</strong> Mejora precios, rutas o especificaciones</li>
              </ul>
            </div>
          </div>

          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-2">💡 Consejos para Mejorar</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Para aumentar ofertas:</h4>
                <ul className="text-gray-600 text-xs space-y-1">
                  <li>• Precios competitivos y realistas</li>
                  <li>• Información completa y detallada</li>
                  <li>• Plazos flexibles cuando sea posible</li>
                  <li>• Rutas populares y accesibles</li>
                </ul>
              </div>
              <div>
                <h4 className="font-medium text-gray-700 mb-1">Para reducir costos:</h4>
                <ul className="text-gray-600 text-xs space-y-1">
                  <li>• Consolidar envíos cuando sea posible</li>
                  <li>• Planificar con mayor anticipación</li>
                  <li>• Considerar rutas alternativas</li>
                  <li>• Negociar tarifas a largo plazo</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-red-50 p-4 rounded-lg border border-red-200">
            <h3 className="font-semibold text-red-800 mb-2">⚠️ Señales de Alerta</h3>
            <ul className="text-red-700 text-sm space-y-1">
              <li>• <strong>Conversión {'<'} 50%:</strong> Problemas serios con precios o condiciones</li>
              <li>• <strong>Costo promedio en aumento:</strong> Posible ineficiencia o inflación del mercado</li>
              <li>• <strong>Pocas ofertas por shipment:</strong> Considera mejorar atractivo de la oferta</li>
              <li>• <strong>Tendencia descendente:</strong> Revisa competitividad en el mercado</li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export function ImporterKPICards({ data }: ImporterKPICardsProps) {
  const { t } = useTranslation()

  const conversionRate = data.conversionRate || 0
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">{t('dashboard.customer.totalShipments')}</h3>
        <ImporterHelpModal />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.customer.totalShipments')}
            </CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalShipments.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.descriptions.shipmentsCreated')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.customer.totalSpent')}
            </CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.totalSpent.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              en transporte
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.customer.averageCost')}
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${data.avgCost.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              por shipment
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Con Ofertas
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.shipmentsWithOffers.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              shipments
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.customer.offersPerShipment')}
            </CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.avgOffers.toFixed(1)}</div>
            <p className="text-xs text-muted-foreground">
              {t('dashboard.units.offers')}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              {t('dashboard.customer.conversionRate')}
            </CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{conversionRate.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              con ofertas recibidas
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 