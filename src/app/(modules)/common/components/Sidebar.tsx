'use client'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/src/components/ui/accordion'
import { Separator } from '@/src/components/ui/separator'
import { Ship, BarChart3 } from 'lucide-react'
import { useTranslation } from '@/src/hooks/useTranslation'
import useAuthStore from '@/src/store/authStore'
import Link from 'next/link'

const Sidebar = () => {
  const user = useAuthStore((state) => state.user)
  const { t } = useTranslation()

  return (
    <div className="w-[18rem] bg-primary border-r">
      <div className="flex flex-col h-screen">
        <div className="flex items-center justify-between h-16 px-4">
          <Link href="#" className="flex items-center gap-2" prefetch={false}>
            <span className="font-medium text-white text-3xl">LogBid</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto h-full">
          {!user ? (
            <h1 className="text-white text-center">{t('sidebar.loading')}</h1>
          ) : (
            <nav className="grid gap-1 px-4 py-2">
              {user?.all_markets.map((market) => (
                <MarketItem
                  key={market.id}
                  market_id={market.id}
                  market={market.name}
                  role={user.role_id}
                  t={t}
                />
              ))}
            </nav>
          )}
        </div>
      </div>
    </div>
  )
}

export default Sidebar

interface ListItem {
  url: string
  nameKey: string
}

interface List {
  2: ListItem[]
  3: ListItem[]
}

const list: List = {
  2: [
    {
      url: '/',
      nameKey: 'sidebar.cargoTrips',
    },
    {
      url: '/graphics',
      nameKey: 'sidebar.statistics',
    },
  ],
  3: [
    {
      url: '/bid_list',
      nameKey: 'sidebar.cargoTrips',
    },
   /* {
      url: '/history_offers',
      nameKey: 'Histórico Propuestas',
    },*/
    {
      url: '/graphics',
      nameKey: 'sidebar.statistics',
    },
  ],
}

const MarketItem = ({
  market,
  role,
  market_id,
  t,
}: {
  market: string
  role: 2 | 3
  market_id: number
  t: (key: string) => string
}) => {
  // Asegurarte de que role sea una clave válida
  if (!(role in list)) {
    return <div>Invalid role</div>
  }

  const getIcon = (nameKey: string) => {
    if (nameKey === 'sidebar.cargoTrips') {
      return <Ship className="h-5 w-5" />
    }
    if (nameKey === 'sidebar.statistics') {
      return <BarChart3 className="h-5 w-5" />
    }
    return null
  }

  return (
    <Accordion type="single" collapsible key={market}>
      <AccordionItem value="item-1">
        <AccordionTrigger className="text-white">
          {`${t('sidebar.market')} ${market}`}
        </AccordionTrigger>
        <AccordionContent>
          {list[role].map((item: ListItem, index: number) => (
            <Link
              key={index}
              href={`${item.url}?market_id=${market_id}`}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-md font-bold hover:bg-purple hover:text-black text-white"
              prefetch={false}
            >
              {getIcon(item.nameKey)}
              {t(item.nameKey)}
            </Link>
          ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
