'use client'
import { useGetShipments } from '@/src/app/hooks/useGetShipments'
import { Button } from '@/src/components/ui/button'
import {
  Card,
  CardContent
} from '@/src/components/ui/card'
import { useTranslation } from '@/src/hooks/useTranslation'
import type { BidListItem } from '@/src/models/BidListItem'
import { ShippingType } from '@/src/models/common'
import { modalService } from '@/src/service/modalService'
import useAuthStore from '@/src/store/authStore'
import { useBidStore } from '@/src/store/useBidStore'
import { supabase } from '@/src/utils/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import Pagination from '../../../common/components/pagination/Pagination'
import CancelShipmentModal from './CancelShipmentModal'
import CreateShipment from './CreateShipment/CreateShipment'
import { ExtendShipmentDeadline } from './ExtendShipmentDeadline'
import { ShipmentFilters } from './ShipmentFilters'
import { ShipmentTable } from './ShipmentTable'

interface ImporterShipmentCardsProps {
  filterType: 'withoutOffers' | 'withOffers' | 'closed'
}

// Function to normalize shipping type to translation key
const normalizeShippingType = (shippingType: string) => {
  const typeMap: { [key: string]: string } = {
    'Terrestre': 'land',
    'Almacén': 'warehouse',
    '1': 'maritime',  // Marítimo en español, Sea en inglés
    '2': 'air'        // Aéreo en español, Air en inglés
  }
  return typeMap[shippingType] || shippingType.toLowerCase()
}

