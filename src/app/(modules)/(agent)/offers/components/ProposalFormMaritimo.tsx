'use client'

import { Button } from '@/src/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Separator } from '@/src/components/ui/separator'
import { useFormik } from 'formik'
import { useEffect, useState, memo } from 'react'
import * as Yup from 'yup'
import { useTranslation } from '@/src/hooks/useTranslation'

interface ProposalFormProps {
  initialData?: CargoQuote
  onSubmit?: (values: CargoQuote) => void
}

export interface CargoQuote {
  bid_id?: number
  agent_id?: number
  price: number
  shipping_type: string
  basic_service: {
    validity: {
      time: number
      unit: string
    }
  }
  cancellation_fee: number
  free_days: number
  freight_fees: {
    value: number
    container: string
  }
  origin_fees: {
    security_manifest: number
    handling: number
  }
  destination_fees: {
    handling: number
    bl_emission: number
    agency: number
    collect_fee: string
  }
  other_fees: {
    pre_shipment_inspection: number
    carbon: number
    security_facility: number
    low_sulfur: number
    cancellation: number
    security_manifest: number
    other: number
  }
}

/*------------------------------------------------------------------
  Componentes extraídos para mantener su identidad en cada render
-------------------------------------------------------------------*/

// Componente para mostrar los subtotales (se memoriza ya que solo depende de sus props)
export const SubtotalDisplay = memo(
  ({ label, amount }: { label: string; amount: number }) => (
    <div className="flex justify-between items-center py-2 px-4 mt-4 bg-gray-50">
      <span className="font-medium">{label}</span>
      <span className="text-right text-purple-600 font-medium">
        {amount.toFixed(2)}
      </span>
    </div>
  )
)

