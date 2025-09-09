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
import { Plus, CheckCircle, AlertTriangle, Upload, FileText, X } from 'lucide-react'
import { DatePicker } from '@/src/components/ui/date-picker'
import { getTransportTypeName, getTypeShipmentName } from '@/src/utils/translateTypeName'
import { supabase } from '@/src/utils/supabase/client'

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
  informacionAdicional: string
  listaEmpaque: File | null
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
  const searchParams = useSearchParams()

  const [shippingType, setShippingType] = useState('1')
  const [showConfirmation, setShowConfirmation] = useState(false)
  const [pendingValues, setPendingValues] = useState<FormValues | null>(null)
  const [uploadingFile, setUploadingFile] = useState(false)
  const [uploadedFileUrl, setUploadedFileUrl] = useState<string | null>(null)

  const profile = useAuthStore((state) => state.profile)
  const { data: containerList = [] } = useGetListContainer(shippingType)

  // Obtener el market_id del perfil del usuario
  const marketId = searchParams.get('market') ?? 
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
      .required(t('createCargo.validation.shippingDateRequired'))
      .test(
        'is-valid-date',
        t('createCargo.validation.dateInvalid'),
        function(value) {
          const { tipoTransporte } = this.parent
          if ((tipoTransporte !== '1' && tipoTransporte !== '2') || !value) return true // Validar para marítimo y aéreo
          const date = new Date(value)
          return !isNaN(date.getTime())
        }
      )
      .test(
        'is-after-closing-date',
        t('createCargo.validation.shippingDateMustBeAfterClosing'),
        function(value) {
          const { tipoTransporte, fechaExpiracion } = this.parent
          if ((tipoTransporte !== '1' && tipoTransporte !== '2') || !value) return true // Validar para marítimo y aéreo
          if (!fechaExpiracion) return true
          
          const shippingDate = new Date(value)
          const closingDate = new Date(fechaExpiracion)
          const minShippingDate = new Date(closingDate.getTime() + 24 * 60 * 60 * 1000) // Al menos 1 día después
          return shippingDate >= minShippingDate
        }
      ),
    tipoMercancia: Yup.string()
      .required(t('createCargo.validation.merchandiseTypeRequired'))
      .test(
        'no-numbers',
        t('createCargo.validation.noNumbersAllowed'),
        (value) => {
          if (!value) return true // Allow empty values (required validation will catch this)
          return !/\d/.test(value) // Return false if any digit is found
        }
      ),
    contenedor: Yup.string().required(t('createCargo.validation.containerRequired')),
    pesoTotal: Yup.mixed()
      .required(t('createCargo.validation.totalWeightRequired'))
      .test(
        'is-numeric',
        t('createCargo.validation.onlyNumbers'),
        (value) => {
          if (value === '' || value === null || value === undefined) return false
          const stringValue = value.toString()
          return /^[0-9.]+$/.test(stringValue) && parseFloat(stringValue) > 0
        }
      ),
    tipoMedida: Yup.string().required(t('createCargo.validation.measureTypeRequired')),
    cbm: Yup.mixed()
      .required(t('createCargo.validation.cbmRequired'))
      .test(
        'is-numeric',
        t('createCargo.validation.onlyNumbers'),
        (value) => {
          if (value === '' || value === null || value === undefined) return false
          const stringValue = value.toString()
          return /^[0-9.]+$/.test(stringValue) && parseFloat(stringValue) > 0
        }
      ),
    unidades: Yup.mixed()
      .required(t('createCargo.validation.unitsRequired'))
      .test(
        'is-numeric',
        t('createCargo.validation.onlyNumbers'),
        (value) => {
          if (value === '' || value === null || value === undefined) return false
          const stringValue = value.toString()
          return /^[0-9]+$/.test(stringValue) && parseInt(stringValue) > 0
        }
      ),
    incoterm: Yup.string().required(t('createCargo.validation.incotermsRequired')),
    cargaClasificacion: Yup.string().required(t('createCargo.validation.cargoClassificationRequired')),
    partidaArancelaria: Yup.string(),
    informacionAdicional: Yup.string()
      .max(250, t('createCargo.validation.additionalInfoMaxLength')),
    listaEmpaque: Yup.mixed()
      .nullable()
      .test(
        'fileType',
        t('createCargo.validation.fileTypeNotSupported'),
        (value) => {
          if (!value) return true // Campo opcional
          const allowedTypes = [
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'application/vnd.ms-excel'
          ]
          return allowedTypes.includes((value as File).type)
        }
      )
      .test(
        'fileSize',
        t('createCargo.validation.fileSizeExceeded'),
        (value) => {
          if (!value) return true // Campo opcional
          return (value as File).size <= 10 * 1024 * 1024 // 10MB máximo
        }
      ),
  })

  const formik = useFormik<FormValues>({
    initialValues: {
      tipoTransporte: '1',
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
      listaEmpaque: null,
    },
    validationSchema,
    onSubmit: (values) => {
      console.log('Valores del formulario:', values)
      console.log('Información adicional específica:', values.informacionAdicional)
      
      // Validación adicional para asegurar que tenemos los datos necesarios
      if (!values.origen || !values.destino || !values.valor) {
        console.log('Faltan campos requeridos:', {
          origen: values.origen,
          destino: values.destino,
          valor: values.valor
        })
        
        // Crear lista de campos faltantes
        const missingFields = []
        if (!values.origen) missingFields.push(t('createCargo.origin'))
        if (!values.destino) missingFields.push(t('createCargo.destination'))
        if (!values.valor) missingFields.push(t('createCargo.value'))
        
        toast({
          title: t('createCargo.validation.title'),
          description: `${t('createCargo.validation.missingFields')}: ${missingFields.join(', ')}`,
          variant: 'destructive',
        })
        return
      }

      console.log({ values })
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

  // Función para subir archivo a Supabase Storage
  const uploadFileToSupabase = async (file: File): Promise<string | null> => {
    try {
      setUploadingFile(true)
      
      // Generar nombre único para el archivo
      const timestamp = new Date().getTime()
      const fileExtension = file.name.split('.').pop()
      const fileName = `lista-empaque-${timestamp}.${fileExtension}`
      
      // Subir archivo al bucket 'packaging-lists'
      const { data, error } = await supabase.storage
        .from('packaging-lists')
        .upload(fileName, file, {
          cacheControl: '3600',
          upsert: false
        })
      
      if (error) {
        console.error('Error uploading file:', error)
        toast({
          title: 'Error al subir archivo',
          description: error.message,
          variant: 'destructive',
        })
        return null
      }
      
      // Para buckets privados, guardamos el path del archivo
      const filePath = data.path
      const fileUrl = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/packaging-lists/${filePath}`
      
      console.log('File uploaded successfully:', fileUrl)
      setUploadedFileUrl(fileUrl)
      return fileUrl
      
    } catch (error) {
      console.error('Error in uploadFileToSupabase:', error)
      toast({
        title: 'Error al subir archivo',
        description: 'Ocurrió un error inesperado al subir el archivo',
        variant: 'destructive',
      })
      return null
    } finally {
      setUploadingFile(false)
    }
  }

  // Función para confirmar y crear el shipment
  const handleConfirmShipment = async () => {
    if (!pendingValues) return

    console.log('Iniciando creación de shipment...')
    console.log({ pendingValues })
    
    let documentUrl: string | null = null
    
    // Si hay un archivo, subirlo primero
    if (pendingValues.listaEmpaque) {
      documentUrl = await uploadFileToSupabase(pendingValues.listaEmpaque)
      if (!documentUrl) {
        // Si falla la subida del archivo, no continuar
        return
      }
    }

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
        // URL del archivo de documentos
        documents_url: documentUrl || undefined,
      },
      {
        onSuccess: (data) => {
          console.log('Shipment created successfully:', data)
          toast({
            title: t('notifications.toasts.shipmentCreatedSuccess'),
            description: t('notifications.toasts.routeDescription', { 
              origin: data.origin_name, 
              destination: data.destination_name 
            }),
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
            title: t('notifications.toasts.shipmentCreationError'),
            description: error.message || t('notifications.toasts.unexpectedError'),
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
      const airportName = airport.country || 'Aeropuerto'
      const iataCode = airport.country_code ? ` (${airport.country_code})` : ''
      return `${airportName}${iataCode}`
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
      const airportName = airport.country || 'Aeropuerto'
      const iataCode = airport.country_code ? ` (${airport.country_code})` : ''
      return `${airportName}${iataCode}`
    }
    
    return destinationId
  }



  // Función para calcular la fecha mínima de embarque
  const getMinShippingDate = () => {
    if (!formik.values.fechaExpiracion) return new Date()
    
    // Parsear fecha manualmente para evitar problemas de zona horaria
    const parts = formik.values.fechaExpiracion.split('-')
    const year = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10) - 1
    const day = parseInt(parts[2], 10)
    const closingDate = new Date(year, month, day)
    
    // Agregar 1 día
    closingDate.setDate(closingDate.getDate() + 1)
    return closingDate
  }

  // Efecto para limpiar fecha de embarque si es anterior a la nueva fecha de cierre
  useEffect(() => {
    const { fechaExpiracion, fechaEmbarque } = formik.values
    if (fechaExpiracion && fechaEmbarque) {
      const closingDate = new Date(fechaExpiracion)
      const shippingDate = new Date(fechaEmbarque)
      
      const minShippingDate = new Date(closingDate.getTime() + 24 * 60 * 60 * 1000) // Al menos 1 día después
      if (shippingDate < minShippingDate) {
        formik.setFieldValue('fechaEmbarque', '')
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formik.values.fechaExpiracion])

  // Efecto para limpiar fecha de embarque cuando se cambia a transporte aéreo
  useEffect(() => {
    // Removed the logic that cleared shipping date for air transport
    // Now shipping date is available for both maritime and air transport
  }, [formik.values.tipoTransporte])

  // Efecto para capturar el shipping_type actual de la URL cada vez que se abra el modal
  useEffect(() => {
    if (isOpen) {
      const currentShippingType = searchParams.get('shipping_type') || '1'
      console.log('Modal abierto - Capturando shipping_type actual:', currentShippingType)
      
      // Solo actualizar si el valor ha cambiado para evitar bucles infinitos
      if (currentShippingType !== formik.values.tipoTransporte) {
        // Actualizar el estado local
        setShippingType(currentShippingType)
        
        // Actualizar el valor del formik
        formik.setFieldValue('tipoTransporte', currentShippingType)
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, searchParams])
  
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    formik.handleSubmit()

    if (Object.keys(formik.errors).length > 0) {
      console.log('Errores de validación:', formik.errors)
      
      // Crear lista de campos con errores
      const errorFields = Object.keys(formik.errors).map(field => {
        const fieldLabels: { [key: string]: string } = {
          tipoTransporte: t('createCargo.transportType'),
          origen: t('createCargo.origin'),
          destino: t('createCargo.destination'),
          tipoComex: t('createCargo.comexType'),
          tipoEnvio: t('createCargo.shipmentType'),
          contenedor: formik.values.tipoTransporte === '1' ? t('createCargo.labels.containerType') : t('createCargo.labels.packagingType'),
          pesoTotal: t('createCargo.labels.totalWeight'),
          tipoMedida: t('createCargo.labels.measureType'),
          cbm: t('createCargo.labels.volume'),
          unidades: t('createCargo.labels.units'),
          incoterm: t('createCargo.labels.incoterm'),
          tipoMercancia: t('createCargo.merchandiseType'),
          cargaClasificacion: t('createCargo.labels.cargoClassification'),
          partidaArancelaria: t('createCargo.labels.tariffItem'),
          valor: t('createCargo.value'),
          moneda: t('createCargo.currency'),
          fechaExpiracion: t('createCargo.shipmentDate'),
          fechaEmbarque: t('createCargo.shippingDate'),
          informacionAdicional: t('createCargo.additionalInfo'),
          listaEmpaque: t('createCargo.labels.documentsList')
        }
        return fieldLabels[field] || field
      })
      
      toast({
        title: t('createCargo.validation.title'),
        description: `${t('createCargo.validation.validationErrors')}: ${errorFields.join(', ')}`,
        variant: 'destructive',
      })
    } else {
      console.log('Formulario válido, sin errores')
    }
  }

  // Función para manejar la selección de archivo
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null
    formik.setFieldValue('listaEmpaque', file)
  }

  // Función para remover archivo seleccionado
  const handleRemoveFile = () => {
    formik.setFieldValue('listaEmpaque', null)
    // Reset input file
    const fileInput = document.getElementById('listaEmpaque') as HTMLInputElement
    if (fileInput) {
      fileInput.value = ''
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
          className="w-full sm:max-w-md md:max-w-lg lg:max-w-xl overflow-y-scroll"
        >
          <SheetHeader className="px-3 md:px-6">
            <SheetTitle className="text-lg md:text-xl">{t('createCargo.title')}</SheetTitle>
          </SheetHeader>

          <form onSubmit={handleSubmit} className="px-3 md:px-6">
            <div className="space-y-4 md:space-y-6 py-2 md:py-4">
              {/* Sección 1: Información básica */}
              <div className="space-y-4 bg-gray-50 p-3 md:p-4 rounded-lg">
                <h3 className="text-lg md:text-xl font-bold text-gray-800 border-b-2 border-blue-500 pb-2">📋 {t('createCargo.sections.basicInfo')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 items-start">
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
                        <SelectItem value="1">{t('transport.maritime')}</SelectItem>
                        <SelectItem value="2">{t('transport.air')}</SelectItem>
                      </SelectContent>
                    </Select>
                    {formik.errors.tipoTransporte && formik.touched.tipoTransporte && (
                      <div className="min-h-[20px]">
                        <div className="text-red-500">
                          <ErrorMessage>
                            {formik.errors.tipoTransporte}
                          </ErrorMessage>
                        </div>
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
                        <SelectItem value="1">{t('createCargo.comexTypes.importation')}</SelectItem>
                        <SelectItem value="2">{t('createCargo.comexTypes.exportation')}</SelectItem>
                      </SelectContent>
                    </Select>
                    {formik.errors.tipoComex && formik.touched.tipoComex && (
                      <div className="min-h-[20px]">
                        <div className="text-red-500">
                          <ErrorMessage>{formik.errors.tipoComex}</ErrorMessage>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 items-start">
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
                      <div className="min-h-[20px]">
                        <div className="text-red-500">
                          <ErrorMessage>
                            {formik.errors.fechaExpiracion}
                          </ErrorMessage>
                        </div>
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
                    {formik.values.tipoTransporte === '1' ? (
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
                    {formik.values.tipoTransporte === '1' ? (
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
                      {formik.values.tipoTransporte === '1' 
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
                          formik.values.tipoTransporte === '1' 
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
                    {formik.errors.contenedor && formik.touched.contenedor && (
                      <div className="text-red-500">
                        <ErrorMessage>{formik.errors.contenedor}</ErrorMessage>
                      </div>
                    )}
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
                    {formik.errors.unidades && formik.touched.unidades && (
                      <div className="text-red-500">
                        <ErrorMessage>{formik.errors.unidades}</ErrorMessage>
                      </div>
                    )}
                  </div>


                </div>
              </div>

              {/* Sección 4: Medidas y Cantidades */}
              <div className="space-y-4 bg-purple-50 p-3 md:p-4 rounded-lg">
                <h3 className="text-lg md:text-xl font-bold text-gray-800 border-b-2 border-purple-500 pb-2">⚖️ {t('createCargo.sections.measureQuantities')}</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-3 md:gap-4">
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
                    {formik.errors.pesoTotal && formik.touched.pesoTotal && (
                      <div className="text-red-500">
                        <ErrorMessage>{formik.errors.pesoTotal}</ErrorMessage>
                      </div>
                    )}
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
                    {formik.errors.tipoMedida && formik.touched.tipoMedida && (
                      <div className="text-red-500">
                        <ErrorMessage>{formik.errors.tipoMedida}</ErrorMessage>
                      </div>
                    )}
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
                    {formik.errors.cbm && formik.touched.cbm && (
                      <div className="text-red-500">
                        <ErrorMessage>{formik.errors.cbm}</ErrorMessage>
                      </div>
                    )}
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
                    {formik.errors.incoterm && formik.touched.incoterm && (
                      <div className="text-red-500">
                        <ErrorMessage>{formik.errors.incoterm}</ErrorMessage>
                      </div>
                    )}
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
                    {formik.errors.cargaClasificacion && formik.touched.cargaClasificacion && (
                      <div className="text-red-500">
                        <ErrorMessage>{formik.errors.cargaClasificacion}</ErrorMessage>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Sección 5: Información Comercial */}
              <div className="space-y-4 bg-orange-50 p-3 md:p-4 rounded-lg">
                <h3 className="text-lg md:text-xl font-bold text-gray-800 border-b-2 border-orange-500 pb-2">💰 {t('createCargo.sections.commercialInfo')}</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 items-start">
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
                      <div className="min-h-[20px]">
                        <div className="text-red-500">
                          <ErrorMessage>{formik.errors.valor}</ErrorMessage>
                        </div>
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
                      <div className="min-h-[20px]">
                        <div className="text-red-500">
                          <ErrorMessage>{formik.errors.moneda}</ErrorMessage>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4 items-start">
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
                      <div className="min-h-[20px]">
                        <div className="text-red-500">
                          <ErrorMessage>
                            {formik.errors.partidaArancelaria}
                          </ErrorMessage>
                        </div>
                      </div>
                    )}
                  </div>
                  {(formik.values.tipoTransporte === '1' || formik.values.tipoTransporte === '2') && (
                    <div className="grid gap-1">
                      <Label htmlFor="fechaEmbarque" className="text-xs md:text-sm font-semibold text-gray-700">{t('createCargo.shippingDate')}</Label>
                      <DatePicker
                        value={formik.values.fechaEmbarque}
                        onChange={(date) => formik.setFieldValue('fechaEmbarque', date)}
                        placeholder={t('extendCargo.selectDate')}
                        minDate={getMinShippingDate()} // Día siguiente a la fecha de cierre
                        maxDate={new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)} // Máximo 1 año en el futuro
                      />
                      {formik.errors.fechaEmbarque && formik.touched.fechaEmbarque && (
                        <div className="min-h-[20px]">
                          <div className="text-red-500">
                            <ErrorMessage>
                              {formik.errors.fechaEmbarque}
                            </ErrorMessage>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Sección 6: Documentos */}
              <div className="space-y-4 bg-blue-50 p-3 md:p-4 rounded-lg">
                <h3 className="text-lg md:text-xl font-bold text-gray-800 border-b-2 border-blue-500 pb-2">📦 {t('createCargo.sections.documents')}</h3>
                <div className="grid gap-1">
                  <Label htmlFor="listaEmpaque" className="text-xs md:text-sm font-semibold text-gray-700">{t('createCargo.labels.documentsList')}</Label>
                  <div className="space-y-2">
                    {!formik.values.listaEmpaque ? (
                      <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors">
                        <input
                          id="listaEmpaque"
                          name="listaEmpaque"
                          type="file"
                          accept=".xlsx,.xls,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                          onChange={handleFileSelect}
                          className="hidden"
                        />
                        <label htmlFor="listaEmpaque" className="cursor-pointer">
                          <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                          <p className="text-sm text-gray-600 mb-1">{t('createCargo.placeholders.selectExcelFile')}</p>
                          <p className="text-xs text-gray-500">Máximo 10MB</p>
                        </label>
                      </div>
                    ) : (
                      <div className="flex items-center justify-between p-3 bg-white border rounded-lg">
                        <div className="flex items-center space-x-2">
                          <FileText className="h-5 w-5 text-green-600" />
                          <span className="text-sm font-medium text-gray-700">
                            {formik.values.listaEmpaque.name}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({(formik.values.listaEmpaque.size / 1024 / 1024).toFixed(2)} MB)
                          </span>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={handleRemoveFile}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    )}
                    {formik.errors.listaEmpaque && formik.touched.listaEmpaque && (
                      <div className="text-red-500">
                        <ErrorMessage>{formik.errors.listaEmpaque}</ErrorMessage>
                      </div>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Archivo opcional. Puedes subir una lista de empaque en formato Excel (.xlsx, .xls)
                  </p>
                </div>
              </div>

              {/* Sección 7: Información Adicional */}
              <div className="space-y-4 bg-teal-50 p-3 md:p-4 rounded-lg">
                <h3 className="text-lg md:text-xl font-bold text-gray-800 border-b-2 border-teal-500 pb-2">📝 {t('createCargo.sections.additionalInfo')}</h3>
                <div className="grid gap-1">
                  <Label htmlFor="informacionAdicional" className="text-xs md:text-sm font-semibold text-gray-700">{t('createCargo.additionalInfo')}</Label>
                  <Textarea
                    id="informacionAdicional"
                    placeholder={t('createCargo.enterAdditionalInfo')}
                    name="informacionAdicional"
                    value={formik.values.informacionAdicional || ''}
                    onChange={(e) => {
                      console.log('Información adicional onChange:', e.target.value)
                      formik.handleChange(e)
                    }}
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
                      {(formik.values.informacionAdicional || '').length}/250
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
                        <span className="font-medium">{getTransportTypeName(pendingValues.tipoTransporte, t)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">{t('createCargo.confirmation.fields.comexType')}:</span>
                        <span className="font-medium">{getTypeShipmentName(pendingValues.tipoComex, t)}</span>
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
                   
                        <div className="flex justify-between">
                          <span className="text-gray-600">{t('createCargo.confirmation.fields.tariffItem')}:</span>
                          <span className="font-medium">{pendingValues.partidaArancelaria || 'N/A'}</span>
                        </div>
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

                  {/* Información de empaque */}
                  {pendingValues.listaEmpaque && (
                    <div className="border-b border-gray-200 pb-2">
                      <h5 className="font-medium text-gray-800 mb-1">📦 {t('createCargo.sections.documents')}</h5>
                      <div className="flex items-center space-x-2 bg-white p-2 rounded border">
                        <FileText className="h-4 w-4 text-green-600" />
                        <span className="text-xs text-gray-700">{pendingValues.listaEmpaque.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(pendingValues.listaEmpaque.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Información adicional */}
                    <div>
                      <h5 className="font-medium text-gray-800 mb-1">📝 {t('createCargo.confirmation.sections.additionalInfo')}</h5>
                      <div className="bg-white p-2 rounded border text-gray-700 text-xs">
                        {pendingValues.informacionAdicional || 'N/A'}
                      </div>
                    </div>
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
