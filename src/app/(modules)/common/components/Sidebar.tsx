'use client'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/src/components/ui/accordion'
import HistoryIcon from '@/src/icons/HistoryIcon'
import TripIcon from '@/src/icons/TripIcon'
import useAuthStore from '@/src/store/authStore'
import Link from 'next/link'

const Sidebar = () => {
  const user = useAuthStore((state) => state.user)

  return (
    <div className="w-[18rem] bg-blue-600 border-r">
      <div className="flex flex-col h-screen">
        <div className="flex items-center justify-between h-16 px-4">
          <Link href="#" className="flex items-center gap-2" prefetch={false}>
            <span className="font-medium text-white text-3xl">LogBid</span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto h-full">
          {!user ? (
            <h1 className="text-white text-center">Cargando..</h1>
          ) : (
            <nav className="grid gap-1 px-4 py-2">
              {user?.all_markets.map((market) => (
                <MarketItem
                  key={market.id}
                  market_id={market.id}
                  market={market.name}
                  role={user.role_id}
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
  name: string
}

interface List {
  2: ListItem[]
  3: ListItem[]
}

const list: List = {
  2: [
    {
      url: '/',
      name: 'Viajes de carga',
    },
    {
      url: '/history',
      name: 'Histórico',
    },
    {
      url: '/graphics',
      name: 'Estadísticas',
    },
  ],
  3: [
    {
      url: '/bid_list',
      name: 'Viajes de carga',
    },
    {
      url: '/history_offers',
      name: 'Histórico Propuestas',
    },
    {
      url: '/graphics',
      name: 'Estadísticas',
    },
  ],
}

const MarketItem = ({
  market,
  role,
  market_id,
}: {
  market: string
  role: 2 | 3
  market_id: number
}) => {
  // Asegurarte de que role sea una clave válida
  if (!(role in list)) {
    return <div>Invalid role</div>
  }
  return (
    <Accordion type="single" collapsible key={market}>
      <AccordionItem value="item-1">
        <AccordionTrigger className="text-white">
          {`Mercado ${market}`}
        </AccordionTrigger>
        <AccordionContent>
          {list[role].map((item: ListItem, index: number) => (
            <Link
              key={index}
              href={`${item.url}?market_id=${market_id}`}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-md font-bold hover:bg-blue-700 hover:text-white text-white"
              prefetch={false}
            >
              {index === 0 ? <TripIcon /> : <HistoryIcon />}
              {item.name}
            </Link>
          ))}
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
