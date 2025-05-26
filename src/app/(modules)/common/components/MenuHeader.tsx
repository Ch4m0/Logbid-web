import { Plane, Ship, Truck, Warehouse } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import useAuthStore from '@/src/store/authStore'

type TransportType = 'air' | 'sea' | 'land' | 'warehouse' | null

const transportToShippingType = {
  air: 'Aéreo',
  sea: 'Marítimo',
  land: 'Terrestre',
  warehouse: 'Almacén',
}

interface ColorMap {
  air: string
  sea: string
  land: string
  warehouse: string
}

const MenuHeader: React.FC = () => {
  const router = useRouter()
  const searchParams = useSearchParams()
  const user = useAuthStore((state) => state.user)

  const initializeSelectedFromURL = (): TransportType => {
    const shippingParam = searchParams.get('shipping_type')

    if (shippingParam === 'Aéreo') return 'air'
    if (shippingParam === 'Marítimo') return 'sea'
    if (shippingParam === 'Terrestre') return 'land'
    if (shippingParam === 'Almacén') return 'warehouse'

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
    
    // Role 2 = Importer, Role 3 = Agent
    if (user.role_id === 3) {
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
    const marketId = searchParams.get('market_id') || 
                     searchParams.get('market') || 
                     (user?.all_markets?.[0]?.id?.toString()) || 
                     '1'
    
    const status = searchParams.get('status') || 'Active'

    currentParams.set('market_id', marketId)
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
    <div className="flex items-center gap-4">
      <div
        className="flex flex-col items-center cursor-pointer transition-colors duration-200"
        onClick={() => handleSelect('sea')}
      >
        <Ship className={`h-8 w-8 ${getColorClass('sea')}`} />
      </div>

      <div className="w-px" style={{ height: '1.5rem', backgroundColor: '#ccc' }}></div>

      <div
        className="flex flex-col items-center cursor-pointer transition-colors duration-200"
        onClick={() => handleSelect('air')}
      >
        <Plane className={`h-8 w-8 ${getColorClass('air')}`} />
      </div>

      <div className="w-px" style={{ height: '1.5rem', backgroundColor: '#ccc' }}></div>

      <div
        className="flex flex-col items-center cursor-pointer transition-colors duration-200"
        onClick={() => handleSelect('land')}
      >
        <Truck className={`h-8 w-8 ${getColorClass('land')}`} />
      </div>

      <div className="w-px" style={{ height: '1.5rem', backgroundColor: '#ccc' }}></div>

      <div
        className="flex flex-col items-center cursor-pointer transition-colors duration-200"
        onClick={() => handleSelect('warehouse')}
      >
        <Warehouse className={`h-8 w-8 ${getColorClass('warehouse')}`} />
      </div>
    </div>
  )
}

export default MenuHeader