// Componente para cada campo del formulario
export const FormField = ({
  label,
  id,
  type = 'text',
  formik,
  error,
  touched,
}: {
  label: string
  id: string
  type?: string
  formik: any
  error?: string
  touched?: boolean
}) => {
  const { value, onChange, onBlur } = formik.getFieldProps(id)
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        name={id}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={touched && error ? 'border-red-500' : ''}
      />
      {touched && error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}

/*------------------------------------------------------------------
  Componente Principal: ProposalFormMaritimo
-------------------------------------------------------------------*/
export default function ProposalFormMaritimo({
  initialData,
  onSubmit,
}: ProposalFormProps) {
  const { t } = useTranslation()
  const [subtotals, setSubtotals] = useState({
    freight: 0,
    origin: 0,
    destination: 0,
    other: 0,
    total: 0,
  })

  const validationSchema = Yup.object().shape({
    shipping_type: Yup.string().required(t('proposalForm.shippingTypeRequired')),
    basic_service: Yup.object().shape({
      validity: Yup.object().shape({
        time: Yup.number().required(t('proposalForm.timeRequired')).min(0),
        unit: Yup.string().required(t('proposalForm.unitRequired')),
      }),
    }),
    freight_fees: Yup.object().shape({
      value: Yup.number().required(t('proposalForm.valueRequired')).min(0),
      container: Yup.string().required(t('proposalForm.containerRequired')),
    }),
    origin_fees: Yup.object().shape({
      security_manifest: Yup.number()
        .required(t('proposalForm.securityManifestRequired'))
        .min(0),
      handling: Yup.number().required(t('proposalForm.handlingRequired')).min(0),
    }),
    destination_fees: Yup.object().shape({
      handling: Yup.number().required(t('proposalForm.handlingRequired')).min(0),
      bl_emission: Yup.number().required(t('proposalForm.blEmissionRequired')).min(0),
      agency: Yup.number().required(t('proposalForm.agencyFeeRequired')).min(0),
      collect_fee: Yup.string().required(t('proposalForm.collectFeeRequired')),
    }),
    other_fees: Yup.object().shape({
      pre_shipment_inspection: Yup.number()
        .required(t('proposalForm.preShipmentInspectionRequired'))
        .min(0),
      carbon: Yup.number().required(t('proposalForm.carbonFeeRequired')).min(0),
      security_facility: Yup.number()
        .required(t('proposalForm.securityFacilityRequired'))
        .min(0),
      low_sulfur: Yup.number().required(t('proposalForm.lowSulfurRequired')).min(0),
      cancellation: Yup.number().required(t('proposalForm.cancellationFeeRequired')).min(0),
      security_manifest: Yup.number()
        .required(t('proposalForm.securityManifestRequired'))
        .min(0),
      other: Yup.number().required(t('proposalForm.otherExpensesRequired')).min(0),
    }),
  })

  const formik = useFormik({
    initialValues: initialData || {
      shipping_type: 'Marítimo',
      price: 0,
      basic_service: {
        validity: {
          time: 30,
          unit: 'min',
        },
        cancellation_fee: 100,
        free_days: 30,
      },
      freight_fees: {
        value: 5000,
        container: '40 HC',
      },
      origin_fees: {
        security_manifest: 100,
        handling: 50,
      },
      destination_fees: {
        handling: 65,
        bl_emission: 0,
        agency: 50,
        collect_fee: '2%',
      },
      other_fees: {
        pre_shipment_inspection: 125,
        carbon: 35.0,
        security_facility: 45,
        low_sulfur: 68,
        cancellation: 100,
        security_manifest: 45,
        other: 100,
      },
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        console.log(JSON.stringify(values))

        if (onSubmit) {
          onSubmit({
            ...values,
            price: subtotals.total
          })
        }
      } catch (error) {
        console.error('Error:', error)
      }
    },
  })

  // Calcula los subtotales sin provocar remount de los inputs
  useEffect(() => {
    const freightTotal = Number(formik.values.freight_fees.value) || 0

    const originTotal =
      (Number(formik.values.origin_fees.security_manifest) || 0) +
      (Number(formik.values.origin_fees.handling) || 0)

    const destinationTotal =
      (Number(formik.values.destination_fees.handling) || 0) +
      (Number(formik.values.destination_fees.bl_emission) || 0) +
      (Number(formik.values.destination_fees.agency) || 0)

    const otherTotal = Object.values(formik.values.other_fees).reduce(
      (sum, fee) => sum + (Number(fee) || 0),
      0
    )

    const grandTotal =
      freightTotal + originTotal + destinationTotal + otherTotal

    setSubtotals({
      freight: freightTotal,
      origin: originTotal,
      destination: destinationTotal,
      other: otherTotal,
      total: grandTotal,
    })
  }, [formik.values])

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    formik.handleSubmit()
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t('proposalForm.maritimeQuote')}</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Servicio Básico */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('proposalForm.basicService')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label={t('proposalForm.validityTime')}
                id="basic_service.validity.time"
                type="number"
                formik={formik}
                error={formik.errors.basic_service?.validity?.time as string}
                touched={
                  formik.touched.basic_service?.validity?.time as boolean
                }
              />
              <FormField
                label={t('proposalForm.unit')}
                id="basic_service.validity.unit"
                formik={formik}
                error={formik.errors.basic_service?.validity?.unit as string}
                touched={
                  formik.touched.basic_service?.validity?.unit as boolean
                }
              />
            </div>
          </div>

          <Separator className="my-6" />

          {/* Cargos de Flete */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('proposalForm.freightCharges')}</h3>
            <div className="grid grid-cols-2 gap-4">
              <FormField
                label={t('proposalForm.value')}
                id="freight_fees.value"
                type="number"
                formik={formik}
                error={formik.errors.freight_fees?.value as string}
                touched={formik.touched.freight_fees?.value as boolean}
              />
              <FormField
                label={t('proposalForm.container')}
                id="freight_fees.container"
                formik={formik}
                error={formik.errors.freight_fees?.container as string}
                touched={formik.touched.freight_fees?.container as boolean}
              />
            </div>
          </div>
          <SubtotalDisplay label={t('proposalForm.freightSubtotal')} amount={subtotals.freight} />

          <Separator className="my-6" />

          {/* Cargos de Origen */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('proposalForm.originCharges')}</h3>
            <div className="grid gap-4">
              <FormField
                label={t('proposalForm.securityManifest')}
                id="origin_fees.security_manifest"
                type="number"
                formik={formik}
                error={formik.errors.origin_fees?.security_manifest as string}
                touched={
                  formik.touched.origin_fees?.security_manifest as boolean
                }
              />
              <FormField
                label={t('proposalForm.handling')}
                id="origin_fees.handling"
                type="number"
                formik={formik}
                error={formik.errors.origin_fees?.handling as string}
                touched={formik.touched.origin_fees?.handling as boolean}
              />
            </div>
          </div>
          <SubtotalDisplay label={t('proposalForm.originSubtotal')} amount={subtotals.origin} />

          <Separator className="my-6" />

          {/* Cargos de Destino */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('proposalForm.destinationCharges')}</h3>
            <div className="grid gap-4">
              <FormField
                label={t('proposalForm.handling')}
                id="destination_fees.handling"
                type="number"
                formik={formik}
                error={formik.errors.destination_fees?.handling as string}
                touched={formik.touched.destination_fees?.handling as boolean}
              />
              <FormField
                label={t('proposalForm.blEmission')}
                id="destination_fees.bl_emission"
                type="number"
                formik={formik}
                error={formik.errors.destination_fees?.bl_emission as string}
                touched={
                  formik.touched.destination_fees?.bl_emission as boolean
                }
              />
              <FormField
                label={t('proposalForm.agency')}
                id="destination_fees.agency"
                type="number"
                formik={formik}
                error={formik.errors.destination_fees?.agency as string}
                touched={formik.touched.destination_fees?.agency as boolean}
              />
              <FormField
                label={t('proposalForm.collectFee')}
                id="destination_fees.collect_fee"
                formik={formik}
                error={formik.errors.destination_fees?.collect_fee as string}
                touched={
                  formik.touched.destination_fees?.collect_fee as boolean
                }
              />
            </div>
          </div>
          <SubtotalDisplay
            label={t('proposalForm.destinationSubtotal')}
            amount={subtotals.destination}
          />

          <Separator className="my-6" />

          {/* Otros Cargos */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium">{t('proposalForm.otherCharges')}</h3>
            <div className="grid gap-4">
              <FormField
                label={t('proposalForm.preShipmentInspection')}
                id="other_fees.pre_shipment_inspection"
                type="number"
                formik={formik}
                error={
                  formik.errors.other_fees?.pre_shipment_inspection as string
                }
                touched={
                  formik.touched.other_fees?.pre_shipment_inspection as boolean
                }
              />
              <FormField
                label={t('proposalForm.carbon')}
                id="other_fees.carbon"
                type="number"
                formik={formik}
                error={formik.errors.other_fees?.carbon as string}
                touched={formik.touched.other_fees?.carbon as boolean}
              />
              <FormField
                label={t('proposalForm.securityFacility')}
                id="other_fees.security_facility"
                type="number"
                formik={formik}
                error={formik.errors.other_fees?.security_facility as string}
                touched={
                  formik.touched.other_fees?.security_facility as boolean
                }
              />
              <FormField
                label={t('proposalForm.lowSulfur')}
                id="other_fees.low_sulfur"
                type="number"
                formik={formik}
                error={formik.errors.other_fees?.low_sulfur as string}
                touched={formik.touched.other_fees?.low_sulfur as boolean}
              />
              <FormField
                label={t('proposalForm.cancellation')}
                id="other_fees.cancellation"
                type="number"
                formik={formik}
                error={formik.errors.other_fees?.cancellation as string}
                touched={formik.touched.other_fees?.cancellation as boolean}
              />
              <FormField
                label={t('proposalForm.securityManifest')}
                id="other_fees.security_manifest"
                type="number"
                formik={formik}
                error={formik.errors.other_fees?.security_manifest as string}
                touched={
                  formik.touched.other_fees?.security_manifest as boolean
                }
              />
              <FormField
                label={t('proposalForm.others')}
                id="other_fees.other"
                type="number"
                formik={formik}
                error={formik.errors.other_fees?.other as string}
                touched={formik.touched.other_fees?.other as boolean}
              />
            </div>
          </div>
          <SubtotalDisplay label={t('proposalForm.otherSubtotal')} amount={subtotals.other} />

          {/* Total General */}
          <div className="bg-gray-100 rounded-lg p-4 mt-4">
            <div className="flex justify-between items-center text-lg font-medium">
              <span>{t('proposalForm.totalCost')}</span>
              <span className="text-purple-600">
                {subtotals.total.toFixed(2)}
              </span>
            </div>
          </div>

          <div className="flex justify-end">
            <Button type="submit">{t('proposalForm.saveQuote')}</Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
