'use client'
import { Button } from '@/src/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import { Input } from '@/src/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/components/ui/table'
import { useTranslation } from '@/src/hooks/useTranslation'
import { convertToColombiaTime, formatDateUTCAsLocal, formatPrice, formatShippingDate, formatStatus } from '@/src/lib/utils'
import useAuthStore from '@/src/store/authStore'
import {
  ArrowRight,
  Loader2,
  MoreVertical,
  Plane,
  Search,
  Ship,
  Truck,
  X
} from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { ShipmentFilters } from './ShipmentFilters'
import { StatusShipmentHistorical } from './StatusShipmentHistorical'

// Hook personalizado para debounce
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

interface ShipmentTableProps {
  title: string
  subtitle: string
  shipments: any[]
  onShowFilters?: () => void
  onCreateNew?: () => void
  onExtendDeadline?: (
    expiration_date: string,
    origin: string,
    destination: string,
    id: string,
    shipping_date?: string | null
  ) => void
  onCancelShipment?: (bid: any) => Promise<void>
  onGoDetails?: (id: string) => void
  checkingCancelId?: string | null
  showCreateButton?: boolean
  filterType?: 'withoutOffers' | 'withOffers' | 'closed'
  createShipmentComponent?: React.ReactNode
  isLoading?: boolean
  // Props para filtros
  filters?: {
    uuid: string
    origin: string
    destination: string
    inserted_at: string
    expiration_date: string
    value: string
    offers_count: string
  }
  onFilterChange?: (key: string, value: string) => void
  onApplyFilters?: () => void
  onClearFilters?: () => void
}

// Function to get transport icon
const getTransportIcon = (shippingType: string) => {
  switch (shippingType) {
    case '1':
      return <Ship className="h-4 w-4 text-blue-600" />
    case '2':
      return <Plane className="h-4 w-4 text-blue-600" />
    case 'Terrestre':
      return <Truck className="h-4 w-4 text-blue-600" />
    default:
      return <Ship className="h-4 w-4 text-blue-600" />
  }
}

const listStatus = ['Closed', 'Cancelled', 'Expired']

const isStatusClosed = (status: string) => {
  return listStatus.includes(status)
}

