'use client'
import { useSearchParams, usePathname } from 'next/navigation'
import useAuthStore from '@/src/store/authStore'
import { useTranslation } from '@/src/hooks/useTranslation'
import { ChevronRight, MapPin } from 'lucide-react'

const Breadcrumb = () => {
  const { profile } = useAuthStore()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const { t } = useTranslation()

  // Obtener el mercado actual con fallback al primer mercado del usuario
  const marketId = searchParams.get('market_id')
  const currentMarket = marketId 
    ? profile?.all_markets?.find(market => market.id.toString() === marketId)
    : profile?.all_markets?.[0] // Fallback al primer mercado si no hay market_id

  const marketName = currentMarket?.name || ''

  // Obtener el tipo de envío
  const shippingType = searchParams.get('shipping_type') || 'Marítimo'

  // Determinar la sección actual basada en la ruta
  const getSectionName = () => {
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

  return (
    <div className="bg-gray-50 border-b px-6 py-3">
      <nav className="flex items-center space-x-2 text-sm text-gray-600">
        <MapPin className="h-4 w-4 text-purple-600" />
        <span className="font-medium text-purple-700">{marketName}</span>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-500">{getSectionName()}</span>
        <ChevronRight className="h-4 w-4" />
        <span className="text-gray-700 font-medium">{shippingType}</span>
      </nav>
    </div>
  )
}

export default Breadcrumb 