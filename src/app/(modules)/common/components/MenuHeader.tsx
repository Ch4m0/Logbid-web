import { Plane, Ship, Truck, Warehouse } from 'lucide-react'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'

// Definición de tipos
type TransportType = 'air' | 'sea' | 'land' | 'warehouse' | null

// Mapping for transport types to shipping_type URL parameter values
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

  // Initialize selected state based on URL parameter
  const initializeSelectedFromURL = (): TransportType => {
    const shippingParam = searchParams.get('shipping_type')

    if (shippingParam === 'Aéreo') return 'air'
    if (shippingParam === 'Marítimo') return 'sea'
    if (shippingParam === 'Terrestre') return 'land'
    if (shippingParam === 'Almacén') return 'warehouse'

    // Default to sea if not specified
    return 'sea'
  }

  // Estado para rastrear qué icono está seleccionado
  const [selected, setSelected] = useState<TransportType>(
    initializeSelectedFromURL
  )

  // Colores para cada tipo de transporte cuando están seleccionados
  const activeColors: ColorMap = {
    air: 'text-blue-500',
    sea: 'text-blue-700',
    land: 'text-green-600',
    warehouse: 'text-amber-600',
  }

  // Color para iconos no seleccionados
  const inactiveColor: string = 'text-gray-500'

  // Color por defecto (antes de cualquier selección)
  const defaultColor: string = 'text-black'

  // Función para manejar clics en iconos
  const handleSelect = (type: TransportType): void => {
    if (type === null) return

    // Always set the selected type
    setSelected(type)

    // Create new URL with updated parameters
    const currentParams = new URLSearchParams(searchParams.toString())

    // Add or update the shipping_type parameter
    currentParams.set('shipping_type', transportToShippingType[type])

    // Preserve market_id and status parameters
    const marketId = searchParams.get('market_id') || '1'
    const status = searchParams.get('status') || 'Active'

    currentParams.set('market_id', marketId)
    currentParams.set('status', status)

    // Navigate to the updated URL
    router.push(`/?${currentParams.toString()}`)
  }

  // Update selected when URL changes
  useEffect(() => {
    const newSelected = initializeSelectedFromURL()
    if (newSelected !== selected) {
      setSelected(newSelected)
    }
  }, [searchParams])

  // Función para determinar qué clase de color aplicar
  const getColorClass = (type: TransportType): string => {
    if (selected === null) {
      return defaultColor // Negro por defecto si ninguno está seleccionado
    }
    return selected === type
      ? activeColors[type as keyof ColorMap]
      : inactiveColor
  }

  return (
    <div className="flex gap-4">
      <div
        className="flex flex-col items-center cursor-pointer transition-colors duration-200"
        onClick={() => handleSelect('sea')}
      >
        <Ship className={`h-8 w-8 ${getColorClass('sea')}`} />
      </div>

      <div
        className="flex flex-col items-center cursor-pointer transition-colors duration-200"
        onClick={() => handleSelect('air')}
      >
        <Plane className={`h-8 w-8 ${getColorClass('air')}`} />
      </div>

      <div
        className="flex flex-col items-center cursor-pointer transition-colors duration-200"
        onClick={() => handleSelect('land')}
      >
        <Truck className={`h-8 w-8 ${getColorClass('land')}`} />
      </div>

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
