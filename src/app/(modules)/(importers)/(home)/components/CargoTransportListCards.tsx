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
import { Suspense, useState } from 'react'
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
} from 'lucide-react'
import { Badge } from '@/src/components/ui/badge'
import { Separator } from '@/src/components/ui/separator'

interface CargoTransporListProps {
  status: 'Active' | 'Closed' | 'Offering'
}

export function CargoTransportListCards({ status }: CargoTransporListProps) {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const { setMarketData } = useBidStore()
  const [itemsPerPage] = useState(8)
  const searchParams = useSearchParams()

  const marketId =
    searchParams.get('market_id') ??
    user?.all_markets[0]?.id?.toString() ??
    null

  const { data: bidList } = useGetBidList({
    user_id: user?.id || null,
    market_id: marketId,
    status,
  })

  const currentPage = Number(searchParams.get('page')) || 1

  const [sort, setSort] = useState({ key: 'id', order: 'desc' })

  const [filters, setFilters] = useState({
    uuid: '',
    origin_name: '',
    destination_name: '',
    inserted_at: '',
    expiration_date: '',
    value: '',
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
      Object.keys(filters).every((key) =>
        bid[key as keyof BidListItem]
          ?.toString()
          .toLowerCase()
          .includes(filters[key as keyof typeof filters].toLowerCase())
      )
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
        <CardTitle className="font-bold">Marítimo</CardTitle>
        <CreateCargoTransport />
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
          <div>
            <label className="text-sm font-medium mb-1 block">
              Fecha de creación
            </label>
            <div className="flex items-center">
              <Input
                placeholder="Filtrar fecha creación"
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
              Fecha de Finalización
            </label>
            <div className="flex items-center">
              <Input
                placeholder="Filtrar fecha finalización"
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
                Código agente
              </label>
              <div className="flex items-center">
                <Input
                  placeholder="Filtrar código"
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
              ID transacción
            </label>
            <div className="flex items-center">
              <Input
                placeholder="Filtrar ID"
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
            <label className="text-sm font-medium mb-1 block">Origen</label>
            <div className="flex items-center">
              <Input
                placeholder="Filtrar origen"
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
            <label className="text-sm font-medium mb-1 block">Destino</label>
            <div className="flex items-center">
              <Input
                placeholder="Filtrar destino"
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
                Último Precio
              </label>
              <div className="flex items-center">
                <Input
                  placeholder="Filtrar precio"
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
        </div>

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
                      ID: {bid.uuid.substring(0, 8)}...
                    </Badge>
                    {STATUS.includes(status) && (
                      <Badge
                        className="w-full justify-center"
                        variant="secondary"
                      >
                        Código: {bid.agent_code}
                      </Badge>
                    )}
                    {STATUS.includes(status) && (
                      <div className="flex items-center justify-center space-x-2 mt-3 bg-primary/10 p-2 rounded-md">
                        <DollarSign className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">
                          USD ${bid.last_price}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-6 p-4">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-2 flex-1">
                        <MapPin className="h-5 w-5 text-primary" />
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">
                            Origen
                          </span>
                          <span className="font-medium">{bid.origin_name}</span>
                        </div>
                      </div>
                      <ArrowRight className="h-5 w-5 text-muted-foreground hidden md:block" />
                      <div className="flex items-center space-x-2 flex-1">
                        <MapPin className="h-5 w-5 text-destructive" />
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">
                            Destino
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
                            Creación
                          </span>
                          <span className="text-sm">{bid.inserted_at}</span>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="text-xs text-muted-foreground">
                            Finalización
                          </span>
                          <span className="text-sm">{bid.expiration_date}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

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
                    Extender
                  </Button>
                </div>
              </div>
            </Card>
          ))}

          {(filteredList?.length || 0) === 0 && (
            <div className="text-center py-8">
              <Package className="h-12 w-12 mx-auto text-muted-foreground" />
              <h3 className="mt-2 text-lg font-medium">
                No hay viajes de carga
              </h3>
              <p className="text-sm text-muted-foreground">
                No se encontraron viajes de carga con los filtros actuales.
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
