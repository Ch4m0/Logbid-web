'use client'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import { Input } from '@/src/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/components/ui/table'
import { convertToColombiaTime } from '@/src/lib/utils'
import { useGetBidById } from '@/src/app/hooks/useGetBidById'
import { useGetBidListByMarket } from '@/src/app/hooks/useGetBidListByMarket'
import useAuthStore from '@/src/store/authStore'
import { useBidStore } from '@/src/store/useBidStore'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import Pagination from '../../../common/components/pagination/Pagination'
import { ShippingType } from '@/src/models/common'

interface BidByMarket {
  hasData: any
  id: string
  inserted_at: string
  uuid: string
  shipping_type: string
  origin: string
  destination: string
}

interface CargoTransporListProps {
  status: 'Active' | 'Closed' | 'Offered'
}

export function CargoTransporListAvaliable({ status }: CargoTransporListProps) {
  const searchParams = useSearchParams()
  const user = useAuthStore((state) => state.user)
  const router = useRouter()

  const marketId =
    searchParams.get('market_id') ??
    user?.all_markets[0]?.id?.toString() ??
    null

  const shippingType = searchParams.get('shipping_type') || 'Marítimo'

  const { data: bidList, refetch } = useGetBidListByMarket(
    marketId,
    status,
    user?.id || null,
    shippingType as ShippingType
  )


  const [filters, setFilters] = useState({
    id: '',
    inserted_at: '',
    uuid: '',
    origin: '',
    shipping_type: '',
    destination: '',
  })
  const currentPage = Number(searchParams.get('page')) || 1

  const [sort, setSort] = useState({ key: 'id', order: 'asc' })
  const [itemsPerPage] = useState(10)

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleGetOffers = (uuid: string) => {
    router.push(`/offers/${uuid}`)
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

  const filteredList = bidList
    ?.filter((bid: BidByMarket) =>
      Object.keys(filters).every((key) => {
        const filterValue = filters[key as keyof typeof filters]
          .trim() // Eliminar espacios en blanco
          .toLowerCase()
        const bidValue = String(bid[key as keyof BidByMarket] || '')
          .trim() // Eliminar espacios en blanco en la data
          .toLowerCase()
        return bidValue.includes(filterValue)
      })
    )
    .sort((a: any, b: any) => {
      const aValue = a[sort.key as keyof BidByMarket]
      const bValue = b[sort.key as keyof BidByMarket]

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


   useEffect(() => {
      refetch()
  }, [shippingType, refetch])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-bold">Viajes de Carga</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className="text-black-500 font-bold text-black cursor-pointer"
                onClick={() => handleSort('inserted_at')}
              >
                Fecha de creación
                <span className="ml-1">
                  {sort.key === 'inserted_at' ? (
                    sort.order === 'asc' ? (
                      '\u2191'
                    ) : (
                      '\u2193'
                    )
                  ) : (
                    <>{'\u2191\u2193'}</>
                  )}
                </span>
              </TableHead>
              <TableHead
                className="text-black-500 font-bold text-black cursor-pointer"
                onClick={() => handleSort('uuid')}
              >
                Código viaje
                <span className="ml-1">
                  {sort.key === 'uuid' ? (
                    sort.order === 'asc' ? (
                      '\u2191'
                    ) : (
                      '\u2193'
                    )
                  ) : (
                    <>{'\u2191\u2193'}</>
                  )}
                </span>
              </TableHead>
              <TableHead
                className="text-black-500 font-bold text-black cursor-pointer"
                onClick={() => handleSort('shipping_type')}
              >
                Tipo de envío
                <span className="ml-1">
                  {sort.key === 'shipping_type' ? (
                    sort.order === 'asc' ? (
                      '\u2191'
                    ) : (
                      '\u2193'
                    )
                  ) : (
                    <>{'\u2191\u2193'}</>
                  )}
                </span>
              </TableHead>
              <TableHead
                className="text-black-500 font-bold text-black cursor-pointer"
                onClick={() => handleSort('origin')}
              >
                Orígen
                <span className="ml-1">
                  {sort.key === 'origin' ? (
                    sort.order === 'asc' ? (
                      '\u2191'
                    ) : (
                      '\u2193'
                    )
                  ) : (
                    <>{'\u2191\u2193'}</>
                  )}
                </span>
              </TableHead>
              <TableHead
                className="text-black-500 font-bold text-black cursor-pointer"
                onClick={() => handleSort('destination')}
              >
                Destíno
                <span className="ml-1">
                  {sort.key === 'destination' ? (
                    sort.order === 'asc' ? (
                      '\u2191'
                    ) : (
                      '\u2193'
                    )
                  ) : (
                    <>{'\u2191\u2193'}</>
                  )}
                </span>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">
                <Input
                  placeholder="Filtrar fecha"
                  onChange={(e) =>
                    handleFilterChange('inserted_at', e.target.value)
                  }
                />
              </TableCell>
              <TableCell className="font-medium">
                <Input
                  placeholder="Filtrar código"
                  onChange={(e) => handleFilterChange('uuid', e.target.value)}
                />
              </TableCell>
              <TableCell className="font-medium">
                <Input
                  placeholder="Filtrar tipo de envío"
                  onChange={(e) =>
                    handleFilterChange('shipping_type', e.target.value)
                  }
                />
              </TableCell>
              <TableCell className="font-medium">
                <Input
                  placeholder="Filtrar Orígen"
                  onChange={(e) => handleFilterChange('origin', e.target.value)}
                />
              </TableCell>
              <TableCell className="font-medium">
                <Input
                  placeholder="Filtrar Destíno"
                  onChange={(e) =>
                    handleFilterChange('destination', e.target.value)
                  }
                />
              </TableCell>
            </TableRow>
            {paginatedList?.map((bid: BidByMarket, idx: number) => (
              <TableRow
                key={idx}
                onClick={() => handleGetOffers(bid.uuid)}
                className="text-xs"
              >
                <TableCell
                  className={`font-medium border-l-4 ${
                    bid.hasData ? 'border-green-500' : ''
                  }`}
                >
                  {convertToColombiaTime(bid.inserted_at)}
                </TableCell>
                <TableCell>{bid.uuid}</TableCell>
                <TableCell>{bid.shipping_type}</TableCell>
                <TableCell>{bid.origin}</TableCell>
                <TableCell>{bid.destination}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="w-full flex justify-end mt-8">
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
