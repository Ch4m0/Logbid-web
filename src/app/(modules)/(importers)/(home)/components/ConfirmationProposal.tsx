'use client'

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
interface ConfirmationProposalProps {
  agentCode: string
  agentName: string
  originBid: string
  finishBid: string
  codeBid: string
  startDate: string
  finishDate: string
}

export function ConfirmationProposal({
  agentCode,
  agentName,
  originBid,
  finishBid,
  codeBid,
  startDate,
  finishDate,
}: ConfirmationProposalProps) {
  return (
    <div className="flex flex-col gap-4 w-full max-w-6xl mx-auto p-4">
      <CardHeader>
        <CardTitle>Has aceptado su propuesta</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <div className="flex items-center gap-2">
            <span className="font-medium">Código Agente:</span>
            <span>{agentCode}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-medium">Origen:</span>
            <span>{originBid}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Destino:</span>
            <span>{finishBid}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Código Subasta:</span>
            <span>{codeBid}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Fecha Creación:</span>
            <span>{startDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Fecha Final:</span>
            <span>{finishDate}</span>
          </div>
        </div>
      </CardContent>
    </div>
  )
}
