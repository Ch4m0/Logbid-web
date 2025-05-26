import React from 'react';
import { convertToColombiaTime } from '@/src/lib/utils';
import { useTranslation } from '@/src/hooks/useTranslation';

const BidInfo = ({ bidDataForAgent }: any) => {
  const { t } = useTranslation();
  
  // Función para obtener valor de mercancía de forma segura
  const getMerchandiseValue = (key: string) => {
    // Buscar en bid_details primero (donde vienen los datos según la API)
    if (bidDataForAgent.bid_details && bidDataForAgent.bid_details[key] !== undefined && bidDataForAgent.bid_details[key] !== null && bidDataForAgent.bid_details[key] !== '') {
      return bidDataForAgent.bid_details[key];
    }
    
    // Buscar en el nivel principal como fallback
    if (bidDataForAgent[key] !== undefined && bidDataForAgent[key] !== null && bidDataForAgent[key] !== '') {
      return bidDataForAgent[key];
    }
    
    // Valor por defecto
    return t('common.notSpecified');
  };

  return (
    <div className="bg-white rounded-lg shadow-md w-full mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="font-bold text-lg mb-3 text-blue-700">{t('bidInfo.routeInformation')}</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-bold">{t('bidInfo.origin')}:</span>
              <span>{bidDataForAgent.origin_country + " - " + bidDataForAgent.origin_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">{t('bidInfo.destination')}:</span>
              <span>{bidDataForAgent.destination_country + " - " + bidDataForAgent.destination_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">{t('bidInfo.shipmentType')}:</span>
              <span>{bidDataForAgent.shipping_type}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">{t('bidInfo.transport')}:</span>
              <span>{bidDataForAgent.transportation}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="font-bold text-lg mb-3 text-blue-700">{t('bidInfo.importantDates')}</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-bold">{t('bidInfo.startDate')}:</span>
              <span>{convertToColombiaTime(bidDataForAgent.inserted_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">{t('bidInfo.endDate')}:</span>
              <span>{convertToColombiaTime(bidDataForAgent.expiration_date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">{t('bidInfo.status')}:</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                {bidDataForAgent.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="font-bold text-lg mb-3 text-blue-700">{t('bidInfo.merchandiseDetails')}</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-bold">{t('bidInfo.merchandiseType')}:</span>
              <span>{getMerchandiseValue('merchandise_type')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">{t('bidInfo.measureType')}:</span>
              <span>{getMerchandiseValue('measure_type')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">{t('bidInfo.units')}:</span>
              <span>{getMerchandiseValue('units')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">{t('bidInfo.totalWeight')}:</span>
              <span>{getMerchandiseValue('total_weight')}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">{t('bidInfo.volume')}:</span>
              <span>{getMerchandiseValue('volume')}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="font-bold text-lg mb-3 text-blue-700">{t('bidInfo.priceInformation')}</h3>
          <div className="space-y-2">
            {/*<div className="flex items-center gap-2">
              <span className="font-bold">{t('bidInfo.lowestPrice')}:</span>
              <span className="font-semibold text-green-600">
                {bidDataForAgent.currency} {bidDataForAgent.lowestPrice}
              </span>
            </div>*/}
            <div className="flex items-center gap-2">
              <span className="font-bold">{t('bidInfo.lastPrice')}:</span>
              <span>{bidDataForAgent.currency} {bidDataForAgent.last_price}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">{t('bidInfo.value')}:</span>
              <span>{bidDataForAgent.currency} {bidDataForAgent.value}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">{t('bidInfo.comexType')}:</span>
              <span>{bidDataForAgent.comex_type}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-md">
        <h3 className="font-bold text-lg mb-3 text-blue-700">{t('bidInfo.identification')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-bold">{t('bidInfo.agentCode')}:</span>
              <span>{bidDataForAgent.agent_code}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-bold">{t('bidInfo.dangerousCargo')}:</span>
              <span>{bidDataForAgent.dangerous_march ? t('bidInfo.yes') : t('bidInfo.no')}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BidInfo;