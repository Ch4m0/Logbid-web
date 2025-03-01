'use client'
import { Button } from '@/src/components/ui/button'
import { CardContent, CardHeader, CardTitle } from '@/src/components/ui/card'
import { Input } from '@/src/components/ui/input'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/components/ui/table'
import { modalService } from '@/src/service/modalService'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import CreateCargoTransport from './CreateCargoTransport/CreateCargoTransport'
import { ExtendCargoTransport } from './ExtendCargoTransport'
import { useBidStore } from '@/src/store/useBidStore'
import { useGetBidList } from '@/src/app/hooks/useGetBidList'
import Pagination from '../../../common/components/pagination/Pagination'
import { Card } from '@/src/components/ui/card'
import { BidListItem } from '@/src/models/BidListItem'
import useAuthStore from '@/src/store/authStore'
import { stat } from 'fs'

interface CargoTransporListProps {
  status: 'Active' | 'Closed' | 'Offering'
}

export function CargoTransportList({ status }: CargoTransporListProps) {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const { setMarketData } = useBidStore()
  const [itemsPerPage] = useState(10)
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

  const STATUS = 'Offering'

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
        <CardTitle className="font-bold">Viajes de Carga</CardTitle>
        <CreateCargoTransport />
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>Lista de tus viajes de carga a cotizar</TableCaption>
          <TableHeader>
            <TableRow className="cursor-pointer">
              <TableHead
                className=" text-black-500 font-bold"
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
                className=" text-black-500 font-bold"
                onClick={() => handleSort('expiration_date')}
              >
                Fecha de Finalización
                <span className="ml-1">
                  {sort.key === 'expiration_date' ? (
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
              {status === STATUS && (
                <TableHead
                  className=" text-black-500 font-bold"
                  onClick={() => handleSort('uuid')}
                >
                  Código agente
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
              )}

              <TableHead
                className=" text-black-500 font-bold"
                onClick={() => handleSort('uuid')}
              >
                ID transacción
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
                className=" text-black-500 font-bold"
                onClick={() => handleSort('origin_name')}
              >
                Orígen
                <span className="ml-1">
                  {sort.key === 'origin_name' ? (
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
                className=" text-black-500 font-bold"
                onClick={() => handleSort('destination_name')}
              >
                Destíno
                <span className="ml-1">
                  {sort.key === 'destination_name' ? (
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

              {status === STATUS && (
                <TableHead
                  className=" text-black-500 font-bold"
                  onClick={() => handleSort('value')}
                >
                  Ultimo Precio
                  <span className="ml-1">
                    {sort.key === 'value' ? (
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
              )}

              <TableHead className=" text-black-500 font-bold">
                Acciones
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>
                <Input
                  placeholder="Filtrar fecha creación"
                  onChange={(e) =>
                    handleFilterChange('inserted_at', e.target.value)
                  }
                />
              </TableCell>
              <TableCell>
                <Input
                  placeholder="Filtrar fecha finalización"
                  onChange={(e) =>
                    handleFilterChange('expiration_date', e.target.value)
                  }
                />
              </TableCell>

              {status === STATUS && (
                <TableCell className="font-small">
                  <Input
                    placeholder="Filtrar código"
                    onChange={(e) => handleFilterChange('uuid', e.target.value)}
                  />
                </TableCell>
              )}

              <TableCell className="font-medium">
                <Input
                  placeholder="Filtrar orígen"
                  onChange={(e) =>
                    handleFilterChange('origin_name', e.target.value)
                  }
                />
              </TableCell>
              <TableCell>
                <Input
                  placeholder="Filtrar Destíno"
                  onChange={(e) =>
                    handleFilterChange('destination_name', e.target.value)
                  }
                />
              </TableCell>

              <TableCell className="text-right">
                <Input
                  placeholder="Filtrar oferta"
                  onChange={(e) => handleFilterChange('value', e.target.value)}
                />
              </TableCell>
              <TableCell className="text-right"></TableCell>
            </TableRow>

            {paginatedList?.map((bid) => (
              <TableRow
                key={bid.uuid}
                className="cursor-pointer text-xs"
                onClick={() => goDetails(bid.uuid)}
              >
                <TableCell>{bid.inserted_at}</TableCell>
                <TableCell>{bid.expiration_date}</TableCell>
                {status === STATUS && (
                  <TableCell className="font-medium">
                    {bid.agent_code}
                  </TableCell>
                )}
                <TableCell className="font-medium">{bid.uuid}</TableCell>
                <TableCell className="font-medium">{bid.origin_name}</TableCell>
                <TableCell>{bid.destination_name}</TableCell>
                {status === STATUS && (
                  <TableCell>USD ${bid.last_price}</TableCell>
                )}
                <TableCell className="text-right">
                  <Button
                    variant="outline"
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
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="w-full flex justify-end">
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
