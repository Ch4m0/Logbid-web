'use client'
import { useEffect, useState } from 'react'
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
  const [activeTab, setActiveTab] = useState('sin-propuestas')
  const filterTypeChildren1 = children1.props.filterType
  const filterTypeChildren2 = children2.props.filterType
  const filterTypeChildren3 = children3.props.filterType

  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search)

      const filterParam = searchParams.get('filter')

      if (filterParam === filterTypeChildren1) {
        setActiveTab('sin-propuestas')

      } else if (filterParam === filterTypeChildren2) {
        setActiveTab('con-propuestas')

      } else if (filterParam === filterTypeChildren3) {
        setActiveTab('historico')

      }
    } catch (error) {
      console.error('Error reading URL parameters:', error)
    }
  }, [filterTypeChildren1, filterTypeChildren2, filterTypeChildren3])

  const changeUrl = (value: string) => {
    const url = new URL(window.location.href)

    url.searchParams.set('filter', value)
    
    window.history.pushState({}, '', url.toString())
  }

  return (
    <div className="w-full mx-auto space-y-6">
      {/* Transport Type Selection */}
      <div className="flex justify-center">
        <MenuHeader />
      </div>
      
      <Tabs defaultValue={activeTab} value={activeTab} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger
          value="sin-propuestas"
          onClick={() => {
            setActiveTab('sin-propuestas')
            if (filterTypeChildren1) {
              changeUrl(filterTypeChildren1)
            }
          }}
        >
                        {t('cargoList.withoutOffers')}
        </TabsTrigger>
        <TabsTrigger
          value="con-propuestas"
          onClick={() => {
            setActiveTab('con-propuestas')
            if (filterTypeChildren2) {
              changeUrl(filterTypeChildren2)
            }
          }}
        >
                        {t('cargoList.withOffers')}
        </TabsTrigger>
        <TabsTrigger
          value="historico"
          onClick={() => {
            setActiveTab('historico')
            if (filterTypeChildren3) {
              changeUrl(filterTypeChildren3)
            }
          }}
        >
          {t('cargoList.history')}
        </TabsTrigger>
      </TabsList>
      <TabsContent value="sin-propuestas">{children1}</TabsContent>
      <TabsContent value="con-propuestas">{children2}</TabsContent>
      <TabsContent value="historico">{children3}</TabsContent>
      </Tabs>
    </div>
  )
}
