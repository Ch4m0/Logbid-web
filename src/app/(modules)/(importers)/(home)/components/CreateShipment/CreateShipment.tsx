'use client'
import { useFormik } from 'formik'
import * as Yup from 'yup'
import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/src/components/ui/sheet'
import { Textarea } from '@/src/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/src/components/ui/dialog'
import { container_sea, container_airplane, incoterms } from './data'
import FilterableSelectAirport from '../../../../common/components/FilterableSelectAirport'
import styled from 'styled-components'
import { Incoterm } from '@/src/interfaces/bid.interface'
import useAuthStore from '@/src/store/authStore'
import { useSearchParams } from 'next/navigation'
import { toast } from '@/src/components/ui/use-toast'
import { drawerService } from '@/src/service/drawerService'
import { useState, useEffect } from 'react'
import { useGetIncotermList } from '@/src/app/hooks/useGetIncotermList'
import { useGetListContainer } from '@/src/app/hooks/useGetContainerList'
import { useGetAirportList } from '@/src/app/hooks/useGetAirportList'
import { useGetMaritimeList } from '@/src/app/hooks/useGetMaritimeList'
import { useCreateShipment } from '@/src/app/hooks/useCreateShipment'
import FilterableSelectMaritimePort from '@/src/app/(modules)/common/components/FilterableSelectMaritimePort'
import { useTranslation } from '@/src/hooks/useTranslation'
import { Plus, CheckCircle, AlertTriangle } from 'lucide-react'
import { DatePicker } from '@/src/components/ui/date-picker'

// Definir el tipo para los valores del formulario
interface FormValues {
  tipoTransporte: string
  origen: string
  destino: string
  tipoComex: string
  tipoEnvio: string
  contenedor: string
  pesoTotal: number | ''
  tipoMedida: string
  cbm: number | ''
  unidades: number | ''
  incoterm: string
  tipoMercancia: string
  cargaClasificacion: string
  partidaArancelaria: string
  valor: number | ''
  moneda: string
  fechaExpiracion: string
  fechaEmbarque: string
  informacionAdicional?: string
}

interface CreateShipmentProps {
  onRefetch?: () => void
}

const ErrorMessage = styled.span`
  font-size: 0.875rem;
  color: red;
`

