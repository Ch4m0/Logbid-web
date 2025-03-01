'use client'
import { DetailProposal } from '../../(home)/components/DetailProposal'
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
import { modalService } from '@/src/service/modalService'
import { Suspense, useEffect, useState } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { convertToColombiaTime } from '@/src/lib/utils'
import { useGetBidById } from '@/src/app/hooks/useGetBidById'
import Pagination from '../../../common/components/pagination/Pagination'
interface Offer {
  id: number
  uuid: string
  agent_id: number
  price: string
  inserted_at: string
}

interface Bid {
  id: number
  uuid: string
  origin_country: string
  origin_name: string
  destination_country: string
  destination_name: string
  inserted_at: string
  expiration_date: string
  offers: Offer[]
  currency: string
  lowestPrice: string
}

export function CargaProposalsList() {
  const router = useRouter()
  const [sort, setSort] = useState({ key: 'id', order: 'asc' })
  const params = useSearchParams()

  const currentPage = Number(params.get('page')) || 1
  const bidId = params.get('bidId') || ''
  const marketId = params.get('market') || ''

  const { mutate: fetchDetailById, isPending: loading } = useGetBidById()
  const [itemsPerPage] = useState(20)
  const [bid, setBid] = useState<Bid | null>(null)

  const [filters, setFilters] = useState({
    uuid: '',
    agent_id: '',
    price: '',
    inserted_at: '',
  })

  useEffect(() => {
    fetchDetailById(
      {
        bid_id: bidId,
      },
      {
        onSuccess: (bid) => {
          console.log(bid, 'success')
          if (bid.status === 'Closed') {
            window.location.href = '/?market=' + marketId
          }

          setBid(bid)
        },
        onError: () => {
          console.log('error')
        },
      }
    )
  }, [])

  if (!params) {
    return <h1>Hubo un error cargando el Detalle de la Transacción</h1>
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

  const openModal = (
    offerId: number,
    agent_id: number,
    agentCode: string,
    _proposalPrice: string,
    _proposalCreatedDate: string
  ) => {
    modalService.showModal({
      component: DetailProposal,
      props: {
        originBid: bid?.origin_country + ' - ' + bid?.origin_name,
        finishBid: bid?.destination_country + ' - ' + bid?.destination_name,
        codeBid: bid?.uuid,
        bidId: bid?.id,
        offerId: offerId,
        startDate: bid?.inserted_at,
        finishDate: bid?.expiration_date,
        proposalCreatedDate: _proposalCreatedDate,
        agentId: agent_id,
        agentCode: agentCode,
        proposalPrice: _proposalPrice,
      },
    })
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  // Filtrado y ordenamiento aplicado a la lista de ofertas
  const filteredOffers = bid?.offers
    ?.filter((offer: any) =>
      Object.keys(filters).every((key) =>
        offer[key as keyof typeof filters]
          ?.toString()
          .toLowerCase()
          .includes(filters[key as keyof typeof filters].toLowerCase())
      )
    )
    .sort((a: any, b: any) => {
      const aValue = a[sort.key as keyof typeof a]
      const bValue = b[sort.key as keyof typeof b]

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sort.order === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      return sort.order === 'asc'
        ? Number(aValue) - Number(bValue)
        : Number(bValue) - Number(aValue)
    })

  const paginatedList = filteredOffers?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  if (loading) {
    return <h1>Cargando...</h1>
  }

  return (
    <>
      {bid && (
        <Card className="w-full">
          <CardHeader>
            <button
              onClick={() => router.back()}
              className="bg-blue-500 text-white font-semibold py-2 px-4 rounded mb-4 flex items-center max-w-[8rem]"
            >
              <svg
                className="w-4 h-4 mr-2"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M15 19l-7-7 7-7"
                ></path>
              </svg>
              Regresar
            </button>
            <h2 className="text-2xl font-bold mt-4 text-blue-500">
              Detalle viaje
            </h2>
            <div className="grid gap-2 pb-6">
              <div className="flex items-center gap-2">
                <span className="font-bold">Origen:</span>
                <span>{bid.origin_country + ' - ' + bid.origin_name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">Destino:</span>
                <span>
                  {bid.destination_country + ' - ' + bid.destination_name}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">Codigo:</span>
                <span>{bid.uuid}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">Menor Precio de la Lista:</span>
                <span className="text-xl font-bold text-green-500">
                  {bid.offers.length > 0
                    ? `USD $${bid.lowestPrice}`
                    : 'No hay ofertas'}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">Fecha inicio:</span>
                <span>{bid.inserted_at}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="font-bold">Fecha Fin:</span>
                <span>{bid.expiration_date}</span>
              </div>
            </div>

            <CardTitle className="text-blue-500 font-bold text-xl">
              Propuestas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow className="cursor-pointer font-bold">
                  <TableHead onClick={() => handleSort('uuid')}>
                    <span className="font-bold">ID</span>
                    {sort.key === 'uuid' && (
                      <span className="ml-1">
                        {sort.order === 'asc' ? '\u2191' : '\u2193'}
                      </span>
                    )}
                  </TableHead>
                  <TableHead onClick={() => handleSort('inserted_at')}>
                    <span className="font-bold">Fecha Creación</span>
                    {sort.key === 'inserted_at' && (
                      <span className="ml-1">
                        {sort.order === 'asc' ? '\u2191' : '\u2193'}
                      </span>
                    )}
                  </TableHead>
                  <TableHead onClick={() => handleSort('agent_id')}>
                    <span className="font-bold">Código Agente</span>
                    {sort.key === 'agent_id' && (
                      <span className="ml-1">
                        {sort.order === 'asc' ? '\u2191' : '\u2193'}
                      </span>
                    )}
                  </TableHead>

                  <TableHead onClick={() => handleSort('price')}>
                    <span className="font-bold">Precio</span>
                    {sort.key === 'price' && (
                      <span className="ml-1">
                        {sort.order === 'asc' ? '\u2191' : '\u2193'}
                      </span>
                    )}
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {/* Mostrar el resto de la lista paginada */}
                <TableRow>
                  <TableCell>
                    <Input
                      placeholder="Filtrar ID"
                      onChange={(e) =>
                        handleFilterChange('uuid', e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder="Filtrar fecha"
                      onChange={(e) =>
                        handleFilterChange('inserted_at', e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder="Filtrar código"
                      onChange={(e) =>
                        handleFilterChange('agent_id', e.target.value)
                      }
                    />
                  </TableCell>
                  <TableCell>
                    <Input
                      placeholder="Filtrar precio"
                      onChange={(e) =>
                        handleFilterChange('price', e.target.value)
                      }
                    />
                  </TableCell>
                </TableRow>
                {paginatedList && paginatedList.length > 0 ? (
                  paginatedList.map((offer: any) => (
                    <TableRow
                      key={offer.uuid}
                      onClick={() =>
                        openModal(
                          offer.id,
                          offer.agent_id,
                          offer.uuid,
                          `$${offer.price}`,
                          convertToColombiaTime(offer.inserted_at)
                        )
                      }
                      // Aplicar fondo amarillo si el precio es el menor
                      className={
                        offer.price === bid.lowestPrice
                          ? 'bg-yellow-500 bg-opacity-20 cursor-pointer text-xs'
                          : 'cursor-pointer text-xs'
                      }
                    >
                      <TableCell>{offer.uuid}</TableCell>
                      <TableCell>
                        {convertToColombiaTime(offer.inserted_at)}
                      </TableCell>
                      <TableCell>{offer.agent_id}</TableCell>
                      <TableCell>{`${offer.price}`}</TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center">
                      No hay resultados que coincidan con los filtros.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            <div className="w-full flex justify-end mt-8">
              <Suspense fallback={<div>Loading...</div>}>
                <Pagination
                  totalPages={Math.ceil(
                    (filteredOffers?.length || 0) / itemsPerPage
                  )}
                />
              </Suspense>
            </div>
          </CardContent>
        </Card>
      )}
    </>
  )
}
