"use client"
import { zodResolver } from "@hookform/resolvers/zod"
import { format } from "date-fns"
import { es, enUS } from "date-fns/locale"
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

// Función helper para parsear fechas de forma simple
const parseDateSimple = (dateString: string): Date => {
  // Usar solo la parte de la fecha (YYYY-MM-DD) y crear fecha local
  const dateOnly = dateString.split('T')[0]
  // Usar parseISO con solo la parte de fecha para evitar problemas de zona horaria
  return parseISO(dateOnly + 'T12:00:00') // Usar mediodía para evitar problemas de zona horaria
}

const createFormSchema = (expiration_date: string, shipping_date?: string | null, t?: any) => z.object({
  dob_cierre: z.date({
    required_error: t?.('extendCargo.validation.dateRequired') || "A date is required.",
  }),
  dob_embarque: z.date({
    required_error: t?.('extendCargo.validation.dateRequired') || "A date is required.",
  })
}).refine((data) => {
  // dob_cierre debe ser mayor a la fecha de cierre actual
  const cierreActual = parseDateSimple(expiration_date)
  return data.dob_cierre > cierreActual
}, {
  message: t?.('extendCargo.validation.dateMustBeAfterCurrentClosing') || "The new closing date must be after the current one",
  path: ['dob_cierre']
}).refine((data) => {
  // dob_embarque debe ser al menos 1 día después de dob_cierre
  return differenceInCalendarDays(data.dob_embarque, data.dob_cierre) >= 1
}, {
  message: t?.('extendCargo.validation.shippingMustBeAfterClosing') || "The shipping date must be at least 1 day after the closing date",
  path: ['dob_embarque']
}).refine((data) => {
  // dob_cierre debe ser menor a dob_embarque
  return data.dob_cierre < data.dob_embarque
}, {
  message: t?.('extendCargo.validation.closingMustBeBeforeShipping') || "The closing date must be before the shipping date",
  path: ['dob_cierre']
})

export function ExtendShipmentDeadline({
  expiration_date,
  origin,
  destination,
  id,
  shippingType,
  shipping_date, // Fecha de embarque
  onRefetch,
}: {
  expiration_date: string
  origin: string
  destination: string
  id: string
  shippingType: string
  shipping_date?: string | null
  onRefetch?: () => void
}) {
 

  const { t, getCurrentLanguage } = useTranslation()
  
  // Función para obtener el locale correcto basado en el idioma actual
  const getCurrentLocale = () => {
    return getCurrentLanguage() === 'es' ? es : enUS
  }
  const { mutate: extendExpirationDate, isPending } = useExtendExpirationDate()

  // Crear el schema de validación con las fechas
  const FormSchema = createFormSchema(expiration_date, shipping_date, t)

  // Crear fechas de forma simple
  const expirationDate = parseDateSimple(expiration_date)
  
  // Crear shippingDateInitial de forma simple
  let shippingDateInitial: Date
  if (shipping_date) {
    try {
      shippingDateInitial = parseDateSimple(shipping_date)
    } catch (error) {
      // Si falla, usar fecha por defecto
      shippingDateInitial = addDays(expirationDate, 1)
    }
  } else {
    // Fecha por defecto: 2 días después de la fecha de expiración actual
    shippingDateInitial = addDays(expirationDate, 1)
  }
  
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      dob_cierre: expirationDate,
      dob_embarque: shippingDateInitial,
    },
  })

  // Función para mapear tipos de shipping a claves de traducción
  const getShippingTypeKey = (type: string) => {
    const typeMap: { [key: string]: string } = {
      'Aéreo': 'air',
      'Marítimo': 'maritime', 
      'Terrestre': 'land',
      'Almacén': 'warehouse'
    }
    return typeMap[type] || 'warehouse'
  }

  const getShippingIcon = () => {
    const typeKey = getShippingTypeKey(shippingType)
    switch (typeKey) {
      case "air":
        return <PlaneIcon className="h-5 w-5 text-muted-foreground" />
      case "maritime":
        return <ShipIcon className="h-5 w-5 text-muted-foreground" />
      case "land":
        return <TruckIcon className="h-5 w-5 text-muted-foreground" />
      case "warehouse":
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
          
          // Refrescar la lista manualmente
          if (onRefetch) {
            onRefetch()
          }
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
                  {t(`extendCargo.shippingTypes.${getShippingTypeKey(shippingType)}`)}
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
                          {field.value ? format(field.value, "PPP", { locale: getCurrentLocale() }) : <span>{t('extendCargo.selectDate')}</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="center">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        defaultMonth={field.value || expirationDate}
                        locale={getCurrentLocale()}
                        disabled={(date) => {
                          // No permitir fechas antes de expirationDatePlusOne
                          if (date < expirationDate) return true
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
                    {t('extendCargo.selectDateAfter')} {format(expirationDate, "PPP", { locale: getCurrentLocale() })}
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
                  <FormLabel>{t('extendCargo.shippingDate')}</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn("w-full pl-3 text-left font-normal", !field.value && "text-muted-foreground")}
                        >
                          {field.value ? format(field.value, "PPP", { locale: getCurrentLocale() }) : <span>{t('extendCargo.selectShippingDate')}</span>}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="center">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        defaultMonth={field.value || shippingDateInitial}
                        locale={getCurrentLocale()}
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
                    {t('extendCargo.validation.shippingMustBeAfterClosing')}
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