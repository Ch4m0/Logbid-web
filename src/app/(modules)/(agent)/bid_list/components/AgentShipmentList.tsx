'use client'
import { useGetBidListByMarket } from '@/src/app/hooks/useGetBidListByMarket'
import { useGetAgentOfferedShipments } from '@/src/app/hooks/useGetAgentOfferedShipments'
import useAuthStore from '@/src/store/authStore'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useEffect, useState } from 'react'
import { ShippingType } from '@/src/models/common'
import { useTranslation } from '@/src/hooks/useTranslation'
import { ShipmentTable } from '@/src/app/(modules)/(importers)/(home)/components/ShipmentTable'
import { useRealtimeShipments } from '@/src/hooks/useRealtimeShipments'
import Pagination from '../../../common/components/pagination/Pagination'


interface ShipmentData {
  id: string
  inserted_at: string
  uuid: string
  shipping_type: string
  origin: string
  destination: string
  offers_count: number
  origin_country: string
  origin_name: string
  destination_country: string
  destination_name: string
  expiration_date: string
  shipping_date?: string | null
  agent_code?: string
  last_price?: number | null
  value?: number | null
  status?: string
  offers?: any[] // Array de ofertas para verificar si el agente logueado ya ofertó
}

interface AgentShipmentListProps {
  status: 'Active' | 'Closed' | 'Offered' | 'WithoutOffers' | 'WithOffers' | 'MyOffers'
}

const normalizeShippingType = (shippingType: string) => {
  const typeMap: { [key: string]: string } = {
    '1': 'maritime',
    '2': 'air',
    'Terrestre': 'land',
    'Almacén': 'warehouse'
  }
  return typeMap[shippingType] || shippingType.toLowerCase()
}

export function AgentShipmentList({ status }: AgentShipmentListProps) {
  
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const user = useAuthStore((state) => state.user)
  const router = useRouter()
  
  const marketId =
    searchParams.get('market') ??
    user?.all_markets[0]?.id?.toString() ??
    null


  const shippingType = searchParams.get('shipping_type') || '1'
  const searchTerm = searchParams.get('search') || ''
  const currentPage = Number(searchParams.get('page')) || 1
  const limit = Number(searchParams.get('limit')) || 10

  // Estados para filtros aplicados
  const [appliedFilters, setAppliedFilters] = useState({
    uuid: '',
    origin: '',
    destination: '',
    inserted_at: '',
    expiration_date: '',
    value: '',
    offers_count: '',
  })

  // Decidir qué hook usar basado en el status
  const shouldUseOfferedShipmentsHook = status === 'MyOffers'

  const { data: offeredShipmentResponse, refetch: refetchOffered, isLoading: isLoadingOffered } = useGetAgentOfferedShipments({
    marketId,
    agentId: user?.id?.toString() || null,
    shippingType: shippingType as ShippingType,
    searchTerm: searchTerm.length >= 3 ? searchTerm : undefined,
    page: currentPage,
    limit: limit,
    originFilter: appliedFilters.origin && appliedFilters.origin !== 'all' ? appliedFilters.origin : undefined,
    destinationFilter: appliedFilters.destination && appliedFilters.destination !== 'all' ? appliedFilters.destination : undefined,
    creationDateFilter: appliedFilters.inserted_at || undefined,
    expirationDateFilter: appliedFilters.expiration_date || undefined,
    uuidFilter: appliedFilters.uuid && appliedFilters.uuid !== 'all' ? appliedFilters.uuid : undefined,
    offersCountFilter: appliedFilters.offers_count || undefined,
    // Solo activar este hook para MyOffers
    enabled: shouldUseOfferedShipmentsHook,
  })

  // Hook estándar para otros status
  const { data: standardShipmentResponse, refetch: refetchStandard, isLoading: isLoadingStandard } = useGetBidListByMarket({
    marketId,
    status,
    user_id: user?.id?.toString() || null,
    shippingType: shippingType as ShippingType,
    searchTerm: searchTerm.length >= 3 ? searchTerm : undefined,
    page: currentPage,
    limit: limit,
    originFilter: appliedFilters.origin && appliedFilters.origin !== 'all' ? appliedFilters.origin : undefined,
    destinationFilter: appliedFilters.destination && appliedFilters.destination !== 'all' ? appliedFilters.destination : undefined,
    creationDateFilter: appliedFilters.inserted_at || undefined,
    expirationDateFilter: appliedFilters.expiration_date || undefined,
    uuidFilter: appliedFilters.uuid && appliedFilters.uuid !== 'all' ? appliedFilters.uuid : undefined,
    offersCountFilter: appliedFilters.offers_count || undefined,
    // Solo activar este hook para status que NO sean MyOffers
    enabled: !shouldUseOfferedShipmentsHook,
  })


  // Seleccionar la respuesta correcta basada en el hook usado
  const shipmentResponse = shouldUseOfferedShipmentsHook ? offeredShipmentResponse : standardShipmentResponse
  const refetch = shouldUseOfferedShipmentsHook ? refetchOffered : refetchStandard
  const isLoading = shouldUseOfferedShipmentsHook ? isLoadingOffered : isLoadingStandard

  // Extraer datos y paginación del response
  const shipmentList = shipmentResponse?.data || []
  const pagination = shipmentResponse?.pagination

  // Hook de tiempo real para shipments
  const { isConnected } = useRealtimeShipments(marketId)
  

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
    setPendingFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleApplyFilters = () => {
    // Aplicar los filtros pendientes
    setAppliedFilters(pendingFilters)
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

  const handleGoDetails = (uuid: string) => {
    router.push(`/offers?shipment_id=${uuid}&market=${marketId}&shipping_type=${shippingType}`)
  }

  // Debug: Detectar cambios en parámetros
  useEffect(() => {
    refetch()
  }, [shippingType, refetch, marketId, status])

  // Función para obtener el subtítulo basado en el status
  const getSubtitle = () => {
    switch (status) {
      case 'WithoutOffers':
        return t('agentShipmentList.pending')
      case 'WithOffers':
        return t('agentShipmentList.myOffers')
      case 'MyOffers':
        return t('agentShipmentList.myOffers')
      case 'Closed':
        return t('agentShipmentList.history')
      default:
        return ''
    }
  }

  // Determinar el tipo de filtro para ShipmentTable
  const getFilterType = () => {
    if (status === 'WithoutOffers') return 'withoutOffers'
    if (status === 'WithOffers' || status === 'MyOffers') return 'withOffers'
    if (status === 'Closed') return 'closed'
    return 'withoutOffers'
  }

  return (
    <div className="w-ful">
      <ShipmentTable
        title={t(`transport.${normalizeShippingType(shippingType)}`)}
        subtitle={`${getSubtitle()}`}
        shipments={shipmentList}
        onGoDetails={handleGoDetails}
        showCreateButton={false}
        filterType={getFilterType()}
        isLoading={isLoading}
        filters={pendingFilters}
        onFilterChange={handleFilterChange}
        onApplyFilters={handleApplyFilters}
        onClearFilters={handleClearFilters}
      />

      {/* Paginación si hay más de una página */}
      {pagination && pagination.totalPages > 1 && (
        <div className="w-full flex justify-end mt-6">
          <Suspense fallback={<div>Loading...</div>}>
            <Pagination
              totalPages={pagination.totalPages}
              currentPage={pagination.currentPage}
              itemsPerPage={limit}
              filterType={getFilterType()}
            />
          </Suspense>
        </div>
      )}
    </div>
  )
}