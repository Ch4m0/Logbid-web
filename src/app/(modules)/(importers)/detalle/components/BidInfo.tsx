import React, { useState } from 'react';
import { convertToColombiaTime, formatDateUTCAsLocal, formatShippingDate } from '@/src/lib/utils';
import { useTranslation } from '@/src/hooks/useTranslation';
import { getTransportTypeName, getTypeShipmentName } from '@/src/utils/translateTypeName';
import { FileText, Eye } from 'lucide-react';
import { Button } from '@/src/components/ui/button';
import ExcelViewer from '@/src/components/ExcelViewer';

const BidInfo = ({ bidDataForAgent }: any) => {
  const { t } = useTranslation();
  const [showExcelViewer, setShowExcelViewer] = useState(false);
  
  // Debug: mostrar los datos recibidos
  console.log('BidInfo - bidDataForAgent:', bidDataForAgent);
  
  // Función para obtener valor de mercancía de forma segura
  const getMerchandiseValue = (key: string) => {
    // Buscar en el nivel principal primero (datos de Supabase ya aplanados)
    if (bidDataForAgent[key] !== undefined && bidDataForAgent[key] !== null && bidDataForAgent[key] !== '') {
      return bidDataForAgent[key];
    }
    
    // Buscar en bid_details como fallback (para compatibilidad con API antigua)
    if (bidDataForAgent.bid_details && bidDataForAgent.bid_details[key] !== undefined && bidDataForAgent.bid_details[key] !== null && bidDataForAgent.bid_details[key] !== '') {
      return bidDataForAgent.bid_details[key];
    }
    
    // Valor por defecto
    return t('common.notSpecified');
  };

  // Función helper para mostrar valores con fallback
  const displayValue = (value: any, fallback = t('common.notSpecified')) => {
    if (value === null || value === undefined || value === '') {
      return fallback;
    }
    return value;
  };

  // Función para truncar texto largo en móviles
  const truncateText = (text: string, maxLength: number = 50) => {
    if (!text) return text;
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  return (
    <div className="bg-white rounded-lg shadow-md w-full mx-auto p-4 sm:p-6 overflow-hidden">
      {/* Información de Ruta y Fechas Importantes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        <div className="bg-gray-50 p-3 sm:p-4 rounded-md overflow-hidden">
          <h3 className="font-bold text-base sm:text-lg mb-3 text-blue-700">{t('bidInfo.routeInformation')}</h3>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
              <span className="font-bold text-sm sm:text-base shrink-0 w-full sm:w-auto sm:min-w-[100px]">{t('bidInfo.origin')}:</span>
              <span className="text-sm sm:text-base break-words overflow-wrap-anywhere w-full sm:flex-1 min-w-0">
                {displayValue(bidDataForAgent.origin_country && bidDataForAgent.origin_name 
                  ? `${bidDataForAgent.origin_country} - ${bidDataForAgent.origin_name}` 
                  : null)}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
              <span className="font-bold text-sm sm:text-base shrink-0 w-full sm:w-auto sm:min-w-[100px]">{t('bidInfo.destination')}:</span>
              <span className="text-sm sm:text-base break-words overflow-wrap-anywhere w-full sm:flex-1 min-w-0">
                {displayValue(bidDataForAgent.destination_country && bidDataForAgent.destination_name 
                  ? `${bidDataForAgent.destination_country} - ${bidDataForAgent.destination_name}` 
                  : null)}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
              <span className="font-bold text-sm sm:text-base shrink-0 w-full sm:w-auto sm:min-w-[100px]">{t('bidInfo.shipmentType')}:</span>
              <span className="text-sm sm:text-base break-words w-full sm:flex-1 min-w-0">{displayValue(getTransportTypeName(bidDataForAgent.shipping_type, t))}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
              <span className="font-bold text-sm sm:text-base shrink-0 w-full sm:w-auto sm:min-w-[100px]">{t('bidInfo.transport')}:</span>
              <span className="text-sm sm:text-base break-words w-full sm:flex-1 min-w-0">{displayValue(bidDataForAgent.transportation)}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-3 sm:p-4 rounded-md overflow-hidden">
          <h3 className="font-bold text-base sm:text-lg mb-3 text-blue-700">{t('bidInfo.importantDates')}</h3>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
              <span className="font-bold text-sm sm:text-base shrink-0 w-full sm:w-auto sm:min-w-[120px]">{t('bidInfo.startDate')}:</span>
              <span className="text-sm sm:text-base break-words w-full sm:flex-1 min-w-0">
                {bidDataForAgent.inserted_at ? convertToColombiaTime(bidDataForAgent.inserted_at) : t('common.notSpecified')}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
              <span className="font-bold text-sm sm:text-base shrink-0 w-full sm:w-auto sm:min-w-[120px]">{t('bidInfo.endDate')}:</span>
              <span className="text-sm sm:text-base break-words w-full sm:flex-1 min-w-0">
                {bidDataForAgent.expiration_date ? formatDateUTCAsLocal(bidDataForAgent.expiration_date) : t('common.notSpecified')}
              </span>
            </div>
            {bidDataForAgent.shipping_date && (
              <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                <span className="font-bold text-sm sm:text-base shrink-0 w-full sm:w-auto sm:min-w-[120px]">{t('bidInfo.shippingDate')}:</span>
                <span className="text-sm sm:text-base break-words w-full sm:flex-1 min-w-0">
                  {formatShippingDate(bidDataForAgent.shipping_date)}
                </span>
              </div>
            )}
            <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
              <span className="font-bold text-sm sm:text-base shrink-0 w-full sm:w-auto sm:min-w-[120px]">{t('bidInfo.status')}:</span>
              <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs sm:text-sm max-w-full truncate">
                {displayValue(bidDataForAgent.status)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detalles de Mercancía y Información de Precio */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
        <div className="bg-gray-50 p-3 sm:p-4 rounded-md overflow-hidden">
          <h3 className="font-bold text-base sm:text-lg mb-3 text-blue-700">{t('bidInfo.merchandiseDetails')}</h3>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
              <span className="font-bold text-sm sm:text-base shrink-0 w-full sm:w-auto sm:min-w-[120px]">{t('bidInfo.merchandiseType')}:</span>
              <span className="text-sm sm:text-base break-words overflow-wrap-anywhere w-full sm:flex-1 min-w-0">
                {getMerchandiseValue('merchandise_type')}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
              <span className="font-bold text-sm sm:text-base shrink-0 w-full sm:w-auto sm:min-w-[120px]">{t('bidInfo.measureType')}:</span>
              <span className="text-sm sm:text-base break-words w-full sm:flex-1 min-w-0">{getMerchandiseValue('measure_type')}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
              <span className="font-bold text-sm sm:text-base shrink-0 w-full sm:w-auto sm:min-w-[120px]">{t('bidInfo.units')}:</span>
              <span className="text-sm sm:text-base break-words w-full sm:flex-1 min-w-0">{getMerchandiseValue('units')}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
              <span className="font-bold text-sm sm:text-base shrink-0 w-full sm:w-auto sm:min-w-[120px]">{t('bidInfo.totalWeight')}:</span>
              <span className="text-sm sm:text-base break-words w-full sm:flex-1 min-w-0">{getMerchandiseValue('total_weight')}</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
              <span className="font-bold text-sm sm:text-base shrink-0 w-full sm:w-auto sm:min-w-[120px]">{t('bidInfo.volume')}:</span>
              <span className="text-sm sm:text-base break-words w-full sm:flex-1 min-w-0">{getMerchandiseValue('volume')} m³</span>
            </div>
            {bidDataForAgent.tariff_item && (
              <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                <span className="font-bold text-sm sm:text-base shrink-0 w-full sm:w-auto sm:min-w-[120px]">{t('bidInfo.tariffItem')}:</span>
                <span className="text-sm sm:text-base break-words overflow-wrap-anywhere w-full sm:flex-1 min-w-0">
                  {bidDataForAgent.tariff_item}
                </span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-50 p-3 sm:p-4 rounded-md overflow-hidden">
          <h3 className="font-bold text-base sm:text-lg mb-3 text-blue-700">{t('bidInfo.priceInformation')}</h3>
          <div className="space-y-2 sm:space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
              <span className="font-bold text-sm sm:text-base shrink-0 w-full sm:w-auto sm:min-w-[120px]">{t('bidInfo.lastPrice')}:</span>
              <span className="text-sm sm:text-base font-semibold text-green-600 break-words w-full sm:flex-1 min-w-0">
                {bidDataForAgent.currency && bidDataForAgent.last_price 
                  ? `${bidDataForAgent.currency} ${bidDataForAgent.last_price}` 
                  : t('common.notSpecified')}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
              <span className="font-bold text-sm sm:text-base shrink-0 w-full sm:w-auto sm:min-w-[120px]">{t('bidInfo.value')}:</span>
              <span className="text-sm sm:text-base break-words w-full sm:flex-1 min-w-0">
                {bidDataForAgent.currency && bidDataForAgent.value 
                  ? `${bidDataForAgent.currency} ${bidDataForAgent.value}` 
                  : t('common.notSpecified')}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
              <span className="font-bold text-sm sm:text-base shrink-0 w-full sm:w-auto sm:min-w-[120px]">{t('bidInfo.comexType')}:</span>
              <span className="text-sm sm:text-base break-words w-full sm:flex-1 min-w-0">{displayValue(getTypeShipmentName(bidDataForAgent.comex_type, t))}</span>
            </div>
            {bidDataForAgent.offers && bidDataForAgent.offers.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                <span className="font-bold text-sm sm:text-base shrink-0 w-full sm:w-auto sm:min-w-[120px]">{t('bidInfo.offersCount')}:</span>
                <span className="text-blue-600 font-semibold text-sm sm:text-base w-full sm:flex-1 min-w-0">
                  {bidDataForAgent.offers.length}
                </span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Información adicional si está disponible */}
      {(bidDataForAgent.container_name || bidDataForAgent.incoterm_name || bidDataForAgent.dimensions) && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 sm:mb-6">
          <div className="bg-blue-50 p-3 sm:p-4 rounded-md overflow-hidden">
            <h3 className="font-bold text-base sm:text-lg mb-3 text-blue-700">{t('bidInfo.additionalDetails')}</h3>
            <div className="space-y-2 sm:space-y-3">
              {bidDataForAgent.container_name && (
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                  <span className="font-bold text-sm sm:text-base shrink-0 w-full sm:w-auto sm:min-w-[120px]">{t('bidInfo.container')}:</span>
                  <span className="text-sm sm:text-base break-words w-full sm:flex-1 min-w-0">{bidDataForAgent.container_name}</span>
                </div>
              )}
              {bidDataForAgent.incoterm_name && (
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                  <span className="font-bold text-sm sm:text-base shrink-0 w-full sm:w-auto sm:min-w-[120px]">{t('bidInfo.incoterm')}:</span>
                  <span className="text-sm sm:text-base break-words w-full sm:flex-1 min-w-0">{bidDataForAgent.incoterm_name}</span>
                </div>
              )}
              {bidDataForAgent.dimensions && (
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                  <span className="font-bold text-sm sm:text-base shrink-0 w-full sm:w-auto sm:min-w-[120px]">{t('bidInfo.dimensions')}:</span>
                  <span className="text-xs sm:text-sm break-all font-mono bg-gray-100 p-1 rounded w-full sm:flex-1 min-w-0 overflow-hidden">
                    {JSON.stringify(bidDataForAgent.dimensions)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Identificación - siempre mostrar */}
          <div className="bg-blue-50 p-3 sm:p-4 rounded-md overflow-hidden">
            <h3 className="font-bold text-base sm:text-lg mb-3 text-blue-700">{t('bidInfo.identification')}</h3>
            <div className="space-y-2 sm:space-y-3">
              {bidDataForAgent.status === 'Closed' && bidDataForAgent.agent_code && (
                <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                  <span className="font-bold text-sm sm:text-base shrink-0 w-full sm:w-auto sm:min-w-[120px]">{t('bidInfo.agentCode')}:</span>
                  <span className="text-sm sm:text-base break-words w-full sm:flex-1 min-w-0">{bidDataForAgent.agent_code}</span>
                </div>
              )}
              <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                <span className="font-bold text-sm sm:text-base shrink-0 w-full sm:w-auto sm:min-w-[120px]">{t('bidInfo.shipmentId')}:</span>
                <span className="font-mono text-xs sm:text-sm bg-gray-100 p-1 rounded break-all w-full sm:flex-1 min-w-0 overflow-hidden">
                  {displayValue(bidDataForAgent.uuid)}
                </span>
              </div>
              <div className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2">
                <span className="font-bold text-sm sm:text-base shrink-0 w-full sm:w-auto sm:min-w-[120px]">{t('bidInfo.dangerousCargo')}:</span>
                <span className="text-sm sm:text-base w-full sm:flex-1 min-w-0">
                  {bidDataForAgent.dangerous_march ? t('bidInfo.yes') : t('bidInfo.no')}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Mostrar identificación como sección individual si no hay detalles adicionales */}
      {!(bidDataForAgent.container_name || bidDataForAgent.incoterm_name || bidDataForAgent.dimensions) && (
        <div className="bg-blue-50 p-3 sm:p-4 rounded-md mb-4 sm:mb-6 overflow-hidden">
          <h3 className="font-bold text-base sm:text-lg mb-3 text-blue-700">{t('bidInfo.identification')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4">
            {bidDataForAgent.status === 'Closed' && bidDataForAgent.agent_code && (
              <div className="flex flex-col gap-1 min-w-0">
                <span className="font-bold text-sm sm:text-base">{t('bidInfo.agentCode')}:</span>
                <span className="text-sm sm:text-base break-words">{bidDataForAgent.agent_code}</span>
              </div>
            )}
            <div className="flex flex-col gap-1 min-w-0">
              <span className="font-bold text-sm sm:text-base">{t('bidInfo.shipmentId')}:</span>
              <span className="font-mono text-xs sm:text-sm bg-gray-100 p-1 rounded break-all overflow-hidden">
                {displayValue(bidDataForAgent.uuid)}
              </span>
            </div>
            <div className="flex flex-col gap-1 min-w-0">
              <span className="font-bold text-sm sm:text-base">{t('bidInfo.dangerousCargo')}:</span>
              <span className="text-sm sm:text-base">{bidDataForAgent.dangerous_march ? t('bidInfo.yes') : t('bidInfo.no')}</span>
            </div>
          </div>
        </div>
      )}

      {/* Lista de empaque si está disponible */}
      {bidDataForAgent.documents_url && (
        <div className="bg-green-50 p-3 sm:p-4 rounded-md mb-4 sm:mb-6 overflow-hidden">
          <h3 className="font-bold text-base sm:text-lg mb-3 text-green-700 flex items-center gap-2">
            <FileText className="h-5 w-5" />
            {t('bidInfo.packingList')}
          </h3>
          <div className="flex flex-col sm:flex-row items-start gap-3">
            <div className="flex items-center gap-2 flex-1">
              <div className="p-2 bg-green-100 rounded-lg">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm sm:text-base font-medium text-gray-900">
                  {t('bidInfo.packingListAvailable')}
                </p>
                <p className="text-xs sm:text-sm text-gray-600">
                  {t('bidInfo.excelFileDetail')}
                </p>
              </div>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowExcelViewer(true)}
              className="flex items-center gap-2 border-green-200 text-green-700 hover:bg-green-50"
            >
              <Eye className="h-4 w-4" />
              {t('bidInfo.viewContent')}
            </Button>
          </div>
          
          {/* Visor de Excel */}
          <ExcelViewer
            fileUrl={bidDataForAgent.documents_url}
            isOpen={showExcelViewer}
            onClose={() => setShowExcelViewer(false)}
          />
        </div>
      )}

      {/* Información adicional si está disponible */}
      {bidDataForAgent.additional_info && (
        <div className="bg-yellow-50 p-3 sm:p-4 rounded-md overflow-hidden">
          <h3 className="font-bold text-base sm:text-lg mb-3 text-yellow-700">{t('bidInfo.additionalInfo')}</h3>
          <p className="text-sm sm:text-base text-gray-700 break-words overflow-wrap-anywhere leading-relaxed w-full min-w-0">
            {bidDataForAgent.additional_info}
          </p>
        </div>
      )}
    </div>
  );
};

export default BidInfo;