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
import { Suspense, useState, useMemo } from 'react'
import Pagination from '../../../common/components/pagination/Pagination'
import { useHistoricalBidsForAgent } from '@/src/app/hooks/useHistoricalBidsForAgent'
import useAuthStore from '@/src/store/authStore'
import { useSearchParams } from 'next/navigation'

type Bid = {
  id: string
  origin_name: string
  destination_name: string
  inserted_at: string
  updated_at: string
  price: string
}

type Filters = Record<string, string>

export function HistoricalListProposal() {
  const searchParams = useSearchParams()
  const [sort, setSort] = useState({ key: 'id', order: 'asc' })
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const user = useAuthStore((state) => state.user)
  const marketId =
    searchParams.get('market') ??
    user?.all_markets[0]?.id?.toString() ??
    null

  const { data: bidList } = useHistoricalBidsForAgent({
    user_id: user?.id || null,
    market_id: marketId,
    status: 'Closed',
    shipping_type: 'Marítimo', // Add required shipping_type parameter
  })

  const [filters, setFilters] = useState({
    id: '',
    origin_name: '',
    destination_name: '',
    inserted_at: '',
    updated_at: '',
    price: '',
  })

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

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
    setCurrentPage(1) // Reiniciar a la primera página al aplicar filtro
  }

  const filteredAndSortedData = useMemo(() => {
    const filteredData = bidList?.filter((bid: Bid) => {
      return Object.keys(filters).every((key: keyof Filters) =>
        bid[key as keyof Bid]
          .toString()
          .toLowerCase()
          .includes(filters[key as keyof Bid]?.toLowerCase())
      )
    })

    const sortedData = filteredData?.sort((a: any, b: any) => {
      const orderFactor = sort.order === 'asc' ? 1 : -1
      return a[sort.key] > b[sort.key] ? orderFactor : -orderFactor
    })

    return sortedData
  }, [bidList, filters, sort])

  const paginatedData = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage
    const endIndex = startIndex + itemsPerPage
    return filteredAndSortedData?.slice(startIndex, endIndex)
  }, [filteredAndSortedData, currentPage])

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-bold">
          Histórico propuesta shipments
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow className="cursor-pointer">
              <TableHead
                className="w-[100px] font-bold text-black"
                onClick={() => handleSort('uuid')}
              >
                Código subasta
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
                className="font-bold text-black"
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
                className="font-bold text-black"
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
              <TableHead
                className="font-bold text-black"
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
                className="font-bold text-black"
                onClick={() => handleSort('updated_at')}
              >
                Fecha de finalización
                <span className="ml-1">
                  {sort.key === 'updated_at' ? (
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
                className="font-bold text-black"
                onClick={() => handleSort('price')}
              >
                Precio cierre
                <span className="ml-1">
                  {sort.key === 'price' ? (
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
              <TableHead className="font-bold text-black">Estado</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">
                <Input
                  placeholder="Filtrar código"
                  onChange={(e) => handleFilterChange('id', e.target.value)}
                />
              </TableCell>
              <TableCell className="font-medium">
                <Input
                  placeholder="Filtrar origen"
                  onChange={(e) =>
                    handleFilterChange('origin_name', e.target.value)
                  }
                />
              </TableCell>
              <TableCell>
                <Input
                  placeholder="Filtrar destino"
                  onChange={(e) =>
                    handleFilterChange('destination_name', e.target.value)
                  }
                />
              </TableCell>
              <TableCell>
                <Input
                  placeholder="Filtrar fecha de creación"
                  onChange={(e) =>
                    handleFilterChange('inserted_at', e.target.value)
                  }
                />
              </TableCell>
              <TableCell>
                <Input
                  placeholder="Filtrar fecha de finalización"
                  onChange={(e) =>
                    handleFilterChange('updated_at', e.target.value)
                  }
                />
              </TableCell>
              <TableCell className="text-right">
                <Input
                  placeholder="Filtrar precio"
                  onChange={(e) => handleFilterChange('price', e.target.value)}
                />
              </TableCell>
              <TableCell className="text-right"></TableCell>
            </TableRow>
            {paginatedData?.map((bid: any) => (
              <TableRow
                key={bid.uuid}
                className={
                  bid.status === 'Won'
                    ? 'bg-green-500 bg-opacity-40 text-xs'
                    : 'bg-red-500 bg-opacity-40 text-xs'
                }
              >
                <TableCell className="font-medium">{bid.uuid}</TableCell>
                <TableCell className="font-medium">{bid.origin_name}</TableCell>
                <TableCell>{bid.destination_name}</TableCell>
                <TableCell>{bid.inserted_at}</TableCell>
                <TableCell>{bid.updated_at}</TableCell>
                <TableCell>{bid.price}</TableCell>
                <TableCell>
                  <b>{bid.status}</b>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="w-full flex justify-end mt-8">
          <Suspense fallback={<div>Loading...</div>}>
            <Pagination
              totalPages={Math.ceil(
                (filteredAndSortedData?.length || 0) / itemsPerPage
              )}
            />
          </Suspense>
        </div>
      </CardContent>
    </Card>
  )
}
