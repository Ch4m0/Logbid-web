'use client'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import { convertToColombiaTime, formatDateUTCAsLocal, formatShippingDate } from '@/src/lib/utils'
import { useGetBidListByMarket } from '@/src/app/hooks/useGetBidListByMarket'
import useAuthStore from '@/src/store/authStore'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import Pagination from '../../../common/components/pagination/Pagination'
import { ShippingType } from '@/src/models/common'
import { Button } from '@/src/components/ui/button'
import { ArrowRight, Calendar, Clock, DollarSign, MapPin, Package, Users, Filter } from 'lucide-react'
import { Badge } from '@/src/components/ui/badge'
import { Separator } from '@/src/components/ui/separator'
import { useTranslation } from '@/src/hooks/useTranslation'
import { ShipmentFilters } from '@/src/app/(modules)/(importers)/(home)/components/ShipmentFilters'
import { format } from 'date-fns'
import { useRealtimeShipmentsWithPagination } from '@/src/hooks/useRealtimeShipmentsWithPagination'

interface ShipmentData {
  id: string
  inserted_at: string
  uuid: string
  shipping_type: string
  origin: string
  destination: string
  offers_count: number
  origin_country: string
  origin_name: string
  destination_country: string
  destination_name: string
  expiration_date: string
  shipping_date?: string | null
  agent_code?: string
  last_price?: number | null
  value?: number | null
  status?: string
}

interface AgentShipmentListProps {
  status: 'Active' | 'Closed' | 'Offered' | 'WithoutOffers' | 'WithOffers'
}

const normalizeShippingType = (shippingType: string) => {
  const typeMap: { [key: string]: string } = {
    'Marítimo': 'maritime',
    'Aéreo': 'air',
    'Terrestre': 'land',
    'Almacén': 'warehouse'
  }
  return typeMap[shippingType] || shippingType.toLowerCase()
}

