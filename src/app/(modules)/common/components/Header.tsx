'use client'
import { Avatar, AvatarFallback, AvatarImage } from '@/src/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import { Badge } from '@/src/components/ui/badge'
import useAuthStore from '@/src/store/authStore'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import MenuHeader from './MenuHeader'

const getInitials = (name?: string, lastName?: string) => {
  const initials =
    name && lastName ? `${name.charAt(0)}${lastName.charAt(0)}` : ''
  return initials.toUpperCase()
}

const getUserRoleLabel = (roleId?: number) => {
  switch (roleId) {
    case 2:
      return 'Importador/Exportador'
    case 3:
      return 'Agente'
    default:
      return 'Usuario'
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
  const user = useAuthStore((state) => state.user)
  const logout = useAuthStore((state) => state.logout)
  const initials = getInitials(user?.name, user?.last_name)

  const handleLogout = () => {
    logout()
    document.cookie =
      'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC;'
    router.push('/auth')
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
        <MenuHeader /> {/* Coloca el componente MenuHeader en el centro */}
      </div>
      <div className="ml-auto flex items-center gap-4">
        <div className="flex flex-col items-end gap-1">
          <span className="text-sm font-bold">
            {user?.name} {user?.last_name}
          </span>
          <Badge variant={getUserRoleVariant(user?.role_id)} className="text-xs">
            {getUserRoleLabel(user?.role_id)}
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
            {/*
            <DropdownMenuItem>My Account</DropdownMenuItem>
            <DropdownMenuItem>Settings</DropdownMenuItem>
            <DropdownMenuSeparator /> */}
            <DropdownMenuItem onClick={() => handleLogout()}>
              Salir
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  )
}

export default Header
