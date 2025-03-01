'use client'

import { Button } from '@/src/components/ui/button'
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import IconPrinter from '@/src/icons/PrintIcon'
import { useBidStore } from '@/src/store/useBidStore'
import { HomeIcon } from 'lucide-react'
import { useRouter } from 'next/navigation'

const Page = () => {
  const {
    agentCode,
    agentName,
    originBid,
    finishBid,
    codeBid,
    startDate,
    finishDate,
    price,
    market,
  } = useBidStore()
  const router = useRouter()

  const copylink = () => {
    navigator.clipboard
      .writeText(`código agente: ${agentCode}, orígen: ${originBid}, precio: ${price},
     destino: ${finishBid}, código subasta: ${codeBid}, fecha início: ${startDate}, fecha finalización: ${finishDate}
     `)
  }
  const handleGoHome = () => {
    console.log('go home')
    router.push(`/?market_id=${market}`)
  }

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
            <span className="font-medium">Precio:</span>
            <span>{price}</span>
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
      <CardFooter className="flex justify-between items-center">
        <Button onClick={handleGoHome}>
          <HomeIcon className="mr-4" />
          Regresar a tus subastas
        </Button>
        <div>
          <Button onClick={() => window.print()} className="mr-4">
            <IconPrinter className="mr-4" />
            IMPRIMIR
          </Button>

          <Button onClick={copylink}>
            <IconPrinter className="mr-4" />
            Copy
          </Button>
        </div>
      </CardFooter>
    </div>
  )
}
export default Page
