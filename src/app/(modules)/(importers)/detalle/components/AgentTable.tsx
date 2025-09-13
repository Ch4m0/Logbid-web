'use client'
import { Button } from '@/src/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/src/components/ui/dropdown-menu'
import { Input } from '@/src/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/components/ui/table'
import { Badge } from '@/src/components/ui/badge'
import { useTranslation } from '@/src/hooks/useTranslation'
import { convertToColombiaTime, formatDateUTCAsLocal, formatPrice, formatShippingDate } from '@/src/lib/utils'
import useAuthStore from '@/src/store/authStore'
import {
  ArrowRight,
  Loader2,
  MoreVertical,
  Plane,
  Search,
  Ship,
  Truck,
  X,
  Eye,
  Check
} from 'lucide-react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { useEffect, useState, ReactNode } from 'react'

// Hook personalizado para debounce
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

// Definición de tipos para columnas
export interface TableColumn {
  key: string
  label: string
  width?: string
  minWidth?: string
  render?: (item: any, index: number) => ReactNode
  sortable?: boolean
}

// Definición de tipos para acciones
export interface TableAction {
  key: string
  label: string
  icon?: ReactNode
  variant?: 'default' | 'outline' | 'destructive' | 'ghost'
  size?: 'sm' | 'default' | 'lg'
  onClick: (item: any, index: number) => void
  condition?: (item: any) => boolean
  className?: string
}

// Props del componente
export interface ReusableTableProps {
  // Configuración básica
  title: string
  subtitle?: string
  data: any[]
  columns: TableColumn[]
  actions?: TableAction[]
  
  // Estados
  isLoading?: boolean
  emptyMessage?: string
  noSearchResultsMessage?: string
  
  // Búsqueda
  searchPlaceholder?: string
  searchValue?: string
  onSearchChange?: (value: string) => void
  enableSearch?: boolean
  
  // Filtros
  showFilters?: boolean
  onToggleFilters?: () => void
  filtersComponent?: ReactNode
  
  // Paginación
  pagination?: ReactNode
  
  // Callbacks
  onRowClick?: (item: any, index: number) => void
  onSort?: (key: string, order: 'asc' | 'desc') => void
  
  // Configuración adicional
  className?: string
  stickyActions?: boolean
  hoverable?: boolean
}

// Function to get transport icon
const getTransportIcon = (shippingType: string) => {
  switch (shippingType) {
    case '1':
      return <Ship className="h-4 w-4 text-blue-600" />
    case '2':
      return <Plane className="h-4 w-4 text-blue-600" />
    case 'Terrestre':
      return <Truck className="h-4 w-4 text-blue-600" />
    default:
      return <Ship className="h-4 w-4 text-blue-600" />
  }
}

