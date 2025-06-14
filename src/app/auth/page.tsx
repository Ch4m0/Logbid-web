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
import { Card, CardContent } from '@/src/components/ui/card'
import { Ship, Package, ArrowRight, Shield, Globe, Users } from 'lucide-react'

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
    <div className="min-h-screen flex">
      {/* Left Side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-blue-600 via-blue-700 to-blue-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="max-w-md">
            {/* Logo */}
            <div className="flex items-center space-x-3 mb-8">
              <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl backdrop-blur-sm">
                <Ship className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold">LogBid</h1>
            </div>
            
            {/* Main Message */}
            <h2 className="text-4xl font-bold leading-tight mb-6">
              Connect your business with the world
            </h2>
            <p className="text-lg text-blue-100 mb-8">
              Leading international logistics platform that connects importers and freight agents in real time.
            </p>
            
            {/* Features */}
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-blue-200" />
                <span className="text-blue-100">Secure and reliable transactions</span>
              </div>
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-blue-200" />
                <span className="text-blue-100">Global coverage</span>
              </div>
              <div className="flex items-center space-x-3">
                <Users className="w-5 h-5 text-blue-200" />
                <span className="text-blue-100">Network of verified agents</span>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative Elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/5 rounded-full"></div>
        <div className="absolute bottom-20 right-32 w-20 h-20 bg-white/5 rounded-full"></div>
      </div>

      {/* Right Side - Login Form */}
      <div className="flex-1 lg:w-1/2 flex items-center justify-center p-8 bg-gray-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-2xl mb-4">
              <Ship className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">LogBid</h1>
          </div>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  {t('auth.login')}
                </h2>
                <p className="text-gray-600">
                  {t('auth.enterEmail')}
                </p>
              </div>

              <form className="space-y-6">
                <div>
                  <Label htmlFor="email" className="text-sm font-semibold text-gray-700 block mb-2">
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
                    className="h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>

                <div>
                  <Label htmlFor="password" className="text-sm font-semibold text-gray-700 block mb-2">
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
                    className="h-12 border-2 border-gray-200 focus:border-blue-500 focus:ring-blue-500/20"
                  />
                </div>

                <Button
                  type="button"
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                  onClick={() => handleLogin()}
                  disabled={isPending}
                >
                  {isPending ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Package className="w-4 h-4 animate-spin" />
                      <span>{t('auth.loggingIn')}</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>{t('auth.login')}</span>
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </Button>

                <div className="text-center pt-2">
                  <Link
                    href="#"
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors"
                    prefetch={false}
                  >
                    {t('auth.forgotPassword')}
                  </Link>
                </div>

                {/* Status Messages */}
                {isSuccess && (
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <p className="text-green-700 text-sm text-center font-medium">
                      {t('auth.loginSuccess')}
                    </p>
                  </div>
                )}
                {isError && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm text-center font-medium">
                      Error: {error.message}
                    </p>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
