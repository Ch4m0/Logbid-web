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
import { Input } from '@/src/components/ui/input'

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
  const [isMobile, setIsMobile] = React.useState(false)
  const [showPlaceholder, setShowPlaceholder] = React.useState(true)
  
  // Detectar dispositivos móviles
  React.useEffect(() => {
    const checkMobile = () => {
      const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera
      const isMobileDevice = /android|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(userAgent.toLowerCase())
      const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0
      const isSmallScreen = window.innerWidth <= 768
      
      setIsMobile(isMobileDevice || (isTouchDevice && isSmallScreen))
    }
    
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Actualizar placeholder cuando hay valor
  React.useEffect(() => {
    setShowPlaceholder(!value)
  }, [value])
  
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

  // Manejar cambio en input nativo de fecha
  const handleNativeInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const dateValue = event.target.value // Ya viene en formato YYYY-MM-DD
    if (onChange) {
      onChange(dateValue)
    }
  }

  // Referencia al input para control directo
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Manejar click en el overlay de placeholder
  const handlePlaceholderClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    setShowPlaceholder(false)
    
    // Activar inmediatamente el input de fecha
    if (inputRef.current) {
      // Forzar focus y click en el input subyacente
      inputRef.current.focus()
      inputRef.current.showPicker?.() // Método moderno para abrir el picker
      
      // Fallback para navegadores que no soportan showPicker
      if (!inputRef.current.showPicker) {
        inputRef.current.click()
      }
    }
  }

  // Configurar restricciones de fecha
  const today = new Date()
  today.setHours(0, 0, 0, 0) // Resetear horas para comparación de fechas
  
  const disabledDays = {
    before: minDate || today, // Por defecto, no permitir fechas pasadas
    after: maxDate, // Si se especifica fecha máxima
  }

  // Formatear fechas para input nativo
  const formatDateForInput = (date: Date): string => {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const minDateForInput = minDate ? formatDateForInput(minDate) : formatDateForInput(today)
  const maxDateForInput = maxDate ? formatDateForInput(maxDate) : undefined

  // En dispositivos móviles, usar input nativo con overlay
  if (isMobile) {
    return (
      <div className={cn('relative w-full flex', className)}>
        {/* Input nativo de fecha */}
        <Input
          ref={inputRef}
          type="date"
          value={value || ''}
          onChange={handleNativeInputChange}
          disabled={disabled}
          min={minDateForInput}
          max={maxDateForInput}
          className={cn(
            'w-full flex-1 pr-10 min-w-0',
            showPlaceholder && !value && 'opacity-0',
            '[&::-webkit-calendar-picker-indicator]:opacity-0 [&::-webkit-calendar-picker-indicator]:absolute [&::-webkit-calendar-picker-indicator]:right-0 [&::-webkit-calendar-picker-indicator]:w-10 [&::-webkit-calendar-picker-indicator]:h-full [&::-webkit-calendar-picker-indicator]:cursor-pointer'
          )}
          style={{ width: '100%' }}
        />
        
        {/* Overlay de placeholder */}
        {showPlaceholder && !value && !disabled && (
          <div
            onClick={handlePlaceholderClick}
            className="absolute inset-0 flex items-center px-3 text-muted-foreground cursor-pointer bg-white border border-input rounded-md"
          >
            {placeholder}
          </div>
        )}
        
        <CalendarIcon className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground pointer-events-none" />
      </div>
    )
  }

  // En desktop, usar el calendario personalizado
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