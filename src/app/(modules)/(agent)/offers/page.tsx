"use client"
import { useCreateOffer } from "@/src/app/hooks/useCreateOffer"
import { useGetBidById } from "@/src/app/hooks/useGetBidById"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/src/components/ui/accordion"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { toast } from "@/src/components/ui/use-toast"
import { modalService } from "@/src/service/modalService"
import useAuthStore from "@/src/store/authStore"
import { ArrowLeft, DollarSign } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { Suspense, useEffect, useMemo, useState } from "react"
import Pagination from "../../common/components/pagination/Pagination"
import AdvancedFilters from "./components/AdvancedFilters"
import BidInfo from "./components/BidInfo"
import OfferCard from "./components/OfferCard"
import ProposalModal from "./components/ProposalModal"
import { FiltersOffer } from '@/src/models/FiltersOffer'

const Page = () => {
  const searchParams = useSearchParams()
  const [bidDataForAgent, setBidDataForAgent] = useState<any>({})
  const user = useAuthStore((state) => state.user)

  const shippingType = 'Marítimo'
  const offer_id = searchParams.get('offer_id')

  const { mutate: createOffer } = useCreateOffer()
  const { mutate: fetchDetailById, isPending: loading } = useGetBidById()

  const currentPage = Number(searchParams.get("page")) || 1
  const [sort, setSort] = useState({ key: "id", order: "asc" })
  const [itemsPerPage] = useState(5)

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

  const router = useRouter()
  const [expandedOffers, setExpandedOffers] = useState<Record<string, boolean>>({})

  // Cargar detalles de la subasta
  const loadDetaildBidByid = (uuid: any) => {
    if (!uuid) return;
    
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
      },
    )
  }

  // Manejar cambios en los filtros
  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev: any) => ({ ...prev, [key]: value }))
  }

  // Resetear todos los filtros
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

  // Manejar la creación de ofertas
  const handleCreateOffer = (value: any) => {
    console.log(value, "value")
    sendOffer(value)
  }

  // Controla la expansión/colapso de detalles de oferta
  const toggleOfferDetails = (offerId: string) => {
    setExpandedOffers((prev) => ({
      ...prev,
      [offerId]: !prev[offerId],
    }))
  }

  // Cerrar modal de confirmación
  const closeConfirm = () => {
    modalService.closeModal()
  }

  // Enviar una nueva oferta
  const sendOffer = (info: any) => {
    console.log(JSON.stringify(info), "info")
    
    createOffer(
      { ...info, ...{ bid_id: bidDataForAgent.id, agent_id: user?.id } },
      {
        onSuccess: () => {
          console.log("Oferta creada exitosamente")
          modalService.closeModal()
          toast({
            title: "Oferta enviada!",
          })

          window.location.reload()
        },
        onError: (error) => {
          console.log("Error al crear la oferta:", error)
          toast({
            title: "Error al enviar la oferta!",
            variant: "destructive",
          })
        },
      },
    )
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
  const filterOffers = (offers: any[]) => {
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
  };

  // Función para ordenar ofertas
  const sortOffers = (offers: any[]) => {
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
  };

  // Optimización con useMemo
  const filteredOffers = useMemo(() => {
    return filterOffers(bidDataForAgent?.offers || []);
  }, [bidDataForAgent?.offers, filters]);

  const sortedOffers = useMemo(() => {
    return sortOffers(filteredOffers);
  }, [filteredOffers, sort]);

  const paginatedList = useMemo(() => {
    return sortedOffers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  }, [sortedOffers, currentPage, itemsPerPage]);

  // Efecto para cargar datos al montar el componente o cambiar offer_id
  useEffect(() => {
    loadDetaildBidByid(offer_id);
  }, [offer_id]);

  return (
    <>
      <button
        onClick={() => router.back()}
        className="bg-blue-500 text-white font-semibold py-2 px-4 rounded mb-4 flex items-center"
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Regresar
      </button>
      <Card className="w-full">
        <CardHeader>
          <h2 className="text-xl font-bold mt-4">INFO SUBASTA: {bidDataForAgent.uuid}</h2>
          <div className="grid gap-2 pb-6">
          {bidDataForAgent && (BidInfo({ bidDataForAgent }))}
            <div className="flex items-center gap-2 justify-center">
              <ProposalModal 
                shippingType={shippingType}
                bidDataShippingType={bidDataForAgent.shipping_type}
                onSubmit={handleCreateOffer}
              />
            </div>
          </div>

          <CardTitle className="text-black-500 font-bold text-xl">Propuestas</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filtros avanzados como componente */}
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

          {/* Tarjetas de propuestas */}
          <div className="space-y-4">
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
          </div>

          {/* Paginación */}
          <div className="w-full flex justify-end mt-8">
            <Suspense fallback={<div>Loading...</div>}>
              <Pagination totalPages={Math.ceil((filteredOffers?.length || 0) / itemsPerPage)} />
            </Suspense>
          </div>
        </CardContent>
      </Card>
    </>
  )
}

export default Page