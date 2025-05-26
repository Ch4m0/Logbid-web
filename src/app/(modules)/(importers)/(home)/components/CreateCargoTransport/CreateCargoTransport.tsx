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
import { useState } from 'react'
import { useGetIncotermList } from '@/src/app/hooks/useGetIncotermList'
import { useGetListContainer } from '@/src/app/hooks/useGetContainerList'
import { useCreateBid } from '@/src/app/hooks/useCreateBid'
import FilterableSelectMaritimePort from '@/src/app/(modules)/common/components/FilterableSelectMaritimePort'
import { useQuery } from '@tanstack/react-query'
import { useTranslation } from '@/src/hooks/useTranslation'

// Definir el tipo para los valores del formulario
interface FormValues {
  tipoTransporte: string
  origen: string
  destino: string
  tipoComex: string
  tipoEnvio: string
  contenedor: string
  empaque: string
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
  informacionAdicional?: string
}

const ErrorMessage = styled.span`
  font-size: 0.875rem;
  color: red;
`

export default function CreateCargoTransport() {
  const { t } = useTranslation()
  const [isOpen, setIsOpen] = useState(false)
  const [shippingType, setShippingType] = useState('Marítimo')
  const searchParams = useSearchParams()
  const { data: containerList = [] } = useGetListContainer(shippingType)

  const user = useAuthStore((state) => state.user)

  const marketId =
    searchParams.get('market_id') ??
    user?.all_markets[0]?.id?.toString() ??
    null

  const validationSchema = Yup.object({
    tipoTransporte: Yup.string().required(t('createCargo.validation.transportTypeRequired')),
    origen: Yup.string().required(t('createCargo.validation.originRequired')),
    destino: Yup.string().required(t('createCargo.validation.destinationRequired')),
    tipoComex: Yup.string().required(t('createCargo.validation.comexTypeRequired')),
    tipoEnvio: Yup.string().required(t('createCargo.validation.shipmentTypeRequired')),
    contenedor: Yup.string().when('tipoTransporte', (tipoTransporte, schema) => {
      return typeof tipoTransporte === 'string' && tipoTransporte === 'Marítimo'
        ? schema.required(t('createCargo.validation.containerRequired'))
        : schema.notRequired()
    }),
    empaque: Yup.string().when('tipoTransporte', (tipoTransporte, schema) => {
      return tipoTransporte[0] === 'Marítimo'
        ? schema.notRequired()
        : schema.required(t('createCargo.validation.packagingRequired'))
    }),
    pesoTotal: Yup.string()
      .required(t('createCargo.validation.totalWeightRequired'))
      .test(
        'is-numeric',
        t('createCargo.validation.onlyNumbers'),
        (value) => /^[0-9]+$/.test(value)
      ),
    tipoMedida: Yup.string().required(t('createCargo.validation.measureTypeRequired')),
    cbm: Yup.string()
      .required(t('createCargo.validation.cbmRequired'))
      .test(
        'is-numeric',
        t('createCargo.validation.onlyNumbers'),
        (value) => /^[0-9]+$/.test(value)
      ),
    unidades: Yup.string()
      .required(t('createCargo.validation.unitsRequired'))
      .test(
        'is-numeric',
        t('createCargo.validation.onlyNumbers'),
        (value) => /^[0-9]+$/.test(value)
      ),
    incoterm: Yup.string().required(t('createCargo.validation.incotermsRequired')),
    tipoMercancia: Yup.string().required(t('createCargo.validation.merchandiseTypeRequired')),
    cargaClasificacion: Yup.string().required(t('createCargo.validation.cargoClassificationRequired')),
    partidaArancelaria: Yup.string().required(t('createCargo.validation.tariffItemRequired')),
    valor: Yup.string()
      .required(t('createCargo.validation.valueRequired'))
      .test(
        'is-numeric',
        t('createCargo.validation.onlyNumbers'),
        (value) => /^[0-9]+$/.test(value)
      ),
    moneda: Yup.string().required(t('createCargo.validation.currencyRequired')),
    fechaExpiracion: Yup.string().required(t('createCargo.validation.shipmentDateRequired')),
  })

  const formik = useFormik<FormValues>({
    initialValues: {
      tipoTransporte: '',
      origen: '',
      destino: '',
      tipoComex: '',
      tipoEnvio: '',
      contenedor: '',
      empaque: '',
      pesoTotal: '',
      tipoMedida: '',
      cbm: '',
      unidades: '',
      incoterm: '',
      tipoMercancia: '',
      cargaClasificacion: '',
      partidaArancelaria: '',
      valor: '',
      moneda: '',
      fechaExpiracion: '',
      informacionAdicional: '',
    },
    validationSchema,
    onSubmit: (values) => {
      createBid(
        {
          ...values,
          ...{ user_id: user?.id, market_id: marketId && parseInt(marketId) },
        },
        {
          onSuccess: () => {
            console.log('Bid created successfully')
            toast({
              title: 'Transacción creada',
              variant: 'success',
            })
            setIsOpen(false)
            setTimeout(() => {
              window.location.href = '/?market=' + marketId
            }, 3000)
          },
          onError: (error) => {
            console.error('Error creating bid:', error)
            toast({
              title: 'Hubo un error creando la transacción',
              description: error.message,
              variant: 'destructive',
            })
          },
        }
      )
    },
  })

  const { data: listIncoterm } = useGetIncotermList()
  const { mutate: createBid, isPending } = useCreateBid()
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
          <Button onClick={() => setIsOpen(true)}>{t('common.save')}</Button>
        </SheetTrigger>

        <SheetContent
          side="right"
          className="w-full md:max-w-3xl overflow-y-scroll"
        >
          <SheetHeader>
            <SheetTitle>{t('createCargo.title')}</SheetTitle>
          </SheetHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="grid gap-1">
                <Label htmlFor="tipoTransporte">{t('createCargo.transportType')}</Label>
                <Select
                  value={formik.values.tipoTransporte}
                  onValueChange={(value) => {
                    console.log(value, 'value')
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
                <div className="text-red-500 min-h-[20px]">
                  {formik.errors.tipoTransporte &&
                    formik.touched.tipoTransporte && (
                      <ErrorMessage>
                        {formik.errors.tipoTransporte}
                      </ErrorMessage>
                    )}
                </div>
              </div>
              <div className="grid gap-1">
                <Label htmlFor="tipoComex">{t('createCargo.comexType')}</Label>
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
                <div className="text-red-500 min-h-[20px]">
                  {formik.errors.tipoComex && formik.touched.tipoComex && (
                    <ErrorMessage>{formik.errors.tipoComex}</ErrorMessage>
                  )}
                </div>
              </div>

              <div className="grid gap-1">
                {formik.values.tipoTransporte === 'Marítimo' ? (
                  <>
                    <FilterableSelectMaritimePort
                      label={t('createCargo.origin')}
                      value={formik.values.origen}
                      onSelect={(option: any) => {
                        formik.setFieldValue('origen', option.id)
                      }}
                    />
                    <div className="text-red-500 min-h-[20px]">
                      {formik.errors.origen && formik.touched.origen && (
                        <ErrorMessage>{formik.errors.origen}</ErrorMessage>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <FilterableSelectAirport
                      label={t('createCargo.origin')}
                      value={formik.values.origen}
                      onSelect={(option: any) =>
                        formik.setFieldValue('origen', option.id)
                      }
                    />
                    <div className="text-red-500 min-h-[20px]">
                      {formik.errors.origen && formik.touched.origen && (
                        <ErrorMessage>{formik.errors.origen}</ErrorMessage>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="grid gap-1">
                {formik.values.tipoTransporte === 'Marítimo' ? (
                  <>
                    <FilterableSelectMaritimePort
                      label={t('createCargo.destination')}
                      value={formik.values.destino}
                      onSelect={(option: any) =>
                        formik.setFieldValue('destino', option.id)
                      }
                    />
                    <div className="text-red-500 min-h-[20px]">
                      {formik.errors.destino && formik.touched.destino && (
                        <ErrorMessage>{formik.errors.destino}</ErrorMessage>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <FilterableSelectAirport
                      label={t('createCargo.destination')}
                      value={formik.values.destino}
                      onSelect={(option: any) =>
                        formik.setFieldValue('destino', option.id)
                      }
                    />
                    <div className="text-red-500 min-h-[20px]">
                      {formik.errors.destino && formik.touched.destino && (
                        <ErrorMessage>{formik.errors.destino}</ErrorMessage>
                      )}
                    </div>
                  </>
                )}
              </div>

              <div className="grid gap-1">
                <Label htmlFor="tipoEnvio">{t('createCargo.shipmentType')}</Label>
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
                <div className="text-red-500 min-h-[20px]">
                  {formik.errors.tipoEnvio && formik.touched.tipoEnvio && (
                    <ErrorMessage>{formik.errors.tipoEnvio}</ErrorMessage>
                  )}
                </div>
              </div>

              {formik.values.tipoTransporte === 'Marítimo' ? (
                <div className="grid gap-1">
                  <Label htmlFor="contenedor">{t('createCargo.containerType')}</Label>
                  <Select
                    value={formik.values.contenedor}
                    onValueChange={(value) =>
                      formik.setFieldValue('contenedor', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('createCargo.select')} />
                    </SelectTrigger>
                    <SelectContent>
                      {containerList?.map(
                        (item: { id: number; name: string }, index: number) => (
                          <SelectItem key={index} value={item.id.toString()}>
                            {item.name}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <div className="text-red-500 min-h-[20px]">
                    {formik.errors.contenedor && formik.touched.contenedor && (
                      <ErrorMessage>{formik.errors.contenedor}</ErrorMessage>
                    )}
                  </div>
                </div>
              ) : (
                <div className="grid gap-1">
                  <Label htmlFor="empaque">{t('createCargo.packaging')}</Label>
                  <Select
                    value={formik.values.empaque}
                    onValueChange={(value) => {
                      console.log(value, 'value')
                      return formik.setFieldValue('empaque', value)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={t('createCargo.select')} />
                    </SelectTrigger>
                    <SelectContent>
                      {containerList?.map(
                        (item: { id: number; name: string }, index: number) => (
                          <SelectItem key={index} value={item.id.toString()}>
                            {item.name}
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                  <div className="text-red-500 min-h-[20px]">
                    {formik.errors.empaque && formik.touched.empaque && (
                      <ErrorMessage>{formik.errors.empaque}</ErrorMessage>
                    )}
                  </div>
                </div>
              )}

              <div className="grid gap-1">
                <Label htmlFor="pesoTotal">{t('createCargo.totalWeight')}</Label>
                <Input
                  id="pesoTotal"
                  name="pesoTotal"
                  placeholder={t('createCargo.enterWeight')}
                  value={formik.values.pesoTotal}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <div className="text-red-500 min-h-[20px]">
                  {formik.errors.pesoTotal && formik.touched.pesoTotal && (
                    <ErrorMessage>{formik.errors.pesoTotal}</ErrorMessage>
                  )}
                </div>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="tipoMedida">{t('createCargo.measureType')}</Label>
                <Select
                  value={formik.values.tipoMedida}
                  onValueChange={(value) =>
                    formik.setFieldValue('tipoMedida', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('createCargo.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    {['Kg', 'Lbs', 'Tons'].map((item: string, index: number) => (
                      <SelectItem key={index} value={item}>
                        {item}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="text-red-500 min-h-[20px]">
                  {formik.errors.tipoMedida && formik.touched.tipoMedida && (
                    <ErrorMessage>{formik.errors.tipoMedida}</ErrorMessage>
                  )}
                </div>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="cbm">{t('createCargo.cbm')}</Label>
                <Input
                  id="cbm"
                  name="cbm"
                  placeholder={t('createCargo.enterCbm')}
                  value={formik.values.cbm}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <div className="text-red-500 min-h-[20px]">
                  {formik.errors.cbm && formik.touched.cbm && (
                    <ErrorMessage>{formik.errors.cbm}</ErrorMessage>
                  )}
                </div>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="unidades">{t('createCargo.units')}</Label>
                <Input
                  id="unidades"
                  name="unidades"
                  placeholder={t('createCargo.enterUnits')}
                  value={formik.values.unidades}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <div className="text-red-500 min-h-[20px]">
                  {formik.errors.unidades && formik.touched.unidades && (
                    <ErrorMessage>{formik.errors.unidades}</ErrorMessage>
                  )}
                </div>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="incoterm">{t('createCargo.incoterms')}</Label>
                <Select
                  value={formik.values.incoterm}
                  onValueChange={(value) =>
                    formik.setFieldValue('incoterm', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('createCargo.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    {listIncoterm?.map((item: Incoterm, index: number) => (
                      <SelectItem key={index} value={item.id.toString()}>
                        {item.english_name} ({item.name})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="text-red-500 min-h-[20px]">
                  {formik.errors.incoterm && formik.touched.incoterm && (
                    <ErrorMessage>{formik.errors.incoterm}</ErrorMessage>
                  )}
                </div>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="tipoMercancia">{t('createCargo.merchandiseType')}</Label>
                <Input
                  id="tipoMercancia"
                  name="tipoMercancia"
                  placeholder={t('createCargo.enterMerchandiseType')}
                  value={formik.values.tipoMercancia}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <div className="text-red-500 min-h-[20px]">
                  {formik.errors.tipoMercancia &&
                    formik.touched.tipoMercancia && (
                      <ErrorMessage>{formik.errors.tipoMercancia}</ErrorMessage>
                    )}
                </div>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="cargaClasificacion">{t('createCargo.cargoClassification')}</Label>
                <Select
                  value={formik.values.cargaClasificacion}
                  onValueChange={(value) =>
                    formik.setFieldValue('cargaClasificacion', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t('createCargo.select')} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Bulk">{t('createCargo.cargoClassifications.bulk')}</SelectItem>
                    <SelectItem value="General">{t('createCargo.cargoClassifications.general')}</SelectItem>
                    <SelectItem value="Peligrosa">{t('createCargo.cargoClassifications.dangerous')}</SelectItem>
                    <SelectItem value="Refrigerada">{t('createCargo.cargoClassifications.refrigerated')}</SelectItem>
                  </SelectContent>
                </Select>
                <div className="text-red-500 min-h-[20px]">
                  {formik.errors.cargaClasificacion &&
                    formik.touched.cargaClasificacion && (
                      <ErrorMessage>
                        {formik.errors.cargaClasificacion}
                      </ErrorMessage>
                    )}
                </div>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="partidaArancelaria">{t('createCargo.tariffItem')}</Label>
                <Input
                  id="partidaArancelaria"
                  name="partidaArancelaria"
                  placeholder={t('createCargo.enterTariffItem')}
                  value={formik.values.partidaArancelaria}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <div className="text-red-500 min-h-[20px]">
                  {formik.errors.partidaArancelaria &&
                    formik.touched.partidaArancelaria && (
                      <ErrorMessage>
                        {formik.errors.partidaArancelaria}
                      </ErrorMessage>
                    )}
                </div>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="valor">{t('createCargo.value')}</Label>
                <Input
                  id="valor"
                  name="valor"
                  placeholder={t('createCargo.enterValue')}
                  value={formik.values.valor}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <div className="text-red-500 min-h-[20px]">
                  {formik.errors.valor && formik.touched.valor && (
                    <ErrorMessage>{formik.errors.valor}</ErrorMessage>
                  )}
                </div>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="moneda">{t('createCargo.currency')}</Label>
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
                <div className="text-red-500 min-h-[20px]">
                  {formik.errors.moneda && formik.touched.moneda && (
                    <ErrorMessage>{formik.errors.moneda}</ErrorMessage>
                  )}
                </div>
              </div>

              <div className="grid gap-1">
                <Label htmlFor="fechaExpiracion">{t('createCargo.shipmentDate')}</Label>
                <Input
                  id="fechaExpiracion"
                  type="date"
                  name="fechaExpiracion"
                  value={formik.values.fechaExpiracion}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
                <div className="text-red-500 min-h-[20px]">
                  {formik.errors.fechaExpiracion &&
                    formik.touched.fechaExpiracion && (
                      <ErrorMessage>
                        {formik.errors.fechaExpiracion}
                      </ErrorMessage>
                    )}
                </div>
              </div>

              <div className="w-full col-span-2 mt-3 mb-4">
                <Textarea
                  placeholder={t('createCargo.enterAdditionalInfo')}
                  name="informacionAdicional"
                  value={formik.values.informacionAdicional}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>
            </div>

            <SheetFooter>
              <Button type="submit" className="ml-auto">
                {t('common.save')}
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
