"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Input } from "@/src/components/ui/input"
import { Suspense, useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { convertToColombiaTime } from "../../../../../lib/utils"
import useAuthStore from "@/src/store/authStore"
import { useRouter } from "next/navigation"
import { modalService } from "@/src/service/modalService"
import { toast } from "@/src/components/ui/use-toast"
import { useCreateOffer } from "@/src/app/hooks/useCreateOffer"
import { useGetBidById } from "@/src/app/hooks/useGetBidById"
import Pagination from "../../../common/components/pagination/Pagination"
import ProposalForm from "./components/proposalForm"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/src/components/ui/accordion"
import ProposalFormMaritimo from "./components/ProposalFormMaritimo"
import { ArrowLeft, ArrowUpDown, Badge, Calendar, ChevronDown, DollarSign, Package, Ship, Tag, User } from "lucide-react"
import { Button } from "@/src/components/ui/button"
import { Tabs } from "@radix-ui/react-tabs"
import { TabsContent, TabsList, TabsTrigger } from "@/src/components/ui/tabs"



const Page = () => {
  const searchParams = useSearchParams()
  const { id } = useParams()
  const [bidDataForAgent, setBidDataForAgent] = useState<any>({})
  const user = useAuthStore((state) => state.user)

  const shippingType = "Marítimo"

  const { mutate: createOffer } = useCreateOffer()
  const { mutate: fetchDetailById, isPending: loading } = useGetBidById()

  const currentPage = Number(searchParams.get("page")) || 1
  const [sort, setSort] = useState({ key: "id", order: "asc" })
  const [itemsPerPage] = useState(5)
  const [filters, setFilters] = useState<any>({
    inserted_at: "",
    agent_id: "",
    price: "",
  })
  const router = useRouter()

  const [expandedOffers, setExpandedOffers] = useState<Record<string, boolean>>({})

  const loadDetaildBidByid = (uuid: any) => {
    fetchDetailById(
      {
        bid_id: uuid,
      },
      {
        onSuccess: (data) => {
          setBidDataForAgent(data)
        },
        onError: (error) => {
          console.log(error)
        },
      },
    )
  }

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev: any) => ({ ...prev, [key]: value }))
  }

  const handleCreateOffer = (value: any) => {
    console.log(value, "value")
    sendOffer(value)
    /*modalService.showModal({
      component: ConfirmOffer,
      props: {
        info: value,
        sendOffer: sendOffer,
        cancel: closeConfirm,
      },
    })*/
  }

  const toggleOfferDetails = (offerId: string) => {
    setExpandedOffers((prev) => ({
      ...prev,
      [offerId]: !prev[offerId],
    }))
  }
  const closeConfirm = () => {
    modalService.closeModal()
  }

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
          window.location.href = `/offers/${id}?page=1`
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

  const filteredList = bidDataForAgent?.offers
    ?.filter((bid: any) =>
      Object.keys(filters).every((key: any) => {
        const filterValue = filters[key].toLowerCase()
        const bidValue = bid[key]?.toString().toLowerCase() || ""
        return bidValue.includes(filterValue)
      }),
    )
    .sort((a: any, b: any) => {
      const aValue = a[sort.key]
      const bValue = b[sort.key]

      if (typeof aValue === "string" && typeof bValue === "string") {
        return sort.order === "asc" ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue)
      }

      return sort.order === "asc" ? Number(aValue) - Number(bValue) : Number(bValue) - Number(aValue)
    })

  const paginatedList = filteredList?.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage)

  useEffect(() => {
    loadDetaildBidByid(id)
  }, [id])

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
            <div className="flex items-center gap-2">
              <span className="font-bold">Orígen:</span>
              <span>{bidDataForAgent.origin_country + " - " + bidDataForAgent.origin_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">Destíno:</span>
              <span>{bidDataForAgent.destination_country + " - " + bidDataForAgent.destination_name}</span>
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
                    <AccordionTrigger>Proponer un nuevo precio</AccordionTrigger>
                    <AccordionContent>
                      <ProposalFormMaritimo onSubmit={handleCreateOffer} />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              ) : (
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                    <AccordionTrigger>Proponer un nuevo precio</AccordionTrigger>
                    <AccordionContent>
                      <ProposalForm onSubmit={handleCreateOffer} />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              )}

              {/*<PriceInput sendOffer={handleCreateOffer} />*/}
            </div>
          </div>

          <CardTitle className="text-black-500 font-bold text-xl">Propuestas</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div>
              <label className="text-sm font-medium mb-1 block">Fecha de creación</label>
              <div className="flex items-center">
                <Input
                  placeholder="Filtrar fecha"
                  onChange={(e) => handleFilterChange("inserted_at", e.target.value)}
                />
                <Button variant="ghost" size="icon" onClick={() => handleSort("inserted_at")} className="ml-1">
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Código agente</label>
              <div className="flex items-center">
                <Input placeholder="Filtrar agente" onChange={(e) => handleFilterChange("agent_id", e.target.value)} />
                <Button variant="ghost" size="icon" onClick={() => handleSort("agent_id")} className="ml-1">
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">Oferta</label>
              <div className="flex items-center">
                <Input placeholder="Filtrar oferta" onChange={(e) => handleFilterChange("price", e.target.value)} />
                <Button variant="ghost" size="icon" onClick={() => handleSort("price")} className="ml-1">
                  <ArrowUpDown className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* Tarjetas de propuestas */}
                    <div className="space-y-4">
            {paginatedList?.map((offer: any, idx: number) => (
              <Card key={idx} className="w-full border-l-4 border-l-primary overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                  <div className="md:col-span-3 p-4 bg-muted/10">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <User className="h-5 w-5 text-primary" />
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">Código Agente</span>
                          <span className="font-medium">{offer.agent_code}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Tag className="h-5 w-5 text-primary" />
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">ID Oferta</span>
                          <span className="font-medium">{offer.uuid}</span>
                        </div>
                      </div>

                      <Badge
                        className={
                          offer.status === "Active" ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-800"
                        }
                      >
                        {offer.status}
                      </Badge>
                    </div>
                  </div>

                  <div className="md:col-span-3 p-4">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">Fecha de Creación</span>
                          <span className="font-medium">{convertToColombiaTime(offer.inserted_at)}</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Ship className="h-5 w-5 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">Tipo de Envío</span>
                          <span className="font-medium">{offer.shipping_type}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-3 p-4 bg-primary/5">
                    <div className="flex items-center space-x-2 w-full">
                      <DollarSign className="h-5 w-5 text-primary" />
                      <div className="flex flex-col">
                        <span className="text-sm text-muted-foreground">Oferta</span>
                        <span className="font-medium text-lg">{offer.price}</span>
                      </div>
                    </div>

                    {offer.details?.freight_fees && (
                      <div className="mt-3 flex items-center space-x-2">
                        <Package className="h-5 w-5 text-muted-foreground" />
                        <div className="flex flex-col">
                          <span className="text-sm text-muted-foreground">Contenedor</span>
                          <span className="font-medium">{offer.details.freight_fees.container}</span>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="md:col-span-3 p-4 flex items-center justify-center">
                    <Button variant="outline" size="sm" className="w-full" onClick={() => toggleOfferDetails(offer.id)}>
                      {expandedOffers[offer.id] ? (
                        <>
                          Ocultar Detalles <ChevronDown className="ml-2 h-4 w-4" />
                        </>
                      ) : (
                        <>
                          Ver Detalles <ChevronDown className="ml-2 h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </div>

                {expandedOffers[offer.id] && offer.details && (
                  <div className="border-t border-border p-4">
                    <Tabs defaultValue="freight">
                      <TabsList className="grid grid-cols-5 mb-4">
                        <TabsTrigger value="freight">Flete</TabsTrigger>
                        <TabsTrigger value="origin">Origen</TabsTrigger>
                        <TabsTrigger value="destination">Destino</TabsTrigger>
                        <TabsTrigger value="basic">Servicio Básico</TabsTrigger>
                        <TabsTrigger value="other">Otros Cargos</TabsTrigger>
                      </TabsList>

                      <TabsContent value="freight" className="space-y-2">
                        <h3 className="font-medium text-sm">Tarifas de Flete</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex justify-between p-2 bg-muted/20 rounded">
                            <span className="text-sm">Contenedor</span>
                            <span className="font-medium">{offer.details.freight_fees?.container}</span>
                          </div>
                          <div className="flex justify-between p-2 bg-muted/20 rounded">
                            <span className="text-sm">Valor</span>
                            <span className="font-medium">${offer.details.freight_fees?.value}</span>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="origin" className="space-y-2">
                        <h3 className="font-medium text-sm">Tarifas de Origen</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex justify-between p-2 bg-muted/20 rounded">
                            <span className="text-sm">Handling</span>
                            <span className="font-medium">${offer.details.origin_fees?.handling}</span>
                          </div>
                          <div className="flex justify-between p-2 bg-muted/20 rounded">
                            <span className="text-sm">Manifiesto de Seguridad</span>
                            <span className="font-medium">${offer.details.origin_fees?.security_manifest}</span>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="destination" className="space-y-2">
                        <h3 className="font-medium text-sm">Tarifas de Destino</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex justify-between p-2 bg-muted/20 rounded">
                            <span className="text-sm">Agencia</span>
                            <span className="font-medium">${offer.details.destination_fees?.agency}</span>
                          </div>
                          <div className="flex justify-between p-2 bg-muted/20 rounded">
                            <span className="text-sm">Emisión BL</span>
                            <span className="font-medium">${offer.details.destination_fees?.bl_emission}</span>
                          </div>
                          <div className="flex justify-between p-2 bg-muted/20 rounded">
                            <span className="text-sm">Tarifa de Cobro</span>
                            <span className="font-medium">{offer.details.destination_fees?.collect_fee}</span>
                          </div>
                          <div className="flex justify-between p-2 bg-muted/20 rounded">
                            <span className="text-sm">Handling</span>
                            <span className="font-medium">${offer.details.destination_fees?.handling}</span>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="basic" className="space-y-2">
                        <h3 className="font-medium text-sm">Servicio Básico</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="flex justify-between p-2 bg-muted/20 rounded">
                            <span className="text-sm">Tarifa de Cancelación</span>
                            <span className="font-medium">${offer.details.basic_service?.cancellation_fee}</span>
                          </div>
                          <div className="flex justify-between p-2 bg-muted/20 rounded">
                            <span className="text-sm">Días Libres</span>
                            <span className="font-medium">{offer.details.basic_service?.free_days} días</span>
                          </div>
                          <div className="flex justify-between p-2 bg-muted/20 rounded">
                            <span className="text-sm">Validez</span>
                            <span className="font-medium">
                              {offer.details.basic_service?.validity?.time}{" "}
                              {offer.details.basic_service?.validity?.unit}
                            </span>
                          </div>
                        </div>
                      </TabsContent>

                      <TabsContent value="other" className="space-y-2">
                        <h3 className="font-medium text-sm">Otros Cargos</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          {offer.details.other_fees &&
                            Object.entries(offer.details.other_fees).map(([key, value]: [string, any]) => (
                              <div key={key} className="flex justify-between p-2 bg-muted/20 rounded">
                                <span className="text-sm">
                                  {key.replace(/_/g, " ").replace(/\b\w/g, (l) => l.toUpperCase())}
                                </span>
                                <span className="font-medium">${value}</span>
                              </div>
                            ))}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </div>
                )}
              </Card>
            ))}

            {(!paginatedList || paginatedList.length === 0) && (
              <div className="text-center py-8">
                <DollarSign className="h-12 w-12 mx-auto text-muted-foreground" />
                <h3 className="mt-2 text-lg font-medium">No hay propuestas</h3>
                <p className="text-sm text-muted-foreground">No se encontraron propuestas con los filtros actuales.</p>
              </div>
            )}
          </div>
                <div className="w-full flex justify-end mt-8">
            <Suspense fallback={<div>Loading...</div>}>
              <Pagination totalPages={Math.ceil((filteredList?.length || 0) / itemsPerPage)} />
            </Suspense>
          </div>
        </CardContent>
      </Card>
    </>
  )
}
export default Page

