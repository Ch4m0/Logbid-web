'use client'
import React from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/src/components/ui/tabs'
import { useTranslation } from '@/src/hooks/useTranslation'
import MenuHeader from '../../../../common/components/MenuHeader'

interface CargoTransportTabsProps {
  children1: React.ReactElement
  children2: React.ReactElement
  children3: React.ReactElement
}

export default function CargoTransportTabs({
  children1,
  children2,
  children3,
}: CargoTransportTabsProps) {
  const { t } = useTranslation()
  const router = useRouter()
  const searchParams = useSearchParams()
  
  const filterTypeChildren1 = children1.props.filterType
  const filterTypeChildren2 = children2.props.filterType
  const filterTypeChildren3 = children3.props.filterType

  // Obtener el tab activo basado en el parámetro de la URL
  const getActiveTabFromUrl = () => {
    const filterParam = searchParams.get('filter')
    
    if (filterParam === filterTypeChildren1) return 'sin-propuestas'
    if (filterParam === filterTypeChildren2) return 'con-propuestas'  
    if (filterParam === filterTypeChildren3) return 'historico'
    
    return 'sin-propuestas' // default
  }

  const currentActiveTab = getActiveTabFromUrl()

  const handleTabChange = (tabValue: string) => {
    let filterType = ''
    
    if (tabValue === 'sin-propuestas') filterType = filterTypeChildren1
    else if (tabValue === 'con-propuestas') filterType = filterTypeChildren2
    else if (tabValue === 'historico') filterType = filterTypeChildren3
    
    if (filterType) {
      const params = new URLSearchParams(searchParams.toString())
      params.set('filter', filterType)
      params.set('page', '1') // Resetear paginación
      params.delete('search') // Limpiar búsqueda al cambiar de tab
      
      router.push(`?${params.toString()}`)
    }
  }

  return (
    <div className="w-full mx-auto space-y-6">
      {/* Transport Type Selection */}
      <div className="flex justify-center">
        <MenuHeader />
      </div>
      
      <Tabs value={currentActiveTab} onValueChange={handleTabChange} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="sin-propuestas">
            {t('cargoList.withoutOffers')}
          </TabsTrigger>
          <TabsTrigger value="con-propuestas">
            {t('common.offers')}
          </TabsTrigger>
          <TabsTrigger value="historico">
            {t('cargoList.history')}
          </TabsTrigger>
        </TabsList>
      <TabsContent value="sin-propuestas" className="mt-6 p-6 bg-gray-50 rounded-lg border">
        {children1}
      </TabsContent>
      <TabsContent value="con-propuestas" className="mt-6 p-6 bg-gray-50 rounded-lg border">
        {children2}
      </TabsContent>
      <TabsContent value="historico" className="mt-6 p-6 bg-gray-50 rounded-lg border">
        {children3}
      </TabsContent>
      </Tabs>
    </div>
  )
}
