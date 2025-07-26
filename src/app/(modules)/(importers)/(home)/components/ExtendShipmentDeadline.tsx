"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { CalendarIcon, TruckIcon, PlaneIcon, ShipIcon, WarehouseIcon, Loader2 } from "lucide-react"
import { useForm } from "react-hook-form"
import { z } from "zod"

import { cn, formatDateUTCAsLocal } from "@/src/lib/utils"
import { Button } from "@/src/components/ui/button"
import { Calendar } from "@/src/components/ui/calendar"
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/src/components/ui/form"
import { Popover, PopoverContent, PopoverTrigger } from "@/src/components/ui/popover"
import { toast } from "@/src/components/ui/use-toast"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { modalService } from "@/src/service/modalService"
import { useExtendExpirationDate } from "@/src/app/hooks/useExtendExpirationDate"
import { Badge } from "@/src/components/ui/badge"
import { useTranslation } from "@/src/hooks/useTranslation"
import { differenceInCalendarDays, addDays, parseISO, startOfDay } from 'date-fns'

const createFormSchema = (expiration_date: string, shipping_date?: string | null, t?: any) => z.object({
  dob_cierre: z.date({
    required_error: t?.('extendCargo.validation.dateRequired') || "Una fecha es requerida.",
  }),
  dob_embarque: z.date({
    required_error: t?.('extendCargo.validation.dateRequired') || "Una fecha es requerida.",
  })
}).refine((data) => {
  // dob_cierre debe ser mayor a la fecha de cierre actual
  const cierreActual = new Date(expiration_date)
  cierreActual.setHours(0,0,0,0)
  return data.dob_cierre > cierreActual
}, {
  message: t?.('extendCargo.validation.dateMustBeAfterCurrentClosing') || "La nueva fecha de cierre debe ser posterior a la actual",
  path: ['dob_cierre']
}).refine((data) => {
  // dob_embarque debe ser al menos 1 día después de dob_cierre
  return differenceInCalendarDays(data.dob_embarque, data.dob_cierre) >= 1
}, {
  message: t?.('extendCargo.validation.shippingMustBeAfterClosing') || "La fecha de embarque debe ser al menos 1 día después de la fecha de cierre",
  path: ['dob_embarque']
}).refine((data) => {
  // dob_cierre debe ser menor a dob_embarque
  return data.dob_cierre < data.dob_embarque
}, {
  message: t?.('extendCargo.validation.closingMustBeBeforeShipping') || "La fecha de cierre debe ser anterior a la fecha de embarque",
  path: ['dob_cierre']
})

