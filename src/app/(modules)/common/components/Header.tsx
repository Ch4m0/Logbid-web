'use client'
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import { Badge } from '@/src/components/ui/badge'
import { LanguageSelector } from '@/src/components/LanguageSelector'
import { useTranslation } from '@/src/hooks/useTranslation'
import useAuthStore from '@/src/store/authStore'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import MenuHeader from './MenuHeader'
import { logout } from '@/src/actions/auth'

const getInitials = (name?: string, lastName?: string) => {
  const initials =
    name && lastName ? `${name.charAt(0)}${lastName.charAt(0)}` : ''
  return initials.toUpperCase()
}

const getUserRoleLabel = (roleId?: number, t?: (key: string) => string) => {
  switch (roleId) {
    case 2:
      return t?.('header.userRole.importer') || 'Importer/Exporter'
    case 3:
      return t?.('header.userRole.agent') || 'Agent'
    default:
      return t?.('header.userRole.user') || 'User'
  }
}

const getUserRoleVariant = (roleId?: number): "default" | "secondary" | "destructive" | "outline" => {
  switch (roleId) {
    case 2:
      return 'default'
    case 3:
      return 'secondary'
    default:
      return 'outline'
  }
}

const Header = () => {
  const router = useRouter()
  const { user, profile } = useAuthStore()
  const logoutStore = useAuthStore((state) => state.logout)
  
  // Usar datos del perfil si están disponibles, sino usar datos de auth
  const displayName = profile?.name || (user as any)?.user_metadata?.name || ''
  const displayLastName = profile?.last_name || (user as any)?.user_metadata?.last_name || ''
  const displayEmail = profile?.email || user?.email || ''
  const userRole = profile?.role_id
  
  const initials = getInitials(displayName, displayLastName)
  const { t } = useTranslation()

  const handleLogout = async () => {
    try {
      console.log('Iniciando proceso de logout...')
      
      // Llamar a la server action de logout
      const result = await logout()
      
      if (result.error) {
        console.error('Error al cerrar sesión:', result.error)
        // Aún así, intentamos limpiar el estado local
      }

      console.log('Logout exitoso, limpiando estado local...')
      
      // Limpiar el estado local
      logoutStore()
      
      // Redirigir al login
      console.log('Redirigiendo a login...')
      router.push('/auth')
    } catch (error) {
      console.error('Error en el proceso de logout:', error)
      // Si hay error, forzamos la limpieza y redirección de todos modos
      logoutStore()
      router.push('/auth')
    }
  }

  return (
    <header className="flex items-center h-16 px-4 shrink-0 md:px-6 mx-auto w-full ">
      <Link
        href="#"
        className="flex items-center gap-2 text-lg font-semibold md:text-base"
        prefetch={false}
      >
        <span className="sr-only">LOGBID</span>
      </Link>
      <div className="flex-1 flex justify-center">
        <MenuHeader />
      </div>
      <div className="ml-auto flex items-center gap-4">
        <LanguageSelector />
        <div className="flex flex-col items-end gap-1">
          <span className="text-sm font-bold">
            {displayName} {displayLastName}
          </span>
          <Badge variant={getUserRoleVariant(userRole)} className="text-xs">
            {getUserRoleLabel(userRole, t)}
          </Badge>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="h-9 w-9">
              <AvatarImage src="/placeholder-user.jpg" />
              <AvatarFallback>
                {initials ? <p>{initials}</p> : <p>No user data</p>}
              </AvatarFallback>
              <span className="sr-only">Toggle user menu</span>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={handleLogout}>
              {t('common.logout')}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export default Header
