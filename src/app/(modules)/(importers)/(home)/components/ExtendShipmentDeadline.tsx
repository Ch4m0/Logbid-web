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

const FormSchema = z.object({
  dob: z.date({
    required_error: "A date of birth is required.",
  }),
})

export function ExtendShipmentDeadline({
  expiration_date,
  origin,
  destination,
  id,
  shippingType, // Default to land if not provided
}: {
  expiration_date: string
  origin: string
  destination: string
  id: string
  shippingType: string
}) {
  const { t } = useTranslation()
  const { mutate: extendExpirationDate, isPending } = useExtendExpirationDate()

  const expirationDatePlusOne = new Date(expiration_date)
  expirationDatePlusOne.setDate(expirationDatePlusOne.getDate() + 1)

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  const transportToShippingType = {
    air: "Aéreo",
    sea: "Marítimo",
    land: "Terrestre",
    warehouse: "Almacén",
  }

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
    const expirationDate = format(new Date(data.dob), "yyyy-MM-dd")

    extendExpirationDate(
      { bidListItemId: id, newExpirationDate: expirationDate },
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
              name="dob"
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
                        disabled={(date) => date < new Date(expirationDatePlusOne)}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    {t('extendCargo.selectDateAfter')} {format(new Date(expirationDatePlusOne), "PPP")}
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