export function ExtendShipmentDeadline({
  expiration_date,
  origin,
  destination,
  id,
  shippingType,
  shipping_date, // Fecha de embarque
}: {
  expiration_date: string
  origin: string
  destination: string
  id: string
  shippingType: string
  shipping_date?: string | null
}) {
  const { t } = useTranslation()
  const { mutate: extendExpirationDate, isPending } = useExtendExpirationDate()

  // Crear el schema de validación con las fechas
  const FormSchema = createFormSchema(expiration_date, shipping_date, t)

  // Crear expirationDatePlusOne de forma consistente
  const expirationDateOnly = expiration_date.split('T')[0]
  const [expYear, expMonth, expDay] = expirationDateOnly.split('-').map(Number)
  const expirationDateLocal = new Date(expYear, expMonth - 1, expDay)
  const expirationDatePlusOne = addDays(expirationDateLocal, 1)
  
  // Crear shippingDateInitial de forma más segura usando date-fns
  let shippingDateInitial: Date
  if (shipping_date) {
    try {
      // Extraer solo la parte de fecha (YYYY-MM-DD) para evitar problemas de zona horaria
      const dateOnly = shipping_date.split('T')[0]
      const [year, month, day] = dateOnly.split('-').map(Number)
      shippingDateInitial = new Date(year, month - 1, day) // month - 1 porque Date usa 0-based months
    } catch (error) {
      // Si falla, usar la fecha por defecto
      shippingDateInitial = addDays(expirationDatePlusOne, 1)
    }
  } else {
    shippingDateInitial = addDays(expirationDatePlusOne, 1)
  }
  
  console.log('🔍 Debug fechas:', {
    shipping_date,
    shippingDateInitial: shippingDateInitial.toISOString(),
    expirationDatePlusOne: expirationDatePlusOne.toISOString(),
    shippingDateInitialLocal: shippingDateInitial.toLocaleDateString(),
    expirationDatePlusOneLocal: expirationDatePlusOne.toLocaleDateString()
  })

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      dob_cierre: expirationDatePlusOne,
      dob_embarque: shippingDateInitial,
    },
  })

  const getShippingIcon = () => {
    switch (shippingType) {
      case "Aéreo":
        return <PlaneIcon className="h-5 w-5 text-muted-foreground" />
      case "Marítimo":
        return <ShipIcon className="h-5 w-5 text-muted-foreground" />
      case "Terrestre":
        return <TruckIcon className="h-5 w-5 text-muted-foreground" />
      case "Almacén":
      default:
        return <WarehouseIcon className="h-5 w-5 text-muted-foreground" />
    }
  }

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const newClosing = format(new Date(data.dob_cierre), "yyyy-MM-dd")
    const newShipping = format(new Date(data.dob_embarque), "yyyy-MM-dd")

    extendExpirationDate(
      { bidListItemId: id, newExpirationDate: newClosing, newShippingDate: newShipping },
      {
        onSuccess: () => {
          toast({
            title: t('extendCargo.dateUpdated'),
          })
          modalService.closeModal()
        },
        onError: (error) => {
          toast({
            title: t('extendCargo.errorUpdating'),
            description: error.message,
            variant: "destructive",
          })
        },
      },
    )
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-0">
        <CardTitle className="text-xl font-semibold">{t('extendCargo.title')}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="flex items-center justify-center my-4">
              <div className="flex items-center gap-2 bg-muted p-3 rounded-lg w-full">
                {getShippingIcon()}
                <Badge variant="outline" className="font-medium bg-background">
                  {origin}
                </Badge>
                <div className="h-[2px] flex-1 bg-border"></div>
                <Badge variant="outline" className="font-medium bg-background">
                  {destination}
                </Badge>
              </div>
            </div>

            <div className="bg-muted/50 p-3 rounded-lg mb-4">
              <div className="flex justify-between items-center">
                <div>
                  <div className="text-sm text-muted-foreground mb-1">{t('extendCargo.currentExpiration')}:</div>
                  <div className="font-medium">{formatDateUTCAsLocal(expiration_date).split(' ')[0]}</div>
                </div>
                <Badge variant="secondary">
                  {shippingType}
                </Badge>
              </div>
            </div>

            <FormField
              control={form.control}
              name="dob_cierre"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>{t('extendCargo.newDate')}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "PPP") : <span>{t('extendCargo.selectDate')}</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="center">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => {
                          // No permitir fechas antes de expirationDatePlusOne
                          if (date < expirationDatePlusOne) return true
                          // No permitir fechas igual o después de la fecha de embarque seleccionada
                          const embarque = form.getValues('dob_embarque')
                          if (embarque && date >= embarque) return true
                          return false
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    {t('extendCargo.selectDateAfter')} {format(expirationDatePlusOne, "PPP")}
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dob_embarque"
              render={({ field }) => (
                <FormItem className="space-y-2">
                  <FormLabel>Fecha de Embarque</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "PPP") : <span>Selecciona fecha de embarque</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="center">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => {
                          // No permitir fechas antes de 1 día después de la fecha de cierre seleccionada
                          const cierre = form.getValues('dob_cierre')
                          if (cierre && date <= cierre) return true
                          return false
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Debe ser al menos 1 día después de la fecha de cierre
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full" disabled={isPending}>
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('common.loading')}
                </>
              ) : (
                t('common.save')
              )}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
} 