export function AgentShipmentList({ status }: AgentShipmentListProps) {
  console.log('🔧 AGENT COMPONENT: Iniciando componente AgentShipmentList con status:', status)
  
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const user = useAuthStore((state) => state.user)
  const router = useRouter()
  
  console.log('🔧 AGENT COMPONENT: Usuario cargado:', { 
    userId: user?.id, 
    markets: user?.all_markets?.length,
    firstMarket: user?.all_markets?.[0]?.id 
  })

  const marketId =
    searchParams.get('market_id') ??
    user?.all_markets[0]?.id?.toString() ??
    null

  const shippingType = searchParams.get('shipping_type') || 'Marítimo'

  console.log('🔍 DEBUGGING: Parámetros para useGetBidListByMarket:', {
    marketId,
    status,
    userId: user?.id,
    shippingType
  })

  const { data: shipmentList, refetch, isLoading, error } = useGetBidListByMarket(
    marketId,
    status,
    user?.id || null,
    shippingType as ShippingType
  )
  
  // Hook híbrido - detecta nuevos shipments automáticamente (Realtime + Polling fallback)
  useRealtimeShipmentsWithPagination(refetch)

  console.log('🔍 DEBUGGING: Resultado de query:', { 
    shipmentList, 
    isLoading, 
    error,
    listLength: shipmentList?.length,
    queryEnabled: !!marketId,
    marketIdExists: !!marketId,
    userExists: !!user?.id
  })

  const [filters, setFilters] = useState({
    uuid: 'all',
    origin_name: 'all',
    destination_name: 'all',
    inserted_at: '',
    expiration_date: '',
    value: '',
    offers_count: '',
  })

  const currentPage = Number(searchParams.get('page')) || 1
  const [sort, setSort] = useState({ key: '', order: '' })
  const [showFilters, setShowFilters] = useState(false)
  const [itemsPerPage] = useState(10)

  const handleFilterChange = (key: string, value: string) => {
    const keyMap: { [key: string]: string } = {
      origin: 'origin_name',
      destination: 'destination_name'
    }
    const mappedKey = keyMap[key] || key
    setFilters(prev => ({ ...prev, [mappedKey]: value }))
  }

  const handleViewShipment = (uuid: string) => {
    router.push(`/offers?offer_id=${uuid}&market_id=${marketId}&shipping_type=${shippingType}`)
  }

  const handleSort = (key: string) => {
    const keyMap: { [key: string]: string } = {
      origin: 'origin_name',
      destination: 'destination_name'
    }
    const mappedKey = keyMap[key] || key

    if (sort.key === mappedKey) {
      setSort((prev) => ({
        ...prev,
        order: prev.order === 'asc' ? 'desc' : 'asc',
      }))
    } else {
      setSort({ key: mappedKey, order: 'asc' })
    }
  }

  const filteredList = shipmentList
    ?.filter((shipment: ShipmentData) => {
      if (status === 'WithoutOffers' && shipment.offers_count > 0) {
        return false
      }
      if (status === 'WithOffers' && shipment.offers_count === 0) {
        return false
      }
      
      const filterChecks = {
        uuid: () => {
          if (!filters.uuid || filters.uuid === 'all') return true;
          return shipment.uuid.toLowerCase().includes(filters.uuid.toLowerCase());
        },
        origin_name: () => {
          if (!filters.origin_name || filters.origin_name === 'all') return true;
          const fullOrigin = `${shipment.origin_country} - ${shipment.origin_name}`.toLowerCase();
          return fullOrigin.includes(filters.origin_name.toLowerCase());
        },
        destination_name: () => {
          if (!filters.destination_name || filters.destination_name === 'all') return true;
          const fullDestination = `${shipment.destination_country} - ${shipment.destination_name}`.toLowerCase();
          return fullDestination.includes(filters.destination_name.toLowerCase());
        },
        inserted_at: () => {
          if (!filters.inserted_at) return true;
          try {
            const filterDate = filters.inserted_at;
            const shipmentDate = format(new Date(shipment.inserted_at), 'yyyy-MM-dd');
            return shipmentDate === filterDate;
          } catch (error) {
            console.error('Error comparing inserted_at dates:', error);
            return true;
          }
        },
        expiration_date: () => {
          if (!filters.expiration_date) return true;
          try {
            const filterDate = filters.expiration_date;
            const shipmentDate = format(new Date(shipment.expiration_date), 'yyyy-MM-dd');
            return shipmentDate === filterDate;
          } catch (error) {
            console.error('Error comparing expiration dates:', error);
            return true;
          }
        },
        value: () => {
          if (!filters.value) return true;
          return String(shipment.value || '').includes(filters.value);
        },
        offers_count: () => {
          if (!filters.offers_count) return true;
          return String(shipment.offers_count).includes(filters.offers_count);
        }
      };

      return Object.keys(filterChecks).every(key => filterChecks[key as keyof typeof filterChecks]());
    })

  // Solo aplicar ordenamiento si el usuario ha seleccionado una columna específica
  const sortedList = sort.key && sort.order 
    ? filteredList?.sort((a: ShipmentData, b: ShipmentData) => {
        const aValue = a[sort.key as keyof ShipmentData]
        const bValue = b[sort.key as keyof ShipmentData]

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sort.order === 'asc'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue)
        }

        return sort.order === 'asc'
          ? Number(aValue || 0) - Number(bValue || 0)
          : Number(bValue || 0) - Number(aValue || 0)
      })
    : filteredList

  const paginatedList = sortedList?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  const STATUS = ['Offered', 'Closed']

  // Debug: Detectar cambios en datos
  useEffect(() => {
    console.log('🔍 DEBUGGING: shipmentList cambió:', {
      length: shipmentList?.length,
      isArray: Array.isArray(shipmentList),
      firstItem: shipmentList?.[0]?.uuid
    })
  }, [shipmentList])

  // Debug: Detectar cambios en parámetros
  useEffect(() => {
    console.log('🔍 DEBUGGING: Parámetros cambiaron, haciendo refetch...', {
      shippingType,
      marketId,
      status
    })
    refetch()
  }, [shippingType, refetch, marketId, status])

  // Debug: Detectar eventos de realtime removido

  return (
    <Card className="w-full">
      <CardHeader className="flex justify-between flex-row w-full">
        <CardTitle className="font-bold">{t(`transport.${normalizeShippingType(shippingType)}`)}</CardTitle>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2"
        >
          <Filter className="h-4 w-4" />
          <span>{showFilters ? t('common.hideFilters') : t('common.showFilters')}</span>
        </Button>
      </CardHeader>
      <CardContent>
        {showFilters && (
          <ShipmentFilters
            shipmentList={shipmentList?.map(shipment => ({
              ...shipment,
              origin: `${shipment.origin_country} - ${shipment.origin_name}`,
              destination: `${shipment.destination_country} - ${shipment.destination_name}`
            }))}
            filters={{
              uuid: filters.uuid,
              origin: filters.origin_name,
              destination: filters.destination_name,
              inserted_at: filters.inserted_at,
              expiration_date: filters.expiration_date,
              value: filters.value,
              offers_count: filters.offers_count
            }}
            onFilterChange={handleFilterChange}
            onSort={handleSort}
            shouldShowStatusElements={STATUS.includes(status)}
          />
        )}

        <div className="space-y-4">
          {paginatedList?.map((shipment: ShipmentData) => (
            <Card
              key={shipment.uuid}
              className="w-full cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-primary"
              onClick={() => handleViewShipment(shipment.uuid)}
            >
              <div className="flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4">
                {/* Mobile: Top section with ID, agent code, price and offers */}
                <div className="md:col-span-3 p-3 md:p-4 bg-muted/10">
                  <div className="space-y-2">
                    <Badge variant="outline" className="w-full justify-center text-xs">
                      ID: {shipment.uuid.substring(0, 15)}...
                    </Badge>
                    
                    {STATUS.includes(status) && (
                      <Badge
                        className="w-full justify-center text-xs"
                        variant="secondary"
                      >
                        {t('cargoList.agentCode')}: {shipment.agent_code}
                      </Badge>
                    )}
                    
                    <div className="grid grid-cols-1 gap-2">
                      {STATUS.includes(status) && (
                        <div className="flex items-center justify-center space-x-2 bg-primary/10 p-2 rounded-md">
                          <DollarSign className="h-4 w-4 text-primary" />
                          <span className="text-xs md:text-sm font-medium">
                            USD {shipment.last_price}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-center space-x-2 bg-blue-50 p-2 rounded-md">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span className="text-xs md:text-sm font-medium text-blue-600">
                          {shipment.offers_count} {shipment.offers_count === 1 ? t('cargoList.offer') : t('cargoList.offers')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main content section */}
                <div className="md:col-span-9 p-3 md:p-4">
                  <div className="space-y-3 md:space-y-4">
                    {/* Origin and Destination - Mobile stacked, Desktop horizontal */}
                    <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
                      <div className="flex items-center space-x-2 flex-1">
                        <MapPin className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs text-muted-foreground">
                            {t('cargoList.origin')}
                          </span>
                          <span className="font-medium text-sm md:text-base truncate">
                            {shipment.origin_country} - {shipment.origin_name}
                          </span>
                        </div>
                      </div>
                      
                      <ArrowRight className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground hidden md:block mx-auto" />
                      <div className="flex md:hidden justify-center">
                        <div className="h-px w-full bg-muted-foreground/20"></div>
                      </div>
                      
                      <div className="flex items-center space-x-2 flex-1">
                        <MapPin className="h-4 w-4 md:h-5 md:w-5 text-destructive" />
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs text-muted-foreground">
                            {t('cargoList.destination')}
                          </span>
                          <span className="font-medium text-sm md:text-base truncate">
                            {shipment.destination_country} - {shipment.destination_name}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-2" />

                    {/* Dates section - Mobile: 1 column, Tablet: 2 columns, Desktop: 2-3 columns */}
                    <div className={`grid gap-3 md:gap-4 
                      ${(shippingType === 'Marítimo' || shippingType === 'Aéreo') && shipment.shipping_date 
                        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                        : 'grid-cols-1 sm:grid-cols-2'}`}>
                      
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs text-muted-foreground">
                            {t('cargoList.creation')}
                          </span>
                          <span className="text-xs md:text-sm truncate">{convertToColombiaTime(shipment.inserted_at)}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs text-muted-foreground">
                            {t('cargoList.finalization')}
                          </span>
                          <span className="text-xs md:text-sm truncate">{formatDateUTCAsLocal(shipment.expiration_date)}</span>
                        </div>
                      </div>
                      
                      {(shippingType === 'Marítimo' || shippingType === 'Aéreo') && shipment.shipping_date && (
                        <div className="flex items-center space-x-2 sm:col-span-2 lg:col-span-1">
                          <Package className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs text-muted-foreground">
                              {t('cargoList.shipping')}
                            </span>
                            <span className="text-xs md:text-sm truncate">{formatShippingDate(shipment.shipping_date)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          ))}

          {(sortedList?.length || 0) === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-2 text-lg font-medium">
                {t('cargoList.noCargoTrips')}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t('cargoList.noCargoTripsMessage')}
              </p>
            </div>
          )}
        </div>

        <div className="w-full flex justify-end mt-6">
          <Suspense fallback={<div>Loading...</div>}>
            <Pagination
              totalPages={Math.ceil((sortedList?.length || 0) / itemsPerPage)}
            />
          </Suspense>
        </div>
      </CardContent>
    </Card>
  )
}