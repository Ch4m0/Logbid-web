'use client'
import { useGetBidById } from '@/src/app/hooks/useGetBidById'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import { modalService } from '@/src/service/modalService'
import { DollarSign } from 'lucide-react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { DetailProposal } from '../../(home)/components/DetailProposal'
import AdvancedFilters from '../../../(agent)/offers/components/AdvancedFilters'
import OfferCard from '../../../(agent)/offers/components/OfferCard'
import Pagination from '../../../common/components/pagination/Pagination'
import BidInfo from './BidInfo'
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

  const [expandedOffers, setExpandedOffers] = useState<Record<string, boolean>>({})
  const [bidDataForAgent, setBidDataForAgent] = useState<any>({})

  const [filters, setFilters] = useState({
    uuid: '',
    agent_id: '',
    price: '',
    inserted_at: '',
  })

  const resetFilters = () => {
    setFilters({
      inserted_at: "",
      agent_id: "",
      price: "",
      shipping_type: "",
      "details.freight_fees.container": "",
      "details.freight_fees.value": "",
      "details.destination_fees.handling": "",
      "details.freight_fees.dimensions.length": "",
      "details.additional_fees.fuel": "",
    });
  }

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

  const toggleOfferDetails = (offerId: string) => {
    setExpandedOffers((prev) => ({
      ...prev,
      [offerId]: !prev[offerId],
    }))
  }

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
              {bid &&  BidInfo({ bidDataForAgent: bid })}
            </div>

            <CardTitle className="text-blue-500 font-bold text-xl">
              Propuestas
            </CardTitle>
          </CardHeader>
          <CardContent>
       
          <AdvancedFilters 
            filters={filters} 
            handleFilterChange={handleFilterChange} 
            handleSort={handleSort} 
            resetFilters={resetFilters}
            bidDataForAgent={bidDataForAgent}
          />

          {/* Estado de carga */}
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">Cargando ofertas...</p>
            </div>
          )}



          {paginatedList?.map((offer: any, idx: number) => (
              <OfferCard 
                key={idx} 
                offer={offer} 
                toggleOfferDetails={toggleOfferDetails} 
                expandedOffers={expandedOffers} 
              />
          ))}


          {(!paginatedList || paginatedList.length === 0) && (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-2 text-lg font-medium">No hay propuestas</h3>
                <p className="text-sm text-muted-foreground">No se encontraron propuestas con los filtros actuales.</p>
              </div>
            )}
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
