
import React from 'react';

const BidInfo = ({ bidDataForAgent }: any) => {
  return (
    <div className="bg-white rounded-lg shadow-md w-full mx-auto">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="font-bold text-lg mb-3 text-blue-700">Información de Ruta</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-bold">Orígen:</span>
              <span>{bidDataForAgent.origin_country + " - " + bidDataForAgent.origin_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">Destíno:</span>
              <span>{bidDataForAgent.destination_country + " - " + bidDataForAgent.destination_name}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">Tipo de Envío:</span>
              <span>{bidDataForAgent.shipping_type}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">Transporte:</span>
              <span>{bidDataForAgent.transportation}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="font-bold text-lg mb-3 text-blue-700">Fechas Importantes</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-bold">Fecha inicio:</span>
              <span>{bidDataForAgent.inserted_at}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">Fecha Fin:</span>
              <span>{bidDataForAgent.expiration_date}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">Estado:</span>
              <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                {bidDataForAgent.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="font-bold text-lg mb-3 text-blue-700">Detalles de Mercancía</h3>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-bold">Tipo de Mercancía:</span>
              <span>{bidDataForAgent.merchandise_type}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">Tipo de Medida:</span>
              <span>{bidDataForAgent.measure_type}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">Unidades:</span>
              <span>{bidDataForAgent.units}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">Peso Total:</span>
              <span>{bidDataForAgent.total_weight}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">Volumen:</span>
              <span>{bidDataForAgent.volume}</span>
            </div>
          </div>
        </div>

        <div className="bg-gray-50 p-4 rounded-md">
          <h3 className="font-bold text-lg mb-3 text-blue-700">Información de Precio</h3>
          <div className="space-y-2">
            {/*<div className="flex items-center gap-2">
              <span className="font-bold">Precio más bajo:</span>
              <span className="font-semibold text-green-600">
                {bidDataForAgent.currency} {bidDataForAgent.lowestPrice}
              </span>
            </div>*/}
            <div className="flex items-center gap-2">
              <span className="font-bold">Último precio:</span>
              <span>{bidDataForAgent.currency} {bidDataForAgent.last_price}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">Valor:</span>
              <span>{bidDataForAgent.currency} {bidDataForAgent.value}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold">Tipo de Comex:</span>
              <span>{bidDataForAgent.comex_type}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-blue-50 p-4 rounded-md">
        <h3 className="font-bold text-lg mb-3 text-blue-700">Identificación</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-bold">Código de Agente:</span>
              <span>{bidDataForAgent.agent_code}</span>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-bold">Carga Peligrosa:</span>
              <span>{bidDataForAgent.dangerous_march ? "Sí" : "No"}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BidInfo;