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
import { Suspense, useEffect, useState } from 'react'
import PriceInput from './components/PriceInput'
import { useParams, useSearchParams } from 'next/navigation'
import { convertToColombiaTime } from '../../../../../lib/utils'
import useAuthStore from '@/src/store/authStore'
import { useRouter } from 'next/navigation'
import { modalService } from '@/src/service/modalService'
import ConfirmOffer from './components/ConfirmOffer'
import { toast } from '@/src/components/ui/use-toast'
import { useCreateOffer } from '@/src/app/hooks/useCreateOffer'
import { useGetBidById } from '@/src/app/hooks/useGetBidById'
import Pagination from '../../../common/components/pagination/Pagination'
import ProposalForm from './components/proposalForm'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/src/components/ui/accordion'
import ProposalFormMaritimo from './components/ProposalFormMaritimo'

const Page = () => {
  const searchParams = useSearchParams()
  const { id } = useParams()
  const [bidDataForAgent, setBidDataForAgent] = useState<any>({})
  const user = useAuthStore((state) => state.user)

  const shippingType = 'Marítimo'

  const { mutate: createOffer } = useCreateOffer()
  const { mutate: fetchDetailById, isPending: loading } = useGetBidById()

  const currentPage = Number(searchParams.get('page')) || 1
  const [sort, setSort] = useState({ key: 'id', order: 'asc' })
  const [itemsPerPage] = useState(5)
  const [filters, setFilters] = useState<any>({
    inserted_at: '',
    agent_id: '',
    price: '',
  })
  const router = useRouter()

  const loadDetaildBidByid = (uuid: any) => {
    fetchDetailById(
      {
        bid_id: uuid,
      },
      {
        onSuccess: (data) => {
          console.log(data, 'data')
          setBidDataForAgent(data)
        },
        onError: (error) => {
          console.log(error)
        },
      }
    )
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev: any) => ({ ...prev, [key]: value }))
  }

  const handleCreateOffer = (value: any) => {
    modalService.showModal({
      component: ConfirmOffer,
      props: {
        info: value,
        sendOffer: sendOffer,
        cancel: closeConfirm,
      },
    })
  }
  const closeConfirm = () => {
    modalService.closeModal()
  }

  const sendOffer = (info: any) => {
    console.log(JSON.stringify(info), 'info')
    createOffer(
      { ...info, ...{ bid_id: bidDataForAgent.id, agent_id: user?.id } },
      {
        onSuccess: () => {
          console.log('Ofer</b>ta creada exitosamente')
          modalService.closeModal()
          toast({
            title: 'Oferta enviada!',
          })
          window.location.href = `/offers/${id}?page=1`
        },
        onError: (error) => {
          console.log('Error al crear la oferta:', error)
          toast({
            title: 'Error al enviar la oferta!',
            variant: 'destructive',
          })
        },
      }
    )
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

  const filteredList = bidDataForAgent?.offers
    ?.filter((bid: any) =>
      Object.keys(filters).every((key: any) => {
        const filterValue = filters[key].toLowerCase()
        const bidValue = bid[key]?.toString().toLowerCase() || ''
        return bidValue.includes(filterValue)
      })
    )
    .sort((a: any, b: any) => {
      const aValue = a[sort.key]
      const bValue = b[sort.key]

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
    loadDetaildBidByid(id)
  }, [id])

  return (
    <>
      <button
        onClick={() => router.back()}
        className="bg-blue-500 text-white font-semibold py-2 px-4 rounded mb-4 flex items-center"
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
      <Card className="w-full">
        <CardHeader>
          <h2 className="text-xl font-bold mt-4">
            INFO SUBASTA: {bidDataForAgent.uuid}
          </h2>
          <div className="grid gap-2 pb-6">
            <div className="flex items-center gap-2">
              <span className="font-bold">Orígen:</span>
              <span>
                {bidDataForAgent.origin_country +
                  ' - ' +
                  bidDataForAgent.origin_name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">Destíno:</span>
              <span>
                {bidDataForAgent.destination_country +
                  ' - ' +
                  bidDataForAgent.destination_name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">Fecha inicio:</span>
              <span>{bidDataForAgent.inserted_at}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">Fecha Fin:</span>
              <span>{bidDataForAgent.expiration_date}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold"> Precio más bajo :</span>
              <span>
                {bidDataForAgent.currency} {bidDataForAgent.lowestPrice}
              </span>
            </div>
            <div className="flex items-center gap-2">
              {bidDataForAgent.shipping_type === shippingType ? (
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>
                      Proponer un nuevo precio
                    </AccordionTrigger>
                    <AccordionContent>
                      <ProposalFormMaritimo onSubmit={handleCreateOffer} />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>
                      Proponer un nuevo precio
                    </AccordionTrigger>
                    <AccordionContent>
                      <ProposalForm onSubmit={handleCreateOffer} />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}

              {/*<PriceInput sendOffer={handleCreateOffer} />*/}
            </div>
          </div>

          <CardTitle className="text-black-500 font-bold text-xl">
            Propuestas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="cursor-pointer">
                <TableHead
                  className="font-bold text-black"
                  onClick={() => handleSort('inserted_at')}
                >
                  Fecha de creación
                  {sort.key === 'inserted_at' && (
                    <span className="ml-1">
                      {sort.order === 'asc' ? '\u2191' : '\u2193'}
                    </span>
                  )}
                </TableHead>
                <TableHead
                  className="font-bold text-black"
                  onClick={() => handleSort('agent_id')}
                >
                  Código agente
                  {sort.key === 'agent_id' && (
                    <span className="ml-1">
                      {sort.order === 'asc' ? '\u2191' : '\u2193'}
                    </span>
                  )}
                </TableHead>
                <TableHead
                  className="font-bold text-black"
                  onClick={() => handleSort('price')}
                >
                  Oferta
                  {sort.key === 'price' && (
                    <span className="ml-1">
                      {sort.order === 'asc' ? '\u2191' : '\u2193'}
                    </span>
                  )}
                </TableHead>
              </TableRow>
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
                    placeholder="Filtrar agente"
                    onChange={(e) =>
                      handleFilterChange('agent_id', e.target.value)
                    }
                  />
                </TableCell>
                <TableCell className="font-medium">
                  <Input
                    placeholder="Filtrar Oferta"
                    onChange={(e) =>
                      handleFilterChange('price', e.target.value)
                    }
                  />
                </TableCell>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedList?.map(
                (
                  offer: {
                    agent_code: any
                    price: string
                    inserted_at: string
                  },
                  idx: number
                ) => (
                  <TableRow key={idx}>
                    <TableCell>
                      {convertToColombiaTime(offer.inserted_at)}
                    </TableCell>
                    <TableCell>{offer.agent_code}</TableCell>
                    <TableCell>{`${offer.price}`}</TableCell>
                  </TableRow>
                )
              )}
            </TableBody>
          </Table>
          <div className="w-full flex justify-end mt-8">
            <Suspense fallback={<div>Loading...</div>}>
              <Pagination
                totalPages={Math.ceil(
                  (filteredList?.length || 0) / itemsPerPage
                )}
              />
            </Suspense>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
export default Page
