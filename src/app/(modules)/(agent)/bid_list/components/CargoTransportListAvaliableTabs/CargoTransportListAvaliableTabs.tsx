'use client'

import { useEffect, useState } from 'react'
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/src/components/ui/tabs'

export default function CargoTransportTabs({ children1, children2 }: any) {
  const [activeTab, setActiveTab] = useState('sin-propuestas')
  const statusChildren1 = children1.props.status
  const statusChildren2 = children2.props.status

  useEffect(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search)
      const statusParam = searchParams.get('status')

      if (statusParam === statusChildren1) {
        setActiveTab('sin-propuestas')
      } else if (statusParam === statusChildren2) {
        setActiveTab('con-propuestas')
      }
    } catch (error) {
      console.error('Error reading URL parameters:', error)
    }
  }, [statusChildren1, statusChildren2])

  const changeUrl = (value: string) => {
    const url = new URL(window.location.href)
    url.searchParams.set('status', value)
    window.history.pushState({}, '', url.toString())
  }

  return (
    <Tabs defaultValue={activeTab} value={activeTab} className="w-full mx-auto">
      <TabsList className="grid w-full grid-cols-2">
        <TabsTrigger
          value="sin-propuestas"
          onClick={() => {
            setActiveTab('sin-propuestas')
            if (statusChildren1) {
              changeUrl(statusChildren1)
            }
          }}
        >
          Sin propuestas
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
          Con propuestas
        </TabsTrigger>
      </TabsList>
      <TabsContent value="sin-propuestas">{children1}</TabsContent>
      <TabsContent value="con-propuestas">{children2}</TabsContent>
    </Tabs>
  )
}
