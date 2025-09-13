'use client'

import { Button } from '@/src/components/ui/button'
import { Input } from '@/src/components/ui/input'
import { Label } from '@/src/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/src/components/ui/select'
import { Slider } from '@/src/components/ui/slider'
import { X, Filter } from 'lucide-react'
import { useTranslation } from '@/src/hooks/useTranslation'
import { Card } from '@/src/components/ui/card'
import { useEffect, useState } from 'react'
import { useOfferStatistics } from '@/src/app/hooks/useOfferStatistics'

interface OfferFiltersProps {
  isOpen: boolean
  shipmentId: string
  filters: {
    agent_code: string
    offer_id: string
    price_min: string
    price_max: string
    status: string
  }
  onFilterChange: (key: string, value: string) => void
  onApplyFilters?: () => void
  onClearFilters?: () => void
  onClose: () => void
}

export function OfferFilters({
  isOpen,
  shipmentId,
  filters,
  onFilterChange,
  onApplyFilters,
  onClearFilters,
  onClose
}: OfferFiltersProps) {
  const { t } = useTranslation()
  const [priceRange, setPriceRange] = useState({ min: 0, max: 0 })
  const [sliderRange, setSliderRange] = useState([0, 0])

  // Get offer statistics using the new hook
  const { data: offerStats, isPending: loadingStats } = useOfferStatistics({
    shipment_id: shipmentId,
    enabled: !!shipmentId
  })

  // Update price range when statistics are loaded
  useEffect(() => {
    if (offerStats?.price_stats) {
      const min = Math.floor(parseFloat(offerStats.price_stats.min_price) || 0)
      const max = Math.ceil(parseFloat(offerStats.price_stats.max_price) || 0)
      setPriceRange({ min, max })
      
      // Initialize slider with current filter values or full range
      const currentMin = filters.price_min ? parseInt(filters.price_min) : min
      const currentMax = filters.price_max ? parseInt(filters.price_max) : max
      setSliderRange([currentMin, currentMax])
    }
  }, [offerStats, filters.price_min, filters.price_max])

  // Update filters when slider changes
  const handleSliderChange = (value: number[]) => {
    setSliderRange(value)
    onFilterChange('price_min', value[0].toString())
    onFilterChange('price_max', value[1].toString())
  }

  // Get unique values from statistics
  const uniqueAgentCodes = offerStats?.unique_agents || []
  const uniqueStatuses = offerStats?.unique_statuses || []

  const clearAllFilters = () => {
    if (onClearFilters) {
      onClearFilters()
    }
  }

  const hasActiveFilters = Object.values(filters).some(value => value && value !== 'all')

  const formatPrice = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const handleApplyFilters = () => {
    if (onApplyFilters) {
      onApplyFilters()
    }
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-purple-600" />
              <h2 className="text-xl font-semibold">{t('offerFilters.title')}</h2>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Filter Fields */}
          <div className="space-y-6">
            {/* Agent Code and Offer ID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="agent-code">{t('offerFilters.agentCode')}</Label>
                <Input
                  id="agent-code"
                  placeholder={t('offerFilters.agentCodePlaceholder')}
                  value={filters.agent_code}
                  onChange={(e) => onFilterChange('agent_code', e.target.value)}
                />
                {!loadingStats && uniqueAgentCodes.length > 0 && (
                  <p className="text-sm text-gray-500">
                    {t('offerFilters.availableCodes')}: {uniqueAgentCodes.slice(0, 3).join(', ')}
                    {uniqueAgentCodes.length > 3 && '...'}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="offer-id">{t('offerFilters.offerId')}</Label>
                <Input
                  id="offer-id"
                  placeholder={t('offerFilters.offerIdPlaceholder')}
                  value={filters.offer_id}
                  onChange={(e) => onFilterChange('offer_id', e.target.value)}
                />
              </div>
            </div>

            {/* Price Range Slider */}
            {priceRange.max > 0 && priceRange.min !== priceRange.max && (
              <div className="space-y-4">
                <Label>{t('offerFilters.priceRange')}</Label>
                <div className="px-3">
                  <Slider
                    value={sliderRange}
                    onValueChange={handleSliderChange}
                    max={priceRange.max}
                    min={priceRange.min}
                    step={1000}
                    className="w-full"
                  />
                </div>
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">{t('offerFilters.min')}:</span>
                    <span className="font-semibold text-purple-600">{formatPrice(sliderRange[0])}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-gray-500">{t('offerFilters.max')}:</span>
                    <span className="font-semibold text-purple-600">{formatPrice(sliderRange[1])}</span>
                  </div>
                </div>
              </div>
            )}

            {/* Quick Range Buttons */}
            {priceRange.max > 0 && priceRange.min !== priceRange.max && (
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleSliderChange([0, Math.min(50000, priceRange.max)])}
                    className="text-xs"
                  >
                    Under $50K
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleSliderChange([50000, Math.min(200000, priceRange.max)])}
                    className="text-xs"
                  >
                    $50K - $200K
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleSliderChange([200000, Math.min(500000, priceRange.max)])}
                    className="text-xs"
                  >
                    $200K - $500K
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => handleSliderChange([500000, priceRange.max])}
                    className="text-xs"
                  >
                    Over $500K
                  </Button>
                </div>
              </div>
            )}

            {/* Single Price Info - when all offers have the same price */}
            {priceRange.max > 0 && priceRange.min === priceRange.max && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">{t('offerFilters.singlePriceInfo')}:</span> {formatPrice(priceRange.min)}
                </p>
              </div>
            )}

            {/* Status */}
            <div className="space-y-2">
              <Label>{t('offerFilters.status')}</Label>
              <Select value={filters.status || 'all'} onValueChange={(value) => onFilterChange('status', value === 'all' ? '' : value)}>
                <SelectTrigger>
                  <SelectValue placeholder={t('offerFilters.selectStatus')} />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">{t('common.all')}</SelectItem>
                  {uniqueStatuses.map((status) => (
                    <SelectItem key={status} value={status}>
                      {String(t(`offerStatus.${status}`, status))}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Price Range Info */}
            {priceRange.max > 0 && (
              <div className="bg-blue-50 p-3 rounded-lg">
                <p className="text-sm text-blue-700">
                  <span className="font-medium">{t('offerFilters.priceRangeInfo')}:</span> {formatPrice(priceRange.min)} - {formatPrice(priceRange.max)}
                </p>
              </div>
            )}

            {/* Active Filters Display */}
            {hasActiveFilters && (
              <div className="bg-gray-50 p-3 rounded-lg">
                <div className="text-sm text-gray-600 mb-2">{t('offerFilters.activeFilters')}:</div>
                <div className="flex flex-wrap gap-2">
                  {filters.agent_code && (
                    <div className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {t('offerFilters.agentCode')}: {filters.agent_code}
                      <button onClick={() => onFilterChange('agent_code', '')} className="hover:bg-blue-200 rounded-full p-0.5">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  {filters.offer_id && (
                    <div className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                      {t('offerFilters.offerId')}: {filters.offer_id.slice(0, 8)}...
                      <button onClick={() => onFilterChange('offer_id', '')} className="hover:bg-blue-200 rounded-full p-0.5">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  {filters.price_min && (
                    <div className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      {t('offerFilters.min')}: ${filters.price_min}
                      <button onClick={() => onFilterChange('price_min', '')} className="hover:bg-green-200 rounded-full p-0.5">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  {filters.price_max && (
                    <div className="inline-flex items-center gap-1 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                      {t('offerFilters.max')}: ${filters.price_max}
                      <button onClick={() => onFilterChange('price_max', '')} className="hover:bg-green-200 rounded-full p-0.5">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                  {filters.status && (
                    <div className="inline-flex items-center gap-1 bg-purple-100 text-purple-800 text-xs px-2 py-1 rounded-full">
                      {t('offerFilters.status')}: {String(t(`offerStatus.${filters.status}`, filters.status))}
                      <button onClick={() => onFilterChange('status', '')} className="hover:bg-purple-200 rounded-full p-0.5">
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 mt-8">
            <Button onClick={handleApplyFilters} className="flex-1 bg-primary hover:bg-primary/90">
              {t('offerFilters.applyFilters')}
            </Button>
            {hasActiveFilters && (
              <Button variant="outline" onClick={clearAllFilters}>
                {t('common.clearAll')}
              </Button>
            )}
            <Button variant="outline" onClick={onClose}>
              {t('common.close')}
            </Button>
          </div>
        </div>
      </Card>
    </div>
  )
}
