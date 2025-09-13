"use client"
import { useCreateOffer } from "@/src/app/hooks/useCreateOffer"
import { useGetShipment } from "@/src/app/hooks/useGetShipment"
import { Badge } from "@/src/components/ui/badge"
import { Button } from "@/src/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/src/components/ui/table"
import { toast } from "@/src/components/ui/use-toast"
import { useTranslation } from "@/src/hooks/useTranslation"
import { convertToColombiaTime, formatPrice } from "@/src/lib/utils"
import { modalService } from "@/src/service/modalService"
import useAuthStore from "@/src/store/authStore"
import { getTransportTypeName } from "@/src/utils/translateTypeName"
import { ArrowLeft, CheckCircle, DollarSign, Loader2, Package, Ruler, Search, User } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useCallback, useEffect, useMemo, useState } from "react"
import Pagination from "../../common/components/pagination/Pagination"
import { OfferFilters } from "../../(importers)/detalle/components/OfferFilters"
import BidInfo from "./components/BidInfo"
import { useRealtimeOffers } from "@/src/hooks/useRealtimeOffers"
import { useGetOffersByShipment } from "@/src/app/hooks/useGetOffersByShipment"
import { OfferConfirmationDialog } from "../../(importers)/(home)/components/OfferConfirmacionDialog"

