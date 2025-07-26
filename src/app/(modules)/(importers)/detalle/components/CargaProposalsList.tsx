'use client'
import { useGetShipment } from '@/src/app/hooks/useGetShipment'
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
import AdvancedFilters from '../../../(agent)/offers/components/AdvancedFilters'
import OfferCard from '../../../(agent)/offers/components/OfferCard'
import Pagination from '../../../common/components/pagination/Pagination'
import BidInfo from './BidInfo'
import { OfferConfirmationDialog } from '../../(home)/components/OfferConfirmacionDialog'
import { FiltersOffer } from '@/src/models/FiltersOffer'
import useAuthStore from '@/src/store/authStore'
import { useTranslation } from '@/src/hooks/useTranslation'

interface Offer {
  id: number
  uuid: string
  agent_id: number
  price: string
  inserted_at: string
}

interface Shipment {
  id: number
  uuid: string
  origin_country: string
  origin_name: string
  destination_country: string
  destination_name: string
  transportation: string
  comex_type: string
  shipping_type: string
  inserted_at: string
  expiration_date: string
  shipping_date?: string | null
  offers: Offer[]
  currency: string
  value: string
  lowestPrice: string
  last_price: string
  total_weight: number
  measure_type: string
  volume: number
  units: number
  merchandise_type: string
  dangerous_march: boolean
  tariff_item: string
  agent_code: string
}

export function CargaProposalsList() {
  const router = useRouter()
  const { t } = useTranslation()
  const [sort, setSort] = useState({ key: 'id', order: 'asc' })
  const params = useSearchParams()

  const currentPage = Number(params.get('page')) || 1
  const shipmentId = params.get('bidId') || '' // Mantenemos el nombre del param para compatibilidad
  const marketId = params.get('market') || ''

  const { data: shipment, isPending: loading } = useGetShipment({ shipment_id: shipmentId })
  const [itemsPerPage] = useState(20)

  const [expandedOffers, setExpandedOffers] = useState<Record<string, boolean>>({})
  const [shipmentDataForAgent, setShipmentDataForAgent] = useState<any>({})

  const [filters, setFilters] = useState<FiltersOffer>({
    inserted_at: '',
    agent_id: '',
    price: '',
    "details.freight_fees.container": '',
    "details.freight_fees.value": '',
    "details.destination_fees.handling": '',
    "details.freight_fees.dimensions.length": '',
    "details.additional_fees.fuel": '',
  })

  const resetFilters = () => {
    setFilters({
      inserted_at: "",
      agent_id: "",
      price: "",
      "details.freight_fees.container": "",
      "details.freight_fees.value": "",
      "details.destination_fees.handling": "",
      "details.freight_fees.dimensions.length": "",
      "details.additional_fees.fuel": "",
    });
  }

  useEffect(() => {
    if (shipment && shipment.status === 'Closed') {
      window.location.href = '/?market=' + marketId
    }
  }, [shipment, marketId])

  const toggleOfferDetails = (offerId: string) => {
    setExpandedOffers((prev) => ({
      ...prev,
      [offerId]: !prev[offerId],
    }))
  }

  if (!params) {
    return <h1>{t('proposals.errorLoading')}</h1>
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
    offer: any
  ) => {
    // Estructurar los datos según lo que espera el modal
    const modalData = {
      id: offer.id,
      uuid: offer.uuid,
      agent_code: offer.agent_code,
      price: offer.price,
      shipping_type: shipment?.shipping_type || offer.shipping_type,
      details: offer.details,
      status: offer.status,
      origin_country: shipment?.origin_country,
      origin_name: shipment?.origin_name,
      destination_country: shipment?.destination_country,
      destination_name: shipment?.destination_name,
      shipment_uuid: shipment?.uuid,
      shipment_id: shipment?.id,
      // Campos legacy para compatibilidad
      originBid: shipment?.origin_country + ' - ' + shipment?.origin_name,
      finishBid: shipment?.destination_country + ' - ' + shipment?.destination_name,
      codeBid: shipment?.uuid,
      bidId: shipment?.id,
    }
    
    console.log('Modal data being passed:', modalData)
    
    modalService.showModal({
      component: OfferConfirmationDialog,
      props: modalData,
    })
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  // Función auxiliar para obtener valor de propiedades anidadas
  const getNestedProperty = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : null;
    }, obj);
  }

  // Filtrado y ordenamiento aplicado a la lista de ofertas
  const filteredOffers = shipment?.offers
    ?.filter((offer: any) => {
      // Si no hay filtros aplicados, mostrar todas las ofertas
      const hasActiveFilters = Object.values(filters).some(value => value && value.trim() !== '');
      if (!hasActiveFilters) return true;
      
      // Solo aplicar filtros si hay valores de filtro activos
      return Object.keys(filters).every((key) => {
        const filterValue = filters[key as keyof typeof filters];
        if (!filterValue || filterValue.trim() === '') return true; // Si este filtro específico está vacío, no filtrar por él
        
        let offerValue: any;
        
        // Manejar propiedades anidadas
        if (key.includes('.')) {
          offerValue = getNestedProperty(offer, key);
        } else {
          offerValue = offer[key];
        }
        
        // Si el valor no existe para este filtro específico, no mostrar esta oferta
        if (offerValue === null || offerValue === undefined) {
          return false;
        }
        
        return offerValue
          .toString()
          .toLowerCase()
          .includes(filterValue.toLowerCase());
      });
    })
    .sort((a: any, b: any) => {
      let aValue, bValue;
      
      // Manejar propiedades anidadas para el sorting también
      if (sort.key.includes('.')) {
        aValue = getNestedProperty(a, sort.key);
        bValue = getNestedProperty(b, sort.key);
      } else {
        aValue = a[sort.key as keyof typeof a];
        bValue = b[sort.key as keyof typeof b];
      }

      if (typeof aValue === 'string' && typeof bValue === 'string') {
        return sort.order === 'asc'
          ? aValue.localeCompare(bValue)
          : bValue.localeCompare(aValue)
      }

      return sort.order === 'asc'
        ? Number(aValue) - Number(bValue)
        : Number(bValue) - Number(aValue)
    })

  console.log(shipment, 'shipment')

  const paginatedList = filteredOffers?.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  if (loading) {
    return <h1>{t('common.loading')}</h1>
  }

  return (
    <>
      {shipment && (
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
              {t('common.back')}
            </button>
            <h2 className="text-2xl font-bold mt-4 text-blue-500">
              {t('proposals.tripDetail')}
            </h2>
            <div className="grid gap-2 pb-6">
              {shipment && <BidInfo bidDataForAgent={shipment} />}
            </div>

            <CardTitle className="text-blue-500 font-bold text-xl">
              {t('proposals.title')}
            </CardTitle>
          </CardHeader>
          <CardContent>
       
          <AdvancedFilters 
            filters={filters} 
            handleFilterChange={handleFilterChange} 
            handleSort={handleSort} 
            resetFilters={resetFilters}
            bidDataForAgent={shipmentDataForAgent}
          />

          {/* Estado de carga */}
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">{t('proposals.loadingOffers')}</p>
            </div>
          )}



          {paginatedList?.map((offer: any, idx: number) => (
              <OfferCard 
                key={idx} 
                offer={offer} 
                toggleOfferDetails={toggleOfferDetails} 
                expandedOffers={expandedOffers} 
                acceptOffer={openModal}
              />
          ))}


          {(!paginatedList || paginatedList.length === 0) && (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-2 text-lg font-medium">{t('proposals.noProposals')}</h3>
                <p className="text-sm text-muted-foreground">{t('proposals.noProposalsMessage')}</p>
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
