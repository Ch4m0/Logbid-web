import { Plane, Ship, Truck, Warehouse } from 'lucide-react'
import { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import useAuthStore from '@/src/store/authStore'

type TransportType = 'air' | 'sea' | 'land' | 'warehouse' | null

const transportToShippingType = {
  air: '2',
  sea: '1',
  land: 'Terrestre',
  warehouse: 'Almacén',
}

interface ColorMap {
  air: string
  sea: string
  land: string
  warehouse: string
}

const MenuHeaderContent: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const user = useAuthStore((state) => state.user)

  const initializeSelectedFromURL = (): TransportType => {
    const shippingParam = searchParams.get('shipping_type')

    if (shippingParam === '2') return 'air'
    if (shippingParam === '1') return 'sea'
    if (shippingParam === 'Terrestre') return 'land'
    if (shippingParam === '3') return 'warehouse'

    return 'sea'
  }

  const [selected, setSelected] = useState<TransportType>(
    initializeSelectedFromURL
  )

  const activeColors: ColorMap = {
    air: 'text-blue-500',
    sea: 'text-blue-700',
    land: 'text-green-600',
    warehouse: 'text-amber-600',
  }

  const inactiveColor: string = 'text-gray-500'
  const defaultColor: string = 'text-black'

  // Get the correct base route based on user role
  const getBaseRoute = (): string => {
    if (!user) return '/'
    
    // Check user.profile.role (from Supabase) or fallback to user.role_id (legacy)
    const userRole = user.profile?.role
    
    if (userRole === 'agent') {
      return '/bid_list'
    } else {
      return '/'
    }
  }

  const handleSelect = (type: TransportType): void => {
    if (type === null) return

    setSelected(type)

    const currentParams = new URLSearchParams(searchParams.toString())

    currentParams.set('shipping_type', transportToShippingType[type])

    // Get the market_id from current params or user's first market
    const marketId = searchParams.get('market') || 
                     searchParams.get('market') || 
                     (user?.all_markets?.[0]?.id?.toString()) || 
                     '1'
    
    const status = searchParams.get('status') || 'Active'

    currentParams.set('market', marketId)
    currentParams.set('status', status)

    // Clean up any page parameter to start fresh
    currentParams.delete('page')

    // Navigate to the correct route based on user role
    const baseRoute = getBaseRoute()
    router.push(`${baseRoute}?${currentParams.toString()}`)
  }

  useEffect(() => {
    const newSelected = initializeSelectedFromURL()
    if (newSelected !== selected) {
      setSelected(newSelected)
    }
  }, [searchParams])

  const getColorClass = (type: TransportType): string => {
    if (selected === null) {
      return defaultColor 
    }
    return selected === type
      ? activeColors[type as keyof ColorMap]
      : inactiveColor
  }

  return (
    <div className="flex items-center gap-2 sm:gap-3 md:gap-4 overflow-x-auto pb-2">
      <div
        className="flex flex-col items-center cursor-pointer transition-colors duration-200 min-w-[40px] sm:min-w-[48px]"
        onClick={() => handleSelect('sea')}
      >
        <Ship className={`h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 ${getColorClass('sea')}`} />
      </div>

      <div className="w-px h-4 sm:h-5 md:h-6 bg-gray-300"></div>

      <div
        className="flex flex-col items-center cursor-pointer transition-colors duration-200 min-w-[40px] sm:min-w-[48px]"
        onClick={() => handleSelect('air')}
      >
        <Plane className={`h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 ${getColorClass('air')}`} />
      </div>

      <div className="w-px h-4 sm:h-5 md:h-6 bg-gray-300"></div>

      <div
        className="flex flex-col items-center cursor-not-allowed transition-colors duration-200 min-w-[40px] sm:min-w-[48px] opacity-50"
      >
        <Truck className={`h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-gray-400`} />
      </div>

      <div className="w-px h-4 sm:h-5 md:h-6 bg-gray-300"></div>

      <div
        className="flex flex-col items-center cursor-not-allowed transition-colors duration-200 min-w-[40px] sm:min-w-[48px] opacity-50"
      >
        <Warehouse className={`h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 text-gray-400`} />
      </div>
    </div>
  )
}

const MenuHeader: React.FC = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center gap-2 sm:gap-3 md:gap-4">
        <div className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-px h-4 sm:h-5 md:h-6 bg-gray-200"></div>
        <div className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-px h-4 sm:h-5 md:h-6 bg-gray-200"></div>
        <div className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 bg-gray-200 rounded animate-pulse"></div>
        <div className="w-px h-4 sm:h-5 md:h-6 bg-gray-200"></div>
        <div className="h-6 w-6 sm:h-7 sm:w-7 md:h-8 md:w-8 bg-gray-200 rounded animate-pulse"></div>
      </div>
    }>
      <MenuHeaderContent />
    </Suspense>
  )
}

export default MenuHeader
