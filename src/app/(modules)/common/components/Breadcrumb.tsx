'use client'
import { useSearchParams, usePathname } from 'next/navigation'
import useAuthStore from '@/src/store/authStore'
import { useTranslation } from '@/src/hooks/useTranslation'
import { ChevronRight, MapPin } from 'lucide-react'
import { Suspense } from 'react'
import { getTransportTypeName } from '@/src/utils/translateTypeName'

const BreadcrumbContent = () => {
  const { profile } = useAuthStore()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { t } = useTranslation()

  // Obtener el mercado actual con fallback al primer mercado del usuario
  const marketId = searchParams.get('market')
  const currentMarket = marketId 
    ? profile?.all_markets?.find(market => market.id.toString() === marketId)
    : profile?.all_markets?.[0] // Fallback al primer mercado si no hay market_id

  const marketName = currentMarket?.name || ''

  // Obtener el tipo de envío
  const shippingType = searchParams.get('shipping_type') || '1'

  // Determinar la sección actual basada en la ruta
  const getSectionName = () => {
    if (pathname.includes('/graphics')) {
      return t('breadcrumb.dashboard')
    }
    if (pathname.includes('/bid_list')) {
      return t('breadcrumb.shipments')
    }
    if (pathname.includes('/offers')) {
      return t('breadcrumb.offers')
    }
    if (pathname.includes('/history')) {
      return t('breadcrumb.history')
    }
    if (pathname.includes('/history_offers')) {
      return t('breadcrumb.offersHistory')
    }
    if (pathname === '/' || pathname.includes('/(home)')) {
      return t('breadcrumb.shipments')
    }
    return t('breadcrumb.shipments')
  }

  // Solo no mostrar si no hay mercados disponibles en absoluto
  if (!profile?.all_markets || profile.all_markets.length === 0) {
    return null
  }

  // Si estamos en la vista de dashboard, solo mostrar "Dashboard"
  if (pathname.includes('/graphics')) {
    return (
      <div className="bg-gray-50 border-b px-6 py-3">
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          <span className="text-gray-700 font-medium">{getSectionName()}</span>
        </nav>
      </div>
    )
  }

  return (
    <div className="bg-gray-50 border-b px-6 py-3">
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <MapPin className="h-4 w-4 text-purple-600" />
        <span className="font-medium text-purple-700">{marketName}</span>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-500">{getSectionName()}</span>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-700 font-medium">{getTransportTypeName(shippingType, t)}</span>
      </nav>
    </div>
  )
}

const Breadcrumb = () => {
  return (
    <Suspense fallback={
      <div className="bg-gray-50 border-b px-6 py-3">
        <nav className="flex items-center space-x-2 text-sm text-gray-600">
          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-4 bg-gray-200 rounded animate-pulse"></div>
          <div className="h-4 w-12 bg-gray-200 rounded animate-pulse"></div>
        </nav>
      </div>
    }>
      <BreadcrumbContent />
    </Suspense>
  )
}

export default Breadcrumb 