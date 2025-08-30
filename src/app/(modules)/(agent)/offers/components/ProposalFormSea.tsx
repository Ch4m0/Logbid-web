'use client'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/src/components/ui/accordion'
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
import { useTranslation } from '@/src/hooks/useTranslation'
import { useFormik } from 'formik'
import { memo, useEffect, useRef, useState } from 'react'
import * as Yup from 'yup'

interface ProposalFormProps {
  initialData?: CargoQuote
  onSubmit?: (values: CargoQuote) => void
  bidDataForAgent?: any
}

export interface CargoQuote {
  bid_id?: number
  agent_id?: number
  price: number
  shipping_type: string
  basic_service: {
    cancellation_fee: number
    free_days: number
  }
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
    <div className="flex justify-between items-center py-2 px-4 mt-4 bg-gray-100">
      <span className="font-medium">{label}</span>
      <span className="text-right text-blue-600 font-medium">
        ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
    </div>
  )
)
SubtotalDisplay.displayName = 'SubtotalDisplay'

// Componente para el header del accordion con total
export const AccordionSectionHeader = memo(
  ({ title, amount }: { title: string; amount: number }) => (
    <div className="flex justify-between items-center w-full">
      <span className="text-base font-semibold text-gray-800">
        {title}
      </span>
      <span className="text-base font-bold text-blue-600">
        ${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
    </div>
  )
)
AccordionSectionHeader.displayName = 'AccordionSectionHeader'

// Componente para cada campo del formulario
export const FormField = ({
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
      {touched && error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}

// Componente para campos Select
export const SelectField = ({
  label,
  id,
  formik,
  error,
  touched,
  options,
  placeholder,
  disabled,
}: {
  label: string
  id: string
  formik: any
  error?: string
  touched?: boolean
  options: { value: string; label: string }[]
  placeholder?: string
  disabled?: boolean
}) => {
  const { value } = formik.getFieldProps(id)
  
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Select 
        value={value} 
        onValueChange={(newValue) => formik.setFieldValue(id, newValue)}
        disabled={disabled}
      >
        <SelectTrigger className={`${touched && error ? 'border-red-500' : ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}>
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

/*------------------------------------------------------------------
  Componente Principal: ProposalFormMaritimo
-------------------------------------------------------------------*/
export default function ProposalFormSea({
  initialData,
  onSubmit,
  bidDataForAgent,
}: ProposalFormProps) {
  const { t } = useTranslation()
  const [subtotals, setSubtotals] = useState({
    freight: 0,
    origin: 0,
    destination: 0,
    other: 0,
    total: 0,
  })
  const containerInitialized = useRef(false)

  // Opciones para los campos Select
  const containerTypes = [
    { value: '20GP', label: '20\' General Purpose (20GP)' },
    { value: '40GP', label: '40\' General Purpose (40GP)' },
    { value: '40HC', label: '40\' High Cube (40HC)' },
    { value: '45HC', label: '45\' High Cube (45HC)' },
    { value: '20RF', label: '20\' Refrigerated (20RF)' },
    { value: '40RF', label: '40\' Refrigerated (40RF)' },
    { value: '20OT', label: '20\' Open Top (20OT)' },
    { value: '40OT', label: '40\' Open Top (40OT)' },
    { value: '20FR', label: '20\' Flat Rack (20FR)' },
    { value: '40FR', label: '40\' Flat Rack (40FR)' },
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
    shipping_type: Yup.string().required(t('proposalForm.shippingTypeRequired')),
    basic_service: Yup.object().shape({
      cancellation_fee: Yup.number().required(t('proposalForm.cancellationFeeRequired')).min(0),
      free_days: Yup.number().required(t('proposalForm.freeDaysRequired')).min(0),
    }),
    freight_fees: Yup.object().shape({
      value: Yup.number().required(t('proposalForm.valueRequired')).min(0),
      container: Yup.string().notRequired(),
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
      shipping_type: '1',
      price: 0,
      basic_service: {
        cancellation_fee: 0,
        free_days: 0,
      },
      freight_fees: {
        value: 0,
        container: '',
      },
      origin_fees: {
        security_manifest: 0,
        handling: 0,
      },
      destination_fees: {
        handling: 0,
        bl_emission: 0,
        agency: 0,
        collect_fee: '',
      },
      other_fees: {
        pre_shipment_inspection: 0,
        carbon: 0,
        security_facility: 0,
        low_sulfur: 0,
        cancellation: 0,
        security_manifest: 0,
        other: 0,
      },
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        
        if (onSubmit) {
          const finalValues = {
            ...values,
            price: subtotals.total
          }
          onSubmit(finalValues)
        } else {
          console.log('⚠️ No external onSubmit function provided')
        }
      } catch (error) {
        console.error('❌ Error in form submission:', error)
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

  // Actualiza el container cuando se recibe bidDataForAgent
  useEffect(() => {
    if (bidDataForAgent?.container_name && !containerInitialized.current) {
   
      formik.setFieldValue('freight_fees.container', bidDataForAgent.container_name)
      containerInitialized.current = true
    }
  }, [bidDataForAgent]) // Removed formik dependency to prevent infinite loop

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    
    // Check if form has validation errors
    if (!formik.isValid) {
      formik.setTouched({}, true) // Mark all fields as touched to show errors
      return
    }
    
    formik.handleSubmit()
  }

  return (
    <div className="space-y-4">
      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Sección 2: Cargos de Flete */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="freight" className="border border-gray-200 rounded-lg">
            <AccordionTrigger className="px-6 py-2 hover:no-underline bg-gray-50 rounded-t-lg">
              <AccordionSectionHeader 
                title={t('proposalForm.freightCharges')} 
                amount={subtotals.freight} 
              />
            </AccordionTrigger>
            <AccordionContent className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label={t('proposalForm.value')}
                  id="freight_fees.value"
                  type="number"
                  placeholder="0"
                  formik={formik}
                  error={formik.errors.freight_fees?.value as string}
                  touched={formik.touched.freight_fees?.value as boolean}
                />
                
                <div>
                  <Label>{t('proposalForm.container')}</Label>
                  <div className="mt-1 p-2 bg-gray-100 rounded-md ">
                    <span className="text-sm text-gray-700 font-medium">
                      {bidDataForAgent?.container_name || t('common.notSpecified')}
                    </span>
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Sección 3: Cargos de Origen */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="origin" className="border border-gray-200 rounded-lg">
            <AccordionTrigger className="px-6 py-2 hover:no-underline bg-gray-50 rounded-t-lg">
              <AccordionSectionHeader 
                title={t('proposalForm.originCharges')} 
                amount={subtotals.origin} 
              />
            </AccordionTrigger>
            <AccordionContent className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label={t('proposalForm.securityManifest')}
                  id="origin_fees.security_manifest"
                  type="number"
                  placeholder="100"
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
                  placeholder="50"
                  formik={formik}
                  error={formik.errors.origin_fees?.handling as string}
                  touched={formik.touched.origin_fees?.handling as boolean}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Sección 4: Cargos de Destino */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="destination" className="border border-gray-200 rounded-lg">
            <AccordionTrigger className="px-6 py-2 hover:no-underline bg-gray-50 rounded-t-lg">
              <AccordionSectionHeader 
                title={t('proposalForm.destinationCharges')} 
                amount={subtotals.destination} 
              />
            </AccordionTrigger>
            <AccordionContent className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label={t('proposalForm.handling')}
                  id="destination_fees.handling"
                  type="number"
                  placeholder="65"
                  formik={formik}
                  error={formik.errors.destination_fees?.handling as string}
                  touched={formik.touched.destination_fees?.handling as boolean}
                />
                <FormField
                  label={t('proposalForm.blEmission')}
                  id="destination_fees.bl_emission"
                  type="number"
                  placeholder="0"
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
                  placeholder="50"
                  formik={formik}
                  error={formik.errors.destination_fees?.agency as string}
                  touched={formik.touched.destination_fees?.agency as boolean}
                />
                <SelectField
                  label={t('proposalForm.collectFee')}
                  id="destination_fees.collect_fee"
                  formik={formik}
                  options={collectFeeOptions}
                  placeholder={t('proposalForm.selectCollectFee') || '2%'}
                  error={formik.errors.destination_fees?.collect_fee as string}
                  touched={
                    formik.touched.destination_fees?.collect_fee as boolean
                  }
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Sección 5: Otros Cargos */}
        <Accordion type="single" collapsible className="w-full">
          <AccordionItem value="other" className="border border-gray-200 rounded-lg">
            <AccordionTrigger className="px-6 py-2 hover:no-underline bg-gray-50 rounded-t-lg">
              <AccordionSectionHeader 
                title={t('proposalForm.otherCharges')} 
                amount={subtotals.other} 
              />
            </AccordionTrigger>
            <AccordionContent className="px-6 py-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label={t('proposalForm.preShipmentInspection')}
                  id="other_fees.pre_shipment_inspection"
                  type="number"
                  placeholder="125"
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
                  placeholder="35"
                  formik={formik}
                  error={formik.errors.other_fees?.carbon as string}
                  touched={formik.touched.other_fees?.carbon as boolean}
                />
                <FormField
                  label={t('proposalForm.securityFacility')}
                  id="other_fees.security_facility"
                  type="number"
                  placeholder="45"
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
                  placeholder="68"
                  formik={formik}
                  error={formik.errors.other_fees?.low_sulfur as string}
                  touched={formik.touched.other_fees?.low_sulfur as boolean}
                />
                <FormField
                  label={t('proposalForm.cancellation')}
                  id="other_fees.cancellation"
                  type="number"
                  placeholder="100"
                  formik={formik}
                  error={formik.errors.other_fees?.cancellation as string}
                  touched={formik.touched.other_fees?.cancellation as boolean}
                />
                <FormField
                  label={t('proposalForm.securityManifest')}
                  id="other_fees.security_manifest"
                  type="number"
                  placeholder="45"
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
                  placeholder="100"
                  formik={formik}
                  error={formik.errors.other_fees?.other as string}
                  touched={formik.touched.other_fees?.other as boolean}
                />
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {/* Sección 1: Información adicional */}
        <div className="space-y-4 bg-gray-50 p-6 rounded-lg border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-800 border-b border-gray-300 pb-3">
             {t('proposalForm.basicService')}
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label={t('proposalForm.cancellationFee')}
              id="basic_service.cancellation_fee"
              type="number"
              placeholder="0"
              formik={formik}
              error={formik.errors.basic_service?.cancellation_fee as string}
              touched={formik.touched.basic_service?.cancellation_fee as boolean}
            />
            <FormField
              label={t('proposalForm.freeDays')}
              id="basic_service.free_days"
              type="number"
              placeholder="0"
              formik={formik}
              error={formik.errors.basic_service?.free_days as string}
              touched={formik.touched.basic_service?.free_days as boolean}
            />
          </div>
        </div>

        {/* Sección 6: Total y Acciones */}
        <div className="space-y-3 bg-white p-4 rounded-lg border border-blue-200 shadow-sm">
          <div className="bg-blue-50 rounded-lg p-3">
            <div className="flex justify-between items-center text-lg font-bold">
              <span className="text-gray-700">{t('proposalForm.totalCost')}:</span>
              <span className="text-blue-600">
                ${subtotals.total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} USD 
              </span>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button 
              type="submit" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2"
              size="default"
              onClick={() => console.log('🔘 Button clicked!')}
            >
              {t('proposalForm.saveQuote')}
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
