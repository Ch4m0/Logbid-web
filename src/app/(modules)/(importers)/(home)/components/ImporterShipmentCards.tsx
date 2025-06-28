'use client'
import { Button } from '@/src/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import { Input } from '@/src/components/ui/input'
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
import { convertToColombiaTime } from '@/src/lib/utils'
import { useTranslation } from '@/src/hooks/useTranslation'

interface ImporterShipmentCardsProps {
  filterType: 'withoutOffers' | 'withOffers' | 'closed'
}

// Function to normalize shipping type to translation key
const normalizeShippingType = (shippingType: string) => {
  const typeMap: { [key: string]: string } = {
    'Marítimo': 'maritime',
    'Aéreo': 'air',
    'Terrestre': 'land',
    'Almacén': 'warehouse'
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

  const shippingType = searchParams.get('shipping_type') || 'Marítimo'

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

  const [filters, setFilters] = useState({
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
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const showExtendFinalDate = (
    expiration_date: string,
    origin: string,
    destination: string,
    id: string
  ) => {
          modalService.showModal({
        component: ExtendShipmentDeadline,
        props: {
        expiration_date: expiration_date,
        origin: origin,
        destination: destination,
        id,
        shippingType
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
      return Object.keys(filters).every((key) => {
        const filterValue = filters[key as keyof typeof filters];
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
    <Card className="w-full">
      <CardHeader className="flex justify-between flex-row w-full">
        <CardTitle className="font-bold">{t(`transport.${normalizeShippingType(shippingType)}`)}</CardTitle>
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center space-x-2"
          >
            <Filter className="h-4 w-4" />
            <span>{showFilters ? t('common.hideFilters') : t('common.showFilters')}</span>
          </Button>
                     <CreateShipment />
        </div>
      </CardHeader>
      <CardContent>
        {showFilters && (
          <ShipmentFilters
            shipmentList={shipmentList}
            filters={filters}
            onFilterChange={handleFilterChange}
            onSort={handleSort}
            shouldShowStatusElements={shouldShowStatusElements()}
          />
        )}

        <div className="space-y-4">
          {paginatedList?.map((bid) => (
            <Card
              key={bid.uuid}
              className="w-full cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-primary"
              onClick={() => goDetails(bid.uuid)}
            >
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-3 p-4 bg-muted/10">
                  <div className="space-y-2">
                    <Badge variant="outline" className="w-full justify-center">
                      ID: {bid.uuid.substring(0, 20)}
                    </Badge>

                    {shouldShowStatusElements() && (
                      <Badge
                        className="w-full justify-center"
                        variant="secondary"
                      >
                        {t('cargoList.agentCode')}: {bid.agent_code}
                      </Badge>
                    )}

                    {shouldShowStatusElements() && (
                      <div className="flex items-center justify-center space-x-2 mt-3 bg-primary/10 p-2 rounded-md">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">
                          USD {bid.last_price}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-center space-x-2 mt-2 bg-blue-50 p-2 rounded-md">
                      <Users className="h-4 w-4 text-blue-600" />
                      <span className="text-sm font-medium text-blue-600">
                        {bid.offers_count} {bid.offers_count === 1 ? t('cargoList.offer') : t('cargoList.offers')}
                      </span>
                    </div>
                  </div>
                </div>

                <div className={`p-4 ${status === 'Closed' ? 'md:col-span-9' : 'md:col-span-6'}`}>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2 flex-1">
                        <MapPin className="h-5 w-5 text-primary" />
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">
                            {t('cargoList.origin')}
                          </span>
                          <span className="font-medium">{bid.origin}</span>
                        </div>
                      </div>

                      <ArrowRight className="h-5 w-5 text-muted-foreground hidden md:block" />

                      <div className="flex items-center space-x-2 flex-1">
                        <MapPin className="h-5 w-5 text-destructive" />
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">
                            {t('cargoList.destination')}
                          </span>
                          <span className="font-medium">
                            {bid.destination}
                          </span>
                        </div>
                      </div>
                    </div>

                    <Separator className="my-2" />

                    <div className="grid grid-cols-2 gap-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">
                            {t('cargoList.creation')}
                          </span>
                          <span className="text-sm">{convertToColombiaTime(bid.inserted_at)}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">
                            {t('cargoList.finalization')}
                          </span>
                          <span className="text-sm">{convertToColombiaTime(bid.expiration_date)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {filterType !== 'closed' && (
                  <div className="md:col-span-3 p-4 flex items-center justify-center border-t md:border-t-0 md:border-l">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation()
                        showExtendFinalDate(
                          bid.expiration_date,
                          bid.origin,
                          bid.destination,
                          bid.id.toString()
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
