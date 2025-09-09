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
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/components/ui/table'
import { useGetShipments } from '@/src/app/hooks/useGetShipments'
import useAuthStore from '@/src/store/authStore'
import { useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import Pagination from '../../../common/components/pagination/Pagination'

export function CargaTransportListHistory() {
  const searchParams = useSearchParams()
  const user = useAuthStore((state) => state.user)
  const profile = useAuthStore((state) => state.profile)
  const marketId =
    searchParams.get('market') ??
    profile?.all_markets?.[0]?.id?.toString() ??
    null

  const shippingType = searchParams.get('shipping_type') as any

  const { data: shipmentList } = useGetShipments({
    user_id: profile?.id || null,
    market_id: marketId,
    status: 'Closed',
    shipping_type: shippingType,
  })

  const currentPage = Number(searchParams.get('page')) || 1
  const [itemsPerPage] = useState(10)

  const [sort, setSort] = useState({ key: 'id', order: 'asc' })

  const [filters, setFilters] = useState({
    uuid: '',
    origin_name: '',
    destination_name: '',
    inserted_at: '',
    expiration_date: '',
    value: '',
    status: '',
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
  }

  const filteredList = shipmentList
    ?.filter((bid: any) =>
      Object.keys(filters).every((key) =>
        bid[key as keyof any]
          ?.toString()
          .toLowerCase()
          .includes(filters[key as keyof typeof filters].toLowerCase())
      )
    )
    .sort((a: any, b: any) => {
      const aValue = a[sort.key as keyof any]
      const bValue = b[sort.key as keyof any]

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
      <CardHeader>
        <CardTitle className="font-bold">
          Historial de shipments
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableCaption>Historial de tus shipments</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead
                className="font-bold text-black"
                onClick={() => handleSort('uuid')}
              >
                Código
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
                onClick={() => handleSort('expiration_date')}
              >
                Fecha de finalización
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
              <TableHead
                className="font-bold text-black"
                onClick={() => handleSort('value')}
              >
                Precio cierre
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
              <TableHead className="font-bold text-black">
                Estado
              </TableHead>
              <TableHead className="font-bold text-black">
                Código agente
              </TableHead>
              <TableHead className="font-bold text-black">
                Nombre agente
              </TableHead>
              <TableHead className="font-bold text-black">
                Fecha aceptación Oferta
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell className="font-medium">
                <Input
                  placeholder="Filtrar código"
                  onChange={(e) => handleFilterChange('uuid', e.target.value)}
                />
              </TableCell>
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
                  onChange={(e) => handleFilterChange('id', e.target.value)}
                />
              </TableCell>
              <TableCell className="text-right">
                <Input
                  placeholder="Filtrar oferta"
                  onChange={(e) => handleFilterChange('id', e.target.value)}
                />
              </TableCell>

              <TableCell className="text-center">
                <Input
                  placeholder="Filtrar estado"
                  onChange={(e) => handleFilterChange('status', e.target.value)}
                />
              </TableCell>

              <TableCell className="text-right">
                <Input
                  placeholder="Filtrar co. agente"
                  onChange={(e) => handleFilterChange('id', e.target.value)}
                />
              </TableCell>

              <TableCell className="text-right">
                <Input
                  placeholder="Filtrar nombre agente"
                  onChange={(e) => handleFilterChange('id', e.target.value)}
                />
              </TableCell>

              <TableCell className="text-right">
                <Input
                  placeholder="Filtrar fecha aceptación"
                  onChange={(e) => handleFilterChange('id', e.target.value)}
                />
              </TableCell>
            </TableRow>
            {paginatedList?.map((item) => (
              <TableRow key={item.uuid} className="text-xs">
                <TableCell className="font-medium">{item.uuid}</TableCell>
                <TableCell className="font-medium">
                  {item.origin}
                </TableCell>
                <TableCell>{item.destination}</TableCell>
                <TableCell>{item.inserted_at}</TableCell>
                <TableCell>{item.expiration_date}</TableCell>
                <TableCell>USD ${item.value}</TableCell>
                <TableCell className="text-center">
                  {item.status === 'Cancelled' ? (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-red-100 text-red-800">
                      🚫 Cancelado
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
                      ✅ Cerrado
                    </span>
                  )}
                </TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
                <TableCell>-</TableCell>
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
