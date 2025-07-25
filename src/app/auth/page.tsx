'use client'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { useTranslation } from '@/src/hooks/useTranslation'
import useAuthStore from '@/src/store/authStore'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent } from '@/src/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/src/components/ui/dialog'
import { Ship, Package, ArrowRight, Shield, Globe, Users, Mail, ArrowLeft } from 'lucide-react'
import { createSupabaseClient } from '@/src/utils/supabase/client'
import { getUserProfileClient } from '@/src/utils/auth-client'

  const CUSTOMER = 2
const AGENT = 3

export default function Auth() {
  const { t } = useTranslation()
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  // Estados para reset de contraseña
  const [resetEmail, setResetEmail] = useState('')
  const [resetError, setResetError] = useState<string | null>(null)
  const [resetSuccess, setResetSuccess] = useState(false)
  const [isResetLoading, setIsResetLoading] = useState(false)
  const [showResetDialog, setShowResetDialog] = useState(false)

  const { setUser, setProfile } = useAuthStore()

  const handleLogin = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    
    console.log('🚀 CLIENT-SIDE handleLogin called')
    console.log('📧 Email:', email)
    console.log('🔒 Password length:', password.length)
    
    try {
      setIsLoading(true)
      setError(null)

      console.log('🏗️ Creating Supabase client...')
      const supabase = createSupabaseClient()
      console.log('✅ Supabase client created')

      console.log('🔍 Attempting sign in with client...')
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      })
      
      console.log('📊 Client auth response:', { 
        hasData: !!authData, 
        hasUser: !!authData?.user, 
        hasError: !!authError,
        errorMessage: authError?.message 
      })

      if (authError) {
        console.error('❌ Client login error:', authError)
        setError(authError.message)
        return
      }

      if (!authData.user) {
        console.error('👤 No user in client auth response')
        setError('No se pudo obtener la información del usuario')
        return
      }

      console.log('✅ CLIENT Authentication successful')
      console.log('👤 User authenticated:', authData.user.email)
      
      // Establecer el usuario en el store de Zustand
      setUser(authData.user as any)

      // Obtener el perfil del usuario desde el cliente
      console.log('🔍 Fetching user profile from client...')
      const { profile, error: profileError } = await getUserProfileClient(authData.user.id)
      
      if (profile && !profileError) {
        console.log('✅ Profile fetched successfully:', profile)
        setProfile(profile as any)
      } else {
        console.error('⚠️ Could not fetch profile from client:', profileError)
        console.log('📧 User email from auth:', authData.user.email)
      }

      console.log('🎉 CLIENT Login successful, redirecting...')
      // Si el login es exitoso, redirigir al dashboard
      router.push('/graphics')
    } catch (err) {
      console.error('💥 CLIENT Unexpected error:', err)
      setError('Error inesperado durante el inicio de sesión')
    } finally {
      setIsLoading(false)
    }
  }

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      setIsResetLoading(true)
      setResetError(null)

      const supabase = createSupabaseClient()
      
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        // Manejar diferentes tipos de errores
        if (error.message.includes('over_email_send_rate_limit') || error.message.includes('email rate limit exceeded')) {
          setResetError('Has alcanzado el límite de emails. Por favor espera 1 hora antes de intentar nuevamente.')
        } else if (error.message.includes('User not found') || error.message.includes('Invalid email')) {
          setResetError('No se encontró una cuenta con este email.')
        } else {
          setResetError(error.message)
        }
        return
      }

      setResetSuccess(true)
    } catch (err) {
      console.error('Error during password reset:', err)
      setResetError('Error inesperado al enviar el email de recuperación')
    } finally {
      setIsResetLoading(false)
    }
  }

  const handleResetDialogClose = () => {
    setShowResetDialog(false)
    setResetEmail('')
    setResetError(null)
    setResetSuccess(false)
    setIsResetLoading(false)
  }

  const handleUserRole = (roleId: number, market_id: number) => {
    if (roleId === CUSTOMER) {
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
              Leading international logistics platform that connects customers and freight agents in real time.
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

              <form onSubmit={handleLogin} action="#" method="post" className="space-y-6">
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
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
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
                  type="submit"
                  className="w-full h-12 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-base rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                  disabled={isLoading}
                >
                  {isLoading ? (
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

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                    <p className="text-red-700 text-sm text-center font-medium">
                      {error}
                    </p>
                  </div>
                )}

                <div className="text-center pt-2 space-y-2">
                  <Dialog open={showResetDialog} onOpenChange={setShowResetDialog}>
                    <DialogTrigger asChild>
                      <button
                        type="button"
                        className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors block w-full cursor-pointer"
                      >
                        {t('auth.forgotPassword')}
                      </button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle className="text-xl font-semibold text-gray-900">
                          Recuperar contraseña
                        </DialogTitle>
                      </DialogHeader>
                      
                      {!resetSuccess ? (
                        <form onSubmit={handlePasswordReset} className="space-y-4">
                          <div className="text-sm text-gray-600 mb-4">
                            Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.
                          </div>
                          
                          <div>
                            <Label htmlFor="reset-email" className="text-sm font-medium text-gray-700">
                              Correo electrónico
                            </Label>
                            <Input
                              id="reset-email"
                              type="email"
                              placeholder="tu@email.com"
                              value={resetEmail}
                              onChange={(e) => setResetEmail(e.target.value)}
                              required
                              className="mt-1"
                              disabled={isResetLoading}
                            />
                          </div>

                          {resetError && (
                            <div className="p-3 bg-red-50 border border-red-200 rounded-md">
                              <p className="text-red-700 text-sm">{resetError}</p>
                            </div>
                          )}

                          <div className="flex space-x-3 pt-4">
                            <Button
                              type="button"
                              variant="outline"
                              onClick={handleResetDialogClose}
                              className="flex-1"
                              disabled={isResetLoading}
                            >
                              <ArrowLeft className="w-4 h-4 mr-2" />
                              Cancelar
                            </Button>
                            <Button
                              type="submit"
                              className="flex-1 bg-blue-600 hover:bg-blue-700"
                              disabled={isResetLoading || !resetEmail}
                            >
                              {isResetLoading ? (
                                <Package className="w-4 h-4 animate-spin mr-2" />
                              ) : (
                                <Mail className="w-4 h-4 mr-2" />
                              )}
                              {isResetLoading ? 'Enviando...' : 'Enviar enlace'}
                            </Button>
                          </div>
                        </form>
                      ) : (
                        <div className="text-center py-6">
                          <div className="mx-auto flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                            <Mail className="w-8 h-8 text-green-600" />
                          </div>
                          <h3 className="text-lg font-medium text-gray-900 mb-2">
                            ¡Email enviado!
                          </h3>
                          <p className="text-sm text-gray-600 mb-6">
                            Te hemos enviado un enlace para restablecer tu contraseña a <strong>{resetEmail}</strong>.
                            Revisa tu bandeja de entrada y sigue las instrucciones.
                          </p>
                          <Button 
                            onClick={handleResetDialogClose}
                            className="w-full bg-blue-600 hover:bg-blue-700"
                          >
                            Entendido
                          </Button>
                        </div>
                      )}
                    </DialogContent>
                  </Dialog>
                  
                  <Link
                    href="/auth/register"
                    className="text-sm text-green-600 hover:text-green-800 font-medium transition-colors block"
                    prefetch={false}
                  >
                    ¿No tienes cuenta? Regístrate
                  </Link>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
