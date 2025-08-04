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
    searchParams.get('market_id') ??
    profile?.all_markets?.[0]?.id?.toString() ??
    null

  const shippingType = searchParams.get('shipping_type') || '1'

  const { data: shipmentList, refetch } = useGetShipments({
    user_id: profile?.id ? Number(profile.id) : null,
    market_id: marketId,
    status,
    shipping_type: shippingType as ShippingType,
  })

  useEffect(() => {
    refetch()
  }, [shippingType, refetch])

  const currentPage = Number(searchParams.get('page')) || 1

  const [sort, setSort] = useState({ key: 'inserted_at', order: 'desc' })

  const [showFilters, setShowFilters] = useState(false)

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
  )

  return (
    <Card className="w-full bg-gray-50">
      <CardHeader className="flex flex-col md:flex-row justify-start md:justify-between w-full space-y-3 md:space-y-0">
        <CardTitle className="font-bold">{t(`transport.${normalizeShippingType(shippingType)}`)}</CardTitle>
        <div className="flex items-center justify-between md:justify-start md:space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span className="hidden md:inline">{showFilters ? t('common.hideFilters') : t('common.showFilters')}</span>
          </Button>
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
              className="w-full cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-primary bg-white"
              onClick={() => goDetails(bid.uuid)}
            >
              <div className="flex flex-col md:grid md:grid-cols-12 gap-2 md:gap-4">
                {/* Mobile: Top section with ID, agent code, and offers */}
                <div className="md:col-span-3 p-3 md:p-4 bg-muted/10">
                  <div className="space-y-2">
                    <Badge variant="outline" className="w-full justify-center text-xs">
                      ID: {bid.uuid.substring(0, 15)}...
                    </Badge>

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

                {/* Extend button section */}
                {filterType !== 'closed' && (
                  <div className="md:col-span-3 p-3 md:p-4 flex items-center justify-center border-t md:border-t-0 md:border-l">
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
      </CardContent>
    </Card>
  )
}
