'use client'
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar'
import { Badge } from '@/src/components/ui/badge'
import { Button } from '@/src/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover'
import { LanguageSelector } from '@/src/components/LanguageSelector'
import { NotificationBell } from '@/src/components/NotificationBell'
import { useTranslation } from '@/src/hooks/useTranslation'
import useAuthStore from '@/src/store/authStore'
import { Menu } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'

interface HeaderProps {
  onToggleSidebar?: () => void
}

const getInitials = (name?: string, lastName?: string) => {
  const initials =
    name && lastName ? `${name.charAt(0)}${lastName.charAt(0)}` : ''
  return initials.toUpperCase()
}

const getUserRoleLabel = (role?: string, t?: (key: string) => string) => {
  switch (role) {
    case 'customer':
      return t?.('header.userRole.customer') || 'Importador/Exportador'
    case 'agent':
      return t?.('header.userRole.agent') || 'Agente'
    default:
      return t?.('header.userRole.customer') || 'Importador/Exportador'
  }
}

const getUserRoleVariant = (role?: string): "default" | "secondary" | "destructive" | "outline" => {
  switch (role) {
    case 'customer':
      return 'default'
    case 'agent':
      return 'secondary'
    default:
      return 'default'
  }
}

const getUserRoleCustomClasses = (role?: string): string => {
  switch (role) {
    case 'customer':
      return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200'
    case 'agent':
      return 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
    default:
      return 'bg-blue-100 text-blue-800 border-blue-200 hover:bg-blue-200'
  }
}

const HeaderContent = ({ onToggleSidebar }: HeaderProps) => {
  const { user, profile } = useAuthStore()
  const searchParams = useSearchParams()
  const { t } = useTranslation()
  const [popoverOpen, setPopoverOpen] = useState(false)
  
  // Usar datos del perfil si están disponibles, sino usar datos de auth
  const fullName = profile?.full_name || (user as any)?.user_metadata?.full_name || ''
  const displayName = fullName.split(' ')[0] || ''
  const displayLastName = fullName.split(' ').slice(1).join(' ') || ''
  const displayEmail = profile?.email || user?.email || ''
  const userRole = profile?.role
  
  // Obtener el mercado actual con fallback al primer mercado del usuario
  const marketId = searchParams.get('market_id')
  const currentMarket = marketId 
    ? profile?.all_markets?.find(market => market.id.toString() === marketId)
    : profile?.all_markets?.[0] // Fallback al primer mercado si no hay market_id
  const marketName = currentMarket?.name || ''
  
  const initials = getInitials(displayName, displayLastName)

  return (
    <header className="flex items-center h-14 sm:h-16 px-3 sm:px-4 md:px-6 shrink-0 mx-auto w-full border-b bg-white">
      {/* Hamburger menu for mobile */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onToggleSidebar}
        className="lg:hidden mr-2 p-2"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <Link
        href="#"
        className="flex items-center gap-2 text-lg font-semibold md:text-base"
        prefetch={false}
      >
        <span className="sr-only">LOGBID</span>
      </Link>
      
      <div className="flex-1 flex justify-center">
        {/* MenuHeader moved to shipments views */}
      </div>
      
      <div className="ml-auto flex items-center gap-2 sm:gap-4">
        <LanguageSelector />
        <NotificationBell />
        
        {/* User info - responsive layout */}
        <div className="hidden md:flex flex-col items-end gap-1">
          <span className="text-sm font-bold truncate max-w-[150px]">
            {displayName} {displayLastName}
          </span>
          <div className="flex items-center gap-2">
            <Badge 
              variant="outline" 
              className={`text-xs ${getUserRoleCustomClasses(userRole)}`}
            >
              {getUserRoleLabel(userRole, t)}
            </Badge>
            {marketName && (
              <Badge 
                variant="outline" 
                className="text-xs bg-purple-100 text-purple-800 border-purple-200 hover:bg-purple-200 truncate max-w-[120px]"
              >
                📍 {marketName}
              </Badge>
            )}
          </div>
        </div>
        
        {/* Mobile user info - simplified with popover */}
        <div className="md:hidden flex items-center gap-2">
          <span className="text-xs font-bold truncate max-w-[100px]">
            {displayName}
          </span>
          <Popover open={popoverOpen} onOpenChange={setPopoverOpen}>
            <PopoverTrigger asChild>
              <Avatar className="h-8 w-8 cursor-pointer hover:ring-2 hover:ring-primary/20 transition-all">
                <AvatarImage src="/placeholder-user.jpg" />
                <AvatarFallback className="text-xs">
                  {initials ? <p>{initials}</p> : <p>NU</p>}
                </AvatarFallback>
              </Avatar>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3" align="end">
              <div className="space-y-2">
                <div className="text-sm font-medium">
                  {displayName} {displayLastName}
                </div>
                <div className="text-xs text-muted-foreground">
                  {displayEmail}
                </div>
                <div className="flex flex-col gap-2 pt-2 border-t">
                  <Badge 
                    variant="outline" 
                    className={`text-xs w-fit ${getUserRoleCustomClasses(userRole)}`}
                  >
                    {getUserRoleLabel(userRole, t)}
                  </Badge>
                  {marketName && (
                    <Badge 
                      variant="outline" 
                      className="text-xs bg-purple-100 text-purple-800 border-purple-200 w-fit"
                    >
                      📍 {marketName}
                    </Badge>
                  )}
                </div>
              </div>
            </PopoverContent>
          </Popover>
        </div>
        
        {/* Desktop Avatar */}
        <div className="hidden md:block">
          <Avatar className="h-8 w-8 sm:h-9 sm:w-9">
            <AvatarImage src="/placeholder-user.jpg" />
            <AvatarFallback className="text-xs">
              {initials ? <p>{initials}</p> : <p>NU</p>}
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  )
}

const Header = ({ onToggleSidebar }: HeaderProps) => {
  return (
    <Suspense fallback={
      <header className="flex items-center h-14 sm:h-16 px-3 sm:px-4 md:px-6 shrink-0 mx-auto w-full border-b bg-white">
        <div className="lg:hidden mr-2">
          <div className="h-8 w-8 bg-gray-200 rounded animate-pulse"></div>
        </div>
        <div className="flex-1 flex justify-center"></div>
        <div className="ml-auto flex items-center gap-2 sm:gap-4">
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-8 w-8 sm:h-9 sm:w-9 bg-gray-200 rounded-full animate-pulse"></div>
        </div>
      </header>
    }>
      <HeaderContent onToggleSidebar={onToggleSidebar} />
    </Suspense>
  )
}

export default Header
