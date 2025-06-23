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
  children4?: React.ReactElement
}

export default function CargoTransportListAvaliableTabs({
  children1,
  children2,
  children3,
  children4,
}: CargoTransportTabsProps) {
  const { t } = useTranslation()
  const [activeTab, setActiveTab] = useState('sin-propuestas')

  const statusChildren1 = children1.props.status
  const statusChildren2 = children2.props.status
  const statusChildren3 = children3.props.status
  const statusChildren4 = children4?.props?.status

  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search)

      const statusParam = searchParams.get('status')

      if (statusParam === statusChildren1) {
        setActiveTab('sin-propuestas')

      } else if (statusParam === statusChildren2) {
        setActiveTab('con-propuestas')

      } else if (statusParam === statusChildren3) {
        setActiveTab('historico')

      } else if (statusParam === statusChildren4) {
        setActiveTab('mis-ofertas')

      }
    } catch (error) {
      console.error('Error reading URL parameters:', error)
    }
  }, [statusChildren1, statusChildren2, statusChildren3])

  const changeUrl = (value: string) => {
    const url = new URL(window.location.href)

    url.searchParams.set('status', value)
    
    window.history.pushState({}, '', url.toString())
  }

  return (
    <div className="w-full mx-auto space-y-6">
      {/* Transport Type Selection */}
      <div className="flex justify-center">
        <MenuHeader />
      </div>
      
      <Tabs defaultValue={activeTab} value={activeTab} className="w-full">
        <TabsList className={`grid w-full ${children4 ? 'grid-cols-4' : 'grid-cols-3'}`}>
        <TabsTrigger
          value="sin-propuestas"
          onClick={() => {
            setActiveTab('sin-propuestas')
            if (statusChildren1) {
              changeUrl(statusChildren1)
            }
          }}
        >
                        {t('cargoList.withoutOffers')}
        </TabsTrigger>
        <TabsTrigger
          value="con-propuestas"
          onClick={() => {
            setActiveTab('con-propuestas')
            if (statusChildren2) {
              changeUrl(statusChildren2)
            }
          }}
        >
                        {t('cargoList.withOffers')}
        </TabsTrigger>
        <TabsTrigger
          value="historico"
          onClick={() => {
            setActiveTab('historico')
            if (statusChildren3) {
              changeUrl(statusChildren3)
            }
          }}
        >
          {t('cargoList.history')}
        </TabsTrigger>
        {children4 && (
          <TabsTrigger
            value="mis-ofertas"
            onClick={() => {
              setActiveTab('mis-ofertas')
              if (statusChildren4) {
                changeUrl(statusChildren4)
              }
            }}
          >
            {t('agentOffers.myOffers')}
          </TabsTrigger>
        )}
      </TabsList>
      <TabsContent value="sin-propuestas">{children1}</TabsContent>
      <TabsContent value="con-propuestas">{children2}</TabsContent>
      <TabsContent value="historico">{children3}</TabsContent>
      {children4 && (
        <TabsContent value="mis-ofertas">{children4}</TabsContent>
      )}
      </Tabs>
    </div>
  )
}
