'use client'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { useTranslation } from '@/src/hooks/useTranslation'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Button } from '@/src/components/ui/button'
import { Card, CardContent } from '@/src/components/ui/card'
import { Ship, Package, ArrowRight, UserPlus, Building2, Globe } from 'lucide-react'
import { createSupabaseClient } from '@/src/utils/supabase/client'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'
import { Checkbox } from '@/src/components/ui/checkbox'

interface Market {
  id: number
  name: string
}

interface Company {
  id: number
  name: string
}

export default function Register() {
  const { t } = useTranslation()
  const router = useRouter()
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
    phone: '',
    role: '',
    language: 'es',
    companyId: '',
    companyName: ''
  })
  const [selectedMarkets, setSelectedMarkets] = useState<number[]>([])
  const [markets, setMarkets] = useState<Market[]>([])
  const [companies, setCompanies] = useState<Company[]>([])
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isCreatingNewCompany, setIsCreatingNewCompany] = useState(false)

  useEffect(() => {
    const loadData = async () => {
      console.log('🔄 Loading markets and companies...')
      const supabase = createSupabaseClient()
      
      console.log('📊 Fetching markets...')
      const { data: marketsData, error: marketsError } = await supabase
        .from('markets')
        .select('id, name')
        .order('name')
      
      console.log('Markets result:', { marketsData, marketsError })
      if (marketsData) {
        setMarkets(marketsData)
        console.log('✅ Markets loaded:', marketsData.length)
      } else {
        console.error('❌ No markets data:', marketsError)
      }

      console.log('🏢 Fetching companies...')
      const { data: companiesData, error: companiesError } = await supabase
        .from('companies')
        .select('id, name')
        .order('name')
      
      console.log('Companies result:', { companiesData, companiesError })
      if (companiesData) {
        setCompanies(companiesData)
        console.log('✅ Companies loaded:', companiesData.length)
      } else {
        console.error('❌ No companies data:', companiesError)
      }
    }

    loadData()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  const handleMarketToggle = (marketId: number) => {
    setSelectedMarkets(prev => 
      prev.includes(marketId)
        ? prev.filter(id => id !== marketId)
        : [...prev, marketId]
    )
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      if (formData.password !== formData.confirmPassword) {
        setError('Las contraseñas no coinciden')
        return
      }

      if (formData.password.length < 6) {
        setError('La contraseña debe tener al menos 6 caracteres')
        return
      }

      if (!formData.role) {
        setError('Debe seleccionar un rol')
        return
      }

      if (selectedMarkets.length === 0) {
        setError('Debe seleccionar al menos un mercado')
        return
      }

      const supabase = createSupabaseClient()

      // Verificar si el email ya existe
      console.log('🔍 Checking if email already exists:', formData.email)
      const { data: existingProfiles, error: checkError } = await supabase
        .from('profiles')
        .select('email, created_at')
        .eq('email', formData.email)

      console.log('Email check result:', { 
        existingProfiles, 
        checkError, 
        count: existingProfiles?.length || 0 
      })

      if (checkError) {
        console.error('❌ Error checking existing email:', checkError)
        setError('Error al verificar el email. Por favor intenta nuevamente.')
        return
      } 
      
      if (existingProfiles && existingProfiles.length > 0) {
        console.log('❌ Email already exists:', existingProfiles[0])
        setError(`Este email ya está registrado (desde ${existingProfiles[0].created_at}). Por favor usa un email diferente.`)
        return
      }

      console.log('✅ Email is available for registration')

      console.log('🔐 Creating auth user...')
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth`,
          // Deshabilitar email de confirmación para testing
          data: {
            confirm: false
          }
        }
      })

      if (authError) {
        console.error('❌ Auth creation error:', authError)
        if (authError.message.includes('User already registered')) {
          setError('Este email ya está registrado. Intenta con otro email o inicia sesión.')
        } else if (authError.code === 'over_email_send_rate_limit') {
          setError('Límite de emails alcanzado. Por favor espera unos minutos antes de registrarte nuevamente.')
        } else {
          setError('Error al crear usuario: ' + authError.message)
        }
        return
      }

      if (!authData.user) {
        setError('No se pudo crear el usuario')
        return
      }

      console.log('✅ Auth user created:', authData.user.id)

      // Esperar un momento para que la sesión se establezca completamente
      await new Promise(resolve => setTimeout(resolve, 500))

      let companyId = formData.companyId
      if (isCreatingNewCompany && formData.companyName) {
        console.log('🏢 Creating new company...')
        
        // Crear un nuevo cliente Supabase con la sesión actual
        const { data: sessionData } = await supabase.auth.getSession()
        console.log('Session status:', sessionData.session ? 'Active' : 'None')
        
        const { data: companyData, error: companyError } = await supabase
          .from('companies')
          .insert([{
            name: formData.companyName,
            email: formData.email
          }])
          .select()
          .single()

        if (companyError) {
          console.error('❌ Company creation error:', companyError)
          setError('Error al crear la empresa: ' + companyError.message)
          return
        }

        companyId = companyData.id.toString()
        console.log('✅ Company created:', companyId)
      }

      console.log('👤 Creating/updating user profile...')
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .upsert([{
          auth_id: authData.user!.id,
          email: formData.email,
          full_name: formData.fullName,
          phone: formData.phone,
          role: formData.role,
          language: formData.language,
          company_id: companyId ? parseInt(companyId) : null
        }], {
          onConflict: 'email'
        })
        .select()
        .single()

      if (profileError) {
        console.error('❌ Profile creation error:', profileError)
        if (profileError.message.includes('duplicate key value violates unique constraint "profiles_email_key"')) {
          setError('Este email ya está registrado en el sistema. Por favor usa un email diferente.')
        } else {
          setError('Error al crear el perfil: ' + profileError.message)
        }
        return
      }

      console.log('✅ Profile created:', profileData.id)

      console.log('🏢 Assigning markets...')
      const marketAssignments = selectedMarkets.map(marketId => ({
        user_id: profileData.id,
        market_id: marketId
      }))

      const { error: marketError } = await supabase
        .from('user_markets')
        .insert(marketAssignments)

      if (marketError) {
        console.error('❌ Market assignment error:', marketError)
        setError('Error al asignar mercados: ' + marketError.message)
        return
      }

      console.log('✅ Markets assigned')

              // Iniciar sesión automáticamente después del registro exitoso
        try {
          const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
            email: formData.email,
            password: formData.password
          })

          if (loginError) {
            console.error('❌ Auto-login error:', loginError)
            alert(`Usuario creado exitosamente, pero hubo un error al iniciar sesión automáticamente: ${loginError.message}. Por favor inicia sesión manualmente.`)
            router.push('/auth')
            return
          }

          if (!loginData?.user) {
            alert(`Usuario creado exitosamente, pero no se pudo obtener la información del usuario. Por favor inicia sesión manualmente.`)
            router.push('/auth')
            return
          }

        // Cargar el perfil en el store inmediatamente después del auto-login
        try {
          const { getUserProfileClient } = await import('@/src/utils/auth-client')
          const authStoreModule = await import('@/src/store/authStore')
          const authStore = authStoreModule.default
          
          const { profile: userProfile, error: profileError } = await getUserProfileClient(loginData.user.id)
          
          if (profileError) {
            console.error('❌ Error loading profile after auto-login:', profileError)
          } else if (userProfile) {
            authStore.getState().setUser(loginData.user as any)
            authStore.getState().setProfile(userProfile)
          }
        } catch (profileLoadError) {
          console.error('💥 Error loading profile after auto-login:', profileLoadError)
        }
        
        // Pequeña pausa para asegurar que todo se establezca
        await new Promise(resolve => setTimeout(resolve, 500))
        
        alert(`¡Bienvenido! Tu cuenta ha sido creada exitosamente.`)
        router.push('/graphics')
      } catch (autoLoginError) {
        console.error('💥 Auto-login catch error:', autoLoginError)
        alert(`Usuario creado exitosamente, pero hubo un error inesperado al iniciar sesión automáticamente. Por favor inicia sesión manualmente.`)
        router.push('/auth')
        return
      }

          } catch (err) {
        console.error('💥 Unexpected error:', err)
        setError('Error inesperado durante el registro')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-green-600 via-green-700 to-green-800 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative z-10 flex flex-col justify-center px-12 text-white">
          <div className="max-w-md">
            <div className="flex items-center space-x-3 mb-8">
              <div className="flex items-center justify-center w-12 h-12 bg-white/20 rounded-xl backdrop-blur-sm">
                <Ship className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-3xl font-bold">LogBid</h1>
            </div>
            
            <h2 className="text-4xl font-bold leading-tight mb-6">
              Únete a nuestra plataforma
            </h2>
            <p className="text-lg text-green-100 mb-8">
              Crea tu cuenta y comienza a conectar con importadores y agentes de carga en tiempo real.
            </p>
            
            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <UserPlus className="w-5 h-5 text-green-200" />
                <span className="text-green-100">Registro rápido y seguro</span>
              </div>
              <div className="flex items-center space-x-3">
                <Building2 className="w-5 h-5 text-green-200" />
                <span className="text-green-100">Múltiples roles disponibles</span>
              </div>
              <div className="flex items-center space-x-3">
                <Globe className="w-5 h-5 text-green-200" />
                <span className="text-green-100">Acceso a mercados internacionales</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/5 rounded-full"></div>
        <div className="absolute bottom-20 right-32 w-20 h-20 bg-white/5 rounded-full"></div>
      </div>

      <div className="flex-1 lg:w-1/2 flex items-center justify-center p-8 bg-gray-50 overflow-y-auto">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-green-600 rounded-2xl mb-4">
              <Ship className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">LogBid</h1>
          </div>

          <Card className="border-0 shadow-xl bg-white">
            <CardContent className="p-8">
              <div className="mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Crear Cuenta
                </h2>
                <p className="text-gray-600">
                  Completa el formulario para registrarte
                </p>
              </div>

              <form onSubmit={handleRegister} className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Información Personal</h3>
                  
                  <div>
                    <Label htmlFor="fullName" className="text-sm font-semibold text-gray-700 block mb-2">
                      Nombre Completo
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      placeholder="Ingresa tu nombre completo"
                      required
                      value={formData.fullName}
                      onChange={(e) => handleInputChange('fullName', e.target.value)}
                      className="h-12 border-2 border-gray-200 focus:border-green-500 focus:ring-green-500/20"
                    />
                  </div>

                  <div>
                    <Label htmlFor="email" className="text-sm font-semibold text-gray-700 block mb-2">
                      Email
                    </Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="tu@email.com"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      className="h-12 border-2 border-gray-200 focus:border-green-500 focus:ring-green-500/20"
                    />
                  </div>

                  <div>
                    <Label htmlFor="phone" className="text-sm font-semibold text-gray-700 block mb-2">
                      Teléfono
                    </Label>
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="+1234567890"
                      value={formData.phone}
                      onChange={(e) => handleInputChange('phone', e.target.value)}
                      className="h-12 border-2 border-gray-200 focus:border-green-500 focus:ring-green-500/20"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Credenciales</h3>
                  
                  <div>
                    <Label htmlFor="password" className="text-sm font-semibold text-gray-700 block mb-2">
                      Contraseña
                    </Label>
                    <Input
                      id="password"
                      type="password"
                      placeholder="Mínimo 6 caracteres"
                      required
                      autoComplete="new-password"
                      value={formData.password}
                      onChange={(e) => handleInputChange('password', e.target.value)}
                      className="h-12 border-2 border-gray-200 focus:border-green-500 focus:ring-green-500/20"
                    />
                  </div>

                  <div>
                    <Label htmlFor="confirmPassword" className="text-sm font-semibold text-gray-700 block mb-2">
                      Confirmar Contraseña
                    </Label>
                    <Input
                      id="confirmPassword"
                      type="password"
                      placeholder="Repite tu contraseña"
                      required
                      autoComplete="new-password"
                      value={formData.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className="h-12 border-2 border-gray-200 focus:border-green-500 focus:ring-green-500/20"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700 block mb-2">
                    Rol
                  </Label>
                  <Select value={formData.role} onValueChange={(value) => handleInputChange('role', value)}>
                    <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-green-500">
                      <SelectValue placeholder="Selecciona tu rol" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="customer">Cliente/Importador</SelectItem>
                      <SelectItem value="agent">Agente de Carga</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-sm font-semibold text-gray-700 block mb-2">
                    {t('auth.language')}
                  </Label>
                  <Select value={formData.language} onValueChange={(value) => handleInputChange('language', value)}>
                    <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-green-500">
                      <SelectValue placeholder={t('auth.selectLanguage')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="es">🇪🇸 {t('auth.spanish')}</SelectItem>
                      <SelectItem value="en">🇺🇸 {t('auth.english')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Empresa</h3>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="newCompany"
                      checked={isCreatingNewCompany}
                      onCheckedChange={setIsCreatingNewCompany}
                    />
                    <Label htmlFor="newCompany" className="text-sm text-gray-700">
                      Crear nueva empresa
                    </Label>
                  </div>

                  {isCreatingNewCompany ? (
                    <div>
                      <Label htmlFor="companyName" className="text-sm font-semibold text-gray-700 block mb-2">
                        Nombre de la Empresa
                      </Label>
                      <Input
                        id="companyName"
                        type="text"
                        placeholder="Nombre de tu empresa"
                        required={isCreatingNewCompany}
                        value={formData.companyName}
                        onChange={(e) => handleInputChange('companyName', e.target.value)}
                        className="h-12 border-2 border-gray-200 focus:border-green-500 focus:ring-green-500/20"
                      />
                    </div>
                  ) : (
                    <div>
                      <Label className="text-sm font-semibold text-gray-700 block mb-2">
                        Empresa Existente
                      </Label>
                      <Select value={formData.companyId} onValueChange={(value) => handleInputChange('companyId', value)}>
                        <SelectTrigger className="h-12 border-2 border-gray-200 focus:border-green-500">
                          <SelectValue placeholder="Selecciona una empresa" />
                        </SelectTrigger>
                        <SelectContent>
                          {companies.map((company) => (
                            <SelectItem key={company.id} value={company.id.toString()}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-800">Mercados</h3>
                  <div className="grid grid-cols-1 gap-3">
                    {markets.map((market) => (
                      <div key={market.id} className="flex items-center space-x-2">
                        <Checkbox
                          id={`market-${market.id}`}
                          checked={selectedMarkets.includes(market.id)}
                          onCheckedChange={() => handleMarketToggle(market.id)}
                        />
                        <Label htmlFor={`market-${market.id}`} className="text-sm text-gray-700">
                          {market.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  type="submit"
                  className="w-full h-12 bg-green-600 hover:bg-green-700 text-white font-semibold text-base rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <Package className="w-4 h-4 animate-spin" />
                      <span>Creando cuenta...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center space-x-2">
                      <span>Crear Cuenta</span>
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

                <div className="text-center pt-2">
                  <Link
                    href="/auth"
                    className="text-sm text-green-600 hover:text-green-800 font-medium transition-colors"
                    prefetch={false}
                  >
                    ¿Ya tienes cuenta? Inicia sesión
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