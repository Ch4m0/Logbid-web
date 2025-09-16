import React, { useState } from 'react';
import { convertToColombiaTime, formatComexType, formatPrice, formatShippingDate } from '@/src/lib/utils'
import { useTranslation } from '@/src/hooks/useTranslation';
import { getTransportTypeName, getTypeShipmentName } from '@/src/utils/translateTypeName';
import { Badge } from "@/src/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Button } from "@/src/components/ui/button"
import { Eye } from "lucide-react"
import ExcelViewer from '@/src/components/ExcelViewer';
import { modalService } from '@/src/service/modalService'
import ProposalModal from './ProposalModal';

interface BidInfoProps {
  bidDataForAgent: any;
  onCreateOffer: (value: any) => void;
  shippingType: string;
}

const BidInfo = ({ bidDataForAgent, onCreateOffer, shippingType }: BidInfoProps) => {
  const { t } = useTranslation();
  const [showExcelViewer, setShowExcelViewer] = useState(false);

  console.log('bidDataForAgent', bidDataForAgent)

  const handleCreateQuote = () => {
    modalService.showModal({
      component: ProposalModal,
      props: {
        shippingType,
        bidDataShippingType: bidDataForAgent?.shipping_type || shippingType,
        bidDataForAgent,
        onSubmit: onCreateOffer,
        onClose: () => modalService.closeModal()
      }
    })
  }
  
  // Función helper para mostrar valores con fallback
  const displayValue = (value: any, fallback = t('common.notSpecified')) => {
    if (value === null || value === undefined || value === '') {
      return fallback;
    }
    return value;
  };

  // Función para obtener el estado con color apropiado
  const getStatusBadge = (status: string) => {
    const statusConfig = {
      'Active': { class: 'bg-green-100 text-green-800 border-green-200', text: t('common.active') },
      'Expired': { class: 'bg-red-100 text-red-800 border-red-200', text: t('common.expired') },
      'Cancelled': { class: 'bg-gray-100 text-gray-800 border-gray-200', text: t('cargoList.cancelled') },
      'Closed': { class: 'bg-blue-100 text-blue-800 border-blue-200', text: t('common.closed') }
    }
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig['Active']
    return <Badge className={config.class}>{config.text}</Badge>
  }

  return (
    <>
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg font-bold font-mono">
                {t('common.shipment')}: {displayValue(bidDataForAgent.uuid)}
              </CardTitle>
            </div>
            {
              bidDataForAgent.status === 'Active' && (
                <Button 
                  className="bg-primary hover:bg-primary/90"
                  onClick={handleCreateQuote}
                >
                  <span className="mr-2">+</span>
                  {t('bidInfo.createQuote')}
                </Button>
              )
            }
            
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Route Section */}
              <div>
                <h3 className="text-blue-600 font-semibold mb-3">{t('bidInfo.route')}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <span className="font-medium w-24">{t('bidInfo.origin')}:</span>
                     {bidDataForAgent.origin_flag}
                    <span className="ml-2">
                      {displayValue(bidDataForAgent.origin_country && bidDataForAgent.origin_name 
                        ? `${bidDataForAgent.origin_country} - ${bidDataForAgent.origin_name}` 
                        : null)}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-24">{t('bidInfo.destination')}:</span>
                    {bidDataForAgent.destination_flag}
                    <span className="ml-2">
                      {displayValue(bidDataForAgent.destination_country && bidDataForAgent.destination_name 
                        ? `${bidDataForAgent.destination_country} - ${bidDataForAgent.destination_name}` 
                        : null)}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-24">{t('bidInfo.shippingMethod')}:</span>
                    <span>{displayValue(getTransportTypeName(bidDataForAgent.shipping_type, t))}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-24">{t('bidInfo.type')}:</span>
                    <span>{displayValue(getTypeShipmentName(bidDataForAgent.transportation, t))}</span>
                  </div>
                </div>
              </div>

              {/* Merchandise Section */}
              <div>
                <h3 className="text-blue-600 font-semibold mb-3">{t('bidInfo.merchandise')}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <span className="font-medium w-32">{t('bidInfo.merchandiseType')}:</span>
                    <span>{displayValue(bidDataForAgent.merchandise_type)}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-32">{t('bidInfo.units')}:</span>
                    <span>{displayValue(bidDataForAgent.units)}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-32">{t('bidInfo.totalWeight')}:</span>
                    <span className="font-mono">{displayValue(bidDataForAgent.total_weight)} {displayValue(bidDataForAgent.measure_type)}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-32">{t('bidInfo.volume')}:</span>
                    <span className="font-mono">{displayValue(bidDataForAgent.volume)} m³</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-32">{t('bidInfo.hsnCode')}:</span>
                    <span className="font-mono">{displayValue(bidDataForAgent.tariff_item)}</span>
                  </div>
                </div>
              </div>

              {/* Additional Details Section */}
              <div>
                <h3 className="text-blue-600 font-semibold mb-3">{t('bidInfo.additionalDetails')}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <span className="font-medium w-32">{t('bidInfo.containerType')}:</span>
                    <span>{displayValue(bidDataForAgent.container_name)}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-32">{t('bidInfo.incoterm')}:</span>
                    <span>{displayValue(bidDataForAgent.incoterm_name)}</span>
                  </div>
                  {bidDataForAgent.documents_url && (
                    <div className="flex">
                      <span className="font-medium w-32">{t('bidInfo.documents')}:</span>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setShowExcelViewer(true)}
                        className="flex items-center gap-1 h-6 px-2 text-xs"
                      >
                        <Eye className="h-3 w-3" />
                        {t('bidInfo.viewDocuments')}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Dates Section */}
              <div>
                <h3 className="text-blue-600 font-semibold mb-3">{t('bidInfo.dates')}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <span className="font-medium w-24">{t('bidInfo.bidStarts')}:</span>
                    <span className="font-mono">{displayValue(convertToColombiaTime(bidDataForAgent.inserted_at))}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-24">{t('bidInfo.bidEnds')}:</span>
                    <span className="font-mono">{displayValue(convertToColombiaTime(bidDataForAgent.expiration_date))}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-24">{t('bidInfo.shippingDate')}:</span>
                    <span className="font-mono">{displayValue(formatShippingDate(bidDataForAgent.shipping_date))}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-24">{t('bidInfo.status')}:</span>
                    {getStatusBadge(bidDataForAgent.status)}
                  </div>
                </div>
              </div>

              {/* Auction Section */}
              <div>
                <h3 className="text-blue-600 font-semibold mb-3">{t('bidInfo.auction')}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <span className="font-medium w-24">{t('bidInfo.lowestPrice')}:</span>
                    <span className="text-green-600 font-semibold font-mono">
                      {bidDataForAgent.lowestPrice && bidDataForAgent.currency ? formatPrice(bidDataForAgent.lowestPrice, bidDataForAgent.currency) : t('common.notSpecified')}
                    </span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-24">{t('bidInfo.value')}:</span>
                    {bidDataForAgent.value && bidDataForAgent.currency ? formatPrice(bidDataForAgent.value, bidDataForAgent.currency) : t('common.notSpecified')}
                  </div>
                  <div className="flex">
                    <span className="font-medium w-24">{t('bidInfo.service')}:</span>
                    <span>{formatComexType(bidDataForAgent.comex_type, t)}</span>
                  </div>
                </div>
              </div>

              {/* Identification Section */}
              <div>
                <h3 className="text-blue-600 font-semibold mb-3">{t('bidInfo.identification')}</h3>
                <div className="space-y-2 text-sm">
                  <div className="flex">
                    <span className="font-medium w-32">{t('bidInfo.shipmentId')}:</span>
                    <span className="font-mono text-xs">{displayValue(bidDataForAgent.uuid)}</span>
                  </div>
                  <div className="flex">
                    <span className="font-medium w-32">{t('bidInfo.dangerousCargo')}:</span>
                    <span>{bidDataForAgent.dangerous_march ? t('common.yes') : t('common.no')}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Excel Viewer Modal */}
      {bidDataForAgent.documents_url && (
        <ExcelViewer
          fileUrl={bidDataForAgent.documents_url}
          onClose={() => setShowExcelViewer(false)}
          isOpen={showExcelViewer}
        />
      )}
    </>
  );
};

export default BidInfo;
