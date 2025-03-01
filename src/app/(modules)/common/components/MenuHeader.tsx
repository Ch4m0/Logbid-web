import { Plane, Ship, Truck, Warehouse } from 'lucide-react'
import { useState } from 'react'

// Definición de tipos
type TransportType = 'air' | 'sea' | 'land' | 'warehouse' | null

interface ColorMap {
  air: string
  sea: string
  land: string
  warehouse: string
}

const MenuHeader: React.FC = () => {
  // Estado para rastrear qué icono está seleccionado (marítimo preseleccionado)
  const [selected, setSelected] = useState<TransportType>('sea')

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
    // Si ya está seleccionado, deseleccionar
    if (selected === type) {
      setSelected(null)
    } else {
      setSelected(type)
    }
  }

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
