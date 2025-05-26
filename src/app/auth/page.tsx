'use client'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { useAuth } from '@/src/app/hooks/useAuth'
import { guardarEnLocalStorage } from '@/src/lib/utils'
import { useTranslation } from '@/src/hooks/useTranslation'
import useAuthStore from '@/src/store/authStore'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/src/components/ui/button'

const IMPORTER = 2
const AGENT = 3

export default function Auth() {
  const { mutate: login, isError, isSuccess, error, isPending } = useAuth()
  const { t } = useTranslation()

  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const setUser = useAuthStore((state) => state.setUser)

  const handleLogin = async () => {
    login(
      { email, password },
      {
        onSuccess: ({ user }) => {
          // Guardar usuario en Zustand
          document.cookie = `authToken=${user.uuid}; path=/;`

          setUser(user)
          // Guardar usuario y contraseña en localStorage
          handleUserRole(user.role_id, user.all_markets[0].id)
        },
      }
    )
  }

  const handleUserRole = (roleId: number, market_id: number) => {
    if (roleId === IMPORTER) {
      router.push(`/?market=${market_id}&status=Active&shipping_type=Marítimo`)
    } else if (roleId === AGENT) {
      router.push(`/bid_list?market=${market_id}&status=Active&shipping_type=Marítimo`)
    } else {
      console.log('Unknown role')
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <div className="mx-auto max-w-sm space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold text-blue-600">{t('auth.login')}</h1>
          <p className="text-gray-500 dark:text-gray-400">
            {t('auth.enterEmail')}
          </p>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="font-bold">
              {t('auth.email')}
            </Label>
            <Input
              id="email"
              type="email"
              placeholder={t('auth.emailPlaceholder')}
              autoComplete="email"
              required
              onChange={(e) => setEmail(e.target.value)}
              value={email}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="password" className="font-bold">
              {t('auth.password')}
            </Label>
            <Input
              id="password"
              type="password"
              placeholder={t('auth.passwordPlaceholder')}
              required
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <Button
            className="w-full"
            onClick={() => handleLogin()}
            disabled={isPending}
          >
            {isPending ? t('auth.loggingIn') : t('auth.login')}
          </Button>
          <Link
            href="/"
            className="inline-block w-full text-center text-sm underline"
            prefetch={false}
          >
            {t('auth.forgotPassword')}
          </Link>
          {isSuccess && <p className="text-[green]">{t('auth.loginSuccess')}</p>}
          {isError && <p className="text-[red]">Error: {error.message}</p>}
        </div>
      </div>
    </main>
  )
}
