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

const validationSchema = Yup.object({
  tipoTransporte: Yup.string().required('El tipo de transporte es requerido'),
  origen: Yup.string().required('El origen es requerido'),
  destino: Yup.string().required('El destino es requerido'),
  tipoComex: Yup.string().required('El tipo de comex es requerido'),
  tipoEnvio: Yup.string().required('El tipo de envío es requerido'),
  contenedor: Yup.string().when('tipoTransporte', (tipoTransporte, schema) => {
    return typeof tipoTransporte === 'string' && tipoTransporte === 'Marítimo'
      ? schema.required('El contenedor es requerido') // Si es "Marítimo", se requiere
      : schema.notRequired() // Para otros tipos de transporte, no se requiere
  }),
  empaque: Yup.string().when('tipoTransporte', (tipoTransporte, schema) => {
    return tipoTransporte[0] === 'Marítimo'
      ? schema.notRequired() // Si es "maritimo", no se requiere
      : schema.required('El empaque es requerido') // Requiere "empaque" para otros tipos de envío
  }),

  pesoTotal: Yup.string()
    .required('El peso total es requerido')
    .test(
      'is-numeric',
      'Solo se permiten números en Peso Total',
      (value) => /^[0-9]+$/.test(value) // Verifica que el valor solo contenga dígitos
    ),

  tipoMedida: Yup.string().required('El tipo de medida es requerido'),
  cbm: Yup.string()
    .required('El m3 (CBM) es requerido')
    .test(
      'is-numeric',
      'Solo se permiten números en CBM',
      (value) => /^[0-9]+$/.test(value) // Verifica que el valor solo contenga dígitos
    ),
  unidades: Yup.string()
    .required('Las unidades son requeridas')
    .test(
      'is-numeric',
      'Solo se permiten números en el campo unidades',
      (value) => /^[0-9]+$/.test(value) // Verifica que el valor solo contenga dígitos
    ),
  incoterm: Yup.string().required('El incoterm es requerido'),
  tipoMercancia: Yup.string().required('El tipo de mercancía es requerido'),
  cargaClasificacion: Yup.string().required(
    'La clasificación de la carga es requerida'
  ),
  partidaArancelaria: Yup.string().required(
    'La partida arancelaria es requerida'
  ),
  valor: Yup.string()
    .required('El valor es requerido')
    .test(
      'is-numeric',
      'Solo se permiten números en el campo valor',
      (value) => /^[0-9]+$/.test(value) // Verifica que el valor solo contenga dígitos
    ),
  moneda: Yup.string().required('La moneda es requerida'),
  fechaExpiracion: Yup.string().required('La fecha de despacho es requerida'),
})

const ErrorMessage = styled.span`
  font-size: 0.875rem;
  color: red;
`

