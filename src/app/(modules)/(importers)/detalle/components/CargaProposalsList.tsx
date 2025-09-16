'use client'
import { useGetShipment } from '@/src/app/hooks/useGetShipment'
import { modalService } from '@/src/service/modalService'
import { useRouter, useSearchParams } from 'next/navigation'
import { Suspense, useState } from 'react'
import Pagination from '../../../common/components/pagination/Pagination'

import { OfferConfirmationDialog } from '../../(home)/components/OfferConfirmacionDialog'
import { useTranslation } from '@/src/hooks/useTranslation'
import { useGetOffersByShipment } from '@/src/app/hooks/useGetOffersByShipment'
import { useRealtimeOffers } from '@/src/hooks/useRealtimeOffers'
import { TableColumn, AgentTable } from '@/src/app/(modules)/(importers)/detalle/components/AgentTable'
import { Button } from '@/src/components/ui/button'
import { Eye, Check } from 'lucide-react'
import { OfferFilters } from './OfferFilters'

export function CargaProposalsList() {
  const router = useRouter()
  const { t } = useTranslation()
  const params = useSearchParams()

  const currentPage = Number(params.get('page')) || 1
  const shipmentId = params.get('shipment_id') || '' // Mantenemos el nombre del param para compatibilidad
  const marketId = params.get('market') || ''

  // Estados para filtros
  const [showFilters, setShowFilters] = useState(false)
  const [appliedFilters, setAppliedFilters] = useState({
    agent_code: '',
    offer_id: '',
    price_min: '',
    price_max: '',
    status: ''
  })
  
  const [pendingFilters, setPendingFilters] = useState({
    agent_code: '',
    offer_id: '',
    price_min: '',
    price_max: '',
    status: ''
  })


  // Usar el hook con paginación y filtros
  const { data: offersResponse, isPending: loading } = useGetOffersByShipment({ 
    shipment_id: shipmentId,
    page: currentPage,
    limit: 10,
    enabled: !!shipmentId,
    agentCodeFilter: appliedFilters.agent_code || undefined,
    offerIdFilter: appliedFilters.offer_id || undefined,
    priceMinFilter: appliedFilters.price_min || undefined,
    priceMaxFilter: appliedFilters.price_max || undefined,
    statusFilter: appliedFilters.status || undefined
  })
  
  const offers = offersResponse?.data || []
  const pagination = offersResponse?.pagination
  const { data: shipment, isPending: loadingShipment } = useGetShipment({ shipment_id: shipmentId })

  // Hook de tiempo real para ofertas (con fallback a auto-refresh)
  const { isConnected } = useRealtimeOffers(shipmentId)

  // Funciones para manejar filtros
  const handleFilterChange = (key: string, value: string) => {
    setPendingFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleApplyFilters = () => {
    setAppliedFilters(pendingFilters)
    
    // Resetear a la primera página cuando se aplican filtros
    const currentUrl = new URL(window.location.href)
    currentUrl.searchParams.set('page', '1')
    router.push(currentUrl.pathname + currentUrl.search)
  }

  const handleClearFilters = () => {
    const emptyFilters = {
      agent_code: '',
      offer_id: '',
      price_min: '',
      price_max: '',
      status: ''
    }
    setPendingFilters(emptyFilters)
    setAppliedFilters(emptyFilters)
    
    // Resetear a la primera página cuando se limpian filtros
    const currentUrl = new URL(window.location.href)
    currentUrl.searchParams.set('page', '1')
    router.push(currentUrl.pathname + currentUrl.search)
  }

  const handleViewOfferDetail = (offerId: string) => {
    router.push(`/detalle/offer/${offerId}?market=${marketId}`)
  }



  if (!params) {
    return <h1>{t('proposals.errorLoading')}</h1>
  }

  if (loading || loadingShipment) {
    return <h1>{t('common.loading')}</h1>
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
    
    modalService.showModal({
      component: OfferConfirmationDialog,
      props: modalData,
    })
  }

  // Los datos ya vienen paginados del hook, no necesitamos filtrar ni paginar aquí
  const paginatedList = offers

  // Configuración de columnas para la tabla de ofertas
  const columns: TableColumn[] = [
    {
      key: 'agent_code',
      label: t('offerCard.agentCode'),
      width: 'w-[120px]',
      minWidth: '120px'
    },
    {
      key: 'uuid',
      label: t('offerCard.offerId'),
      width: 'w-[120px]',
      minWidth: '120px'
    },
    {
      key: 'price',
      label: t('offerCard.offer'),
      width: 'w-[100px]',
      minWidth: '100px'
    },
    {
      key: 'inserted_at',
      label: t('offerCard.creationDate'),
      width: 'w-[160px]',
      minWidth: '120px'
    },
    {
      key: 'status',
      label: t('common.status'),
      width: 'w-[100px]',
      minWidth: '100px'
    },
    {
      key: 'actions',
      label: t('common.actions'),
      width: 'w-[120px]',
      minWidth: '120px',
      render: (offer: any) => (
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={(e: React.MouseEvent) => {
              e.stopPropagation()
              handleViewOfferDetail(offer.uuid)
            }}
            className="flex items-center gap-1"
          >
            <Eye className="h-4 w-4" />
            {t('common.showDetails')}
          </Button>
          {offer.status === "pending" && (
            <Button
              variant="default"
              size="sm"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation()
                openModal(offer)
              }}
              className="flex items-center gap-1"
            >
              <Check className="h-4 w-4" />
              {t('common.accept')}
            </Button>
          )}
        </div>
      )
    }
  ]



  return (
    <>
      {shipment && (
        <div className="w-full">
          {/* Tabla de ofertas usando AgentTable */}
          <AgentTable
            title={t('common.offers')}
            subtitle=""
            data={paginatedList}
            columns={columns}
            isLoading={loading}
            emptyMessage={t('proposals.noProposals')}
            noSearchResultsMessage={t('common.noSearchResults')}
            enableSearch={false}
            showFilters={showFilters}
            onToggleFilters={() => setShowFilters(!showFilters)}
            hoverable={true}
            stickyActions={true}
            filtersComponent={null}
            pagination={
              <Suspense fallback={<div>Loading...</div>}>
                <Pagination
                  currentPage={currentPage}
                  totalPages={pagination?.totalPages || 1}
                  itemsPerPage={10}
                />
              </Suspense>
            }
          />

          {/* Modal de filtros */}
          <OfferFilters
            isOpen={showFilters}
            shipmentId={shipmentId}
            filters={pendingFilters}
            onFilterChange={handleFilterChange}
            onApplyFilters={handleApplyFilters}
            onClearFilters={handleClearFilters}
            onClose={() => setShowFilters(false)}
          />
        </div>
      )}
    </>
  )
}
