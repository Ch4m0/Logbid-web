'use client'
import { useEffect, useState } from 'react'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/src/components/ui/tabs'
import { useTranslation } from '@/src/hooks/useTranslation'

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
  const statusChildren1 = children1.props.status
  const statusChildren2 = children2.props.status
  const statusChildren3 = children3.props.status

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
    <Tabs defaultValue={activeTab} value={activeTab} className="w-full mx-auto">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger
          value="sin-propuestas"
          onClick={() => {
            setActiveTab('sin-propuestas')
            if (statusChildren1) {
              changeUrl(statusChildren1)
            }
          }}
        >
          {t('cargoList.withoutProposals')}
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
          {t('cargoList.withProposals')}
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
      </TabsList>
      <TabsContent value="sin-propuestas">{children1}</TabsContent>
      <TabsContent value="con-propuestas">{children2}</TabsContent>
      <TabsContent value="historico">{children3}</TabsContent>
    </Tabs>
  )
}