const OffersPageContent = () => {
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const user = useAuthStore((state) => state.user)
  const router = useRouter()

  const shipment_id = searchParams.get('shipment_id')

  const { mutate: createOffer } = useCreateOffer()
  const { data: bidDataForAgent, isPending: loading, refetch: refetchShipment } = useGetShipment({ shipment_id })
  const currentPage = Number(searchParams.get("page")) || 1
  const limit = 5 // Mantener 5 ofertas por página
  const searchTerm = searchParams.get('search') || ''

  // Estado de filtros para OfferFilters (pendientes)
  const [pendingFilters, setPendingFilters] = useState({
    agent_code: '',
    offer_id: '',
    price_min: '',
    price_max: '',
    status: ''
  })

  // Estado de filtros aplicados (que se envían al hook)
  const [appliedFilters, setAppliedFilters] = useState({
    agent_code: '',
    offer_id: '',
    price_min: '',
    price_max: '',
    status: ''
  })

  const { data: offersResponse, isLoading: loadingOffers, refetch: refetchOffers } = useGetOffersByShipment({ 
    shipment_id,
    page: currentPage,
    limit: limit,
    searchTerm: searchTerm.length >= 3 ? searchTerm : undefined,
    agentCodeFilter: appliedFilters.agent_code || undefined,
    offerIdFilter: appliedFilters.offer_id || undefined,
    priceMinFilter: appliedFilters.price_min || undefined,
    priceMaxFilter: appliedFilters.price_max || undefined,
    statusFilter: appliedFilters.status || undefined
  })

  // Extraer datos de la nueva estructura
  const offersData = offersResponse?.data || []
  const offersMetrics = offersResponse?.metrics
  const offersPagination = offersResponse?.pagination
  
  const bidDataForAgentWithShipmentPrice = { 
    ...bidDataForAgent, 
    lowestPrice: offersMetrics?.lowestPrice, 
    lastPrice: offersMetrics?.lastPrice, 
    offersCount: offersMetrics?.offersCount || 0
  }

  // Hook de realtime para actualizar ofertas y estado del shipment
  const { isConnected } = useRealtimeOffers(shipment_id)

  // Use the actual shipping type from the shipment data, fallback to URL param
  const shippingType = bidDataForAgentWithShipmentPrice?.shipping_type

  const [sort, setSort] = useState({ key: "id", order: "asc" })
  const [showFilters, setShowFilters] = useState(false)

  // Estado de filtros mejorado para manejar ambos tipos de ofertas
  const [filters, setFilters] = useState({
    inserted_at: "",
    agent_id: "",
    price: "",
    shipping_type: "",
    // Filtros para marítimo
    "details.freight_fees.container": "",
    "details.freight_fees.value": "",
    "details.destination_fees.handling": "",
    // Filtros para aéreo
    "details.freight_fees.dimensions.length": "",
    "details.additional_fees.fuel": "",
  });


  // Manejar cambios en los filtros
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev: any) => ({ ...prev, [key]: value }))
  }

  // Funciones para manejar OfferFilters
  const handleOfferFilterChange = (key: string, value: string) => {
    setPendingFilters(prev => ({ ...prev, [key]: value }))
  }

  const handleApplyOfferFilters = () => {
    // Aplicar los filtros pendientes a los filtros aplicados
    setAppliedFilters({ ...pendingFilters })
    setShowFilters(false)
    
    // Resetear a la primera página cuando se aplican filtros
    const currentUrl = new URL(window.location.href)
    currentUrl.searchParams.set('page', '1')
    router.push(currentUrl.pathname + currentUrl.search)
  }

  const handleClearOfferFilters = () => {
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

  // Manejar la creación de ofertas
  const handleCreateOffer = (value: any) => {
    sendOffer(value)
  }

  // Enviar una nueva oferta
  const sendOffer = async (info: any) => {
    if (!bidDataForAgentWithShipmentPrice) {
      toast({
        title: t('agentOffers.error'),
        description: t('agentOffers.noBidData'),
        variant: "destructive",
      })
      return
    }

    
    try {
      // Usar refetch del hook useGetShipment para obtener datos frescos
      const result = await refetchShipment()
      
      if (result.error) {
        console.error('Error al verificar estado del shipment:', result.error)
        toast({
          title: t('agentOffers.error'),
          description: 'No se pudo verificar el estado del embarque',
          variant: "destructive",
        })
        return
      }

      const currentShipmentData = result.data
      if (!currentShipmentData) {
        console.error('Shipment no encontrado')
        toast({
          title: t('agentOffers.error'),
          description: 'Embarque no encontrado',
          variant: "destructive",
        })
        return
      }

      // Verificar si el shipment está cerrado o cancelado
      if (currentShipmentData.status === 'Closed' || currentShipmentData.status === 'Cancelled') {
        console.error('Shipment is closed or cancelled:', currentShipmentData.status)
        toast({
          title: t('agentOffers.shipmentClosed'),
          description: t('agentOffers.shipmentClosedMessage'),
          variant: "destructive",
        })
        
      }

      // Verificar si el shipment ha expirado
      if (currentShipmentData.expiration_date) {
        const expirationDate = new Date(currentShipmentData.expiration_date)
        const now = new Date()
        
        if (expirationDate < now) {
          console.error('Shipment has expired:', currentShipmentData.expiration_date)
          toast({
            title: t('agentOffers.shipmentExpired'),
            description: t('agentOffers.shipmentExpiredMessage'),
            variant: "destructive",
          })
          
          return
        }
      }

      // Si todas las validaciones pasan, crear la oferta
      createOffer(
        { ...info, bid_id: bidDataForAgentWithShipmentPrice.id, agent_id: user?.id },
        {
          onSuccess: () => {
            console.log("Oferta creada exitosamente")
            modalService.closeModal()
            toast({
              title: t('agentOffers.offerSent'),
            })
          },
          onError: (error) => {
            if(error.message === 'Closed') {
              toast({
                title: t('agentOffers.shipmentClosed'),
                description: t('agentOffers.shipmentClosedMessage'),
                variant: "destructive",
              })
              return
            }
            console.log(error, "error")
            console.log("Error al crear la oferta:", error)
            toast({
              title: t('agentOffers.offerSentError'),
              variant: "destructive",
            })
          },
        },
      )
    } catch (error) {
      console.error('Error durante la validación:', error)
      toast({
        title: t('agentOffers.error'),
        description: 'Error al validar el estado del embarque',
        variant: "destructive",
      })
    }
  }

  // Manejar ordenamiento de la tabla
  const handleSort = (key: string) => {
    if (sort.key === key) {
      setSort((prev) => ({
        ...prev,
        order: prev.order === "asc" ? "desc" : "asc",
      }))
    } else {
      setSort({ key, order: "asc" })
    }
  }

  // Función para acceder a propiedades anidadas de un objeto
  const getNestedValue = (obj: any, path: string) => {
    const parts = path.split('.');
    let value = obj;
    
    for (const part of parts) {
      if (value == null || typeof value !== 'object') {
        return null;
      }
      value = value[part];
    }
    
    return value;
  };

  // Función mejorada para filtrar ofertas
  const filterOffers = useCallback((offers: any[]) => {
    if (!offers || !Array.isArray(offers)) return [];
    
    return offers.filter((offer) =>
      Object.entries(filters).every(([key, filterValue]) => {
        if (!filterValue) return true;
        
        const strFilterValue = String(filterValue).toLowerCase();
        
        // Si es un filtro específico para marítimo y la oferta es aérea, ignoramos este filtro
        if (offer.shipping_type === "Aéreo" && 
            (key === "details.freight_fees.container" || 
             key === "details.destination_fees.handling")) {
          return true;
        }
        
        // Si es un filtro específico para aéreo y la oferta es marítima, ignoramos este filtro
        if (offer.shipping_type === "Marítimo" && 
            (key.includes("details.freight_fees.dimensions") || 
             key === "details.additional_fees.fuel")) {
          return true;
        }
        
        // Si la clave contiene puntos, es una propiedad anidada
        if (key.includes('.')) {
          const offerValue = getNestedValue(offer, key);
          if (offerValue == null) return true;
          return String(offerValue).toLowerCase().includes(strFilterValue);
        } else {
          // Propiedad de primer nivel
          const offerValue = offer[key];
          if (offerValue == null) return true;
          return String(offerValue).toLowerCase().includes(strFilterValue);
        }
      })
    );
  }, [filters]);

  const goDetailOffer = (offer: any) => {
    router.push(`/detalle/offer/${offer.uuid}`)
  }

  // Función para ordenar ofertas
  const sortOffers = useCallback((offers: any[]) => {
    if (!offers || !Array.isArray(offers)) return [];
    
    return [...offers].sort((a, b) => {
      let aValue = sort.key.includes('.')
        ? getNestedValue(a, sort.key)
        : a[sort.key];
      
      let bValue = sort.key.includes('.')
        ? getNestedValue(b, sort.key)
        : b[sort.key];
      
      if (aValue == null) aValue = '';
      if (bValue == null) bValue = '';
      
      if (typeof aValue === "string" && typeof bValue === "string") {
        return sort.order === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
      }
      
      aValue = isNaN(Number(aValue)) ? 0 : Number(aValue);
      bValue = isNaN(Number(bValue)) ? 0 : Number(bValue);
      
      return sort.order === "asc" ? aValue - bValue : bValue - aValue;
    });
  }, [sort]);

  // Con el nuevo RPC, las ofertas ya vienen paginadas del servidor
  // Solo aplicamos filtros y ordenamiento locales si es necesario
  const filteredOffers = filterOffers(offersData)



  return (
    <>
      <button
        onClick={() => router.back()}
        className="bg-primary text-white font-semibold py-2 px-4 rounded mb-4 flex items-center"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        {t('common.back')}
      </button>
      <Card className="w-full">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
          </div>
          
          <div className="grid gap-2 pb-6 mt-4">
            {bidDataForAgentWithShipmentPrice && (
              <BidInfo 
                bidDataForAgent={bidDataForAgentWithShipmentPrice}
                onCreateOffer={handleCreateOffer}
                shippingType={shippingType}
              />
            )}
          </div>

          {/* Banner de advertencia para shipments cerrados o expirados */}
          {bidDataForAgentWithShipmentPrice && (
            <>
              {(bidDataForAgentWithShipmentPrice.status === 'Closed' || bidDataForAgentWithShipmentPrice.status === 'Cancelled') && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-red-100 rounded-full flex items-center justify-center">
                      <span className="text-red-600 text-sm">⚠️</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-red-800">
                        {t('agentOffers.shipmentClosed')}
                      </h3>
                      <p className="text-sm text-red-600 mt-1">
                        {t('agentOffers.shipmentClosedMessage')}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {bidDataForAgentWithShipmentPrice.status === 'Expired' && (
                <div className="mb-6 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="h-8 w-8 bg-orange-100 rounded-full flex items-center justify-center">
                      <span className="text-orange-600 text-sm">⏰</span>
                    </div>
                    <div>
                      <h3 className="font-medium text-orange-800">
                        {t('agentOffers.shipmentExpired')}
                      </h3>
                      <p className="text-sm text-orange-600 mt-1">
                        {t('agentOffers.shipmentExpiredMessage')}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}

        </CardHeader>
        <CardContent>
          {/* Botón para mostrar filtros */}
          <div className="mb-4 flex justify-between items-center">
          <CardTitle className="text-black-500 font-bold text-xl">{t('common.offers')}</CardTitle>
              <Button variant="outline" size="sm" onClick={() => setShowFilters(!showFilters)} className="text-muted-foreground">
                <Search className="h-4 w-4 mr-2" />
                {showFilters ? t('common.hideFilters') : t('common.showFilters')}
              </Button>
          </div>

          {/* Modal de filtros */}
          <OfferFilters
            isOpen={showFilters}
            shipmentId={shipment_id || ''}
            filters={pendingFilters}
            onFilterChange={handleOfferFilterChange}
            onApplyFilters={handleApplyOfferFilters}
            onClearFilters={handleClearOfferFilters}
            onClose={() => setShowFilters(false)}
          />

          {/* Estado de carga */}
          {(loading || loadingOffers) && (
            <div className="text-center py-8">
              <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto"></div>
              <p className="mt-2 text-sm text-muted-foreground">{t('agentOffers.loadingOffers')}</p>
            </div>
          )}

          {/* Tabla de ofertas */}
          <div className="overflow-x-auto bg-white rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow className="bg-white">
                  <TableHead className="w-[120px]">{t('offerCard.agentCode')}</TableHead>
                  <TableHead className="w-[120px]">{t('offerCard.offerId')}</TableHead>
                  <TableHead className="w-[100px]">{t('common.offerPrice')}</TableHead>
                  <TableHead className="w-[120px]">{t('offerCard.creationDate')}</TableHead>
                  <TableHead className="w-[100px]">{t('common.status')}</TableHead>
                  <TableHead className="w-[80px]">{t('common.actions')}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {offersData?.map((offer: any, idx: number) => (
                  <TableRow key={idx} className="hover:bg-gray-50">
                    {/* Código del Agente */}
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <User className="h-4 w-4 text-primary" />
                        <div>
                          <p className="font-medium text-sm">{offer.agent_code}</p>
                          {offer.agent_full_name && (
                            <p className="text-xs text-muted-foreground">{offer.agent_full_name}</p>
                          )}
                        </div>
                      </div>
                    </TableCell>

                    {/* ID de la Oferta */}
                    <TableCell>
                      <p className="text-xs text-muted-foreground font-mono">{offer.uuid?.substring(0, 12)}...</p>
                    </TableCell>

                    {/* Precio */}
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <span className="font-bold font-mono">{formatPrice(offer.price, offer.details.currency)}</span>
                      </div>
                    </TableCell>

                    {/* Fecha de Creación */}
                    <TableCell>
                      <p className="text-sm font-mono">{convertToColombiaTime(offer.inserted_at)}</p>
                    </TableCell>

                    {/* Estado */}
                    <TableCell>
                      <Badge
                        className={
                          offer.status === "pending" ? "bg-yellow-100 text-yellow-800 border-yellow-300" : 
                          offer.status === "accepted" ? "bg-green-100 text-green-800 border-green-300" :
                          "bg-red-100 text-red-800 border-red-300"
                        }
                      >
                        {offer.status === "pending" ? t('offerCard.pending') : 
                         offer.status === "accepted" ? t('offerCard.accepted') :
                         offer.status === "rejected" ? t('offerCard.rejected') : offer.status}
                      </Badge>
                    </TableCell>

                    {/* Acciones */}
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {/* Botón Aceptar Oferta (solo para importadores) */}
                          <Button
                            variant="default"
                            size="sm"
                            className=" text-white flex items-center gap-1"
                            onClick={() => goDetailOffer(offer)}
                          >
                            {t('common.showDetails')}
                          </Button>
                      </div>
                    </TableCell>


                  </TableRow>
                ))}
              </TableBody>
            </Table>

            {(!offersData || offersData.length === 0) && (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-2 text-lg font-medium">{t('agentOffers.noProposals')}</h3>
                <p className="text-sm text-muted-foreground">{t('agentOffers.noProposalsMessage')}</p>
              </div>
            )}
          </div>

          {/* Paginación - usar datos del servidor */}
          {offersPagination && offersPagination.totalPages > 1 && (
            <div className="w-full flex justify-end mt-8">
              <Suspense fallback={<div>Loading...</div>}>
                <Pagination 
                  totalPages={offersPagination.totalPages} 
                  currentPage={offersPagination.currentPage}
                  itemsPerPage={limit}
                />
              </Suspense>
            </div>
          )}
        </CardContent>
      </Card>
    </>
  )
}

const Page = () => {
  return (
    <Suspense fallback={<div className="flex items-center justify-center p-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      <span className="ml-2">Loading...</span>
    </div>}>
      <OffersPageContent />
    </Suspense>
  )
}

export default Page