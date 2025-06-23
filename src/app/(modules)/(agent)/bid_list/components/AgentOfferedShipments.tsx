'use client'
import React, { useMemo } from 'react'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/src/components/ui/table'
import { Button } from '@/src/components/ui/button'
import { useGetBidListByMarket } from '@/src/app/hooks/useGetBidListByMarket'
import useAuthStore from '@/src/store/authStore'
import { useSearchParams } from 'next/navigation'
import { useTranslation } from '@/src/hooks/useTranslation'
import Link from 'next/link'
import { format } from 'date-fns'
import { es, enUS } from 'date-fns/locale'
import Pagination from '@/src/app/(modules)/common/components/pagination/Pagination'

interface AgentOfferedShipmentsProps {
  status: string
}

export function AgentOfferedShipments({ status }: AgentOfferedShipmentsProps) {
  const { t, getCurrentLanguage } = useTranslation()
  const searchParams = useSearchParams()
  const user = useAuthStore((state) => state.user)
  const profile = useAuthStore((state) => state.profile)
  const locale = getCurrentLanguage()
  
  const marketId = searchParams.get('market_id') ?? 
                   profile?.all_markets?.[0]?.id?.toString() ?? 
                   null

  const shippingType = (searchParams.get('shipping_type') as 'Aéreo' | 'Marítimo') ?? 'Marítimo'
  
  // Paginación
  const currentPage = Number(searchParams.get('page')) || 1
  const itemsPerPage = 10
  
  const { data: bidList, isLoading, error } = useGetBidListByMarket(
    marketId,
    'Active',
    user?.id || null,
    shippingType
  )

  // Filtrar shipments donde el agente actual ha hecho ofertas
  const shipmentsWithMyOffers = useMemo(() => {
    if (!bidList || !user?.id) return []
    
    return bidList.filter((shipment: any) => {
      return shipment.offers && shipment.offers.some((offer: any) => 
        offer.agent_id === user.id
      )
    })
  }, [bidList, user?.id])

  // Calcular paginación
  const totalPages = Math.ceil(shipmentsWithMyOffers.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const paginatedShipments = shipmentsWithMyOffers.slice(startIndex, endIndex)

  const dateLocale = locale === 'es' ? es : enUS

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <span className="ml-2">{t('common.loading')}</span>
      </div>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardContent className="p-8 text-center">
          <p className="text-red-500">{t('common.error')}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="font-bold">
          {t('agentOffers.myOffers')} ({shipmentsWithMyOffers.length})
        </CardTitle>
        {shipmentsWithMyOffers.length > itemsPerPage && (
          <div className="text-sm text-gray-500">
            {t('pagination.showing')} {startIndex + 1}-{Math.min(endIndex, shipmentsWithMyOffers.length)} {t('pagination.of')} {shipmentsWithMyOffers.length}
          </div>
        )}
      </CardHeader>
      <CardContent>
        {shipmentsWithMyOffers.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">
              {t('agentOffers.noOffersMessage')}
            </p>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="font-bold text-black">
                  {t('cargoList.transactionId')}
                </TableHead>
                <TableHead className="font-bold text-black">
                  {t('cargoList.origin')}
                </TableHead>
                <TableHead className="font-bold text-black">
                  {t('cargoList.destination')}
                </TableHead>
                <TableHead className="font-bold text-black">
                  {t('cargoList.creationDate')}
                </TableHead>
                <TableHead className="font-bold text-black">
                  {t('cargoList.lastPrice')}
                </TableHead>
                <TableHead className="font-bold text-black">
                  {t('cargoList.offersCount')}
                </TableHead>
                <TableHead className="font-bold text-black">
                  {t('agentOffers.myOffers')}
                </TableHead>
                <TableHead className="font-bold text-black">
                  {t('cargoList.offers')}
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedShipments.map((shipment: any) => {
                const myOffers = shipment.offers?.filter((offer: any) => 
                  offer.agent_id === user?.id
                ) || []
                
                return (
                  <TableRow key={shipment.id}>
                    <TableCell className="font-medium">
                      {shipment.uuid}
                    </TableCell>
                    <TableCell>{shipment.origin}</TableCell>
                    <TableCell>{shipment.destination}</TableCell>
                    <TableCell>
                      {format(new Date(shipment.inserted_at), 'dd/MM/yyyy HH:mm', {
                        locale: dateLocale,
                      })}
                    </TableCell>
                    <TableCell>
                      {shipment.last_price ? `$${shipment.last_price}` : 'N/A'}
                    </TableCell>
                    <TableCell>
                      <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                        {shipment.offers_count}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                        {myOffers.length}
                      </span>
                    </TableCell>
                    <TableCell>
                      <Link href={`/offers?offer_id=${shipment.uuid}&market_id=${marketId}&shipping_type=${shippingType}`}>
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="hover:bg-blue-50"
                        >
                          {t('cargoList.offers')}
                        </Button>
                      </Link>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        )}
        
        {/* Paginación */}
        {shipmentsWithMyOffers.length > itemsPerPage && (
          <div className="mt-6 flex justify-center">
            <Pagination totalPages={totalPages} />
          </div>
        )}
      </CardContent>
    </Card>
  )
} 