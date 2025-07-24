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
  
  // Función para crear fecha en zona horaria local
  // IMPORTANTE: new Date('2024-01-30') se interpreta como UTC y puede mostrar un día diferente
  // en la zona horaria local. Parseamos manualmente para mantener la fecha exacta.
  const parseLocalDate = (dateString: string): Date | undefined => {
    if (!dateString) return undefined
    
    // Parsear manualmente YYYY-MM-DD para evitar problemas de zona horaria
    const parts = dateString.split('-')
    if (parts.length !== 3) return undefined
    
    const year = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10) - 1 // Los meses en Date son 0-indexados
    const day = parseInt(parts[2], 10)
    
    if (isNaN(year) || isNaN(month) || isNaN(day)) return undefined
    
    return new Date(year, month, day)
  }
  
  // Convertir el string value a Date si existe, manteniendo zona horaria local
  const selectedDate = value ? parseLocalDate(value) : undefined
  
  // Validar que la fecha sea válida
  const isValidDate = selectedDate && !isNaN(selectedDate.getTime())
  
  const handleSelect = (date: Date | undefined) => {
    if (date && onChange) {
      // Asegurar que usamos la fecha local para evitar problemas de zona horaria
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, '0') // +1 porque getMonth() es 0-indexado
      const day = String(date.getDate()).padStart(2, '0')
      const formattedDate = `${year}-${month}-${day}`
      
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