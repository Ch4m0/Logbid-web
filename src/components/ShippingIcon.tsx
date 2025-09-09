import { TruckIcon, PlaneIcon, ShipIcon, WarehouseIcon } from "lucide-react"

interface ShippingIconProps {
  shippingType: string
  className?: string
}

// Función para mapear tipos de shipping a claves de traducción
export const getShippingTypeKey = (type: string) => {
  const typeMap: { [key: string]: string } = {
    '2': 'air',
    '1': 'maritime', 
    'Terrestre': 'land',
    'Almacén': 'warehouse'
  }
  return typeMap[type] || 'warehouse'
}

export function ShippingIcon({ shippingType, className = "h-5 w-5 text-muted-foreground" }: ShippingIconProps) {
  const typeKey = getShippingTypeKey(shippingType)
  
  switch (typeKey) {
    case "air":
      return <PlaneIcon className={className} />
    case "maritime":
      return <ShipIcon className={className} />
    case "land":
      return <TruckIcon className={className} />
    case "warehouse":
    default:
      return <WarehouseIcon className={className} />
  }
}
