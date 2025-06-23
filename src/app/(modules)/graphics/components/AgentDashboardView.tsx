/**
 * AgentDashboardView - Dashboard principal para agentes
 * 
 * SECCIONES IMPLEMENTADAS:
 * ✅ KPIs Principales - Datos reales de conversión, ingresos, ranking, oportunidades
 * ✅ Filtros Dinámicos - Por mercado, período y tipo de transporte
 * ✅ Performance y Conversión - Métricas detalladas de rendimiento
 * ✅ Performance Competitiva - Ranking, tiempo respuesta, análisis precios
 * 
 * SECCIONES PENDIENTES (comentadas):
 * 💰 Métricas Financieras - Análisis detallado de ingresos y márgenes
 * 🗺️ Rutas y Especialización - Mapas y análisis geográfico  
 * 📊 Oportunidades de Mercado - Alertas en tiempo real
 * ⚡ Eficiencia Operacional - Métricas de cumplimiento
 */

'use client'
import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Button } from '@/src/components/ui/button'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'
import { useTranslation } from '@/src/hooks/useTranslation'
import { Calendar, Filter, Target, TrendingUp, Award, MapPin, Loader2 } from 'lucide-react'
import { AgentPerformanceMetrics } from './AgentPerformanceMetrics'
import { CompetitiveAnalysisChart } from './CompetitiveAnalysisChart'
import { useGetAgentPerformanceMetrics } from '../../../hooks/useGetAgentPerformanceMetrics'
import { useGetAgentCompetitivePerformance } from '../../../hooks/useGetAgentCompetitivePerformance'
import { useGetBidList } from '../../../hooks/useGetBidList'

interface AgentDashboardViewProps {
  profile: any
}

