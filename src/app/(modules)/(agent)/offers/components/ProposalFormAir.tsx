'use client'

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
import { Separator } from '@/src/components/ui/separator'
import { useTranslation } from '@/src/hooks/useTranslation'
import { useFormik } from 'formik'
import { memo, useEffect, useState } from 'react'
import * as Yup from 'yup'

interface ProposalFormProps {
  initialData?: CargoQuote
  onSubmit?: (values: CargoQuote) => void
  bidDataForAgent?: any
}

interface CargoQuote {
  bid_id?: number
  agent_id?: number
  price: number
  shipping_type: string
  freight_fees: {
    value: number
    dimensions: {
      height: number
      width: number
      length: number
      units: string
    }
  }
  additional_fees: {
    screening: number
    fuel: number
    airway_bill: number
    origin_costs: number
    destination_costs: number
    cancelation_fee: number
  }
  other_fees: {
    collect_fee: string
    other_fees: number
  }
}

const SubtotalDisplay = memo(
  ({ label, amount }: { label: string; amount: number }) => (
    <div className="flex justify-between items-center py-2 px-4 mt-4 bg-gray-50">
      <span className="font-medium">{label}</span>
      <span className="text-right text-purple-600 font-medium">
        {amount.toFixed(2)}
      </span>
    </div>
  )
)
SubtotalDisplay.displayName = 'SubtotalDisplay'

const FormField = memo(
  ({
    label,
    id,
    type = 'text',
    formik,
    error,
    touched,
    placeholder,
  }: {
    label: string
    id: string
    type?: string
    formik: any
    error?: string
    touched?: boolean
    placeholder?: string
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
          placeholder={placeholder}
          className={touched && error ? 'border-red-500' : ''}
        />
        {touched && error && (
          <p className="text-red-500 text-sm mt-1">{error}</p>
        )}
      </div>
    )
  }
)
FormField.displayName = 'FormField'

// Componente para campos Select
const SelectField = memo(
  ({
    label,
    id,
    formik,
    error,
    touched,
    options,
    placeholder,
  }: {
    label: string
    id: string
    formik: any
    error?: string
    touched?: boolean
    options: { value: string; label: string }[]
    placeholder?: string
  }) => {
    const { value } = formik.getFieldProps(id)
    
    return (
      <div>
        <Label htmlFor={id}>{label}</Label>
        <Select 
          value={value} 
          onValueChange={(newValue) => formik.setFieldValue(id, newValue)}
        >
          <SelectTrigger className={touched && error ? 'border-red-500' : ''}>
            <SelectValue placeholder={placeholder} />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {touched && error && <p className="text-red-500 text-sm mt-1">{error}</p>}
      </div>
    )
  }
)
SelectField.displayName = 'SelectField'

