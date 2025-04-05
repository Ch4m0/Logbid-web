import { Card, CardContent } from '@/src/components/ui/card'
import React from 'react'

const ConfirmOffer = ({
  info,
  cancel,
  sendOffer,
}: {
  info: any
  sendOffer: (info: any) => void
  cancel: () => void
}) => {
  const formatMoney = (amount: number) => {
    return amount.toFixed(2)
  }

  return (
    <Card className="h-[calc(100vh-2rem)]">
      <CardContent className="pt-6">
        <div className="space-y-6 p-3 bg-white">
          <h1 className="text-2xl font-bold">Confirmación de Cotización</h1>

          <div className="flex-1 overflow-y-auto p-6 h-[500px]">
            {/* Cargos Flete */}
            <div className="border-b pb-4">
              <h2 className="font-semibold text-lg mb-3">Cargos Flete</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Flete:</span>
                  <span>${formatMoney(info.freight_fees.value)}</span>
                </div>
                <div className="text-sm text-gray-600">
                  <p>
                    Dimensiones: {info.freight_fees.dimensions.height} ×{' '}
                    {info.freight_fees.dimensions.width} ×{' '}
                    {info.freight_fees.dimensions.length}{' '}
                    {info.freight_fees.dimensions.units}
                  </p>
                </div>
              </div>
            </div>

            {/* Cargos Adicionales */}
            <div className="border-b pb-4">
              <h2 className="font-semibold text-lg mb-3">Cargos Adicionales</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Screening fee:</span>
                  <span>${formatMoney(info.additional_fees.screening)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Fuel Surcharge:</span>
                  <span>${formatMoney(info.additional_fees.fuel)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Airway Bill (AWB):</span>
                  <span>${formatMoney(info.additional_fees.airway_bill)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Gastos en origen:</span>
                  <span>${formatMoney(info.additional_fees.origin_costs)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Gastos en destino:</span>
                  <span>
                    ${formatMoney(info.additional_fees.destination_costs)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Cancelación:</span>
                  <span>
                    ${formatMoney(info.additional_fees.cancelation_fee)}
                  </span>
                </div>
              </div>
            </div>

            {/* Otros Gastos */}
            <div className="border-b pb-4">
              <h2 className="font-semibold text-lg mb-3">Otros Gastos</h2>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Collect fee:</span>
                  <span>{info.other_fees.collect_fee}</span>
                </div>
                <div className="flex justify-between">
                  <span>Otros Gastos:</span>
                  <span>${formatMoney(info.other_fees.other_fees)}</span>
                </div>
              </div>
            </div>

            {/* Precio Total */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="flex justify-between text-lg font-bold">
                <span>Precio Total:</span>
                <span className="text-purple-600">
                  ${formatMoney(info.price)}
                </span>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button
              className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 transition-colors"
              onClick={cancel}
            >
              Cancelar
            </button>
            <button
              className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 transition-colors"
              onClick={() => sendOffer(info)}
            >
              Confirmar Cotización
            </button>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default ConfirmOffer
