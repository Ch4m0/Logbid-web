'use client'
import { Button } from '@/src/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import { modalService } from '@/src/service/modalService'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import CreateShipment from './CreateShipment/CreateShipment'
import { ExtendShipmentDeadline } from './ExtendShipmentDeadline'
import { ShipmentFilters } from './ShipmentFilters'
import { useBidStore } from '@/src/store/useBidStore'
import { useGetShipments } from '@/src/app/hooks/useGetShipments'
import Pagination from '../../../common/components/pagination/Pagination'
import useAuthStore from '@/src/store/authStore'
import type { BidListItem } from '@/src/models/BidListItem'
import {
  Calendar,
  MapPin,
  Package,
  Clock,
  DollarSign,
  ArrowRight,
  Users,
  Filter,
} from 'lucide-react'
import { Badge } from '@/src/components/ui/badge'
import { Separator } from '@/src/components/ui/separator'
import { ShippingType } from '@/src/models/common'
import { convertToColombiaTime, formatDateUTCAsLocal, formatShippingDate } from '@/src/lib/utils'
import { useTranslation } from '@/src/hooks/useTranslation'
import CancelShipmentModal from './CancelShipmentModal'
import { X } from 'lucide-react'
import { Loader2 } from 'lucide-react'
import { supabase } from '@/src/utils/supabase/client'
import { useRealtimeShipmentsWithPagination } from '@/src/hooks/useRealtimeShipmentsWithPagination'

interface ImporterShipmentCardsProps {
  filterType: 'withoutOffers' | 'withOffers' | 'closed'
}

// Function to normalize shipping type to translation key
const normalizeShippingType = (shippingType: string) => {
  const typeMap: { [key: string]: string } = {
    'Terrestre': 'land',
    'Almacén': 'warehouse',
    '1': 'maritime',  // Marítimo en español, Sea en inglés
    '2': 'air'        // Aéreo en español, Air en inglés
  }
  return typeMap[shippingType] || shippingType.toLowerCase()
}