export function ImporterShipmentCards({ filterType }: ImporterShipmentCardsProps) {
  const router = useRouter()
  const profile = useAuthStore((state) => state.profile)
  const { setMarketData } = useBidStore()
  const searchParams = useSearchParams()
  const { t } = useTranslation()

  // Map filterType to status for API call
  const getStatusFromFilterType = (filterType: string) => {
    switch (filterType) {
      case 'closed':
        return 'Closed'
      case 'withOffers':
      case 'withoutOffers':
        return 'Active' // Both with and without offers use Active status, we'll filter by offers_count
      default:
        return 'Active'
    }
  }

  const status = getStatusFromFilterType(filterType)
  
  const marketId =
    searchParams.get('market') ??
    profile?.all_markets?.[0]?.id?.toString() ??
    null

  const shippingType = searchParams.get('shipping_type') || '1'
  const searchTerm = searchParams.get('search') || ''
  
  // Parámetros estándar de paginación
  const currentPage = Number(searchParams.get('page')) || 1
  const limit = Number(searchParams.get('limit')) || 10

  // Filtros realmente aplicados para el filtrado (movido aquí para evitar error de referencia)
  const [appliedFilters, setAppliedFilters] = useState({
    uuid: '',
    origin: '',
    destination: '',
    inserted_at: '',
    expiration_date: '',
    value: '',
    offers_count: '',
  })

  const { data: shipmentResponse, refetch, isLoading, error } = useGetShipments({
    user_id: profile?.id || null,
    market_id: marketId,
    status,
    shipping_type: shippingType as ShippingType,
    filterType: filterType,
    searchTerm: searchTerm.length >= 3 ? searchTerm : undefined,
    page: currentPage,
    limit: limit,
    // Pasar filtros aplicados al backend
    originFilter: appliedFilters.origin && appliedFilters.origin !== 'all' ? appliedFilters.origin : undefined,
    destinationFilter: appliedFilters.destination && appliedFilters.destination !== 'all' ? appliedFilters.destination : undefined,
    creationDateFilter: appliedFilters.inserted_at || undefined,
    expirationDateFilter: appliedFilters.expiration_date || undefined,
    uuidFilter: appliedFilters.uuid && appliedFilters.uuid !== 'all' ? appliedFilters.uuid : undefined,
    offersCountFilter: appliedFilters.offers_count || undefined,
  })
  
  // Extraer datos y paginación del response
  const shipmentList = shipmentResponse?.data || []
  const pagination = shipmentResponse?.pagination

  useEffect(() => {
    if (profile?.id && marketId) {
      console.log('🔄 Refetching shipments...')
      refetch()
    } else {
      console.log('⏸️ Skipping refetch - missing profile or market')
    }
  }, [shippingType, profile?.id, marketId, refetch])

  // El ordenamiento ahora se maneja en el backend

  const [showFilters, setShowFilters] = useState(false)
  const [cancelModalOpen, setCancelModalOpen] = useState(false)
  const [shipmentToCancel, setShipmentToCancel] = useState<{
    uuid: string
    origin: string
    destination: string
    value?: number
    currency?: string
  } | null>(null)
  const [hasOffersForCancel, setHasOffersForCancel] = useState<boolean>(false)
  const [checkingCancelId, setCheckingCancelId] = useState<string | null>(null)

  // Filtros que el usuario está configurando (no aplicados aún)
  const [pendingFilters, setPendingFilters] = useState({
    uuid: '',
    origin: '',
    destination: '',
    inserted_at: '',
    expiration_date: '',
    value: '',
    offers_count: '',
  })


  const handleFilterChange = (key: string, value: string) => {
    setPendingFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleApplyFilters = () => {
    // Aplicar los filtros pendientes
    setAppliedFilters(pendingFilters)
    console.log('Filtros aplicados:', pendingFilters)
  }

  const handleClearFilters = () => {
    const emptyFilters = {
      uuid: '',
      origin: '',
      destination: '',
      inserted_at: '',
      expiration_date: '',
      value: '',
      offers_count: '',
    }
    setPendingFilters(emptyFilters)
    setAppliedFilters(emptyFilters)
  }

  const showExtendFinalDate = (
    expiration_date: string,
    origin: string,
    destination: string,
    id: string,
    shipping_date?: string | null
  ) => {
    modalService.showModal({
      component: ExtendShipmentDeadline,
      props: {
        expiration_date: expiration_date,
        origin: origin,
        destination: destination,
        id,
        shippingType,
        shipping_date,
        onRefetch: refetch
      },
    })
  }

  const handleCancelShipment = async (
    bid: any
  ) => {
    setCheckingCancelId(bid.id.toString())
    try {
      // Consultar si existen ofertas para este shipment
      const { count, error } = await supabase
        .from('offers')
        .select('id', { count: 'exact', head: true })
        .eq('shipment_id', bid.id)

      if (error) {
        console.error('Error checking offers (cancel):', error)
      }
      const hasOffers = (count || 0) > 0
      setHasOffersForCancel(hasOffers)

      setShipmentToCancel({
        uuid: bid.uuid,
        origin: bid.origin,
        destination: bid.destination,
        value: bid.value,
        currency: bid.currency
      })
      setCancelModalOpen(true)
    } finally {
      setCheckingCancelId(null)
    }
  }

  // handleSort removido - el ordenamiento se maneja en el backend

  const goDetails = (id: string) => {
    setMarketData(marketId)
    router.push(`/detalle/?shipment_id=${id}&market=${marketId}`)
  }

  // Manejo de estados de carga y error
  if (!profile?.id) {
    return (
      <Card className="w-full bg-gray-50">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
            <p className="text-muted-foreground">Cargando perfil de usuario...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!marketId) {
    return (
      <Card className="w-full bg-gray-50">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="h-8 w-8 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-yellow-600 text-sm">⚠️</span>
            </div>
            <p className="text-muted-foreground">{t('common.noMarketSelected')}</p>
            <p className="text-sm text-muted-foreground mt-2">{t('common.pleaseSelectMarket')}</p>
          </div>
        </CardContent>
      </Card>
    )
  }


  if (error) {
    return (
      <Card className="w-full bg-gray-50">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-red-600 text-sm">❌</span>
            </div>
            <p className="text-muted-foreground">{t('common.errorLoadingShipments')}</p>
            <p className="text-sm text-muted-foreground mt-2">{t('common.pleaseTryAgain')}</p>
            <Button onClick={() => refetch()} className="mt-4" variant="outline">
              {t('common.retry')}
            </Button>
          </div>
        </CardContent>
      </Card>
    )
  }

  // Los datos ya vienen filtrados y ordenados desde el backend
  const paginatedList = shipmentList
  const getSubtitle = () => {
    switch (filterType) {
      case 'withoutOffers':
        return t('importerShipmentCards.withoutOffers')
      case 'withOffers':
        return t('importerShipmentCards.withOffers')
      case 'closed':
        return t('importerShipmentCards.closed')
      default:
        return ''
    }
  }

  return (
    <div>
      

      <ShipmentTable
        title={t(`transport.${normalizeShippingType(shippingType)}`)}
        subtitle={getSubtitle()}
        shipments={paginatedList}
        onShowFilters={undefined}
        onCreateNew={() => {
          // El CreateShipment se renderiza directamente en el componente
        }}
        onExtendDeadline={showExtendFinalDate}
        onCancelShipment={handleCancelShipment}
        onGoDetails={goDetails}
        checkingCancelId={checkingCancelId}
        filterType={filterType}
        createShipmentComponent={<CreateShipment onRefetch={refetch} />}
        isLoading={isLoading}
        filters={pendingFilters}
        onFilterChange={handleFilterChange}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />

      {pagination && pagination.totalPages > 1 && (
        <div className="w-full flex justify-end mt-6">
          <Suspense fallback={<div>Loading...</div>}>
            <Pagination
              totalPages={pagination.totalPages}
              currentPage={pagination.currentPage}
              itemsPerPage={limit}
              filterType={filterType}
            />
          </Suspense>
        </div>
      )}

      {/* Cancel Shipment Modal */}
      <CancelShipmentModal
        isOpen={cancelModalOpen}
        onClose={() => {
          setCancelModalOpen(false)
          setShipmentToCancel(null)
        }}
        shipment={shipmentToCancel}
        hasOffers={hasOffersForCancel}
        onSuccess={() => {
          refetch()
        }}
      />
    </div>
  )
}
