'use client'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/src/components/ui/accordion'
import { Separator } from '@/src/components/ui/separator'
import { Ship, BarChart3, Package, LogOut } from 'lucide-react'
import { useTranslation } from '@/src/hooks/useTranslation'
import useAuthStore from '@/src/store/authStore'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { logout } from '@/src/actions/auth'
import { Button } from '@/src/components/ui/button'

const Sidebar = () => {
  const router = useRouter()
  const { user, profile } = useAuthStore()
  const logoutStore = useAuthStore((state) => state.logout)
  const { t } = useTranslation()

  // Usar markets del profile o fallback si no hay profile
  const userMarkets = profile?.all_markets || []
  const userRole = profile?.role || 'customer'



  const handleLogout = async () => {
    try {
  
      
      // Llamar a la server action de logout
      const result = await logout()
      
      if (result.error) {
        console.error('Error al cerrar sesión:', result.error)
        // Aún así, intentamos limpiar el estado local
      }


      
      // Limpiar el estado local
      logoutStore()
      
      // Redirigir al login

      router.push('/auth')
    } catch (error) {
      console.error('Error en el proceso de logout:', error)
      // Si hay error, forzamos la limpieza y redirección de todos modos
      logoutStore()
      router.push('/auth')
    }
  }

  return (
    <div className="fixed left-0 top-0 w-[18rem] bg-primary border-r z-40">
      <div className="flex flex-col h-[100vh] min-h-[100vh] max-h-[100vh]">
        <div className="flex items-center justify-between h-16 px-4">
          <Link href="#" className="flex items-center gap-3" prefetch={false}>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-2">
              <Package className="h-8 w-8 text-white" />
            </div>
            <span className="font-bold text-white text-3xl tracking-tight">
              Log<span className="text-yellow-300">Bid</span>
            </span>
          </Link>
        </div>
        <div className="flex-1 overflow-auto h-full">
          {!user ? (
            <h1 className="text-white text-center">{t('sidebar.loading')}</h1>
          ) : (
            <nav className="grid gap-1 px-4 py-2">
              {/* Dashboard Global - Fuera de mercados */}
              <Link
                href="/graphics"
                className="flex items-center gap-2 rounded-md px-3 py-2 text-md font-bold hover:bg-purple hover:text-black text-white mb-4"
                prefetch={false}
              >
                <BarChart3 className="h-5 w-5" />
                {t('sidebar.dashboard')}
              </Link>
              
              <Separator className="my-2 bg-white/20" />
              
              {/* Mercados */}
              {userMarkets.length === 0 ? (
                <div className="text-white text-center py-2">
                  <h1>{t('sidebar.noMarketsAssigned')}</h1>
                  <p className="text-sm mt-2">{t('sidebar.profile')}: {profile ? t('sidebar.yes') : t('sidebar.no')}</p>
                  <p className="text-sm">{t('sidebar.role')}: {userRole}</p>
                </div>
              ) : (
                userMarkets.map((market) => (
                  <MarketItem
                    key={market.id}
                    market_id={market.id}
                    market={market.name}
                    role={userRole}
                    t={t}
                  />
                ))
              )}
            </nav>
          )}
        </div>
        
        {/* Logout button at the bottom */}
        <div className="mt-auto p-4 border-t border-white/20">
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="w-full justify-start text-white hover:bg-white/10 hover:text-white"
          >
            <LogOut className="h-5 w-5 mr-2" />
            {t('common.logout')}
          </Button>
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
  customer: ListItem[]
  admin: ListItem[]
  agent: ListItem[]
}

const list: List = {
  customer: [
    {
      url: '/',
      nameKey: 'sidebar.cargoTrips',
    },
  ],
  admin: [
    {
      url: '/',
      nameKey: 'sidebar.cargoTrips',
    },
  ],
  agent: [
    {
      url: '/bid_list',
      nameKey: 'sidebar.cargoTrips',
    },
   /* {
      url: '/history_offers',
      nameKey: 'Histórico Propuestas',
    },*/
  ],
}

const MarketItem = ({
  market,
  role,
  market_id,
  t,
}: {
  market: string
  role: string
  market_id: number
  t: (key: string) => string
}) => {
  // Asegurarte de que role sea una clave válida
  const validRole = role as keyof List
  if (!(validRole in list)) {
    return <div>{t('sidebar.invalidRole')}: {role}</div>
  }

  const getIcon = (nameKey: string) => {
    if (nameKey === 'sidebar.cargoTrips') {
      return <Ship className="h-5 w-5" />
    }
    return null
  }

  return (
    <Accordion type="single" collapsible key={market}>
      <AccordionItem value="item-1" className="border-b border-white/20">
        <AccordionTrigger className="text-white hover:no-underline">
          {market}
        </AccordionTrigger>
        <AccordionContent>
          {list[validRole].map((item: ListItem, index: number) => (
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
