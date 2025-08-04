'use client'

import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select'
import { Calendar } from '@/src/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/src/components/ui/popover'
import { CalendarIcon, ArrowUpDown, X, Filter } from 'lucide-react'
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
  onSort: (key: string) => void
  shouldShowStatusElements: boolean
  onApplyFilters?: () => void
  onClearFilters?: () => void
}

export function ShipmentFilters({
  shipmentList = [],
  filters,
  onFilterChange,
  onSort,
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

        <div className="space-y-6">
          {/* First Row: Origin and Destination */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Origin */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                {t('cargoList.origin')}
              </label>
              <div className="flex items-center gap-1 flex-wrap sm:flex-nowrap">
                <div className="w-full min-w-0">
                  <Select
                    value={filters.origin}
                    onValueChange={(value) => onFilterChange('origin', value)}
                  >
                    <SelectTrigger className="w-full truncate">
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
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {filters.origin && filters.origin !== 'all' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => clearFilter('origin')}
                      className="h-10 w-10 hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onSort('origin')}
                    className="h-10 w-10"
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Destination */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                {t('cargoList.destination')}
              </label>
              <div className="flex items-center gap-1 flex-wrap sm:flex-nowrap">
                <div className="w-full min-w-0">
                  <Select
                    value={filters.destination}
                    onValueChange={(value) => onFilterChange('destination', value)}
                  >
                    <SelectTrigger className="w-full truncate">
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
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {filters.destination && filters.destination !== 'all' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => clearFilter('destination')}
                      className="h-10 w-10 hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onSort('destination')}
                    className="h-10 w-10"
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Second Row: Creation Date and Expiration Date */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Creation Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                {t('cargoList.creationDate')}
              </label>
              <div className="flex items-center gap-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {creationDate ? (
                        format(creationDate, 'PPP', { locale: es })
                      ) : (
                        <span className="text-muted-foreground">{t('filters.filterCreationDate')}</span>
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
                    className="h-10 w-10 hover:text-destructive flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Expiration Date */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                {t('cargoList.expirationDate')}
              </label>
              <div className="flex items-center gap-1">
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {expirationDate ? (
                        format(expirationDate, 'PPP', { locale: es })
                      ) : (
                        <span className="text-muted-foreground">{t('filters.filterExpirationDate')}</span>
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
                    className="h-10 w-10 hover:text-destructive flex-shrink-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>

          <Separator className="my-6" />

          {/* Third Row: Transaction ID and Number of Offers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Transaction ID */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                {t('cargoList.transactionId')}
              </label>
              <div className="flex items-center gap-1 flex-wrap sm:flex-nowrap">
                <div className="w-full min-w-0">
                  <Select
                    value={filters.uuid}
                    onValueChange={(value) => onFilterChange('uuid', value)}
                  >
                    <SelectTrigger className="w-full truncate">
                      <SelectValue placeholder={t('filters.filterId')} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">{t('common.all')}</SelectItem>
                      {uniqueUuids.map((uuid) => (
                        <SelectItem key={uuid} value={uuid}>
                          {uuid.substring(0, 20)}...
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  {filters.uuid && filters.uuid !== 'all' && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => clearFilter('uuid')}
                      className="h-10 w-10 hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onSort('uuid')}
                    className="h-10 w-10"
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Number of Offers */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">
                {t('cargoList.offersCount')}
              </label>
              <div className="flex items-center gap-1">
                <Input
                  type="number"
                  value={filters.offers_count || ''}
                  onChange={(e) => onFilterChange('offers_count', e.target.value)}
                  placeholder={t('filters.filterOffersCount')}
                  className="w-full"
                />
                <div className="flex gap-1 flex-shrink-0">
                  {filters.offers_count && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => clearFilter('offers_count')}
                      className="h-10 w-10 hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onSort('offers_count')}
                    className="h-10 w-10"
                  >
                    <ArrowUpDown className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Botón de filtrar */}
        {onApplyFilters && (
          <div className="flex justify-center mt-6 pt-4 border-t">
            <Button
              onClick={onApplyFilters}
              className="w-full sm:w-auto px-8"
            >
              <Filter className="h-4 w-4 mr-2" />
              {t('common.filter')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
} 