export default function ProposalFormAir({
  initialData,
  onSubmit,
  bidDataForAgent,
}: ProposalFormProps) {
  const { t } = useTranslation()
  const [hasErrors, setHasErrors] = useState(false)
  const [subtotals, setSubtotals] = useState({
    freight: 0,
    additional: 0,
    other: 0,
    total: 0,
  })

  // Opciones para los campos Select
  const dimensionUnits = [
    { value: 'cm', label: t('proposalFormAir.centimeters') || 'Centimeters (cm)' },
    { value: 'in', label: t('proposalFormAir.inches') || 'Inches (in)' },
    { value: 'm', label: t('proposalFormAir.meters') || 'Meters (m)' },
  ]

  const collectFeeOptions = [
    { value: '0%', label: '0%' },
    { value: '1%', label: '1%' },
    { value: '2%', label: '2%' },
    { value: '2.5%', label: '2.5%' },
    { value: '3%', label: '3%' },
    { value: '5%', label: '5%' },
    { value: 'custom', label: t('proposalForm.customPercentage') || 'Custom %' },
  ]

  const validationSchema = Yup.object().shape({
    shipping_type: Yup.string().required(t('proposalFormAir.shippingTypeRequired')),
    freight_fees: Yup.object().shape({
      value: Yup.number()
        .required(t('proposalFormAir.freightRequired'))
        .positive(t('proposalFormAir.mustBePositive')),
      dimensions: Yup.object().shape({
        height: Yup.number()
          .required(t('proposalFormAir.heightRequired'))
          .positive(t('proposalFormAir.heightMustBePositive')),
        width: Yup.number()
          .required(t('proposalFormAir.widthRequired'))
          .positive(t('proposalFormAir.widthMustBePositive')),
        length: Yup.number()
          .required(t('proposalFormAir.lengthRequired'))
          .positive(t('proposalFormAir.lengthMustBePositive')),
        units: Yup.string().required(t('proposalFormAir.unitRequired')),
      }),
    }),
    additional_fees: Yup.object().shape({
      screening: Yup.number().required(t('proposalFormAir.screeningFeeRequired')).min(0),
      fuel: Yup.number().required(t('proposalFormAir.fuelSurchargeRequired')).min(0),
      airway_bill: Yup.number().required(t('proposalFormAir.awbRequired')).min(0),
      origin_costs: Yup.number().required(t('proposalFormAir.originCostsRequired')).min(0),
      destination_costs: Yup.number()
        .required(t('proposalFormAir.destinationCostsRequired'))
        .min(0),
      cancelation_fee: Yup.number().required(t('proposalFormAir.cancellationFeeRequired')).min(0),
    }),
    other_fees: Yup.object().shape({
      collect_fee: Yup.string().required(t('proposalFormAir.collectFeeRequired')),
      other_fees: Yup.number().required(t('proposalFormAir.otherCostsRequired')).min(0),
    }),
  })

  const formik = useFormik({
    initialValues: {
      shipping_type: 'Aéreo',
      price: 0,
      freight_fees: {
        value: 0,
        dimensions: {
          height: 0,
          width: 0,
          length: 0,
          units: '',
        },
      },
      additional_fees: {
        screening: 0,
        fuel: 0,
        airway_bill: 0,
        origin_costs: 0,
        destination_costs: 0,
        cancelation_fee: 0,
      },
      other_fees: {
        collect_fee: '',
        other_fees: 0,
      },
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        const freightValue = values.freight_fees.value
        const additionalFees = Object.values(values.additional_fees).reduce(
          (sum, fee) => sum + (Number(fee) || 0),
          0
        )
        const otherFeesValue = values.other_fees.other_fees
        const totalPrice = freightValue + additionalFees + otherFeesValue

        const finalValues = {
          ...values,
          price: totalPrice,
        }

        if (onSubmit) {
          onSubmit(finalValues)
        }
      } catch (error) {
        console.error('Error al enviar el formulario:', error)
      }
    },
  })

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    formik.handleSubmit()
    if (Object.keys(formik.errors).length > 0) {
  
      setHasErrors(true)
    } else {
      setHasErrors(false)
  
    }
  }

  useEffect(() => {
    const freightTotal = Number(formik.values.freight_fees.value) || 0
    const additionalTotal = Object.values(formik.values.additional_fees).reduce(
      (sum, fee) => sum + (Number(fee) || 0),
      0
    )
    const otherTotal = Number(formik.values.other_fees.other_fees) || 0
    const grandTotal = freightTotal + additionalTotal + otherTotal

    setSubtotals({
      freight: freightTotal,
      additional: additionalTotal,
      other: otherTotal,
      total: grandTotal,
    })
  }, [formik.values])

  return (
    <div className="space-y-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Sección 1: Cargos de Flete */}
        <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-3">
            ✈️ {t('proposalFormAir.freightCharges')}
          </h3>
          <div className="grid gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                label={t('proposalFormAir.freight')}
                id="freight_fees.value"
                type="number"
                placeholder="2500"
                formik={formik}
                error={formik.errors.freight_fees?.value}
                touched={formik.touched.freight_fees?.value}
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <FormField
                label={t('proposalFormAir.height')}
                id="freight_fees.dimensions.height"
                type="number"
                placeholder="120"
                formik={formik}
                error={formik.errors.freight_fees?.dimensions?.height}
                touched={formik.touched.freight_fees?.dimensions?.height}
              />
              <FormField
                label={t('proposalFormAir.width')}
                id="freight_fees.dimensions.width"
                type="number"
                placeholder="80"
                formik={formik}
                error={formik.errors.freight_fees?.dimensions?.width}
                touched={formik.touched.freight_fees?.dimensions?.width}
              />
              <FormField
                label={t('proposalFormAir.length')}
                id="freight_fees.dimensions.length"
                type="number"
                placeholder="100"
                formik={formik}
                error={formik.errors.freight_fees?.dimensions?.length}
                touched={formik.touched.freight_fees?.dimensions?.length}
              />
              <SelectField
                label={t('proposalFormAir.units')}
                id="freight_fees.dimensions.units"
                formik={formik}
                options={dimensionUnits}
                placeholder="cm"
                error={formik.errors.freight_fees?.dimensions?.units}
                touched={formik.touched.freight_fees?.dimensions?.units}
              />
            </div>
          </div>
          <SubtotalDisplay label={t('proposalFormAir.subtotal')} amount={subtotals.freight} />
        </div>

        <Separator className="my-6" />

        {/* Sección 2: Cargos Adicionales */}
        <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-3">
            💰 {t('proposalFormAir.additionalCharges')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label={t('proposalFormAir.screeningFee')}
              id="additional_fees.screening"
              type="number"
              placeholder="50"
              formik={formik}
              error={formik.errors.additional_fees?.screening}
              touched={formik.touched.additional_fees?.screening}
            />
            <FormField
              label={t('proposalFormAir.fuelSurcharge')}
              id="additional_fees.fuel"
              type="number"
              placeholder="150"
              formik={formik}
              error={formik.errors.additional_fees?.fuel}
              touched={formik.touched.additional_fees?.fuel}
            />
            <FormField
              label={t('proposalFormAir.airwayBill')}
              id="additional_fees.airway_bill"
              type="number"
              placeholder="25"
              formik={formik}
              error={formik.errors.additional_fees?.airway_bill}
              touched={formik.touched.additional_fees?.airway_bill}
            />
            <FormField
              label={t('proposalFormAir.originCosts')}
              id="additional_fees.origin_costs"
              type="number"
              placeholder="75"
              formik={formik}
              error={formik.errors.additional_fees?.origin_costs}
              touched={formik.touched.additional_fees?.origin_costs}
            />
            <FormField
              label={t('proposalFormAir.destinationCosts')}
              id="additional_fees.destination_costs"
              type="number"
              placeholder="85"
              formik={formik}
              error={formik.errors.additional_fees?.destination_costs}
              touched={formik.touched.additional_fees?.destination_costs}
            />
            <FormField
              label={t('proposalFormAir.cancellation')}
              id="additional_fees.cancelation_fee"
              type="number"
              placeholder="100"
              formik={formik}
              error={formik.errors.additional_fees?.cancelation_fee}
              touched={formik.touched.additional_fees?.cancelation_fee}
            />
          </div>
          <SubtotalDisplay label={t('proposalFormAir.subtotal')} amount={subtotals.additional} />
        </div>

        <Separator className="my-6" />

        {/* Sección 3: Otros Gastos */}
        <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-3">
            📋 {t('proposalFormAir.otherCosts')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SelectField
              label={t('proposalFormAir.collectFeePercent')}
              id="other_fees.collect_fee"
              formik={formik}
              options={collectFeeOptions}
              placeholder="2%"
              error={formik.errors.other_fees?.collect_fee}
              touched={formik.touched.other_fees?.collect_fee}
            />
            <FormField
              label={t('proposalFormAir.otherCosts')}
              id="other_fees.other_fees"
              type="number"
              placeholder="50"
              formik={formik}
              error={formik.errors.other_fees?.other_fees}
              touched={formik.touched.other_fees?.other_fees}
            />
          </div>
          <SubtotalDisplay label={t('proposalFormAir.subtotal')} amount={subtotals.other} />
        </div>

        {/* Sección 4: Total y Acciones */}
        <div className="space-y-4 bg-white p-6 rounded-lg border-2 border-blue-200 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-3">
            💎 {t('proposalFormAir.totalCost')}
          </h3>
          <div className="bg-blue-50 rounded-lg p-6">
            <div className="flex justify-between items-center text-2xl font-bold">
              <span className="text-gray-700">{t('proposalFormAir.totalCost')}:</span>
              <span className="text-blue-600">
                USD ${subtotals.total.toFixed(2)}
              </span>
            </div>
          </div>
          
          {hasErrors && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-600 text-sm font-medium">
                {t('proposalFormAir.pleaseCorrectErrors')}
              </p>
            </div>
          )}
          
          <div className="flex justify-end pt-4">
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg font-semibold"
              size="lg"
            >
              {t('proposalFormAir.saveQuote')}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