export function ImporterShipmentCards({ filterType }: ImporterShipmentCardsProps) {
  const router = useRouter()
  const profile = useAuthStore((state) => state.profile)
  const { setMarketData } = useBidStore()
  const [itemsPerPage] = useState(8)
  const searchParams = useSearchParams()
  const { t } = useTranslation()

  // Map filterType to status for API call
  const getStatusFromFilterType = (filterType: string) => {
    switch (filterType) {
      case 'closed':
        return 'Closed'
      case 'withOffers':
      case 'withoutOffers':
        return 'Active' // Both with and without offers use Active status, we'll filter by offers_count
      default:
        return 'Active'
    }
  }

  const status = getStatusFromFilterType(filterType)
  
  const marketId =
    searchParams.get('market') ??
    profile?.all_markets?.[0]?.id?.toString() ??
    null

  const shippingType = searchParams.get('shipping_type') || '1'

  const { data: shipmentList, refetch, isLoading, error } = useGetShipments({
    user_id: profile?.id ? Number(profile.id) : null,
    market_id: marketId,
    status,
    shipping_type: shippingType as ShippingType,
  })

  useRealtimeShipmentsWithPagination(refetch)

  useEffect(() => {
    if (profile?.id && marketId) {
      console.log('🔄 Refetching shipments...')
      refetch()
    } else {
      console.log('⏸️ Skipping refetch - missing profile or market')
    }
  }, [shippingType, profile?.id, marketId, refetch])

  const currentPage = Number(searchParams.get('page')) || 1

  const [sort, setSort] = useState({ key: 'inserted_at', order: 'desc' })

  const [showFilters, setShowFilters] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [shipmentToCancel, setShipmentToCancel] = useState<{
    uuid: string
    origin: string
    destination: string
    value?: number
    currency?: string
  } | null>(null)
  const [hasOffersForCancel, setHasOffersForCancel] = useState<boolean>(false)
  const [checkingCancelId, setCheckingCancelId] = useState<string | null>(null)

  // Filtros que el usuario está configurando (no aplicados aún)
  const [pendingFilters, setPendingFilters] = useState({
    uuid: '',
    origin: '',
    destination: '',
    inserted_at: '',
    expiration_date: '',
    value: '',
    offers_count: '',
  })

  // Filtros realmente aplicados para el filtrado
  const [appliedFilters, setAppliedFilters] = useState({
    uuid: '',
    origin: '',
    destination: '',
    inserted_at: '',
    expiration_date: '',
    value: '',
    offers_count: '',
  })

  // Helper function to determine if we should show status-based elements
  const shouldShowStatusElements = () => {
    return filterType === 'withOffers' || filterType === 'closed'
  }

  const handleFilterChange = (key: string, value: string) => {
    setPendingFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleApplyFilters = () => {
    // Aplicar los filtros pendientes
    setAppliedFilters(pendingFilters)
    console.log('Filtros aplicados:', pendingFilters)
  }

  const handleClearFilters = () => {
    const emptyFilters = {
      uuid: '',
      origin: '',
      destination: '',
      inserted_at: '',
      expiration_date: '',
      value: '',
      offers_count: '',
    }
    setPendingFilters(emptyFilters)
    setAppliedFilters(emptyFilters)
  }

  const showExtendFinalDate = (
    expiration_date: string,
    origin: string,
    destination: string,
    id: string,
    shipping_date?: string | null
  ) => {
    modalService.showModal({
      component: ExtendShipmentDeadline,
      props: {
        expiration_date: expiration_date,
        origin: origin,
        destination: destination,
        id,
        shippingType,
        shipping_date,
        onRefetch: refetch
      },
    })
  }

  const handleCancelShipment = async (
    bid: any
  ) => {
    setCheckingCancelId(bid.id.toString())
    try {
      // Consultar si existen ofertas para este shipment
      const { count, error } = await supabase
        .from('offers')
        .select('id', { count: 'exact', head: true })
        .eq('shipment_id', bid.id)

      if (error) {
        console.error('Error checking offers (cancel):', error)
      }
      const hasOffers = (count || 0) > 0
      setHasOffersForCancel(hasOffers)

      setShipmentToCancel({
        uuid: bid.uuid,
        origin: bid.origin,
        destination: bid.destination,
        value: bid.value,
        currency: bid.currency
      })
      setCancelModalOpen(true)
    } finally {
      setCheckingCancelId(null)
    }
  }

  const handleSort = (key: string) => {
    if (sort.key === key) {
      setSort((prev) => ({
        ...prev,
        order: prev.order === 'asc' ? 'desc' : 'asc',
      }))
    } else {
      setSort({ key, order: 'asc' })
    }
  }

  const goDetails = (id: string) => {
    setMarketData(marketId)
    router.push(`/detalle/?bidId=${id}&market=${marketId}`)
  }

  // Manejo de estados de carga y error
  if (!profile?.id) {
    return (
      <Card className="w-full bg-gray-50">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando perfil de usuario...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!marketId) {
    return (
      <Card className="w-full bg-gray-50">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-yellow-600 text-sm">⚠️</span>
            </div>
            <p className="text-muted-foreground">No se ha seleccionado un mercado</p>
            <p className="text-sm text-muted-foreground mt-2">Por favor, selecciona un mercado para ver los envíos</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (isLoading) {
    return (
      <Card className="w-full bg-gray-50">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando envíos...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full bg-gray-50">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-sm">❌</span>
            </div>
            <p className="text-muted-foreground">Error al cargar los envíos</p>
            <p className="text-sm text-muted-foreground mt-2">Por favor, intenta de nuevo</p>
            <Button onClick={() => refetch()} className="mt-4" variant="outline">
              Reintentar
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  const filteredList = shipmentList
    ?.filter((shipment: any) => {
      // First filter by offers count based on filterType
      let passesOfferFilter = true;
      if (filterType === 'withoutOffers') {
        passesOfferFilter = shipment.offers_count === 0;
      } else if (filterType === 'withOffers') {
        passesOfferFilter = shipment.offers_count > 0;
      }
      // For 'closed' filterType, we already filter by status in the API call
      
      if (!passesOfferFilter) {
        return false;
      }

      // Then apply other filters
      return Object.keys(appliedFilters).every((key) => {
        const filterValue = appliedFilters[key as keyof typeof appliedFilters];
        // If filter is empty or set to 'all', don't apply this filter
        if (!filterValue || filterValue.trim() === '' || filterValue === 'all') {
          return true;
        }
        
        const shipmentValue = shipment[key as keyof BidListItem];
        // Handle null/undefined values
        if (shipmentValue == null) {
          return false;
        }
        
        // Special handling for date fields
        if (key === 'inserted_at' || key === 'expiration_date') {
          const shipmentDate = new Date(shipmentValue).toISOString().split('T')[0]; // Extract YYYY-MM-DD
          return shipmentDate === filterValue;
        }
        
        // Default string comparison for other fields
        return shipmentValue
          .toString()
          .toLowerCase()
          .includes(filterValue.toLowerCase());
      })
    })
    .sort((a: any, b: any) => {
      const aValue = a[sort.key as keyof BidListItem]
      const bValue = b[sort.key as keyof BidListItem]

      // Manejar fechas especialmente
      if (sort.key === 'inserted_at' || sort.key === 'expiration_date') {
        const aDate = new Date(aValue).getTime()
        const bDate = new Date(bValue).getTime()
        return sort.order === 'asc' ? aDate - bDate : bDate - aDate
      }

      // Manejar strings
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sort.order === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      // Manejar números
      return sort.order === 'asc'
        ? Number(aValue) - Number(bValue)
        : Number(bValue) - Number(aValue)
    })

  const paginatedList = filteredList?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  ) ?? []

  const getSubtitle = () => {
    switch (filterType) {
      case 'withoutOffers':
        return t('importerShipmentCards.withoutOffers')
      case 'withOffers':
        return t('importerShipmentCards.withOffers')
      case 'closed':
        return t('importerShipmentCards.closed')
      default:
        return ''
    }
  }

  return (
    <Card className="w-full bg-gray-50">
      <CardHeader className="flex flex-col md:flex-row justify-start md:justify-between w-full space-y-3 md:space-y-0">
        <div>
        <CardTitle className="font-bold">{t(`transport.${normalizeShippingType(shippingType)}`)}</CardTitle>
        <p className="text-sm text-muted-foreground mt-1">{getSubtitle()}</p>
        </div>
        <div className="flex items-center justify-between md:justify-start md:space-x-2">
          {
            paginatedList?.length > 0 ? (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="flex items-center space-x-2"
              >
                <Filter className="h-4 w-4" />
                <span className="hidden md:inline">{showFilters ? t('common.hideFilters') : t('common.showFilters')}</span>
              </Button>
            ) : null
          }
        <CreateShipment onRefetch={refetch} />
        </div>
      </CardHeader>
      <CardContent>
        {showFilters && (
          <ShipmentFilters
            shipmentList={shipmentList}
            filters={pendingFilters}
            onFilterChange={handleFilterChange}
            onSort={handleSort}
            shouldShowStatusElements={shouldShowStatusElements()}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
          />
        )}

        <div className="space-y-4">
          {paginatedList?.map((bid) => (
            <Card
              key={bid.uuid}
              className={`w-full cursor-pointer hover:shadow-md transition-shadow border-l-4 ${
                bid.status === 'Cancelled' 
                  ? 'border-l-red-500 bg-red-50/50' 
                  : 'border-l-primary bg-white'
              }`}
              onClick={() => goDetails(bid.uuid)}
            >
              <div className="flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4">
                {/* Mobile: Top section with ID, agent code, and offers */}
                <div className="md:col-span-3 p-3 md:p-4 bg-muted/10">
                  <div className="space-y-2">
                    <Badge variant="outline" className="w-full justify-center text-xs">
                      ID: {bid.uuid.substring(0, 15)}...
                    </Badge>

                    {/* Badge de estado cancelado */}
                    {bid.status === 'Cancelled' && (
                      <Badge className="w-full justify-center text-xs bg-red-500 text-white hover:bg-red-600">
                        <X className="h-3 w-3 mr-1" />
                        {t('cargoList.cancelled')}
                      </Badge>
                    )}

                    {shouldShowStatusElements() && (
                      <Badge
                        className="w-full justify-center text-xs"
                        variant="secondary"
                      >
                        {t('cargoList.agentCode')}: {bid.agent_code}
                      </Badge>
                    )}

                    <div className="grid grid-cols-1 gap-2">
                      {shouldShowStatusElements() && (
                        <div className="flex items-center justify-center space-x-2 bg-primary/10 p-2 rounded-md">
                          <DollarSign className="h-4 w-4 text-primary" />
                          <span className="text-xs md:text-sm font-medium">
                            USD {bid.last_price}
                          </span>
                        </div>
                      )}
                      
                      <div className="flex items-center justify-center space-x-2 bg-blue-50 p-2 rounded-md">
                        <Users className="h-4 w-4 text-blue-600" />
                        <span className="text-xs md:text-sm font-medium text-blue-600">
                          {bid.offers_count} {bid.offers_count === 1 ? t('cargoList.offer') : t('cargoList.offers')}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Main content section */}
                <div className={`p-3 md:p-4 ${status === 'Closed' ? 'md:col-span-9' : 'md:col-span-6'}`}>
                  <div className="space-y-3 md:space-y-4">
                    {/* Origin and Destination - Mobile stacked, Desktop horizontal */}
                    <div className="flex flex-col md:flex-row md:items-center space-y-3 md:space-y-0 md:space-x-4">
                      <div className="flex items-center space-x-2 flex-1">
                        <MapPin className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">
                            {t('cargoList.origin')}
                          </span>
                          <span className="font-medium text-sm md:text-base">{bid.origin}</span>
                        </div>
                      </div>

                      <ArrowRight className="h-4 w-4 md:h-5 md:w-5 text-muted-foreground hidden md:block mx-auto" />
                      <div className="flex md:hidden justify-center">
                        <div className="h-px w-full bg-muted-foreground/20"></div>
                      </div>

                      <div className="flex items-center space-x-2 flex-1">
                        <MapPin className="h-4 w-4 md:h-5 md:w-5 text-destructive" />
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">
                            {t('cargoList.destination')}
                          </span>
                          <span className="font-medium text-sm md:text-base">
                            {bid.destination}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-2" />
                    
                    {/* Dates section - Mobile: 1 column, Tablet: 2 columns, Desktop: 2-3 columns */}
                    <div className={`grid gap-3 md:gap-4 
                      ${(shippingType === '1' || shippingType === '2') && bid.shipping_date 
                        ? 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3' 
                        : 'grid-cols-1 sm:grid-cols-2'}`}>
                      
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs text-muted-foreground">
                            {t('cargoList.creation')}
                          </span>
                          <span className="text-xs md:text-sm truncate">{convertToColombiaTime(bid.inserted_at)}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <div className="flex flex-col min-w-0">
                          <span className="text-xs text-muted-foreground">
                            {t('cargoList.finalization')}
                          </span>
                          <span className="text-xs md:text-sm truncate">{formatDateUTCAsLocal(bid.expiration_date)}</span>
                        </div>
                      </div>
                      
                      {(shippingType === '1' || shippingType === '2') && bid.shipping_date && (
                        <div className="flex items-center space-x-2 sm:col-span-2 lg:col-span-1">
                          <Package className="h-4 w-4 text-blue-600 flex-shrink-0" />
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs text-muted-foreground">
                              {t('cargoList.shipping')}
                            </span>
                            <span className="text-xs md:text-sm truncate">{formatShippingDate(bid.shipping_date)}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions buttons section */}
                {filterType !== 'closed' && bid.status !== 'Cancelled' && (
                  <div className="md:col-span-3 p-3 md:p-4 flex flex-col gap-2 items-center justify-center border-t md:border-t-0 md:border-l">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs md:text-sm"
                      onClick={(e) => {
                        e.stopPropagation()
                        showExtendFinalDate(
                          bid.expiration_date,
                          bid.origin,
                          bid.destination,
                          bid.id.toString(),
                          bid.shipping_date
                        )
                      }}
                    >
                      {t('common.extend')}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full text-xs md:text-sm border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                      disabled={checkingCancelId === bid.id.toString()}
                      onClick={async (e) => {
                        e.stopPropagation()
                        await handleCancelShipment(bid)
                      }}
                    >
                      {checkingCancelId === bid.id.toString() ? (
                        <span className="inline-flex items-center gap-2">
                          <Loader2 className="h-3 w-3 animate-spin" />
                          {t('cancelShipment.checkingOffers')}
                        </span>
                      ) : (
                        <>
                          <X className="h-3 w-3 mr-1" />
                          {t('common.cancel')}
                        </>
                      )}
                    </Button>
                  </div>
                )}

                {/* Información de cancelación */}
                {bid.status === 'Cancelled' && (
                  <div className="md:col-span-3 p-3 md:p-4 flex flex-col gap-2 items-center justify-center border-t md:border-t-0 md:border-l bg-red-50">
                    <div className="flex items-center gap-2 text-red-700">
                      <X className="h-4 w-4" />
                      <span className="text-xs md:text-sm font-medium">
                        {t('cargoList.cancelled')}
                      </span>
                    </div>
                    {bid.cancelled_at && (
                      <div className="text-xs text-red-600 text-center">
                        {new Date(bid.cancelled_at).toLocaleDateString()}
                      </div>
                    )}
                    {bid.cancellation_reason && (
                      <div className="text-xs text-red-600 text-center italic">
                        &ldquo;{bid.cancellation_reason}&rdquo;
                      </div>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))}

          {(filteredList?.length || 0) === 0 && (
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
              totalPages={Math.ceil((filteredList?.length || 0) / itemsPerPage)}
            />
          </Suspense>
        </div>

        {/* Cancel Shipment Modal */}
        <CancelShipmentModal
          isOpen={cancelModalOpen}
          onClose={() => {
            setCancelModalOpen(false)
            setShipmentToCancel(null)
          }}
          shipment={shipmentToCancel}
          hasOffers={hasOffersForCancel}
          onSuccess={() => {
            refetch()
          }}
        />
      </CardContent>
    </Card>
  )
}