export default function CreateCargoTransport() {
  const [isOpen, setIsOpen] = useState(false)
  const [shippingType, setShippingType] = useState('Marítimo')
  const searchParams = useSearchParams()
  const { data: containerList = [] } = useGetListContainer(shippingType)

  const user = useAuthStore((state) => state.user)

  const marketId =
    searchParams.get('market_id') ??
    user?.all_markets[0]?.id?.toString() ??
    null

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
    formik.handleSubmit() // Ejecuta la validación

    // Verifica si hay errores de validación y los imprime
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
          <Button onClick={() => setIsOpen(true)}>Crear</Button>
        </SheetTrigger>

        <SheetContent
          side="right"
          className="w-full md:max-w-3xl overflow-y-scroll"
        >
          <SheetHeader>
            <SheetTitle>Creación de transporte de carga</SheetTitle>
          </SheetHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-2 gap-4 py-4">
              <div className="grid gap-1">
                <Label htmlFor="tipoTransporte">Transporte</Label>
                <Select
                  value={formik.values.tipoTransporte}
                  onValueChange={(value) => {
                    console.log(value, 'value')
                    setShippingType(value)
                    return formik.setFieldValue('tipoTransporte', value)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Marítimo">Marítimo</SelectItem>
                    <SelectItem value="Aéreo">Aéreo</SelectItem>
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
                <Label htmlFor="tipoComex">Tipo Comex</Label>
                <Select
                  value={formik.values.tipoComex}
                  onValueChange={(value) => {
                    formik.setFieldValue('tipoComex', value)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Importación">Importación</SelectItem>
                    <SelectItem value="Exportación">Exportación</SelectItem>
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
                      label="Orígen"
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
                      label="Orígen"
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
                      label="Destino"
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
                      label="Destino"
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
                <Label htmlFor="tipoEnvio">Tipo envío</Label>
                <Select
                  value={formik.values.tipoEnvio}
                  onValueChange={(value) =>
                    formik.setFieldValue('tipoEnvio', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Carga suelta">Carga suelta</SelectItem>
                    <SelectItem value="FCL">FCL</SelectItem>
                    <SelectItem value="LCL">LCL</SelectItem>
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
                  <Label htmlFor="contenedor">Contenedor</Label>
                  <Select
                    value={formik.values.contenedor}
                    onValueChange={(value) =>
                      formik.setFieldValue('contenedor', value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
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
                  <Label htmlFor="empaque">Empaque</Label>
                  <Select
                    value={formik.values.empaque}
                    onValueChange={(value) => {
                      console.log(value, 'value')
                      return formik.setFieldValue('empaque', value)
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar" />
                    </SelectTrigger>
                    <SelectContent>
                      {/* containerList.map((item, index) => (
                        <SelectItem key={index} value={item}>
                          {item}
                        </SelectItem>
                      )) */}
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
                <Label htmlFor="pesoTotal">Peso Bruto Total</Label>
                <Input
                  id="pesoTotal"
                  name="pesoTotal"
                  placeholder="Ingrese el peso total"
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
                <Label htmlFor="tipoMedida">Tipo Medida</Label>
                <Select
                  value={formik.values.tipoMedida}
                  onValueChange={(value) =>
                    formik.setFieldValue('tipoMedida', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {['Kg', 'Lbs', 'Tons'].map((item, index) => (
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
                <Label htmlFor="cbm">m3 (CBM)</Label>
                <Input
                  id="cbm"
                  name="cbm"
                  placeholder="Ingrese el m3 (CBM)"
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
                <Label htmlFor="unidades">Unidades</Label>
                <Input
                  id="unidades"
                  name="unidades"
                  placeholder="Ingrese las unidades"
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
                <Label htmlFor="incoterm">Incoterms</Label>
                <Select
                  value={formik.values.incoterm}
                  onValueChange={(value) =>
                    formik.setFieldValue('incoterm', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
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
                <Label htmlFor="tipoMercancia">Tipo Mercancia</Label>
                <Input
                  id="tipoMercancia"
                  name="tipoMercancia"
                  placeholder="Ingrese el tipo de mercancía"
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
                <Label htmlFor="cargaClasificacion">Carga Clasificación</Label>
                <Select
                  value={formik.values.cargaClasificacion}
                  onValueChange={(value) =>
                    formik.setFieldValue('cargaClasificacion', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {['Bulk', 'General', 'Peligrosa', 'Refrigerada'].map(
                      (item, index) => (
                        <SelectItem key={index} value={item}>
                          {item}
                        </SelectItem>
                      )
                    )}
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
                <Label htmlFor="partidaArancelaria">Partida Arancelaria</Label>
                <Input
                  id="partidaArancelaria"
                  name="partidaArancelaria"
                  placeholder="Ingrese la partida arancelaria"
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
                <Label htmlFor="valor">Valor</Label>
                <Input
                  id="valor"
                  name="valor"
                  placeholder="Ingrese el valor"
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
                <Label htmlFor="moneda">Moneda</Label>
                <Select
                  value={formik.values.moneda}
                  onValueChange={(value) =>
                    formik.setFieldValue('moneda', value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    {['EUR', 'USD'].map((item, index) => (
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
                <Label htmlFor="fechaExpiracion">Fecha despacho</Label>
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

              <div className="w-full col-ErrorMessage-2 mt-3 mb-4">
                <Textarea
                  placeholder="Información adicional"
                  name="informacionAdicional"
                  value={formik.values.informacionAdicional}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                />
              </div>
            </div>

            <SheetFooter>
              <Button type="submit" className="ml-auto">
                Guardar
              </Button>
            </SheetFooter>
          </form>
        </SheetContent>
      </Sheet>
    </div>
  )
}