export function AgentTable({
  title,
  subtitle,
  data,
  columns,
  actions = [],
  isLoading = false,
  emptyMessage,
  noSearchResultsMessage,
  searchPlaceholder,
  searchValue,
  onSearchChange,
  enableSearch = true,
  showFilters = false,
  onToggleFilters,
  filtersComponent,
  pagination,
  onRowClick,
  onSort,
  className = '',
  stickyActions = false,
  hoverable = true
}: ReusableTableProps) {
  const { t } = useTranslation()
  const searchParams = useSearchParams()
  const router = useRouter()
  const pathname = usePathname()
  
  // Estado del buscador con persistencia en URL
  const [searchTerm, setSearchTerm] = useState(searchValue || searchParams.get('search') || '')
  
  // Debounce del término de búsqueda (300ms de delay)
  const debouncedSearchTerm = useDebounce(searchTerm, 300)
  
  // Actualizar URL cuando cambie el término de búsqueda (solo si tiene 3+ caracteres o está vacío)
  useEffect(() => {
    if (!enableSearch) return
    
    const currentSearchTerm = searchParams.get('search') || ''
    
    // Solo actualizar si el término de búsqueda realmente cambió
    if (debouncedSearchTerm !== currentSearchTerm) {
      const params = new URLSearchParams(searchParams)
      if (debouncedSearchTerm && debouncedSearchTerm.length >= 3) {
        params.set('search', debouncedSearchTerm)
        // Resetear paginación cuando se hace una nueva búsqueda
        params.set('page', '1')
      } else {
        params.delete('search')
        // También resetear paginación cuando se limpia la búsqueda
        params.set('page', '1')
      }
      router.replace(`${pathname}?${params.toString()}`)
    }
  }, [debouncedSearchTerm, router, pathname, searchParams, enableSearch])
  
  // Manejar cambio de búsqueda
  const handleSearchChange = (value: string) => {
    setSearchTerm(value)
    onSearchChange?.(value)
  }

  // Renderizar contenido de celda
  const renderCellContent = (column: TableColumn, item: any, index: number) => {
    if (column.render) {
      return column.render(item, index)
    }
    
    // Renderizado por defecto basado en el tipo de dato
    const value = item[column.key]

    if (value === null || value === undefined) {
      return <span className="text-muted-foreground">{t('common.notSpecified')}</span>
    }


    
    // Formateo especial para fechas
    if (column.key.includes('date') || column.key.includes('_at')) {
      if (column.key === 'inserted_at') {
        return <span className="text-sm text-muted-foreground font-mono">{convertToColombiaTime(value)}</span>
      }
      if (column.key === 'expiration_date') {
        return <span className="text-sm font-mono">{formatDateUTCAsLocal(value)}</span>
      }
      if (column.key === 'shipping_date') {
        return <span className="text-sm font-mono">{formatShippingDate(value)}</span>
      }
      return <span className="text-sm font-mono">{formatDateUTCAsLocal(value)}</span>
    }
    
    // Formateo para precios
    if (column.key === 'price') {
      const currency = item.currency || 'USD'
      return <span className="font-semibold text-sm text-muted-foreground font-mono">{formatPrice(value, currency)}</span>
    }
    
    // Formateo para estados
    if (column.key === 'status') {
      const statusColors = {
        pending: "bg-yellow-100 text-yellow-800 border-yellow-300",
        accepted: "bg-green-100 text-green-800 border-green-300",
        rejected: "bg-red-100 text-red-800 border-red-300",
        active: "bg-blue-100 text-blue-800 border-blue-300",
        cancelled: "bg-gray-100 text-gray-800 border-gray-300",
        expired: "bg-orange-100 text-orange-800 border-orange-300"
      }
      
      const statusLabels = {
        pending: t('offerCard.pending'),
        accepted: t('offerCard.accepted'),
        rejected: t('offerCard.rejected'),
        active: t('common.active'),
        cancelled: t('cargoList.cancelled'),
        expired: t('common.expired')
      }
      
      return (
        <Badge className={statusColors[value as keyof typeof statusColors] || statusColors.pending}>
          {statusLabels[value as keyof typeof statusLabels] || value}
        </Badge>
      )
    }
    
    // Formateo para códigos de agente
    if (column.key === 'agent_code') {
      return <span className="font-medium  text-muted-foreground font-mono">{value}</span>
    }
    
    // Formateo para UUIDs (mostrar solo primeros caracteres)
    if (column.key === 'uuid' && value.length > 12) {
      return <span className="text-xs text-muted-foreground font-mono">{value.substring(0, 12)}...</span>
    }
    
    // Formateo para offer_id (UUID de la oferta) - también maneja 'uuid' para ofertas
    if (column.key === 'offer_id' || (column.key === 'uuid' && item.agent_code)) {
      return <span className="text-xs text-muted-foreground font-mono">{value.substring(0, 12)}...</span>
    }
    
    // Formateo para transporte
    if (column.key === 'transportation') {
      return (
        <div className="flex items-center space-x-2">
          {getTransportIcon(item.shipping_type || '1')}
          <span className="font-medium text-sm text-muted-foreground font-mono">{value}</span>
        </div>
      )
    }
    
    // Formateo para origen/destino con banderas
    if (column.key === 'origin' || column.key === 'destination') {
      const flag = column.key === 'origin' ? item.origin_flag : item.destination_flag
      return (
        <div className="flex items-center space-x-2">
          <span className="text-lg">{flag || '🏳️'}</span>
          <div>
            <p className="font-medium text-sm">{value}</p>
          </div>
        </div>
      )
    }
    
    // Formateo por defecto
    return <span className="text-sm font-mono">{value}</span>
  }

  return (
    <Card className={`border-0 shadow-sm bg-gray-50 ${className}`}>
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">{title}</CardTitle>
            {subtitle && <p className="text-sm text-muted-foreground mt-1">{subtitle}</p>}
          </div>
          <div className="flex items-center space-x-2">
            {onToggleFilters && (
              <Button variant="outline" size="sm" onClick={onToggleFilters} className="text-muted-foreground">
                <Search className="h-4 w-4 mr-2" />
                {showFilters ? t('common.hideFilters') : t('common.showFilters')}
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="mb-6 space-y-4">
          {enableSearch && (
            <Input
              placeholder={searchPlaceholder || t('common.searchPlaceholder')}
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="max-w-md"
            />
          )}
          
          {/* Filtros */}
          {showFilters && filtersComponent}
        </div>
        
        <div className="overflow-x-auto bg-white">
          <Table>
            <TableHeader>
              <TableRow className="bg-white">
                {columns.map((column) => (
                  <TableHead 
                    key={column.key}
                    className={`${column.width || 'w-auto'} ${column.minWidth ? `min-w-[${column.minWidth}]` : ''} ${stickyActions && column.key === 'actions' ? 'sticky right-0 bg-white border-l-2 border-gray-200 z-10' : ''}`}
                  >
                    {column.sortable ? (
                      <button
                        onClick={() => onSort?.(column.key, 'asc')}
                        className="flex items-center space-x-1 hover:text-primary"
                      >
                        <span>{column.label}</span>
                      </button>
                    ) : (
                      column.label
                    )}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={columns.length} className="text-center py-8">
                    <div className="flex items-center justify-center space-x-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-muted-foreground">{t('common.loading')}</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : (
                data.map((item, index) => (
                  <TableRow 
                    key={item.id || item.uuid || index} 
                    className={`${hoverable ? 'hover:bg-gray-50 cursor-pointer' : ''}`}
                    onClick={() => onRowClick?.(item, index)}
                  >
                    {columns.map((column) => (
                      <TableCell 
                        key={column.key}
                        className={stickyActions && column.key === 'actions' ? 'sticky right-0 bg-white border-l-2 border-gray-200 z-10' : ''}
                      >
                        {renderCellContent(column, item, index)}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
        
        {!isLoading && data.length === 0 && (
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              {debouncedSearchTerm.trim() 
                ? (noSearchResultsMessage || t('common.noSearchResults'))
                : (emptyMessage || t('common.noData'))
              }
            </p>
          </div>
        )}
        
        {pagination && (
          <div className="w-full flex justify-end mt-8">
            {pagination}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
