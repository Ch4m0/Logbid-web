'use client'

import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select'
import { Calendar } from '@/src/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover'
import { CalendarIcon, X, Filter } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { useState } from 'react'
import { useTranslation } from '@/src/hooks/useTranslation'
import type { BidListItem } from '@/src/models/BidListItem'
import { Card, CardContent } from '@/src/components/ui/card'
import { Separator } from '@/src/components/ui/separator'

interface ShipmentFiltersProps {
  shipmentList?: any[]
  filters: {
    uuid: string
    origin: string
    destination: string
    inserted_at: string
    expiration_date: string
    value: string
    offers_count: string
  }
  onFilterChange: (key: string, value: string) => void
  shouldShowStatusElements: boolean
  onApplyFilters?: () => void
  onClearFilters?: () => void
}

export function ShipmentFilters({
  shipmentList = [],
  filters,
  onFilterChange,
  shouldShowStatusElements,
  onApplyFilters,
  onClearFilters
}: ShipmentFiltersProps) {
  const { t } = useTranslation()
  const [creationDate, setCreationDate] = useState<Date>()
  const [expirationDate, setExpirationDate] = useState<Date>()

  // Get unique values for dropdowns
  const uniqueUuids = Array.from(new Set(shipmentList.map(item => item.uuid))).slice(0, 100)
  const uniqueOrigins = Array.from(new Set(shipmentList.map(item => item.origin))).sort()
  const uniqueDestinations = Array.from(new Set(shipmentList.map(item => item.destination))).sort()

  const handleDateChange = (date: Date | undefined, filterKey: string) => {
    if (date) {
      const formattedDate = format(date, 'yyyy-MM-dd')
      onFilterChange(filterKey, formattedDate)
    } else {
      onFilterChange(filterKey, '')
    }
  }

  const clearFilter = (key: string) => {
    onFilterChange(key, '')
    if (key === 'inserted_at') {
      setCreationDate(undefined)
    } else if (key === 'expiration_date') {
      setExpirationDate(undefined)
    }
  }

  const clearAllFilters = () => {
    if (onClearFilters) {
      onClearFilters()
    } else {
      Object.keys(filters).forEach(key => clearFilter(key))
    }
    // Limpiar también los estados locales de fecha
    setCreationDate(undefined)
    setExpirationDate(undefined)
  }

  const hasActiveFilters = Object.values(filters).some(value => value && value !== 'all')

  return (
    <Card className="mb-6 border-none shadow-md overflow-hidden">
      <CardContent className="p-4 sm:p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-primary" />
            <h3 className="font-semibold text-lg">{t('common.filter')}</h3>
          </div>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              onClick={clearAllFilters}
              className="text-muted-foreground hover:text-destructive w-full sm:w-auto"
            >
              {t('common.clearAll')}
            </Button>
          )}
        </div>

        {/* Horizontal Filters Layout */}
        <div className="overflow-x-auto">
          <div className="flex gap-4 pb-2 min-w-max">
            {/* Origin Filter */}
            <div className="flex-1 min-w-0">
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                {t('cargoList.origin')}
              </label>
              <div className="flex items-center gap-1">
                <Select
                  value={filters.origin}
                  onValueChange={(value) => onFilterChange('origin', value)}
                >
                  <SelectTrigger className="w-full h-8 text-xs">
                    <SelectValue placeholder={t('filters.filterOrigin')} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] min-w-[300px]">
                    <SelectItem value="all">{t('common.all')}</SelectItem>
                    {uniqueOrigins.map((origin) => (
                      <SelectItem
                        key={origin}
                        value={origin}
                        className="break-words whitespace-normal py-2 min-h-[32px]"
                      >
                        {origin}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {filters.origin && filters.origin !== 'all' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => clearFilter('origin')}
                    className="h-8 w-8 hover:text-destructive flex-shrink-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>

            {/* Destination Filter */}
            <div className="flex-1 min-w-0">
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                {t('cargoList.destination')}
              </label>
              <div className="flex items-center gap-1">
                <Select
                  value={filters.destination}
                  onValueChange={(value) => onFilterChange('destination', value)}
                >
                  <SelectTrigger className="w-full h-8 text-xs">
                    <SelectValue placeholder={t('filters.filterDestination')} />
                  </SelectTrigger>
                  <SelectContent className="max-h-[300px] min-w-[300px]">
                    <SelectItem value="all">{t('common.all')}</SelectItem>
                    {uniqueDestinations.map((destination) => (
                      <SelectItem
                        key={destination}
                        value={destination}
                        className="break-words whitespace-normal py-2 min-h-[32px]"
                      >
                        {destination}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {filters.destination && filters.destination !== 'all' && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => clearFilter('destination')}
                    className="h-8 w-8 hover:text-destructive flex-shrink-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>

            {/* Creation Date Filter */}
            <div className="flex-1 min-w-0 max-w-40">
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                {t('cargoList.creationDate')}
              </label>
              <div className="flex items-center gap-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-8 justify-start text-left font-normal text-xs px-2"
                    >
                      <CalendarIcon className="mr-1 h-3 w-3" />
                      {creationDate ? (
                        format(creationDate, 'dd/MM', { locale: es })
                      ) : (
                        <span className="text-muted-foreground text-xs">Fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={creationDate}
                      onSelect={(date) => {
                        setCreationDate(date)
                        handleDateChange(date, 'inserted_at')
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {filters.inserted_at && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => clearFilter('inserted_at')}
                    className="h-8 w-8 hover:text-destructive flex-shrink-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>

            {/* Expiration Date Filter */}
            <div className="flex-1 min-w-0 max-w-40">
              <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                {t('cargoList.expirationDate')}
              </label>
              <div className="flex items-center gap-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full h-8 justify-start text-left font-normal text-xs px-2"
                    >
                      <CalendarIcon className="mr-1 h-3 w-3" />
                      {expirationDate ? (
                        format(expirationDate, 'dd/MM', { locale: es })
                      ) : (
                        <span className="text-muted-foreground text-xs">Fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={expirationDate}
                      onSelect={(date) => {
                        setExpirationDate(date)
                        handleDateChange(date, 'expiration_date')
                      }}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                {filters.expiration_date && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => clearFilter('expiration_date')}
                    className="h-8 w-8 hover:text-destructive flex-shrink-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
            </div>
            
            {/* Apply Filters Button */}
            {onApplyFilters && (
              <div className="flex-shrink-0 w-28">
                <label className="text-xs font-medium text-muted-foreground block mb-1.5">
                  &nbsp;
                </label>
                <Button
                  onClick={onApplyFilters}
                  className="w-full h-8 text-xs"
                >
                  <Filter className="h-3 w-3 mr-1" />
                  {t('common.filter')}
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
} 