export function ShipmentTable({
  title,
  subtitle,
  shipments,
  onShowFilters,
  onCreateNew,
  onExtendDeadline,
  onCancelShipment,
  onGoDetails,
  checkingCancelId,
  showCreateButton = true,
  filterType = 'withoutOffers',
  createShipmentComponent,
  isLoading = false,
  filters,
  onFilterChange,
  onApplyFilters,
  onClearFilters
}: ShipmentTableProps) {
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  const user = useAuthStore((state) => state.user)
  
  // Estado del buscador con persistencia en URL
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '')
  
  // Estado para mostrar/ocultar filtros
  const [showFilters, setShowFilters] = useState(false)
  
  // Debounce del término de búsqueda (300ms de delay)
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  
  // Función para determinar si hay filtros activos
  const hasActiveFilters = () => {
    if (debouncedSearchTerm.trim()) return true
    if (!filters) return false
    
    return Object.values(filters).some(value => value && value.trim() !== '' && value !== 'all')
  }
  
  // Actualizar URL cuando cambie el término de búsqueda (solo si tiene 3+ caracteres o está vacío)
  useEffect(() => {
    const currentSearchTerm = searchParams.get('search') || ''
    
    // Solo actualizar si el término de búsqueda realmente cambió
    if (debouncedSearchTerm !== currentSearchTerm) {
      const params = new URLSearchParams(searchParams)
      if (debouncedSearchTerm && debouncedSearchTerm.length >= 3) {
        params.set('search', debouncedSearchTerm)
        // Resetear paginación cuando se hace una nueva búsqueda
        params.set('page', '1')
      } else {
        params.delete('search')
        // También resetear paginación cuando se limpia la búsqueda
        params.set('page', '1')
      }
      router.replace(`${pathname}?${params.toString()}`)
    }
  }, [debouncedSearchTerm, router, pathname, searchParams])
  

  return (
    <Card className="border-0 shadow-sm  flex flex-col">
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">{title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>
          </div>
          <div className="flex items-center space-x-2">
            {filters && onFilterChange && (
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)}>
                <Search className="h-4 w-4 mr-2" />
                {showFilters ? t('common.hideFilters') : t('common.showFilters')}
              </Button>
            )}
            {createShipmentComponent}
          </div>
        </div>
      </CardHeader>

      {!isLoading && shipments.length === 0 && (
          <div className="text-center py-8 flex-1 flex items-center justify-center">
            <p className="text-muted-foreground">
              {hasActiveFilters() 
                ? t('common.noSearchResults') 
                : t('cargoList.noCargoTripsMessage')
              }
            </p>
          </div>
        )} 

      {(!isLoading && shipments.length > 0) && (
        <CardContent className="p-3 flex-1">
        <div className="mb-6 space-y-4">
          <Input
            placeholder={t('common.searchPlaceholder')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="max-w-md"
          />
          
          {/* Filtros integrados */}
          {showFilters && filters && onFilterChange && (
            <ShipmentFilters
              shipmentList={shipments}
              filters={filters}
              onFilterChange={onFilterChange}
              shouldShowStatusElements={true}
              onApplyFilters={onApplyFilters}
              onClearFilters={onClearFilters}
            />
          )}
        </div>
        <div className="overflow-x-auto bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-white">
                <TableHead className="w-[80px] min-w-[80px] px-2">{t('common.type')}</TableHead>
                <TableHead className="w-[120px] min-w-[120px] px-2">ID</TableHead>
                <TableHead className="w-[180px] min-w-[180px] px-2">{t('cargoList.origin')}</TableHead>
                <TableHead className="w-[10px] min-w-[10px] px-2"></TableHead>
                <TableHead className="w-[180px] min-w-[180px] px-2">{t('cargoList.destination')}</TableHead>
                { filterType !== 'withoutOffers' && (
                  <TableHead className="w-[180px] min-w-[110px] px-2">{t('cargoList.lowestPrice')}</TableHead>
                )}
                {filterType === 'withoutOffers' && (
                  <TableHead className="w-[120px] min-w-[120px] px-2">{t('cargoList.creation')}</TableHead>
                )}
                <TableHead className="w-[120px] min-w-[120px] px-2">{t('cargoList.finalization')}</TableHead>
                <TableHead className="w-[110px] min-w-[110px] px-2">{t('cargoList.shipping')}</TableHead>
                <TableHead className="w-[40px] min-w-[20px] sticky right-0 bg-white border-l-2 border-gray-200 z-10">{t('common.actions')}</TableHead>
              </TableRow>
            </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8">
                  <div className="flex items-center justify-center space-x-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span className="text-muted-foreground">{t('common.loading')}</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              shipments.map((shipment: any) => (
              <TableRow 
                key={shipment.id} 
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => onGoDetails?.(shipment.uuid)}
              >
                {/* Tipo de Transporte */}
                <TableCell className="px-2">
                  <div className="flex items-center">
                    {getTransportIcon(shipment.shipping_type || '1')}
                    <span className="font-medium text-sm">{shipment.transportation}</span>
                  </div>
                </TableCell>

                {/* ID y Ofertas */}
                <TableCell className="px-2">
                  <div className="space-y-1">
                    <p className="text-xs text-muted-foreground font-mono">{shipment.uuid?.substring(0, 12)}...</p>
                    {filterType !== 'withoutOffers' && (shipment.offers_count || 0) > 0 && (
                      <div className="flex items-center space-x-1">
                        <span className="text-blue-600 text-xs">👥</span>
                        <span className="text-blue-600 font-medium text-xs">{shipment.offers_count} {t('common.offers')}</span>
                      </div>
                    )}
                  </div>
                </TableCell>

                {/* Origen */}
                <TableCell className="px-2">
                  <div className="flex items-center space-x-1">
                    <span className="text-lg">{shipment.origin_flag || '🏳️'}</span>
                    <div>
                      <p className="font-medium text-sm">{shipment.origin}</p>
                    </div>
                  </div>
                </TableCell>

                {/* Flecha */}
                <TableCell className="text-center px-2">
                  <ArrowRight className="h-4 w-4 text-muted-foreground" />
                </TableCell>

                {/* Destino */}
                <TableCell className="px-2">
                  <div className="flex items-center space-x-1">
                    <span className="text-lg">{shipment.destination_flag || '🏳️'}</span>
                    <div>
                      <p className="font-medium text-sm">{shipment.destination}</p>
                    </div>
                  </div>
                </TableCell>

                {/* Precio más bajo */}
                {
                  filterType !== 'withoutOffers' && (
                  <TableCell className="px-2">
                    <p className="text-sm font-mono space-x-1">{formatPrice(shipment.min_offer_price, shipment.currency)}</p>
                  </TableCell>
                )}

                {/* Fecha de Inicio */}
                {
                  filterType === 'withoutOffers' && (
                  <TableCell className="px-2">
                    <p className="text-sm font-mono space-x-1">{convertToColombiaTime(shipment.inserted_at)}</p>
                  </TableCell>
                )}

                {/* Cierre de Subasta */}
                <TableCell className="px-2">
                  <p className="text-sm font-mono space-x-1">{formatDateUTCAsLocal(shipment.expiration_date)}</p>
                </TableCell>

                {/* Fecha de Embarque */}
                <TableCell className="px-2">
                  <p className="text-sm font-mono space-x-1">
                    {shipment.shipping_date ? formatShippingDate(shipment.shipping_date) : 'N/A'}
                  </p>
                </TableCell>

                <TableCell className="sticky right-0 bg-white border-l-2 border-gray-200 z-10 px-2">
                  {!isStatusClosed(shipment.status) ? (
                    <div className="flex items-center space-x-1">
                      {/* Si el usuario es agente y el shipment está activo, mostrar solo botón Cotizar */}
                      {user?.profile?.role === 'agent' && shipment.status === 'Active' ? (
                        <Button 
                          variant="default" 
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation()
                            const marketId = searchParams.get('market') || user?.all_markets?.[0]?.id?.toString()
                            const shippingType = searchParams.get('shipping_type') || '1'
                            router.push(`/offers?shipment_id=${shipment.uuid}&market=${marketId}&shipping_type=${shippingType}`)
                          }}
                        >
                          {t('common.quote')}
                        </Button>
                      ) : (
                        /* Dropdown menu original para importadores o otros casos */
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation()
                                if (onGoDetails) {
                                  onGoDetails(shipment.uuid)
                                }
                              }}
                            >
                              {t('common.showDetails')}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={(e) => {
                                e.stopPropagation()
                                if (onExtendDeadline) {
                                  onExtendDeadline(
                                    shipment.expiration_date,
                                    shipment.origin,
                                    shipment.destination,
                                    shipment.id.toString(),
                                    shipment.shipping_date
                                  )
                                }
                              }}
                            >
                              {t('common.extend')}
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive"
                              disabled={checkingCancelId === shipment.id.toString()}
                              onClick={async (e) => {
                                e.stopPropagation()
                                if (onCancelShipment) {
                                  await onCancelShipment(shipment)
                                }
                              }}
                            >
                              {checkingCancelId === shipment.id.toString() ? (
                                <span className="flex items-center gap-2">
                                  <Loader2 className="h-3 w-3 animate-spin" />
                                  {t('cancelShipment.checkingOffers')}
                                </span>
                              ) : (
                                t('common.cancel')
                              )}
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  ) : (
                    <StatusShipmentHistorical status={shipment.status} />
                  )}
                </TableCell>
              </TableRow>
              ))
            )}
          </TableBody>
        </Table>
        </div>
        

      </CardContent>
      )}
    </Card>
  )
}
