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
import CreateCargoTransport from './CreateCargoTransport/CreateCargoTransport'
import { ExtendCargoTransport } from './ExtendCargoTransport'
import { useBidStore } from '@/src/store/useBidStore'
import { useGetBidList } from '@/src/app/hooks/useGetBidList'
import Pagination from '../../../common/components/pagination/Pagination'
import useAuthStore from '@/src/store/authStore'
import type { BidListItem } from '@/src/models/BidListItem'
import {
  Calendar,
  MapPin,
  Package,
  Clock,
  DollarSign,
  ArrowUpDown,
  ArrowRight,
  Users,
  Filter,
} from 'lucide-react'
import { Badge } from '@/src/components/ui/badge'
import { Separator } from '@/src/components/ui/separator'
import { ShippingType } from '@/src/models/common'
import { convertToColombiaTime } from '@/src/lib/utils'
import { useTranslation } from '@/src/hooks/useTranslation'

interface CargoTransporListProps {
  status: 'Active' | 'Closed' | 'Offering'
}

export function CargoTransportListCards({ status }: CargoTransporListProps) {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const { setMarketData } = useBidStore()
  const [itemsPerPage] = useState(8)
  const searchParams = useSearchParams()
  const { t } = useTranslation()

  const marketId =
    searchParams.get('market_id') ??
    user?.all_markets[0]?.id?.toString() ??
    null

  const shippingType = searchParams.get('shipping_type') || 'Marítimo'

  const { data: bidList, refetch } = useGetBidList({
    user_id: user?.id || null,
    market_id: marketId,
    status,
    shipping_type: shippingType as ShippingType,
  })

  useEffect(() => {
    refetch()
  }, [shippingType, refetch])

  const currentPage = Number(searchParams.get('page')) || 1

  const [sort, setSort] = useState({ key: 'id', order: 'desc' })

  const [showFilters, setShowFilters] = useState(false)

  const [filters, setFilters] = useState({
    uuid: '',
    origin_name: '',
    destination_name: '',
    inserted_at: '',
    expiration_date: '',
    value: '',
    offers_count: '',
  })

  const STATUS = ['Offering', 'Closed']

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
      component: ExtendCargoTransport,
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

  const filteredList = bidList
    ?.filter((bid: any) =>
      Object.keys(filters).every((key) => {
        const filterValue = filters[key as keyof typeof filters];
        // If filter is empty, don't apply this filter
        if (!filterValue || filterValue.trim() === '') {
          return true;
        }
        
        const bidValue = bid[key as keyof BidListItem];
        // Handle null/undefined values
        if (bidValue == null) {
          return false;
        }
        
        return bidValue
          .toString()
          .toLowerCase()
          .includes(filterValue.toLowerCase());
      })
    )
    .sort((a: any, b: any) => {
      const aValue = a[sort.key as keyof BidListItem]
      const bValue = b[sort.key as keyof BidListItem]

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sort.order === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

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
        <CardTitle className="font-bold">{t(`transport.${shippingType.toLowerCase()}`)}</CardTitle>
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
          <CreateCargoTransport />
        </div>
      </CardHeader>
      <CardContent>
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium mb-1 block">
                {t('cargoList.creationDate')}
              </label>
              <div className="flex items-center">
                <Input
                  placeholder={t('filters.filterCreationDate')}
                  onChange={(e) =>
                    handleFilterChange('inserted_at', e.target.value)
                  }
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleSort('inserted_at')}
                  className="ml-1"
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">
                {t('cargoList.finalizationDate')}
              </label>
              <div className="flex items-center">
                <Input
                  placeholder={t('filters.filterFinalizationDate')}
                  onChange={(e) =>
                    handleFilterChange('expiration_date', e.target.value)
                  }
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleSort('expiration_date')}
                  className="ml-1"
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {STATUS.includes(status) && (
              <div>
                <label className="text-sm font-medium mb-1 block">
                  {t('cargoList.agentCode')}
                </label>
                <div className="flex items-center">
                  <Input
                    placeholder={t('filters.filterCode')}
                    onChange={(e) => handleFilterChange('uuid', e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleSort('uuid')}
                    className="ml-1"
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            <div>
              <label className="text-sm font-medium mb-1 block">
                {t('cargoList.transactionId')}
              </label>
              <div className="flex items-center">
                <Input
                  placeholder={t('filters.filterId')}
                  onChange={(e) => handleFilterChange('uuid', e.target.value)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleSort('uuid')}
                  className="ml-1"
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t('cargoList.origin')}</label>
              <div className="flex items-center">
                <Input
                  placeholder={t('filters.filterOrigin')}
                  onChange={(e) =>
                    handleFilterChange('origin_name', e.target.value)
                  }
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleSort('origin_name')}
                  className="ml-1"
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">{t('cargoList.destination')}</label>
              <div className="flex items-center">
                <Input
                  placeholder={t('filters.filterDestination')}
                  onChange={(e) =>
                    handleFilterChange('destination_name', e.target.value)
                  }
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleSort('destination_name')}
                  className="ml-1"
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
            {STATUS.includes(status) && (
              <div>
                <label className="text-sm font-medium mb-1 block">
                  {t('cargoList.lastPrice')}
                </label>
                <div className="flex items-center">
                  <Input
                    placeholder={t('filters.filterPrice')}
                    onChange={(e) => handleFilterChange('value', e.target.value)}
                  />
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleSort('value')}
                    className="ml-1"
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}
            <div>
              <label className="text-sm font-medium mb-1 block">
                {t('cargoList.offersCount')}
              </label>
              <div className="flex items-center">
                <Input
                  placeholder={t('filters.filterOffers')}
                  onChange={(e) => handleFilterChange('offers_count', e.target.value)}
                />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleSort('offers_count')}
                  className="ml-1"
                >
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
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
                    {STATUS.includes(status) && (
                      <Badge
                        className="w-full justify-center"
                        variant="secondary"
                      >
                        {t('cargoList.agentCode')}: {bid.agent_code}
                      </Badge>
                    )}
                    {STATUS.includes(status) && (
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
                          <span className="font-medium">{bid.origin_name}</span>
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
                            {bid.destination_name}
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

                {status !== 'Closed' && (
                  <div className="md:col-span-3 p-4 flex items-center justify-center border-t md:border-t-0 md:border-l">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={(e) => {
                        e.stopPropagation()
                        showExtendFinalDate(
                          bid.expiration_date,
                          bid.origin_name,
                          bid.destination_name,
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
