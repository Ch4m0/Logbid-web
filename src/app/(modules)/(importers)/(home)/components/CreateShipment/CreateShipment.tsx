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
import { useCreateShipment } from '@/src/app/hooks/useCreateShipment'
import FilterableSelectMaritimePort from '@/src/app/(modules)/common/components/FilterableSelectMaritimePort'
import { useTranslation } from '@/src/hooks/useTranslation'
import { Plus } from 'lucide-react'
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

      // Función para convertir fecha a datetime con hora 23:59:59
      const formatDateTimeEndOfDay = (dateString: string): string => {
        if (!dateString) return ''
        // Añadir la hora 23:59:59 para representar el final del día
        return `${dateString} 23:59:59`
      }

      console.log('Iniciando creación de shipment...')

      createShipment(
        {
          tipoTransporte: values.tipoTransporte,
          origen: values.origen,
          destino: values.destino,
          tipoComex: values.tipoComex,
          tipoEnvio: values.tipoEnvio,
          valor: values.valor.toString(),
          moneda: values.moneda,
          fechaExpiracion: formatDateTimeEndOfDay(values.fechaExpiracion),
          fechaEmbarque: formatDateTimeEndOfDay(values.fechaEmbarque),
          informacionAdicional: values.informacionAdicional,
          tipoMercancia: values.tipoMercancia,
          market_id: parseInt(marketId),
          // Campos adicionales del formulario
          contenedor: values.contenedor,
          pesoTotal: typeof values.pesoTotal === 'number' ? values.pesoTotal : undefined,
          tipoMedida: values.tipoMedida,
          cbm: typeof values.cbm === 'number' ? values.cbm : undefined,
          unidades: typeof values.unidades === 'number' ? values.unidades : undefined,
          incoterm: values.incoterm,
          cargaClasificacion: values.cargaClasificacion,
          partidaArancelaria: values.partidaArancelaria,
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
          },
        }
      )
    },
  })

  const { data: listIncoterm } = useGetIncotermList()
  const { mutate: createShipment, isPending } = useCreateShipment()

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
                  />
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
    </div>
  )
}
