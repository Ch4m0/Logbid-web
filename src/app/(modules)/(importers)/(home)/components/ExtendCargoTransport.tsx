'use client'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { CalendarIcon } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { cn } from '@/src/lib/utils'
import { Button } from '@/src/components/ui/button'
import { Calendar } from '@/src/components/ui/calendar'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/src/components/ui/form'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/src/components/ui/popover'
import { toast } from '@/src/components/ui/use-toast'
import { Card, CardContent } from '@/src/components/ui/card'
import { modalService } from '@/src/service/modalService'
import { useExtendExpirationDate } from '@/src/app/hooks/useExtendExpirationDate'

const FormSchema = z.object({
  dob: z.date({
    required_error: 'A date of birth is required.',
  }),
})

export function ExtendCargoTransport({
  expiration_date,
  origin,
  destination,
  id,
}: {
  expiration_date: string
  origin: string
  destination: string
  id: string
}) {
  const { mutate: extendExpirationDate, isPending } = useExtendExpirationDate()

  const expirationDatePlusOne = new Date(expiration_date)
  expirationDatePlusOne.setDate(expirationDatePlusOne.getDate() + 1)

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
  })

  function onSubmit(data: z.infer<typeof FormSchema>) {
    const expirationDate = format(new Date(data.dob), 'yyyy-MM-dd')

    // Llamar a la mutación para actualizar la fecha
    extendExpirationDate(
      { bidListItemId: id, newExpirationDate: expirationDate },
      {
        onSuccess: () => {
          toast({
            title: 'Fecha actualizada!',
          })
          modalService.closeModal()
        },
        onError: (error) => {
          toast({
            title: 'Error al actualizar la fecha',
            description: error.message,
            variant: 'destructive',
          })
        },
      }
    )
  }

  return (
    <Card>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-8 p-8"
          >
            <FormField
              control={form.control}
              name="dob"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel className="flex flex-col">
                    Fecha de extención:{' '}
                    <div className="mt-6 mb-6">
                      <span className="font-bold rounded-xl p-2 bg-black text-white mr-2">{`${origin}`}</span>{' '}
                      hasta
                      <span className="ffont-bold rounded-xl p-2 bg-black text-white ml-2">{`${destination}`}</span>
                    </div>
                  </FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-[240px] pl-3 text-left font-normal',
                            !field.value && 'text-muted-foreground'
                          )}
                        >
                          {field.value ? (
                            format(field.value, 'PPP')
                          ) : (
                            <span>Selecciona una fecha</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) =>
                          date < new Date(expirationDatePlusOne)
                        }
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormDescription>
                    Extiende tu fecha de viaje de carga
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isPending}>
              {isPending ? 'Actualizando.. ' : 'Guardar'}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
