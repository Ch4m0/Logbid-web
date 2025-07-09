'use client'

import * as React from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'

import { cn } from '@/src/lib/utils'
import { Button } from '@/src/components/ui/button'
import { Calendar } from '@/src/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/src/components/ui/popover'

interface DatePickerProps {
  value?: string
  onChange?: (date: string) => void
  placeholder?: string
  disabled?: boolean
  className?: string
  minDate?: Date
  maxDate?: Date
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Seleccionar fecha',
  disabled = false,
  className,
  minDate,
  maxDate,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)
  
  // Convertir el string value a Date si existe
  const selectedDate = value ? new Date(value) : undefined
  
  // Validar que la fecha sea válida
  const isValidDate = selectedDate && !isNaN(selectedDate.getTime())
  
  const handleSelect = (date: Date | undefined) => {
    if (date && onChange) {
      // Formatear la fecha como YYYY-MM-DD para compatibilidad con el formulario
      const formattedDate = format(date, 'yyyy-MM-dd')
      onChange(formattedDate)
    }
    setOpen(false)
  }

  // Configurar restricciones de fecha
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Resetear horas para comparación de fechas
  
  const disabledDays = {
    before: minDate || today, // Por defecto, no permitir fechas pasadas
    after: maxDate, // Si se especifica fecha máxima
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant={'outline'}
          className={cn(
            'w-full justify-start text-left font-normal',
            !isValidDate && 'text-muted-foreground',
            className
          )}
          disabled={disabled}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {isValidDate ? (
            format(selectedDate, 'dd/MM/yyyy')
          ) : (
            <span>{placeholder}</span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={isValidDate ? selectedDate : undefined}
          onSelect={handleSelect}
          disabled={disabledDays}
          initialFocus
        />
      </PopoverContent>
    </Popover>
  )
} 