import { Button } from '@/src/components/ui/button'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/src/components/ui/card'
import { drawerService } from '@/src/service/drawerService'
import { ConfirmationProposal } from './ConfirmationProposal'
import { useBidStore } from '@/src/store/useBidStore'
import { useRouter } from 'next/navigation'
import { modalService } from '@/src/service/modalService'
import { useCloseBid } from '@/src/app/hooks/useCloseBid'

interface DetailProposalProps {
  originBid: string
  finishBid: string
  codeBid: number
  bidId: number
  offerId: number
  startDate: string
  finishDate: string
  proposalCreatedDate: string
  agentId: number
  agentCode: string
  proposalPrice: string
}

export function DetailProposal({
  originBid,
  finishBid,
  codeBid,
  bidId,
  offerId,
  startDate,
  finishDate,
  proposalCreatedDate,
  agentCode,
  proposalPrice,
}: DetailProposalProps) {
  const router = useRouter()
  const { mutate: closeBid } = useCloseBid()
  const { setBidData } = useBidStore()

  const openConfirmationProposal = () => {
    console.log(codeBid)
    console.log('Abriendo modal')
    closeBid(
      { bid_id: bidId, offer_id: offerId },
      {
        onSuccess: () => {
          console.log('Subasta cerrada correctamente')

          setBidData({
            agentCode,
            agentName: 'Agent Name',
            originBid,
            finishBid,
            codeBid,
            startDate,
            finishDate,
            price: proposalPrice,
          })
          router.push('confirmation-bid')
          modalService.closeModal()
        },
        onError: () => {
          console.error('Hubo un error tratando de cerrar la subasta')
        },
      }
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Propuesta para viaje de Carga</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-2">
          <div className="flex items-center gap-2">
            <span className="font-medium">Origin:</span>
            <span>{originBid}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Destination:</span>
            <span>{finishBid}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Auction Code:</span>
            <span>{codeBid}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-medium">Start Date:</span>
            <span>{startDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">End Date:</span>
            <span>{finishDate}</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="font-medium">Proposal Creation Date:</span>
            <span>{proposalCreatedDate}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Agent Code:</span>
            <span>{agentCode}</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="font-medium">Proposal Price:</span>
            <span>{proposalPrice}</span>
          </div>
          <Button className="w-full mt-4" onClick={openConfirmationProposal}>
            Accept Proposal
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
