'use client'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/src/components/ui/accordion'
import { Separator } from '@/src/components/ui/separator'
import { Ship, BarChart3, Package, LogOut, X } from 'lucide-react'
import { useTranslation } from '@/src/hooks/useTranslation'
import useAuthStore from '@/src/store/authStore'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { logout } from '@/src/actions/auth'
import { Button } from '@/src/components/ui/button'
import Image from 'next/image'

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

const Sidebar = ({ isOpen = false, onClose }: SidebarProps) => {
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

  const handleLinkClick = () => {
    // Cerrar sidebar en móvil cuando se hace clic en un link
    if (onClose) {
      onClose()
    }
  }

  return (
    <>
      {/* Sidebar for desktop */}
      <div className={`
        fixed left-0 top-0 w-[16rem] h-screen border-r border-blue-200 z-40
        hidden lg:block
      `}
      style={{ background: 'linear-gradient(90deg, #4916A2 50%, #4A57D9 100%)' }}>
        <SidebarContent 
          user={user}
          profile={profile}
          userMarkets={userMarkets}
          userRole={userRole}
          handleLogout={handleLogout}
          handleLinkClick={handleLinkClick}
          t={t}
        />
      </div>

      {/* Sidebar for mobile/tablet */}
      <div className={`
        fixed left-0 top-0 w-[240px] sm:w-[280px] border-r border-blue-200 z-40
        lg:hidden transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        flex flex-col h-screen
      `}
      style={{ background: 'linear-gradient(90deg, #4916A2 50%, #4A57D9 100%)' }}>
        <div className="flex items-center justify-center h-20 px-4 pb-4">
        <Link href="https://logbid.co" className="flex items-center gap-3" prefetch={false} >
            <div className="flex items-center">
              <span className="text-2xl font-black transition-colors text-white">LogBid</span>
            </div>
          </Link>
        </div>
        <div className="flex justify-end px-4 pb-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="text-white hover:bg-white/10 p-2"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>
        
        <SidebarContent 
          user={user}
          profile={profile}
          userMarkets={userMarkets}
          userRole={userRole}
          handleLogout={handleLogout}
          handleLinkClick={handleLinkClick}
          t={t}
          isMobile={true}
        />
      </div>
    </>
  )
}

interface SidebarContentProps {
  user: any
  profile: any
  userMarkets: any[]
  userRole: string
  handleLogout: () => void
  handleLinkClick: () => void
  t: (key: string) => string
  isMobile?: boolean
}

const SidebarContent = ({ 
  user, 
  profile, 
  userMarkets, 
  userRole, 
  handleLogout, 
  handleLinkClick, 
  t,
  isMobile = false 
}: SidebarContentProps) => {
  return (
    <div className="flex flex-col h-full">
      {!isMobile && (
        <div className="flex items-center justify-center h-25 px-4 pb-5 pt-10 mb-8">
          <Link href="https://logbid.co" className="flex items-center gap-3" prefetch={false} >
            <div className="flex items-center">
              <span className="text-2xl font-black transition-colors text-white">LogBid</span>
            </div>
          </Link>
        </div>
      )}
      
      <div className="flex-1 overflow-auto">
        {!user ? (
          <h1 className="text-white text-center p-4">{t('sidebar.loading')}</h1>
        ) : (
          <nav className="grid gap-1 px-4 py-2">
            {/* Dashboard Global - Fuera de mercados */}
            <Link
              href="/graphics"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm sm:text-md font-bold hover:bg-white/20 hover:text-white text-white mb-2"
              prefetch={false}
              onClick={handleLinkClick}
            >
              <BarChart3 className="h-4 w-4 sm:h-5 sm:w-5" />
              {t('sidebar.dashboard')}
            </Link>
            
            <Separator className="my-2 bg-white/20" />
            
            {/* Mercados */}
            {userMarkets.length === 0 ? (
              <div className="text-white text-center py-2">
                <h1 className="text-sm">{t('sidebar.noMarketsAssigned')}</h1>
                <p className="text-xs mt-2">{t('sidebar.profile')}: {profile ? t('sidebar.yes') : t('sidebar.no')}</p>
                <p className="text-xs">{t('sidebar.role')}: {userRole}</p>
              </div>
            ) : (
              userMarkets.map((market) => (
                <MarketItem
                  key={market.id}
                  market_id={market.id}
                  market={market.name}
                  role={userRole}
                  t={t}
                  onLinkClick={handleLinkClick}
                  isMobile={isMobile}
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
          className="w-full justify-start text-white hover:bg-white/10 hover:text-white text-sm"
        >
          <LogOut className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
          {t('common.logout')}
        </Button>
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
  agent: ListItem[]
}

const list: List = {
  customer: [
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
  onLinkClick,
  isMobile = false
}: {
  market: string
  role: string
  market_id: number
  t: (key: string) => string
  onLinkClick: () => void
  isMobile?: boolean
}) => {
  // Asegurarte de que role sea una clave válida
  const validRole = role as keyof List
  if (!(validRole in list)) {
    return <div className="text-white text-xs">{t('sidebar.invalidRole')}: {role}</div>
  }

  const getIcon = (nameKey: string) => {
    if (nameKey === 'sidebar.cargoTrips') {
      return <Ship className={`h-4 w-4 ${isMobile ? 'sm:h-5 sm:w-5' : 'sm:h-5 sm:w-5'}`} />
    }
    return null
  }

  return (
    <Accordion type="single" collapsible key={market}>
      <AccordionItem value="item-1" className="border-b border-white/20">
        <AccordionTrigger className="text-white hover:no-underline text-sm sm:text-base">
          {market}
        </AccordionTrigger>
        <AccordionContent>
          {list[validRole].map((item: ListItem, index: number) => (
            <Link
              key={index}
              href={`${item.url}?market=${market_id}`}
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm sm:text-md font-bold hover:bg-white/20 hover:text-white text-white"
              prefetch={false}
              onClick={onLinkClick}
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