export function AgentDashboardView({ profile }: AgentDashboardViewProps) {
  const { t, i18n } = useTranslation()
  
  // State para forzar re-render cuando cambie el idioma
  const [languageKey, setLanguageKey] = useState(0)
  
  // Obtener el primer mercado del usuario como default
  const defaultMarketId = profile?.all_markets?.[0]?.id?.toString() || 'all'
  
  const [filters, setFilters] = useState({
    marketId: defaultMarketId,
    dateRange: '30d',
    transportType: 'all',
    enabled: !!profile?.id
  })

  // Escuchar cambios de idioma y forzar re-render
  useEffect(() => {
    const handleLanguageChange = () => {
      console.log('🔄 Language changed, forcing re-render...')
      setLanguageKey(prev => prev + 1)
    }

    i18n.on('languageChanged', handleLanguageChange)
    
    return () => {
      i18n.off('languageChanged', handleLanguageChange)
    }
  }, [i18n])

  const updateFilter = (key: string, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }))
  }

  // Obtener datos de performance y competencia
  const performanceData = useGetAgentPerformanceMetrics({
    agentId: profile?.id?.toString() || '',
    marketId: filters.marketId === 'all' ? undefined : filters.marketId,
    transportType: filters.transportType === 'all' ? undefined : filters.transportType,
    enabled: filters.enabled && !!profile?.id
  })

  const competitiveData = useGetAgentCompetitivePerformance({
    agentId: profile?.id?.toString() || '',
    marketId: filters.marketId === 'all' ? undefined : filters.marketId,
    transportType: filters.transportType === 'all' ? undefined : filters.transportType,
    enabled: filters.enabled && !!profile?.id
  })

  // Obtener shipments disponibles (oportunidades) 
  const bidListData = useGetBidList({
    user_id: profile?.id ? Number(profile.id) : null,
    market_id: filters.marketId === 'all' ? null : filters.marketId,
    status: 'Active',
    shipping_type: filters.transportType === 'all' ? 'Marítimo' : filters.transportType as any
  })

  const dateRangeOptions = [
    { value: '7d', label: t('dashboard.agent.dateRanges.7d') },
    { value: '30d', label: t('dashboard.agent.dateRanges.30d') },
    { value: '3m', label: t('dashboard.agent.dateRanges.3m') },
    { value: '6m', label: t('dashboard.agent.dateRanges.6m') },
    { value: '1y', label: t('dashboard.agent.dateRanges.1y') }
  ]

  const transportTypeOptions = [
    { value: 'all', label: t('dashboard.agent.allTransportTypes') },
    { value: 'Marítimo', label: t('transport.maritime') },
    { value: 'Aéreo', label: t('transport.air') }
  ]

  return (
    <div key={`agent-dashboard-${languageKey}`} className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Target className="h-8 w-8 text-green-600" />
            {t('dashboard.agent.title')}
          </h1>
          <p className="text-muted-foreground">
            {t('dashboard.agent.subtitle')}
          </p>
                  </div>
        <div className="flex items-center gap-2">
          <Award className="h-8 w-8 text-primary" />
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            {t('dashboard.agent.filtersTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Filtro de Mercado */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('dashboard.agent.marketLabel')}</label>
              <Select
                value={filters.marketId}
                onValueChange={(value) => updateFilter('marketId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('dashboard.agent.selectMarket')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('dashboard.agent.allMarkets')}</SelectItem>
                  {profile?.all_markets?.map((market: any) => (
                    <SelectItem key={market.id} value={market.id.toString()}>
                      {market.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro de Período */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('dashboard.agent.periodLabel')}</label>
              <Select
                value={filters.dateRange}
                onValueChange={(value: any) => updateFilter('dateRange', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('dashboard.agent.selectPeriod')} />
                </SelectTrigger>
                <SelectContent>
                  {dateRangeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Filtro de Tipo de Transporte */}
            <div className="space-y-2">
              <label className="text-sm font-medium">{t('dashboard.agent.transportTypeLabel')}</label>
              <Select
                value={filters.transportType}
                onValueChange={(value: any) => updateFilter('transportType', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder={t('dashboard.agent.selectTransportType')} />
                </SelectTrigger>
                <SelectContent>
                  {transportTypeOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Botón de Actualizar */}
            <div className="space-y-2">
              <label className="text-sm font-medium invisible">{t('dashboard.agent.updateButton')}</label>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => {
                  // Forzar refetch actualizando filtros
                  setFilters(prev => ({ ...prev, enabled: false }))
                  setTimeout(() => {
                    setFilters(prev => ({ ...prev, enabled: true }))
                  }, 100)
                }}
              >
                <Calendar className="h-4 w-4 mr-2" />
                {t('dashboard.agent.updateButton')}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Métricas Principales con Datos Reales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Tasa de Conversión */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.agent.kpis.conversionRate')}</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {performanceData.isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <div className="text-sm text-muted-foreground">{t('dashboard.agent.loading')}</div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-green-600">
                  {performanceData.data?.basicMetrics?.conversionRate ? 
                    performanceData.data.basicMetrics.conversionRate.toFixed(1) : '0.0'}%
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('dashboard.agent.of')} {performanceData.data?.basicMetrics?.totalOffers || 0} {t('dashboard.agent.offers')}
                  {performanceData.data?.basicMetrics?.totalOffers === 0 && ` (${t('dashboard.agent.noActivity')})`}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Ingresos del Período */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.agent.kpis.monthlyRevenue')}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {performanceData.isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <div className="text-sm text-muted-foreground">{t('dashboard.agent.loading')}</div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-blue-600">
                  ${(performanceData.data?.basicMetrics?.totalRevenue || 0).toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('dashboard.agent.average')}: ${(performanceData.data?.basicMetrics?.avgContractValue || 0).toLocaleString()}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Ranking en el Mercado */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.agent.kpis.ranking')}</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {competitiveData.isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <div className="text-sm text-muted-foreground">{t('dashboard.agent.loading')}</div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-purple-600">
                  #{competitiveData.data?.marketPosition?.agentRankings?.winRank || '--'}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('dashboard.agent.of')} {competitiveData.data?.marketPosition?.totalActiveAgents || 0} {t('dashboard.agent.agents')}
                </p>
              </>
            )}
          </CardContent>
        </Card>

        {/* Oportunidades Disponibles */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t('dashboard.agent.kpis.opportunities')}</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {bidListData.isLoading ? (
              <div className="flex items-center space-x-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <div className="text-sm text-muted-foreground">{t('dashboard.agent.loading')}</div>
              </div>
            ) : (
              <>
                <div className="text-2xl font-bold text-orange-600">
                  {bidListData.data?.length || 0}
                </div>
                <p className="text-xs text-muted-foreground">
                  {t('dashboard.agent.kpis.availableShipments')}
                </p>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Secciones de Métricas */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">🎯 {t('dashboard.agent.performance.title')}</h2>
        <AgentPerformanceMetrics 
          filters={{
            agentId: profile?.id?.toString() || '',
            marketId: filters.marketId === 'all' ? undefined : filters.marketId,
            transportType: filters.transportType === 'all' ? undefined : filters.transportType,
            enabled: !!profile?.id
          }}
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">⚡ {t('dashboard.agent.competitivePerformance')}</h2>
        <CompetitiveAnalysisChart 
          filters={{
            agentId: profile?.id?.toString() || '',
            marketId: filters.marketId === 'all' ? undefined : filters.marketId,
            transportType: filters.transportType === 'all' ? undefined : filters.transportType,
            enabled: !!profile?.id
          }}
        />
      </div>

      {/* SECCIONES EN DESARROLLO - COMENTADAS TEMPORALMENTE */}
      
      {/* 💰 Métricas Financieras - Próximamente */}
      {/*
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">💰 {t('dashboard.agent.financial.title')}</h2>
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.agent.financial.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-8">
              <p className="text-gray-500">{t('dashboard.agent.comingSoon')}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {t('dashboard.agent.financial.subtitle')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      */}

      {/* 🗺️ Rutas y Especialización - Próximamente */}
      {/*
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">🗺️ {t('dashboard.agent.routes.title')}</h2>
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.agent.routes.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-8">
              <p className="text-gray-500">{t('dashboard.agent.comingSoon')}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {t('dashboard.agent.routes.subtitle')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      */}

      {/* 📊 Oportunidades de Mercado - Próximamente */}
      {/*
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">📊 {t('dashboard.agent.opportunities.title')}</h2>
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.agent.opportunities.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-8">
              <p className="text-gray-500">{t('dashboard.agent.comingSoon')}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {t('dashboard.agent.opportunities.subtitle')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      */}

      {/* ⚡ Eficiencia Operacional - Próximamente */}
      {/*
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">⚡ {t('dashboard.agent.efficiency.title')}</h2>
        <Card>
          <CardHeader>
            <CardTitle>{t('dashboard.agent.efficiency.title')}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center p-8">
              <p className="text-gray-500">{t('dashboard.agent.comingSoon')}</p>
              <p className="text-sm text-muted-foreground mt-2">
                {t('dashboard.agent.efficiency.subtitle')}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
      */}
    </div>
  )
} 