export default function CreateShipment({ onRefetch }: CreateShipmentProps = {}) {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [shippingType, setShippingType] = useState('Marítimo')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [pendingValues, setPendingValues] = useState<FormValues | null>(null)

  const profile = useAuthStore((state) => state.profile)
  const searchParams = useSearchParams()
  const { data: containerList = [] } = useGetListContainer(shippingType)

  // Obtener el market_id del perfil del usuario
  const marketId = searchParams.get('market_id') ?? 
                  profile?.all_markets?.[0]?.id?.toString() ?? 
                  '1' // Fallback al mercado Norte

  const validationSchema = Yup.object({
    tipoTransporte: Yup.string().required(t('createCargo.validation.transportTypeRequired')),
    origen: Yup.string().required(t('createCargo.validation.originRequired')),
    destino: Yup.string().required(t('createCargo.validation.destinationRequired')),
    tipoComex: Yup.string().required(t('createCargo.validation.comexTypeRequired')),
    tipoEnvio: Yup.string().required(t('createCargo.validation.shipmentTypeRequired')),
    valor: Yup.mixed()
      .required(t('createCargo.validation.valueRequired'))
      .test(
        'is-numeric',
        t('createCargo.validation.onlyNumbers'),
        (value) => {
          if (value === '' || value === null || value === undefined) return false
          const stringValue = value.toString()
          return /^[0-9.]+$/.test(stringValue) && parseFloat(stringValue) > 0
        }
      ),
    moneda: Yup.string().required(t('createCargo.validation.currencyRequired')),
    fechaExpiracion: Yup.string()
      .required(t('createCargo.validation.shipmentDateRequired'))
      .test(
        'is-valid-date',
        t('createCargo.validation.dateInvalid'),
        (value) => {
          if (!value) return false
          const date = new Date(value)
          return !isNaN(date.getTime())
        }
      )
      .test(
        'is-future-date',
        t('createCargo.validation.dateMustBeFuture'),
        (value) => {
          if (!value) return false
          const date = new Date(value)
          const today = new Date()
          today.setHours(0, 0, 0, 0)
          return date >= today
        }
      )
      .test(
        'is-reasonable-date',
        t('createCargo.validation.dateNotMoreThanYear'),
        (value) => {
          if (!value) return false
          const date = new Date(value)
          const maxDate = new Date()
          maxDate.setFullYear(maxDate.getFullYear() + 1)
          return date <= maxDate
        }
      ),
    fechaEmbarque: Yup.string()
      .test(
        'is-valid-date',
        t('createCargo.validation.dateInvalid'),
        function(value) {
          const { tipoTransporte } = this.parent
          if ((tipoTransporte !== 'Marítimo' && tipoTransporte !== 'Aéreo') || !value) return true // Validar para marítimo y aéreo
          const date = new Date(value)
          return !isNaN(date.getTime())
        }
      )
      .test(
        'is-after-closing-date',
        t('createCargo.validation.shippingDateMustBeAfterClosing'),
        function(value) {
          const { tipoTransporte, fechaExpiracion } = this.parent
          if ((tipoTransporte !== 'Marítimo' && tipoTransporte !== 'Aéreo') || !value) return true // Validar para marítimo y aéreo
          if (!fechaExpiracion) return true
          
          const shippingDate = new Date(value)
          const closingDate = new Date(fechaExpiracion)
          return shippingDate >= closingDate
        }
      ),
    tipoMercancia: Yup.string().required(t('createCargo.validation.merchandiseTypeRequired')),
    informacionAdicional: Yup.string()
      .max(250, t('createCargo.validation.additionalInfoMaxLength')),
  })

  const formik = useFormik<FormValues>({
    initialValues: {
      tipoTransporte: 'Marítimo',
      origen: '',
      destino: '',
      tipoComex: '',
      tipoEnvio: '',
      contenedor: '',
      pesoTotal: '',
      tipoMedida: '',
      cbm: '',
      unidades: '',
      incoterm: '',
      tipoMercancia: '',
      cargaClasificacion: '',
      partidaArancelaria: '',
      valor: '',
      moneda: 'USD',
      fechaExpiracion: '',
      fechaEmbarque: '',
      informacionAdicional: '',
    },
    validationSchema,
    onSubmit: (values) => {
      console.log('Valores del formulario:', values)
      
      // Validación adicional para asegurar que tenemos los datos necesarios
      if (!values.origen || !values.destino || !values.valor) {
        console.log('Faltan campos requeridos:', {
          origen: values.origen,
          destino: values.destino,
          valor: values.valor
        })
        toast({
          title: 'Error de validación',
          description: 'Por favor completa todos los campos requeridos',
          variant: 'destructive',
        })
        return
      }

      // Mostrar diálogo de confirmación
      setPendingValues(values)
      setShowConfirmation(true)
    },
  })

  const { data: listIncoterm } = useGetIncotermList()
  const { mutate: createShipment, isPending } = useCreateShipment()
  
  // Obtener datos de puertos y aeropuertos para el mapeo
  const { data: airportData } = useGetAirportList('', true)
  const { data: maritimeData } = useGetMaritimeList('', true)

  // Función para convertir fecha a datetime con hora 23:59:59
  const formatDateTimeEndOfDay = (dateString: string): string => {
    if (!dateString) return ''
    // Añadir la hora 23:59:59 para representar el final del día
    return `${dateString} 23:59:59`
  }

  // Función para confirmar y crear el shipment
  const handleConfirmShipment = () => {
    if (!pendingValues) return

    console.log('Iniciando creación de shipment...')

    createShipment(
      {
        tipoTransporte: pendingValues.tipoTransporte,
        origen: pendingValues.origen,
        destino: pendingValues.destino,
        tipoComex: pendingValues.tipoComex,
        tipoEnvio: pendingValues.tipoEnvio,
        valor: pendingValues.valor.toString(),
        moneda: pendingValues.moneda,
        fechaExpiracion: formatDateTimeEndOfDay(pendingValues.fechaExpiracion),
        fechaEmbarque: formatDateTimeEndOfDay(pendingValues.fechaEmbarque),
        informacionAdicional: pendingValues.informacionAdicional,
        tipoMercancia: pendingValues.tipoMercancia,
        market_id: parseInt(marketId),
        // Campos adicionales del formulario
        contenedor: pendingValues.contenedor,
        pesoTotal: typeof pendingValues.pesoTotal === 'number' ? pendingValues.pesoTotal : undefined,
        tipoMedida: pendingValues.tipoMedida,
        cbm: typeof pendingValues.cbm === 'number' ? pendingValues.cbm : undefined,
        unidades: typeof pendingValues.unidades === 'number' ? pendingValues.unidades : undefined,
        incoterm: pendingValues.incoterm,
        cargaClasificacion: pendingValues.cargaClasificacion,
        partidaArancelaria: pendingValues.partidaArancelaria,
      },
      {
        onSuccess: (data) => {
          console.log('Shipment created successfully:', data)
          toast({
            title: '¡Shipment creado exitosamente!',
            description: `Ruta: ${data.origin_name} → ${data.destination_name}`,
            variant: 'default',
          })
          setIsOpen(false)
          setShowConfirmation(false)
          setPendingValues(null)
          formik.resetForm()
          
          // 🔄 Refrescar la lista manualmente
          console.log('🔄 Ejecutando refetch manual...')
          if (onRefetch) {
            onRefetch()
            console.log('✅ Refetch ejecutado - la lista se actualizará automáticamente')
          } else {
            console.log('⚠️ No se proporcionó función onRefetch')
          }
        },
        onError: (error) => {
          console.error('Error creating shipment:', error)
          toast({
            title: 'Error al crear el shipment',
            description: error.message || 'Ocurrió un error inesperado',
            variant: 'destructive',
          })
          setShowConfirmation(false)
          setPendingValues(null)
        },
      }
    )
  }

  // Función para cancelar la confirmación
  const handleCancelConfirmation = () => {
    setShowConfirmation(false)
    setPendingValues(null)
  }

  // Funciones para mapear IDs a nombres
  const getContainerName = (containerId: string) => {
    if (!containerId) return ''
    const container = containerList.find(c => c.id.toString() === containerId)
    return container?.name || containerId
  }

  const getIncotermName = (incotermId: string) => {
    if (!incotermId) return ''
    const incoterm = listIncoterm?.find(i => i.id.toString() === incotermId)
    return incoterm?.name || incotermId
  }

  const getOriginName = (originId: string) => {
    if (!originId) return ''
    
    // Buscar en puertos marítimos
    const maritimePort = maritimeData?.pages?.flatMap(page => page.data)?.find(
      port => port.id.toString() === originId
    )
    if (maritimePort) {
      return `${maritimePort.port_name} - ${maritimePort.country}`
    }
    
    // Buscar en aeropuertos
    const airport = airportData?.pages?.flatMap(page => page.data)?.find(
      airport => airport.id.toString() === originId
    )
    if (airport) {
      return `${airport.airport_name} - ${airport.country}`
    }
    
    return originId
  }

  const getDestinationName = (destinationId: string) => {
    if (!destinationId) return ''
    
    // Buscar en puertos marítimos
    const maritimePort = maritimeData?.pages?.flatMap(page => page.data)?.find(
      port => port.id.toString() === destinationId
    )
    if (maritimePort) {
      return `${maritimePort.port_name} - ${maritimePort.country}`
    }
    
    // Buscar en aeropuertos
    const airport = airportData?.pages?.flatMap(page => page.data)?.find(
      airport => airport.id.toString() === destinationId
    )
    if (airport) {
      return `${airport.airport_name} - ${airport.country}`
    }
    
    return destinationId
  }

  // Efecto para limpiar fecha de embarque si es anterior a la nueva fecha de cierre
  useEffect(() => {
    const { fechaExpiracion, fechaEmbarque } = formik.values
    if (fechaExpiracion && fechaEmbarque) {
      const closingDate = new Date(fechaExpiracion)
      const shippingDate = new Date(fechaEmbarque)
      
      if (shippingDate < closingDate) {
        formik.setFieldValue('fechaEmbarque', '')
      }
    }
  }, [formik.values.fechaExpiracion])

  // Efecto para limpiar fecha de embarque cuando se cambia a transporte aéreo
  useEffect(() => {
    // Removed the logic that cleared shipping date for air transport
    // Now shipping date is available for both maritime and air transport
  }, [formik.values.tipoTransporte])
  
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    formik.handleSubmit()

    if (Object.keys(formik.errors).length > 0) {
      console.log('Errores de validación:', formik.errors)
    } else {
      console.log('Formulario válido, sin errores')
    }
  }

  return (
    <div>
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button onClick={() => setIsOpen(true)} className="flex items-center space-x-2">
            <Plus className="h-4 w-4" />
            <span>{t('common.newShipment')}</span>
          </Button>
        </SheetTrigger>

        <SheetContent
          side="right"
          className="w-full sm:max-w-lg md:max-w-2xl lg:max-w-3xl overflow-y-scroll"
        >
          <SheetHeader className="px-3 md:px-6">
            <SheetTitle className="text-lg md:text-xl">{t('createCargo.title')}</SheetTitle>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="px-3 md:px-6">
            <div className="space-y-4 md:space-y-6 py-2 md:py-4">
              {/* Sección 1: Información básica */}
              <div className="space-y-4 bg-gray-50 p-3 md:p-4 rounded-lg">
                <h3 className="text-lg md:text-xl font-bold text-gray-800 border-b-2 border-blue-500 pb-2">📋 {t('createCargo.sections.basicInfo')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                                      <div className="grid gap-1">
                      <Label htmlFor="tipoTransporte" className="text-xs md:text-sm font-semibold text-gray-700">{t('createCargo.transportType')}</Label>
                    <Select
                      value={formik.values.tipoTransporte}
                      onValueChange={(value) => {
                        console.log(value, 'transport type')
                        setShippingType(value)
                        return formik.setFieldValue('tipoTransporte', value)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('createCargo.select')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Marítimo">{t('transport.maritime')}</SelectItem>
                        <SelectItem value="Aéreo">{t('transport.air')}</SelectItem>
                      </SelectContent>
                    </Select>
                    {formik.errors.tipoTransporte && formik.touched.tipoTransporte && (
                      <div className="text-red-500">
                        <ErrorMessage>
                          {formik.errors.tipoTransporte}
                        </ErrorMessage>
                      </div>
                    )}
                  </div>

                                      <div className="grid gap-1">
                      <Label htmlFor="tipoComex" className="text-xs md:text-sm font-semibold text-gray-700">{t('createCargo.comexType')}</Label>
                    <Select
                      value={formik.values.tipoComex}
                      onValueChange={(value) => {
                        formik.setFieldValue('tipoComex', value)
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('createCargo.select')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Importación">{t('createCargo.comexTypes.importation')}</SelectItem>
                        <SelectItem value="Exportación">{t('createCargo.comexTypes.exportation')}</SelectItem>
                      </SelectContent>
                    </Select>
                    {formik.errors.tipoComex && formik.touched.tipoComex && (
                      <div className="text-red-500">
                        <ErrorMessage>{formik.errors.tipoComex}</ErrorMessage>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sección 2: Origen y Destino */}
              <div className="space-y-4 bg-green-50 p-3 md:p-4 rounded-lg">
                <h3 className="text-lg md:text-xl font-bold text-gray-800 border-b-2 border-green-500 pb-2">🌍 {t('createCargo.sections.originDestination')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="grid gap-1">
                    {formik.values.tipoTransporte === 'Marítimo' ? (
                      <>
                        <FilterableSelectMaritimePort
                          label={t('createCargo.origin')}
                          value={formik.values.origen}
                          onSelect={(option: any) => {
                            console.log('Selected origin:', option)
                            formik.setFieldValue('origen', option.id.toString())
                          }}
                        />
                        {formik.errors.origen && formik.touched.origen && (
                          <div className="text-red-500">
                            <ErrorMessage>{formik.errors.origen}</ErrorMessage>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <FilterableSelectAirport
                          label={t('createCargo.origin')}
                          value={formik.values.origen}
                          onSelect={(option: any) => {
                            console.log('Selected origin:', option)
                            formik.setFieldValue('origen', option.id.toString())
                          }}
                        />
                        {formik.errors.origen && formik.touched.origen && (
                          <div className="text-red-500">
                            <ErrorMessage>{formik.errors.origen}</ErrorMessage>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  <div className="grid gap-1">
                    {formik.values.tipoTransporte === 'Marítimo' ? (
                      <>
                        <FilterableSelectMaritimePort
                          label={t('createCargo.destination')}
                          value={formik.values.destino}
                          onSelect={(option: any) => {
                            console.log('Selected destination:', option)
                            formik.setFieldValue('destino', option.id.toString())
                          }}
                        />
                        {formik.errors.destino && formik.touched.destino && (
                          <div className="text-red-500">
                            <ErrorMessage>{formik.errors.destino}</ErrorMessage>
                          </div>
                        )}
                      </>
                    ) : (
                      <>
                        <FilterableSelectAirport
                          label={t('createCargo.destination')}
                          value={formik.values.destino}
                          onSelect={(option: any) => {
                            console.log('Selected destination:', option)
                            formik.setFieldValue('destino', option.id.toString())
                          }}
                        />
                        {formik.errors.destino && formik.touched.destino && (
                          <div className="text-red-500">
                            <ErrorMessage>{formik.errors.destino}</ErrorMessage>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Sección 3: Detalles del Envío */}
              <div className="space-y-4 bg-yellow-50 p-3 md:p-4 rounded-lg">
                <h3 className="text-lg md:text-xl font-bold text-gray-800 border-b-2 border-yellow-500 pb-2">📦 {t('createCargo.sections.shipmentDetails')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                  <div className="grid gap-1">
                    <Label htmlFor="tipoEnvio" className="text-xs md:text-sm font-semibold text-gray-700">{t('createCargo.shipmentType')}</Label>
                    <Select
                      value={formik.values.tipoEnvio}
                      onValueChange={(value) =>
                        formik.setFieldValue('tipoEnvio', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('createCargo.select')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Carga suelta">{t('createCargo.shipmentTypes.looseCargo')}</SelectItem>
                        <SelectItem value="FCL">{t('createCargo.shipmentTypes.fcl')}</SelectItem>
                        <SelectItem value="LCL">{t('createCargo.shipmentTypes.lcl')}</SelectItem>
                      </SelectContent>
                    </Select>
                    {formik.errors.tipoEnvio && formik.touched.tipoEnvio && (
                      <div className="text-red-500">
                        <ErrorMessage>{formik.errors.tipoEnvio}</ErrorMessage>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-1">
                    <Label htmlFor="tipoMercancia" className="text-xs md:text-sm font-semibold text-gray-700">{t('createCargo.merchandiseType')}</Label>
                    <Input
                      id="tipoMercancia"
                      name="tipoMercancia"
                      placeholder={t('createCargo.enterMerchandiseType')}
                      value={formik.values.tipoMercancia}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.errors.tipoMercancia && formik.touched.tipoMercancia && (
                      <div className="text-red-500">
                        <ErrorMessage>{formik.errors.tipoMercancia}</ErrorMessage>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-1">
                    <Label htmlFor="contenedor" className="text-xs md:text-sm font-semibold text-gray-700">
                      {formik.values.tipoTransporte === 'Marítimo' 
                        ? t('createCargo.labels.containerType') 
                        : t('createCargo.labels.packagingType')
                      }
                    </Label>
                    <Select
                      value={formik.values.contenedor}
                      onValueChange={(value) =>
                        formik.setFieldValue('contenedor', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={
                          formik.values.tipoTransporte === 'Marítimo' 
                            ? t('createCargo.placeholders.selectContainer')
                            : t('createCargo.placeholders.selectPackaging')
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {containerList?.map((container: any) => (
                          <SelectItem key={container.id} value={container.id.toString()}>
                            {container.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>


                </div>
              </div>

              {/* Sección 4: Medidas y Cantidades */}
              <div className="space-y-4 bg-purple-50 p-3 md:p-4 rounded-lg">
                <h3 className="text-lg md:text-xl font-bold text-gray-800 border-b-2 border-purple-500 pb-2">⚖️ {t('createCargo.sections.measureQuantities')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                  <div className="grid gap-1">
                    <Label htmlFor="pesoTotal" className="text-xs md:text-sm font-semibold text-gray-700">{t('createCargo.labels.totalWeight')}</Label>
                    <Input
                      id="pesoTotal"
                      name="pesoTotal"
                      type="number"
                      placeholder={t('createCargo.placeholders.enterTotalWeight')}
                      value={formik.values.pesoTotal}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  </div>

                  <div className="grid gap-1">
                    <Label htmlFor="tipoMedida" className="text-xs md:text-sm font-semibold text-gray-700">{t('createCargo.labels.measureType')}</Label>
                    <Select
                      value={formik.values.tipoMedida}
                      onValueChange={(value) =>
                        formik.setFieldValue('tipoMedida', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('createCargo.placeholders.selectMeasure')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Kg">{t('createCargo.measures.kilograms')}</SelectItem>
                        <SelectItem value="Lbs">{t('createCargo.measures.pounds')}</SelectItem>
                        <SelectItem value="Tons">{t('createCargo.measures.tons')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-1">
                    <Label htmlFor="cbm" className="text-xs md:text-sm font-semibold text-gray-700">{t('createCargo.labels.volume')}</Label>
                    <Input
                      id="cbm"
                      name="cbm"
                      type="number"
                      step="0.01"
                      placeholder={t('createCargo.placeholders.cubicMeters')}
                      value={formik.values.cbm}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  </div>

                  <div className="grid gap-1">
                    <Label htmlFor="unidades" className="text-xs md:text-sm font-semibold text-gray-700">{t('createCargo.labels.units')}</Label>
                    <Input
                      id="unidades"
                      name="unidades"
                      type="number"
                      placeholder={t('createCargo.placeholders.numberOfUnits')}
                      value={formik.values.unidades}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                  </div>

                  <div className="grid gap-1">
                    <Label htmlFor="incoterm" className="text-xs md:text-sm font-semibold text-gray-700">{t('createCargo.labels.incoterm')}</Label>
                    <Select
                      value={formik.values.incoterm}
                      onValueChange={(value) =>
                        formik.setFieldValue('incoterm', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('createCargo.placeholders.selectIncoterm')} />
                      </SelectTrigger>
                      <SelectContent>
                        {listIncoterm?.map((incoterm: any) => (
                          <SelectItem key={incoterm.id} value={incoterm.id.toString()}>
                            {incoterm.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid gap-1">
                    <Label htmlFor="cargaClasificacion" className="text-xs md:text-sm font-semibold text-gray-700">{t('createCargo.labels.cargoClassification')}</Label>
                    <Select
                      value={formik.values.cargaClasificacion}
                      onValueChange={(value) =>
                        formik.setFieldValue('cargaClasificacion', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('createCargo.placeholders.selectClassification')} />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Normal">{t('createCargo.cargoClassifications.normal')}</SelectItem>
                        <SelectItem value="Peligrosa">{t('createCargo.cargoClassifications.dangerous')}</SelectItem>
                        <SelectItem value="Refrigerada">{t('createCargo.cargoClassifications.refrigerated')}</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Sección 5: Información Comercial */}
              <div className="space-y-4 bg-orange-50 p-3 md:p-4 rounded-lg">
                <h3 className="text-lg md:text-xl font-bold text-gray-800 border-b-2 border-orange-500 pb-2">💰 {t('createCargo.sections.commercialInfo')}</h3>
                <div className={`grid gap-3 md:gap-4 ${formik.values.tipoTransporte === 'Marítimo' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1 md:grid-cols-2'}`}>
                  <div className="grid gap-1">
                    <Label htmlFor="valor" className="text-xs md:text-sm font-semibold text-gray-700">{t('createCargo.value')}</Label>
                    <Input
                      id="valor"
                      name="valor"
                      placeholder={t('createCargo.enterValue')}
                      value={formik.values.valor}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.errors.valor && formik.touched.valor && (
                      <div className="text-red-500">
                        <ErrorMessage>{formik.errors.valor}</ErrorMessage>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-1">
                    <Label htmlFor="moneda" className="text-xs md:text-sm font-semibold text-gray-700">{t('createCargo.currency')}</Label>
                    <Select
                      value={formik.values.moneda}
                      onValueChange={(value) =>
                        formik.setFieldValue('moneda', value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder={t('createCargo.select')} />
                      </SelectTrigger>
                      <SelectContent>
                        {['EUR', 'USD'].map((item: string, index: number) => (
                          <SelectItem key={index} value={item}>
                            {item}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formik.errors.moneda && formik.touched.moneda && (
                      <div className="text-red-500">
                        <ErrorMessage>{formik.errors.moneda}</ErrorMessage>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-1">
                    <Label htmlFor="fechaExpiracion" className="text-xs md:text-sm font-semibold text-gray-700">{t('createCargo.shipmentDate')}</Label>
                    <DatePicker
                      value={formik.values.fechaExpiracion}
                      onChange={(date) => formik.setFieldValue('fechaExpiracion', date)}
                      placeholder={t('extendCargo.selectDate')}
                      minDate={new Date()} // No permitir fechas pasadas
                      maxDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)} // Máximo 1 año en el futuro
                    />
                    {formik.errors.fechaExpiracion && formik.touched.fechaExpiracion && (
                      <div className="text-red-500">
                        <ErrorMessage>
                          {formik.errors.fechaExpiracion}
                        </ErrorMessage>
                      </div>
                    )}
                  </div>

                  <div className="grid gap-1">
                    <Label htmlFor="partidaArancelaria" className="text-xs md:text-sm font-semibold text-gray-700">{t('createCargo.labels.tariffItem')}</Label>
                    <Input
                      id="partidaArancelaria"
                      name="partidaArancelaria"
                      placeholder={t('createCargo.placeholders.tariffExample')}
                      value={formik.values.partidaArancelaria}
                      onChange={formik.handleChange}
                      onBlur={formik.handleBlur}
                    />
                    {formik.errors.partidaArancelaria && formik.touched.partidaArancelaria && (
                      <div className="text-red-500">
                        <ErrorMessage>
                          {formik.errors.partidaArancelaria}
                        </ErrorMessage>
                      </div>
                    )}
                  </div>

                  {(formik.values.tipoTransporte === 'Marítimo' || formik.values.tipoTransporte === 'Aéreo') && (
                    <div className="grid gap-1">
                      <Label htmlFor="fechaEmbarque" className="text-xs md:text-sm font-semibold text-gray-700">{t('createCargo.shippingDate')}</Label>
                      <DatePicker
                        value={formik.values.fechaEmbarque}
                        onChange={(date) => formik.setFieldValue('fechaEmbarque', date)}
                        placeholder={t('extendCargo.selectDate')}
                        minDate={formik.values.fechaExpiracion ? new Date(formik.values.fechaExpiracion) : new Date()} // Usar fecha de cierre como mínimo
                        maxDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)} // Máximo 1 año en el futuro
                      />
                      {formik.errors.fechaEmbarque && formik.touched.fechaEmbarque && (
                        <div className="text-red-500">
                          <ErrorMessage>
                            {formik.errors.fechaEmbarque}
                          </ErrorMessage>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Sección 6: Información Adicional */}
              <div className="space-y-4 bg-teal-50 p-3 md:p-4 rounded-lg">
                <h3 className="text-lg md:text-xl font-bold text-gray-800 border-b-2 border-teal-500 pb-2">📝 {t('createCargo.sections.additionalInfo')}</h3>
                <div className="grid gap-1">
                  <Label htmlFor="informacionAdicional" className="text-xs md:text-sm font-semibold text-gray-700">{t('createCargo.additionalInfo')}</Label>
                  <Textarea
                    placeholder={t('createCargo.enterAdditionalInfo')}
                    name="informacionAdicional"
                    value={formik.values.informacionAdicional}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    rows={4}
                    maxLength={250}
                  />
                  <div className="flex justify-between items-center text-xs text-gray-500">
                    <span>
                      {formik.errors.informacionAdicional && formik.touched.informacionAdicional && (
                        <ErrorMessage>{formik.errors.informacionAdicional}</ErrorMessage>
                      )}
                    </span>
                    <span>
                      {formik.values.informacionAdicional?.length || 0}/250
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <SheetFooter className="px-3 md:px-6">
              <Button type="submit" disabled={isPending} className="w-full md:w-auto md:ml-auto text-sm md:text-base">
                {isPending ? t('createCargo.buttons.creating') : t('createCargo.buttons.createShipment')}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>

      {/* Diálogo de confirmación */}
      <Dialog open={showConfirmation} onOpenChange={setShowConfirmation}>
        <DialogContent className="max-w-2xl max-h-[90vh]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-orange-500" />
              {t('createCargo.confirmation.title')}
            </DialogTitle>
            <DialogDescription>
              {t('createCargo.confirmation.description')}
            </DialogDescription>
          </DialogHeader>

          {pendingValues && (
            <div className="space-y-3 text-sm max-h-96 overflow-y-auto">
              <div className="bg-gray-50 p-3 rounded-lg">
                <h4 className="font-semibold mb-3 text-base">{t('createCargo.confirmation.summary')}</h4>
                <div className="space-y-2">
                  {/* Información básica */}
                  <div className="border-b border-gray-200 pb-2">
                    <h5 className="font-medium text-gray-800 mb-1">📋 {t('createCargo.confirmation.sections.basicInfo')}</h5>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('createCargo.confirmation.fields.transportType')}:</span>
                        <span className="font-medium">{pendingValues.tipoTransporte}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('createCargo.confirmation.fields.comexType')}:</span>
                        <span className="font-medium">{pendingValues.tipoComex}</span>
                      </div>
                    </div>
                  </div>

                  {/* Origen y destino */}
                  <div className="border-b border-gray-200 pb-2">
                    <h5 className="font-medium text-gray-800 mb-1">🌍 {t('createCargo.confirmation.sections.originDestination')}</h5>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('createCargo.confirmation.fields.origin')}:</span>
                        <span className="font-medium">{getOriginName(pendingValues.origen)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('createCargo.confirmation.fields.destination')}:</span>
                        <span className="font-medium">{getDestinationName(pendingValues.destino)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Detalles del envío */}
                  <div className="border-b border-gray-200 pb-2">
                    <h5 className="font-medium text-gray-800 mb-1">📦 {t('createCargo.confirmation.sections.shipmentDetails')}</h5>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('createCargo.confirmation.fields.shipmentType')}:</span>
                        <span className="font-medium">{pendingValues.tipoEnvio}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('createCargo.confirmation.fields.merchandiseType')}:</span>
                        <span className="font-medium">{pendingValues.tipoMercancia}</span>
                      </div>
                      {pendingValues.contenedor && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('createCargo.confirmation.fields.container')}:</span>
                          <span className="font-medium">{getContainerName(pendingValues.contenedor)}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Medidas y cantidades */}
                  <div className="border-b border-gray-200 pb-2">
                    <h5 className="font-medium text-gray-800 mb-1">⚖️ {t('createCargo.confirmation.sections.measureQuantities')}</h5>
                    <div className="space-y-1">
                      {pendingValues.pesoTotal && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('createCargo.confirmation.fields.totalWeight')}:</span>
                          <span className="font-medium">{pendingValues.pesoTotal}</span>
                        </div>
                      )}
                      {pendingValues.tipoMedida && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('createCargo.confirmation.fields.measureType')}:</span>
                          <span className="font-medium">{pendingValues.tipoMedida}</span>
                        </div>
                      )}
                      {pendingValues.cbm && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('createCargo.confirmation.fields.volume')}:</span>
                          <span className="font-medium">{pendingValues.cbm}</span>
                        </div>
                      )}
                      {pendingValues.unidades && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('createCargo.confirmation.fields.units')}:</span>
                          <span className="font-medium">{pendingValues.unidades}</span>
                        </div>
                      )}
                      {pendingValues.incoterm && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('createCargo.confirmation.fields.incoterm')}:</span>
                          <span className="font-medium">{getIncotermName(pendingValues.incoterm)}</span>
                        </div>
                      )}
                      {pendingValues.cargaClasificacion && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('createCargo.confirmation.fields.cargoClassification')}:</span>
                          <span className="font-medium">{pendingValues.cargaClasificacion}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Información comercial */}
                  <div className="border-b border-gray-200 pb-2">
                    <h5 className="font-medium text-gray-800 mb-1">💰 {t('createCargo.confirmation.sections.commercialInfo')}</h5>
                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('createCargo.confirmation.fields.value')}:</span>
                        <span className="font-medium">{pendingValues.valor} {pendingValues.moneda}</span>
                      </div>
                      {pendingValues.partidaArancelaria && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('createCargo.confirmation.fields.tariffItem')}:</span>
                          <span className="font-medium">{pendingValues.partidaArancelaria}</span>
                        </div>
                      )}
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('createCargo.confirmation.fields.expirationDate')}:</span>
                        <span className="font-medium">{pendingValues.fechaExpiracion}</span>
                      </div>
                      {pendingValues.fechaEmbarque && (
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('createCargo.confirmation.fields.shippingDate')}:</span>
                          <span className="font-medium">{pendingValues.fechaEmbarque}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Información adicional */}
                  {pendingValues.informacionAdicional && (
                    <div>
                      <h5 className="font-medium text-gray-800 mb-1">📝 {t('createCargo.confirmation.sections.additionalInfo')}</h5>
                      <div className="bg-white p-2 rounded border text-gray-700 text-xs">
                        {pendingValues.informacionAdicional}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleCancelConfirmation}
              disabled={isPending}
            >
              {t('createCargo.confirmation.buttons.cancel')}
            </Button>
            <Button
              onClick={handleConfirmShipment}
              disabled={isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('createCargo.buttons.creating')}
                </>
              ) : (
                <>
                  <CheckCircle className="h-4 w-4 mr-2" />
                  {t('createCargo.confirmation.buttons.confirm')}
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
